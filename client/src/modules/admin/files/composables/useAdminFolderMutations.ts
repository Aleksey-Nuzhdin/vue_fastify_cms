import { useQueryClient } from '@tanstack/vue-query'
import { useShowPopup } from '@/shared/components/Popup/useShowPopup'
import { isFetcherError } from '@/shared/api/fetcher.error'
import type { CreateFolderPayload, CreateFolderDto, UpdateFolderDto } from '../admin.files.type'
import { adminFilesApi } from '../admin.files.api'
import { currentFolderId } from './adminFilesState'

const api = adminFilesApi

export function useAdminFolderMutations() {

  const showPopup = useShowPopup()
  const queryClient = useQueryClient()

  async function createFolder(data:CreateFolderPayload) {
    const dataCreate:CreateFolderDto = {
      name: data.name,
      parentId: currentFolderId.value,
    }

    try {
      let resultCreate = await api.createFolder(dataCreate)
      queryClient.setQueryData(
        ['admin-folders', currentFolderId.value],
        (oldData: any) => oldData ? [...oldData, resultCreate] : [resultCreate],
      )
    } catch (error) {
      if(isFetcherError(error)) showPopup.addErrorPopup(error.message)
      else showPopup.addErrorPopup('Не удалось создать папку')
    }
  }

  async function updateFolder(idFolder: string, data: UpdateFolderDto) {
    try {
      const result = await api.updateFolder(idFolder, data)
      queryClient.setQueryData(
        ['admin-folders', currentFolderId.value],
        (oldData: any) => oldData?.map((f: any) => f._id === idFolder ? { ...f, ...result } : f),
      )
      showPopup.addSuccessPopup('Папка обновлена')
    } catch (error) {
      if (isFetcherError(error)) showPopup.addErrorPopup(error.message)
      else showPopup.addErrorPopup('Не удалось обновить папку')
    }
  }

  async function deleteFolder(idFolder:string) {
    try {
      await api.deleteFolder(idFolder)
      queryClient.setQueryData(
        ['admin-folders', currentFolderId.value],
        (oldData: any) => oldData.filter((folder:any) => folder._id !== idFolder),
      )
      showPopup.addSuccessPopup('Папка удалена')
    } catch (error) {
      if(isFetcherError(error)) showPopup.addErrorPopup(error.message)
      else showPopup.addErrorPopup('Не удалось удалить папку')
    }
  }

  return {
    createFolder,
    updateFolder,
    deleteFolder,
  }
}
