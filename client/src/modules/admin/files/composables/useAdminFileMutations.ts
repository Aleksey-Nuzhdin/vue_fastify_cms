import { ref } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { useShowPopup } from '@/shared/components/Popup/useShowPopup'
import { isFetcherError } from '@/shared/api/fetcher.error'
import type { CreateFileDto, CreateFilePayload, UpdateFileDto } from '../admin.files.type'
import { adminFilesApi } from '../admin.files.api'
import { currentFolderId } from './adminFilesState'

const api = adminFilesApi

export function useAdminFileMutations() {

  const showPopup = useShowPopup()
  const queryClient = useQueryClient()

  const errorText = ref('')

  async function createFile(data:CreateFilePayload) {
    errorText.value = ''
    if(!data.file){
      errorText.value = 'Выберите файл'
    }
    if (errorText.value) {
      showPopup.addErrorPopup(errorText.value)
      return
    }

    const dataUpdate: CreateFileDto = {...data, folderId: currentFolderId.value}

    const formData = new FormData()
    formData.append('file', data.file)
    formData.append('folderId', currentFolderId.value)

    for (const key of Object.keys(dataUpdate) as Array<keyof CreateFileDto>) {
      if(['file', 'folderId'].includes(key)) continue
      if(typeof dataUpdate[key] === 'string') formData.append(key, dataUpdate[key])
    }

    try {
      const resultCreate = await api.createFile(formData)
      queryClient.setQueryData(
        ['admin-files', currentFolderId.value],
        (oldData: any) => oldData ? [...oldData, resultCreate] : [resultCreate],
      )
    } catch (error) {
      if(isFetcherError(error)) showPopup.addErrorPopup(error.message)
      else showPopup.addErrorPopup('Не удалось загрузить файл')
    }
  }

  async function deleteFile(idFile:string) {
    try {
      await api.deleteFile(idFile)
      queryClient.setQueryData(
        ['admin-files', currentFolderId.value],
        (oldData: any) => oldData.filter((file:any) => file._id !== idFile),
      )
      showPopup.addSuccessPopup('Файл удален')
    } catch (error) {
      if(isFetcherError(error)) showPopup.addErrorPopup(error.message)
      else showPopup.addErrorPopup('Не удалось удалить файл')
    }
  }

  async function updateFile(id: string, data: Partial<UpdateFileDto>, file?: File) {
    const formData = new FormData()
    if(file) formData.append('file', file)
    if(data.name) formData.append('name', data.name)
    if(data.info !== undefined) formData.append('info', data.info ?? '')

    try {
      const result = await api.updateFile(id, formData)
      queryClient.setQueryData(
        ['admin-files', currentFolderId.value],
        (oldData: any) => oldData?.map((f: any) => f._id === id ? result : f),
      )
      showPopup.addSuccessPopup('Файл обновлён')
      return result
    } catch (error) {
      if(isFetcherError(error)) showPopup.addErrorPopup(error.message)
      else showPopup.addErrorPopup('Не удалось обновить файл')
    }
  }

  return {
    createFile,
    updateFile,
    deleteFile,
  }
}
