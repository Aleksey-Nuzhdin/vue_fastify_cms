import { ObjectId } from 'mongodb'

export type { CreateFileDto, UpdateFileDto } from '@shared/types/storage.types.shared'
import type { FileBase } from '@shared/types/storage.types.shared'

export interface FileType extends FileBase<ObjectId>{} // File 

export type FileDocument = Omit<FileType, '_id'> & {
  createdAt: number
  updatedAt: number
}
interface FileWritable extends ExplicitPick<FileType, 
  'name' | 'info' ,
  'fileName'|'extension'| 'fullPath' | '_id' | 'folderId'
> {
  folderId:string
}

//Dto-payload-data-document

export type CreateFilePayload = Omit<FileWritable, 'name'> & {
  name?: string
  folderId: string
}

export type CreateFileData = Omit<FileType, 'folderId' | '_id'> & {
  folderId: string
}

export type UpdateFilePayload = Partial<FileWritable>
export type UpdateFileData = Partial<FileWritable>