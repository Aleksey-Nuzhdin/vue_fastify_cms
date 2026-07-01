export interface FileBase<FolderId = string> {
  _id: FolderId
  name: string
  fileName: string
  extension: string
  folderId: FolderId
  info: string
  fullPath: string
}

export interface CreateFileDto<FolderId = string> {
  folderId: FolderId
  name?: string
  info?: string
}

export interface UpdateFileDto<FolderId = string> {
  name?: string
  info?: string
  folderId?: FolderId
}


export interface FolderBase<ParentId = string> {
  _id: ParentId,
  parentId: ParentId,
  name: string
}
export interface CreateFolderDto<ParentId = string> {
  parentId: ParentId
  name: string
}
export interface UpdateFolderDto<ParentId = string> {
  parentId?: ParentId
  name?: string
}

export interface FolderView extends FolderBase { 
  breadCrumbs: Array<{_id: string, name: string}> 
}