import { readdir } from 'fs/promises'
import { join } from 'path'
import type { FormConfig, PageData } from '@shared/types/form'
import type { I18nFormConfig, I18nPageData } from './seeds.types'

// ===== Type Guards =====

function isI18nFormConfig(data: unknown): data is I18nFormConfig {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'object' && obj.name !== null && 'ru' in (obj.name as object) &&
    Array.isArray(obj.fields)
  )
  
  
}

function isFormConfig(data: unknown): data is FormConfig {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    Array.isArray(obj.fields)
  )
}

function isI18nPageData(data: unknown): data is I18nPageData {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>
  if (!obj.ru || typeof obj.ru !== 'object') return false
  const ru = obj.ru as Record<string, unknown>
  return typeof ru.id === 'string' && typeof ru.data === 'object' && ru.data !== null
}

function isPageData(data: unknown): data is PageData {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.data === 'object' &&
    obj.data !== null
  )
}

// ===== Loaders =====

const isProd = process.env.NODE_ENV === 'production'

export async function loadFormConfigs(dirPath: string): Promise<(FormConfig | I18nFormConfig)[]> {
  const files = await readdir(dirPath)
  const tsFiles = files.filter(f => f.endsWith(isProd ? '.form.js' : '.form.ts'))

  const configs: (FormConfig | I18nFormConfig)[] = []

  for (const file of tsFiles) {
    const filePath = join(dirPath, file)
    const module = await import(filePath)

    // Ищем первый экспорт, который подходит
    const exportedValue = module.default ?? Object.values(module)[0]

    if (isI18nFormConfig(exportedValue)) {
      configs.push(exportedValue)
    } else if (isFormConfig(exportedValue)) {
      configs.push(exportedValue)
    } else {
      console.warn(`[seeds] Invalid form config in ${file}, skipping`)
    }
  }

  return configs
}

export async function loadPageData(dirPath: string): Promise<(PageData | I18nPageData)[]> {
  const files = await readdir(dirPath)
  // Контент-коллекция хранит и страницы (.page), и справочники-списки (.list)
  const suffixes = isProd ? ['.page.js', '.list.js'] : ['.page.ts', '.list.ts']
  const tsFiles = files.filter(f => suffixes.some(s => f.endsWith(s)))

  const pages: (PageData | I18nPageData)[] = []

  for (const file of tsFiles) {
    const filePath = join(dirPath, file)
    const module = await import(filePath)

    const exportedValue = module.default ?? Object.values(module)[0]

    if (isI18nPageData(exportedValue)) {
      pages.push(exportedValue)
    } else if (isPageData(exportedValue)) {
      pages.push(exportedValue)
    } else {
      console.warn(`[seeds] Invalid page data in ${file}, skipping`)
    }
  }

  return pages
}
