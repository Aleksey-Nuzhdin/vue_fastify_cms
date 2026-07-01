import { useQuery } from '@tanstack/vue-query'
import { fetcher } from '@/shared/api'
import { useLocale } from '../useLocale'

interface UsePageDataOptions {
  enabled?: boolean
}


export function usePageData<TypePageData>(
  pageId: string,
  options: UsePageDataOptions = {}
){
  const { enabled = true } = options
  const { lang } = useLocale()

  const {
    data:pageData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['pageData', pageId, lang],
    queryFn: () => fetcher.get<TypePageData>(`/content/data/item/${pageId}?lang=${lang.value}`),
    enabled,
  })

  return {
    pageData,
    isLoading,
    error,
    refetch,
  }
}
