import { ref, computed } from "vue"

export function usePagination(chunkValue: number = 10, listValue: number = 0) {

  const currentPage = ref(1)
  const listLength = ref(listValue)
  const chunkSize = ref(chunkValue)

  const goToPage = (page: number) => {
    if (page > maxPage.value) return
    if (page < 1) return
    currentPage.value = page
  }

  const maxPage = computed(() => Math.ceil(listLength.value / chunkSize.value))

  const skip = computed(() => (currentPage.value - 1) * chunkSize.value)
  const limit = computed(() => chunkSize.value)

  const setListLength = (value: number) => {
    listLength.value = value
  }

  return {currentPage, maxPage, goToPage, skip, limit, setListLength}
}
