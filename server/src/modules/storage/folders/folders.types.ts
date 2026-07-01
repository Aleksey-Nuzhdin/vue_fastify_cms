import { ObjectId } from 'mongodb'

export type { CreateFolderDto, UpdateFolderDto,FolderView } from '@shared/types/storage.types.shared'
import type { FolderBase } from '@shared/types/storage.types.shared'

export interface Folder extends FolderBase <ObjectId>{}

export type FolderDocument = Omit<Folder, '_id'> & {
  createdAt: number
  updatedAt: number
}

interface FolderWritable extends ExplicitPick<Folder,
  'name' ,
  '_id' | 'parentId'
> {
  parentId: string
}

export interface CreateFolderData extends FolderWritable {}
export interface CreateFolderPayload extends FolderWritable {}

export interface UpdateFolderData extends Partial<FolderWritable> {}
export interface UpdateFolderPayload extends Partial<FolderWritable> {}


