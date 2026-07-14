import { computed, toRaw } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fetcher } from '@/shared/api'
import type { FormConfig } from '@/shared/types/form.types'
import { useLocale } from '../useLocale'

interface UsePageDataOptions {
  enabled?: boolean
}

export function useConfigData<TypeInitionalValues>(
  pageId: string,
  options: UsePageDataOptions = {}
) {
  const { enabled = true } = options
  const { lang } = useLocale()

  const {
    data: configData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['configData', pageId, lang],
    queryFn: () => fetcher.get<FormConfig<TypeInitionalValues>>(`/content/config/item/${pageId}?lang=${lang.value}`),
    enabled,
  })

  const config = computed(() => {
    return {
      id: configData.value?.id || '',
      fields: configData.value?.fields || [],
    }
  })

  const initionalValues = computed<TypeInitionalValues | null>(() => {
    return configData.value?.initionalValues || null
  })

  const getInitionalValues = (): TypeInitionalValues | null => {
    if(!initionalValues.value) return null
    return structuredClone(toRaw(initionalValues.value))
  }

  return {
    configData:config,
    initionalValues,
    getInitionalValues,
    isLoading,
    error,
    refetch,
  }
}
