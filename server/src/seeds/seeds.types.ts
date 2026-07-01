export type { FormField, FormConfig, PageData } from '@shared/types/form'
import type { Lang, PageData } from '@shared/types/form'

// Строка или объект с переводами. Plain string = одинаково для всех языков.
export type I18nString = string | Record<Lang, string>

// Опция селекта с i18n
export interface I18nSelectOption {
  title: I18nString
  value: string
}

interface I18nBaseFormField {
  field: string
  label?: I18nString
  placeholder?: I18nString
  errorText?: string
  cols?: number
}

interface I18nInputFormField extends I18nBaseFormField {
  type: 'input'
  options: { type: string; disabled?: boolean; required?: boolean; readonly?: boolean }
}

interface I18nFileFormField extends I18nBaseFormField {
  type: 'file'
  options: { typeInputFile: 'select' | 'upload'; disabled?: boolean; required?: boolean; readonly?: boolean }
}
interface I18nSelectFileFormField extends I18nBaseFormField {
  type: 'select-file'
  options: { disabled?: boolean; required?: boolean; readonly?: boolean }
}

interface I18nSelectFormField extends I18nBaseFormField {
  type: 'select'
  options: { options: I18nSelectOption[]; disabled?: boolean; required?: boolean; readonly?: boolean }
}

interface I18nMultiSelectFormField extends I18nBaseFormField {
  type: 'multi-select'
  options: { options: I18nSelectOption[]; disabled?: boolean; required?: boolean; readonly?: boolean }
}

interface I18nCheckboxFormField extends I18nBaseFormField {
  type: 'checkbox'
  options: { value: string | boolean; disabled?: boolean; required?: boolean; readonly?: boolean }
}

interface I18nQuillFormField extends I18nBaseFormField {
  type: 'quill'
  options?: { size?: string; detalis?: string; disabled?: boolean; required?: boolean; readonly?: boolean }
}

interface I18nArrayFormField extends I18nBaseFormField {
  type: 'array'
  arrayItem: I18nFormField[]
}

interface I18nObjectFormField extends I18nBaseFormField {
  type: 'object'
  fieldsList: I18nFormField[]
}

export type I18nFormField =
  | I18nInputFormField
  | I18nFileFormField
  | I18nSelectFileFormField
  | I18nSelectFormField
  | I18nMultiSelectFormField
  | I18nCheckboxFormField
  | I18nQuillFormField
  | I18nArrayFormField
  | I18nObjectFormField

// FormConfig seed с inline-переводами
export interface I18nFormConfig<T = unknown> {
  id: string
  name: I18nString
  page?:boolean
  initionalValues: T
  fields: I18nFormField[]
}

// PageData seed: карта по языкам
export type I18nPageData = Record<Lang, PageData>
