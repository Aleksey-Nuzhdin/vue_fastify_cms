import type { FoldersRepository } from "./folders/folders.repository"
import type { FilesRepository } from "./files/files.repository"

export function createStorageService(repoFolder: FoldersRepository, repoFile: FilesRepository) {
  return {
    getFolderData:async (id: string) =>{ 
      const folders = await repoFolder.getFoldersPreview(id)
      const files = await repoFile.getFilesPreview(id)

      return { folders, files }
    }

  }
}

export type StorageService = ReturnType<typeof createStorageService>