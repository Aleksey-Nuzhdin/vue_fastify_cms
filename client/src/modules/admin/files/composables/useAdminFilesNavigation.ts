import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { adminFilesApi } from '../admin.files.api'
import { currentFolderId, ROOT_FOLDER_ID } from './adminFilesState'

const api = adminFilesApi

export function useAdminFilesNavigation() {
  const route = useRoute()
  const router = useRouter()

  const queryFolderId = route.query.folderId
  if (typeof queryFolderId === 'string' && queryFolderId) {
    currentFolderId.value = queryFolderId
  }

  watch(currentFolderId, (id) => {
    const query = { ...route.query }
    if (id === ROOT_FOLDER_ID) {
      delete query.folderId
    } else {
      query.folderId = id
    }
    router.replace({ query })
  })
  const currentFolder = useQuery({
    queryKey: computed(() => ['admin-current-folders', currentFolderId.value]),
    queryFn: () => api.fetchFolderItem(currentFolderId.value),
  })

  const folders = useQuery({
    queryKey: computed(() => ['admin-folders', currentFolderId.value]),
    queryFn: () => api.fetchFoldersList(currentFolderId.value),
  })

  const files = useQuery({
    queryKey: computed(() => ['admin-files', currentFolderId.value]),
    queryFn: () => api.fetchFilesList(currentFolderId.value),
  })

  function openFolder(folderId: string) {
    currentFolderId.value = folderId
  }

  function goToRoot() {
    currentFolderId.value = ROOT_FOLDER_ID
  }

  return {
    currentFolderId,
    currentFolder,
    folders,
    files,
    openFolder,
    goToRoot,
  }
}
