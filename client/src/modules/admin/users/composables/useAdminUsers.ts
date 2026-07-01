import { computed, ref, watch } from 'vue'
import { useQueryClient, useQuery } from '@tanstack/vue-query'
import { isFetcherError } from '@/shared/api/fetcher.error'
import { usePagination } from '@/shared/composables/usePagination'
import { adminUsersApi as api } from '../admin.users.api'
import type { GetUsersQuery } from '../admin.users.type'

export function useAdminUsers(filter?: GetUsersQuery) {
  const queryClient = useQueryClient()
  const chankSize = 6
  const pagination = usePagination(chankSize)

  const setPage = (page: number) => {
    pagination.goToPage(page)
  }

  const filtersDefault = computed(() => ({
    skip: pagination.skip.value,
    limit: pagination.limit.value,
  }))

  const filters = ref<GetUsersQuery>({})

  const setFilters = (filtersValue: GetUsersQuery) => {
    setPage(1)
    queryClient.invalidateQueries({ queryKey: ['admin-users'] })

    filters.value = { ...filtersDefault.value, ...filtersValue }
  }

  if (filter) setFilters(filter)

  const listQuery = computed<GetUsersQuery>(() => ({
    ...filters.value,
    ...filtersDefault.value,
  }))

  const list = useQuery({
    queryKey: computed(() => ['admin-users', listQuery.value]),
    queryFn: () => api.fetchUsersList(listQuery.value),
  })

  watch(
    () => list.data.value?.count,
    (count) => {
      pagination.setListLength(count || 0)
      if(pagination.currentPage.value > pagination.maxPage.value){
        pagination.goToPage(pagination.maxPage.value)
      }
    },
    { immediate: true },
  )

  return { list, filters, setFilters, setPage, pagination }
}
