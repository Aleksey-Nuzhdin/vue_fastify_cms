import sharp from 'sharp'
import { IMAGE_MAX_SIDE } from '@shared/constants'
import { imageTooLargeError, validationError } from '../errors'

import type { MultipartFile } from '@fastify/multipart'

// Аватар обязан быть картинкой: не-картинку saveFileInFs сохранил бы как
// обычный файл, а profile.service всё равно записал бы в БД путь до
// original.webp — ссылку на несуществующий файл.
// Подделанный mimetype ловится следом в assertImageSize: sharp не прочитает
// метадату у не-картинки и бросит ошибку до записи на диск.
export function assertIsImage(file: MultipartFile) {
  if (!file.mimetype.startsWith('image/')) throw validationError('File must be an image')
}

// Потолок разрешения для картинок с пользовательских путей (аватар, доклады).
// Зовётся до сохранения: контроллер уже вызвал part.toBuffer(), повторный вызов
// отдаёт закешированный буфер и не трогает поток, а sharp читает только
// заголовок — картинка не декодируется и на диск не попадает.
// Не-картинки пропускаем: в докладах законен pdf.
export async function assertImageSize(file: MultipartFile) {
  if (!file.mimetype.startsWith('image/')) return

  const buffer = await file.toBuffer()

  let width: number | undefined
  let height: number | undefined
  try {
    ({ width, height } = await sharp(buffer).metadata())
  } catch {
    throw validationError('Invalid image file')
  }

  if (!width || !height) throw validationError('Invalid image file')

  if (width > IMAGE_MAX_SIDE || height > IMAGE_MAX_SIDE) {
    throw imageTooLargeError(`Image side must not exceed ${IMAGE_MAX_SIDE}px`)
  }
}
