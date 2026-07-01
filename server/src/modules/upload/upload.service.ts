import { join, dirname } from 'path'

import { 
  unauthorizedError,
  conflictError,
  notFoundError,
  validationError,
  internalError 
} from '../../common/errors'
import { fsStorageService } from 'src/services/fsStorage.service'

const MIN_IMAGE_SIZE = 100
export function createUploadService() {
  const fsStorage = fsStorageService()

  return{
    async getImage(filePath:string, width?:number, height?:number) {      
      //Если размеры не заданы возвращаем исходник
      if( !width && !height ) return filePath
      //Если одно из размеров не задано, делаем его не важным прировняв к MIN_IMAGE_SIZE
      if( !width || width < MIN_IMAGE_SIZE ) width = MIN_IMAGE_SIZE
      if( !height || height < MIN_IMAGE_SIZE ) height = MIN_IMAGE_SIZE

      const sizeList = await fsStorage.getImageSizeListSort(filePath)
      if(sizeList.length === 0) return filePath
      
      //Если все доступные размеры меньше отдаём исходинк
      const maxSize = sizeList[sizeList.length - 1]
      if(width >= maxSize.width || height >= maxSize.height) return filePath


      //Ищем подходящее изображение
      //т.к. список соритрованный идём от меньшего к большему
      let returnSize = maxSize
      for(const size of sizeList) {
        if( size.width < width || size.height < height ) continue
        returnSize = size
        break
      }
      
      const returnPath = join(dirname(filePath), `${returnSize.width}x${returnSize.height}.webp`)

      //Чтобы не создавать бесконенчо малые изображение
      if(width >= 100 && height >= 100){
        //Берём процентную разницу в размерах
        const difProcentWidth = 1 - (width / returnSize.width)
        const difProcentHeight = 1 - (height / returnSize.height)
        //Если откланение слишком большее создаем новое изображение
        if(difProcentWidth > 0.2 && difProcentHeight > 0.2){
          //Получаем новые размеры
          const difProcent = Math.min(difProcentWidth, difProcentHeight)
          const newWidth = Math.floor( returnSize.width * (1 - difProcent) )
          const newHeight =  Math.floor( returnSize.height * (1 - difProcent) )
          
          fsStorage.createNewImageSize(filePath, newWidth+5, newHeight+5)
            .catch(err => console.error('Background image resize failed:', err))
        }
      }

      return returnPath
    }
  }
}

export type UploadService = ReturnType<typeof createUploadService>