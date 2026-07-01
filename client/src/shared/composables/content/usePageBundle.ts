import { useConfigData } from "./useConfigData"
import { usePageData } from "./usePageData"
interface UsePageDataOptions {
  enabled?: boolean
}

export function usePageBandle<TypePageData,TypeInitionalValues>(
  pageId: string,
  options: UsePageDataOptions = {}
) {
  const page = usePageData<TypePageData>(pageId, options)
  const config = useConfigData<TypeInitionalValues>(pageId, options)

  return {
    page,config
  }
}
