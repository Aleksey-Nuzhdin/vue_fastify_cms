import { ref, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { adminFilesApi } from '@/modules/admin/files/admin.files.api'

const ROOT_FOLDER_ID = '000000000000000000000000'

export function useStorageNavigation() {
  const currentFolderId = ref(ROOT_FOLDER_ID)

  const currentFolder = useQuery({
    queryKey: computed(() => ['storage-nav-folder', currentFolderId.value]),
    queryFn: () => adminFilesApi.fetchFolderItem(currentFolderId.value),
  })

  const folders = useQuery({
    queryKey: computed(() => ['storage-nav-folders', currentFolderId.value]),
    queryFn: () => adminFilesApi.fetchFoldersList(currentFolderId.value),
  })

  const files = useQuery({
    queryKey: computed(() => ['storage-nav-files', currentFolderId.value]),
    queryFn: () => adminFilesApi.fetchFilesList(currentFolderId.value),
  })

  const isLoading = computed(() => folders.isLoading.value || files.isLoading.value || currentFolder.isLoading.value)
  const isError = computed(() => folders.isError.value || files.isError.value || currentFolder.isError.value)
  const errorText = computed(() =>
    [folders.error.value?.message, files.error.value?.message, currentFolder.error.value?.message]
      .filter(Boolean).join(', ')
  )

  const sortedBreadCrumbs = computed(() => {
    if (!currentFolder.data.value) return []
    return [...currentFolder.data.value.breadCrumbs]
      .sort((a, b) => parseInt(a._id, 16) - parseInt(b._id, 16))
  })

  function openFolder(folderId: string) {
    currentFolderId.value = folderId
  }

  function goToRoot() {
    currentFolderId.value = ROOT_FOLDER_ID
  }

  function goBack() {
    const crumbs = sortedBreadCrumbs.value
    if (crumbs.length > 0) {
      openFolder(crumbs[crumbs.length - 1]!._id)
    } else {
      goToRoot()
    }
  }

  return {
    currentFolderId,
    currentFolder,
    folders,
    files,
    isLoading,
    isError,
    errorText,
    sortedBreadCrumbs,
    openFolder,
    goToRoot,
    goBack,
  }
}
