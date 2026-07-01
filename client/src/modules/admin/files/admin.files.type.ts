export type {FileBase, FolderView, FolderBase,CreateFileDto, UpdateFileDto, CreateFolderDto, UpdateFolderDto} from '@shared/types/storage.types.shared'

import type {FileBase, FolderBase} from '@shared/types/storage.types.shared'

export interface FileType extends FileBase{}

interface FileWritable extends ExplicitPick<FileBase,
  "name" | "info" ,
  "_id" | "fileName" | "extension" | "fullPath" | "folderId"
>{}

export interface CreateFilePayload extends Partial<FileWritable>{
  file:File
}

interface FolderWritable extends ExplicitPick<FolderBase,
  "name" | "parentId",
  "_id"
>{}
export interface CreateFolderPayload extends Omit<FolderWritable, 'parentId'>{}
