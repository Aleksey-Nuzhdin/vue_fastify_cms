import { fetcher } from '@/shared/api'
import type {FolderView, FileBase, FolderBase, CreateFolderDto, UpdateFolderDto } from './admin.files.type'

export const adminFilesApi = {
  //Files
  fetchFileItem: (id: string):Promise<FileBase> =>
    fetcher.get('/storage/files/item/' + id),
  fetchFilesList: (idFolder: string) : Promise<FileBase[]> =>
    fetcher.get('/storage/files/folder/'+ idFolder),
  createFile: (formData: FormData):Promise<FileBase> =>
    fetcher.post('/storage/files/create', formData),
  updateFile: (id: string, formData: FormData):Promise<FileBase> =>
    fetcher.patch('/storage/files/update/' + id, formData),
  deleteFile: (id: string):Promise<void> =>
    fetcher.delete('/storage/files/delete/' + id),

  //Folders
  fetchFolderItem: (id: string):Promise<FolderView> =>
    fetcher.get('/storage/folders/item/' + id),
  fetchFoldersList: (id:string):Promise<FolderBase[]> =>
    fetcher.get('/storage/folders/parent/'+ id),
  createFolder: (createFolderDto: CreateFolderDto):Promise<FolderBase> =>
    fetcher.post('/storage/folders/create', createFolderDto),
  updateFolder: (id: string, updateFolderDto: UpdateFolderDto):Promise<FolderBase> =>
    fetcher.patch('/storage/folders/update/' + id, updateFolderDto),
  deleteFolder: (id: string):Promise<void> =>
    fetcher.delete('/storage/folders/delete/' + id),
}
