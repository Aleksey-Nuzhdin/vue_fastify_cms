import { computed, ref, watch } from 'vue'
import { useQueryClient, useQuery } from '@tanstack/vue-query'
import { isFetcherError } from '@/shared/api/fetcher.error'
import { usePagination } from '@/shared/composables/usePagination'
import { adminReportsApi as api } from '../admin.reports.api'
import type { GetReportsQuery } from '../admin.reports.type'

export function useAdminReports(filter?: GetReportsQuery) {
  const chankSize = 6
  // const queryClient = useQueryClient()
  const pagination = usePagination(chankSize)

  const setPage = (page: number) => {
    pagination.goToPage(page)
  }

  const filtersDefault = computed(() => ({
    skip: pagination.skip.value,
    limit: pagination.limit.value,
  }))

  const filters = ref<GetReportsQuery>({})

  const setFilters = (filtersValue: GetReportsQuery) => {
    setPage(1)
    filters.value = { ...filtersDefault.value, ...filtersValue }
  }

  if (filter) setFilters(filter)

  const listQuery = computed<GetReportsQuery>(() => ({
    ...filters.value,
    ...filtersDefault.value,
  }))

  const list = useQuery({
    queryKey: computed(() => ['admin-reports', listQuery.value]),
    queryFn: () => api.fetchReportsList(listQuery.value),
    //   return res
    // },
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
