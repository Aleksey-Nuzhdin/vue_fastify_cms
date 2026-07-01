import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fetcher } from '@/shared/api'
import { useLocale } from '../useLocale'
import type { OptionListData, SelectOption } from '@shared/types/form'

interface UseOptionListOptions {
  enabled?: boolean
}

// Типизированная обёртка над /content/data/item/:id для справочников-списков (type:'list').
// Возвращает options: SelectOption[] из data.items.
export function useOptionList(
  listId: string,
  options: UseOptionListOptions = {},
) {
  const { enabled = true } = options
  const { lang } = useLocale()

  const {
    data: pageData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['optionList', listId, lang],
    queryFn: () =>
      fetcher.get<{ data: OptionListData }>(`/content/data/item/${listId}?lang=${lang.value}`),
    enabled,
  })

  const options_ = computed<SelectOption[]>(() => pageData.value?.data.items ?? [])

  return {
    options: options_,
    isLoading,
    error,
    refetch,
  }
}
