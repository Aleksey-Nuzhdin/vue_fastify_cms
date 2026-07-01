// import { SUPPORTED_LANGS } from '@shared/types/form'
import type { Lang, FormConfig, FormField, PageData} from '@shared/types/form'

const SUPPORTED_LANGS: Lang[] = ['ru', 'en']
import type { I18nFormConfig, I18nFormField, I18nString, I18nPageData } from './seeds.types'

// ===== Helpers =====

function resolveString(value: I18nString, lang: Lang): string {
  if (typeof value === 'string') return value
  return value[lang] ?? value['ru'] ?? ''
}

// ===== Form Config Expansion =====

function resolveField(field: I18nFormField, lang: Lang): FormField {
  const base: any = { ...field }

  if (base.label != null) base.label = resolveString(base.label, lang)
  if (base.placeholder != null) base.placeholder = resolveString(base.placeholder, lang)

  // select / multi-select → options.options[].title
  if ((base.type === 'select' || base.type === 'multi-select') && base.options?.options) {
    base.options = {
      ...base.options,
      options: base.options.options.map((opt: any) => ({
        ...opt,
        title: resolveString(opt.title, lang),
      })),
    }
  }

  // array → рекурсия в arrayItem
  if (base.type === 'array' && base.arrayItem) {
    base.arrayItem = base.arrayItem.map((f: I18nFormField) => resolveField(f, lang))
  }

  // object → рекурсия в fieldsList
  if (base.type === 'object' && base.fieldsList) {
    base.fieldsList = base.fieldsList.map((f: I18nFormField) => resolveField(f, lang))
  }

  return base as FormField
}

export function expandFormConfig(config: I18nFormConfig): FormConfig[] {
  return SUPPORTED_LANGS.map(lang => ({
    id: config.id,
    lang,
    name: resolveString(config.name, lang),
    ...(config.page !== undefined && { page: config.page }),
    initionalValues: config.initionalValues,
    fields: config.fields.map(f => resolveField(f, lang)),
  }))
}

// ===== Page Data Expansion =====

export function expandPageData(data: I18nPageData): PageData[] {
  return SUPPORTED_LANGS
    .filter(lang => data[lang] != null)
    .map(lang => ({
      ...data[lang],
      lang,
    }))
}
