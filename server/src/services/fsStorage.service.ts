import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { mkdir, unlink, readdir, rmdir, copyFile, rm } from 'fs/promises'
import { createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'
import { randomUUID } from 'crypto'
import { Worker } from 'worker_threads'

import sharp from 'sharp'
import { parseFileName } from '../common/utils/files.utils'

import type { MultipartFile } from "@fastify/multipart"

const isProd = process.env.NODE_ENV === 'production'

// ES modules замена для __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const defaultPath = join(__dirname, '..', '..', isProd ? 'app/public' : 'public', 'upload')

async function saveFile(file: MultipartFile, path: string) {
  const folderChunkName = new Date().toISOString().split('T')[0] //yyyy-mm-dd
  const { extension } = parseFileName(file.filename)

  const uuid = randomUUID()
  const savedFileName = `${uuid}${extension ? '.' : ''}${extension}`
  const folderPath = join(defaultPath, path, folderChunkName)

  await mkdir(folderPath, { recursive: true })
  await pipeline(file.file, createWriteStream(join(folderPath, savedFileName)))

  return { uuidFileName: savedFileName, folderPath: join('/upload/', path, folderChunkName) }
}

const webpOptions: sharp.WebpOptions = {
  quality: 80,
}

async function saveImage(file: MultipartFile, path: string) {
  const folderChunkName = new Date().toISOString().split('T')[0] //yyyy-mm-dd

  const uuid = randomUUID()
  const savedFileName = 'original.webp'
  const folderPath = join(defaultPath, path, folderChunkName, uuid)

  await mkdir(folderPath, { recursive: true })
  
  await pipeline(file.file, sharp().webp(webpOptions), createWriteStream(join(folderPath, savedFileName)))

  const fullPath = join(folderPath, savedFileName)

  const { width, height } = await sharp(fullPath).metadata()

  await copyFile(fullPath, join(folderPath, `${width}x${height}.webp`))

  return { uuidFileName:savedFileName, folderPath:join('/upload/',path, folderChunkName, uuid) }
}

const resizeInProgress = new Map<string, Promise<{ width: number; height: number }>>()

export function fsStorageService() {

  return {
    async getImageSizeListSort(imagePath: string) {
      const folderPath = join(defaultPath, imagePath.replace('original.webp', ''))
      const files = await readdir(folderPath).catch(() => ['fake'])
      if(files.length === 0) return []
      const sizeList = files
        .filter(f => !f.startsWith('original') && !f.startsWith('_temp_'))
        .map(el => el.split('.')[0])
        .map(el => ({
          width:+el.split('x')[0], 
          height:+el.split('x')[1]
        }))
      return sizeList.sort((a,b) => a.width - b.width)
    },

    async createNewImageSize(imagePath: string, width: number, height: number) {
      const key = `${imagePath}:${width}x${height}`

      const existing = resizeInProgress.get(key)
      if (existing) return existing

      const promise = (async () => {
        const originalPath = join(defaultPath, imagePath)
        const folderPath = dirname(originalPath)
        const tempOutputPath = join(folderPath, `_temp_${width}x${height}.webp`)
        const workerPath = join(__dirname,  isProd ?  '/services/imageResize.worker.js': 'imageResize.worker.ts' )
        // const workerPath = join(__dirname,  'imageResize.worker.js')

        const { width: actualW, height: actualH } = await new Promise<{ width: number; height: number }>((resolve, reject) => {
          const worker = new Worker(workerPath, {
            workerData: { inputPath: originalPath, outputPath: tempOutputPath, width, height },
            ...(isProd ? {} : { execArgv: ['--import', 'tsx'] }),
          })
          worker.on('message', (msg) => {
            if (msg.error) reject(new Error(msg.error))
            else resolve(msg)
          })
          worker.on('error', reject)
        })

        const finalPath = join(folderPath, `${actualW}x${actualH}.webp`)
        await copyFile(tempOutputPath, finalPath)
        await unlink(tempOutputPath)

        return { width: actualW, height: actualH }
      })().finally(() => resizeInProgress.delete(key))

      resizeInProgress.set(key, promise)
      return promise
    },

    async saveFileInFs(file:MultipartFile, path?:string){    
      const isImage = file.mimetype.startsWith('image/')  
      if (isImage) {
        return saveImage(file, path ?? 'images')
      }
      return saveFile(file, path ?? 'files')
    },

    async replaceFile(file: MultipartFile, relativePath: string) {
      const isImage = relativePath.startsWith('/upload/images')
      const cleanPath = relativePath.replace(/^\/upload\//, '/')
      const fullPath = join(defaultPath, cleanPath)
      const folderPath = dirname(fullPath)

      await mkdir(folderPath, { recursive: true })

      if(isImage) {
        // Перезаписываем original.webp через sharp
        await pipeline(file.file, sharp().webp(webpOptions), createWriteStream(fullPath))

        // Удаляем все старые копии WxH.webp
        const files = await readdir(folderPath).catch(() => [])
        for(const f of files) {
          if(!f.startsWith('original') && !f.startsWith('_temp_')) {
            await unlink(join(folderPath, f)).catch(() => {})
          }
        }

        // Создаём начальную копию с размерами нового оригинала
        const { width, height } = await sharp(fullPath).metadata()
        await copyFile(fullPath, join(folderPath, `${width}x${height}.webp`))
      } else {
        await pipeline(file.file, createWriteStream(fullPath))
      }
    },

    async deleteFile(relativePath:string) {
      const isImage = relativePath.startsWith('/upload/images')

      const cleanPath = relativePath.replace(/^\/upload\//, '/')
      const fullPath = join(defaultPath, cleanPath)

      if(isImage){
        const removeDir = dirname(fullPath)
        await rm(removeDir, { recursive: true }).catch(() => {})
      }else{
        await unlink(fullPath).catch(() => {})  // игнорируем если файла нет
      }

      // Удаляем папку если пустая
      let folderPath = isImage ?  dirname(dirname(fullPath)) : dirname(fullPath)

      // Не удаляем корневую папку upload
      if (folderPath === defaultPath) return

      while (folderPath !== defaultPath && folderPath.startsWith(defaultPath)) {
        const files = await readdir(folderPath).catch(() => ['fake'])

        if (files.length === 0) {
          await rmdir(folderPath).catch(() => {})
          folderPath = dirname(folderPath)  // поднимаемся выше
        } else {
          break  // папка не пустая — стоп
        }
      }
    },
    
    async deleteFolder(relativePath:string) {
      const cleanPath = relativePath.replace(/^\/upload\//, '/')
      const fullPath = join(defaultPath, cleanPath)

      if (!fullPath.startsWith(defaultPath) || fullPath === defaultPath) return

      await rm(fullPath, { recursive: true }).catch(() => {})

      // Удаляем пустые родительские папки
      let folderPath = dirname(fullPath)
      while (folderPath !== defaultPath && folderPath.startsWith(defaultPath)) {
        const files = await readdir(folderPath).catch(() => ['fake'])

        if (files.length === 0) {
          await rmdir(folderPath).catch(() => {})
          folderPath = dirname(folderPath)
        } else {
          break
        }
      }
    }
  }
}