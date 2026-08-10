import { FoldersRepository } from '../folders/folders.repository'
import { FilesRepository } from './files.repository'
import { parseFileName, sanitizeFileName } from '../../../common/utils/files.utils'

import { notFoundError, conflictError, validationError } from '../../../common/errors'
// import { ObjectId } from 'mongodb'
import { fsStorageService } from '../../../services/fsStorage.service'

import { buildUpdate } from '../../../common/utils/buildUpdate'

import type { FileType, CreateFilePayload, CreateFileData, UpdateFilePayload, UpdateFileData } from './files.types'
import type { MultipartFile } from '@fastify/multipart'

export function createFilesService(filesRepo: FilesRepository, foldersRepo:FoldersRepository) {
  const storage = fsStorageService()
  return {
    getAll: ():Promise<FileType[]> => filesRepo.findAll(),
    getById: async (id: string):Promise<FileType> => {
      const file = await filesRepo.findById(id)
      if(!file) throw notFoundError('File', id)

      return file
    },
    async create(file: MultipartFile | undefined, data: CreateFilePayload):Promise<FileType> {
      const { folderId, name, info } = data
      
      if(!file) throw validationError('File is required')
      if(!folderId) throw validationError('Folder id is required')

      //Проверить что такая папка существует.
      const folder = await foldersRepo.findById(folderId)
      if( folder === null) throw notFoundError('Folder', folderId)
       
      const { name: fileName, extension: fileExtension } = parseFileName(file.filename)

      const cleanedFileName = sanitizeFileName( name || fileName )

      //Проверка на уникальность
      //TD если файлов в 1 папке будет >1000, переделать на цикл
      const fileListInFolder = await filesRepo.getListFilesNameByFolderId(folderId)
      
      let uniqueName = cleanedFileName
      let i = 0
      while(fileListInFolder.includes(uniqueName)) {
        uniqueName = `${cleanedFileName} (${++i})`
      }
      
      // Сохранение файла
      const { uuidFileName, folderPath } = await storage.saveFileInFs(file)

      const dataCreate:CreateFileData = {
        folderId,
        name: uniqueName,
        fileName: uuidFileName,
        extension: fileExtension,
        fullPath:`${folderPath}/${uuidFileName}`,
        info: info ?? '',
      }

      try {
        const file = await filesRepo.create(dataCreate)
        if(!file) throw conflictError('File cannot be created')
        return file
      }catch (error) {
        await storage.deleteFile(`${folderPath}/${uuidFileName}`)
        throw error
      }
    },

    getListByFolderId: async (folderId: string):Promise<FileType[]> => filesRepo.getListByFolderId(folderId),

    async update(id: string, data: UpdateFilePayload, file?: MultipartFile ):Promise<FileType> {
      const existingFile = await filesRepo.findById(id)
      if(!existingFile) throw notFoundError('File', id)

      // Замена самого файла (перезапись по тому же пути)
      if(file) {
        const isImage = file.mimetype.startsWith('image/')
        const isExistingImage = existingFile.fullPath.startsWith('/upload/images')

        if(isImage !== isExistingImage) {
          throw validationError(`Cannot replace ${isExistingImage ? 'image' : 'file'} with ${isImage ? 'image' : 'file'}`)
        }

        if(!isImage) {
          const { extension: newExtension } = parseFileName(file.filename)
          if(newExtension !== existingFile.extension) {
            throw validationError(`Extension mismatch: expected .${existingFile.extension}, got .${newExtension}`)
          }
        }

        await storage.replaceFile(file, existingFile.fullPath)
      }

      const { name, info, folderId } = data

      const dataUpdate = buildUpdate<UpdateFileData>({
        name: name ?? null,
        info: info ?? null,
        folderId: folderId ?? null,
      })

      const fileUpdated = await filesRepo.update(id, dataUpdate)
      if(fileUpdated === null) throw conflictError('File cannot be updated')
      return fileUpdated
    },
    async delete(id: string):Promise<FileType> {
      const file = await filesRepo.findById(id)
      if(!file) throw notFoundError('File', id)

      await storage.deleteFile(file.fullPath)
      await filesRepo.delete(id)

      return file
    },
  }
}

export type FilesService = ReturnType<typeof createFilesService>