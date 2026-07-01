import { useQuery } from '@tanstack/vue-query'
import { fetcher } from '@/shared/api'
import type { PageData } from '@shared/types/form'
import { useLocale } from '../useLocale'

interface UsePageSectionsOptions {
  enabled?: boolean
}

export function usePageSections<T extends PageData>(
  page: string,
  options: UsePageSectionsOptions = {}
) {
  const { enabled = true } = options
  const { lang } = useLocale()

  const {
    data: sections,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['pageSections', page, lang],
    queryFn: () => fetcher.get<T[]>(`/content/data/page/${page}?lang=${lang.value}`),
    enabled,
  })

  return {
    sections,
    isLoading,
    error,
    refetch,
  }
}
