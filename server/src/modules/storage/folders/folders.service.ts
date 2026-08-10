import { FoldersRepository } from './folders.repository'
import { FilesRepository } from '../files/files.repository'
import { parseFileName, sanitizeFileName } from '../../../common/utils/files.utils'

import { notFoundError, conflictError, validationError } from '../../../common/errors'

import type {Folder, FolderView, UpdateFolderData, UpdateFolderPayload, CreateFolderData, CreateFolderPayload  } from './folders.types'
import { buildUpdate } from '../../../common/utils/buildUpdate'

export function createFoldersService(repo: FoldersRepository, filesRepo: FilesRepository) {
  
  return {
    getById: async (id: string): Promise<Folder> => {
      let folder = await repo.findById(id)
      if( !folder ) throw notFoundError('Folder', id)
      return folder
    },
    getFolderView: async (id:string):Promise<FolderView> =>{
      let folder = await repo.getFolderView(id)
      if( !folder ) throw notFoundError('Folder', id)
      return folder
    },
    getAll: ():Promise<Folder[]> => repo.findAll(),
    delete: async (id: string):Promise<Folder> => {
      if( id === '000000000000000000000000') throw validationError('Root folder cannot be deleted');
      const deletedFolder = await repo.findById(id)

      if (!deletedFolder) throw notFoundError('Folder', id)

      const [childFolders, childFiles] = await Promise.all([
        repo.getListByParentId(id),
        filesRepo.getListByFolderId(id),
      ])
      if (childFolders.length > 0 || childFiles.length > 0) {
        throw validationError('Folder is not empty')
      }

      const result = await repo.delete(id)
      if (result.deletedCount === 0) throw conflictError('Folder cannot be deleted')

      return deletedFolder
    },
    async create(data: CreateFolderPayload):Promise<Folder> {
      const { parentId, name } = data

      const parentFolder = await repo.findById(parentId)
      if (!parentFolder) throw notFoundError('Parent folder', parentId)

      const listFoldersNameInParentFolder = await repo.getListFoldersNameByParentId(parentId)
      const cleanedFileName = sanitizeFileName(name)

      let uniqueName = cleanedFileName
      let i = 0
      while(listFoldersNameInParentFolder.includes(uniqueName)) {
        uniqueName = `${cleanedFileName} (${++i})`
      }

      const dataCreate: CreateFolderData = {
        name:uniqueName,
        parentId
      }
      const folder = await repo.create(dataCreate)
      if(!folder) throw conflictError('Folder')
      return folder
    },
    getListByParentId: async (parentId: string):Promise<Folder[]> =>{
      return repo.getListByParentId(parentId)
    },
    update: async (id:string, bodyData: UpdateFolderPayload):Promise<Folder> => {
      if( id === '000000000000000000000000') throw validationError('Root folder cannot be updated')
      const { name, parentId } = bodyData

      const updateFolder = await repo.findById(id)
      if (!updateFolder) throw notFoundError('Folder', id)

      const updateData = buildUpdate<UpdateFolderData>({
        name: name ?? null,
        parentId: parentId ?? null,
      })
      const updatedFolder = await repo.update(id, updateData)

      if(!updatedFolder) throw conflictError('Folder cannot be updated')
      return updatedFolder
    }
  }
}

export type FolderService = ReturnType<typeof createFoldersService>