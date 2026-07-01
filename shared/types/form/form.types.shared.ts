import type { JsonValue, JsonObject } from "./../json.type.shared";

// ===== i18n =====

export type Lang = 'ru' | 'en'
export const SUPPORTED_LANGS: Lang[] = ['ru', 'en']
export const DEFAULT_LANG: Lang = 'ru'

// ===== Form Configs (конфигурации форм для админки) =====

export type FormFieldType = 
  'input' | 'select' | 'multi-select' | 'quill' | 'array' | 'object' | 'checkbox' | 'file' | 'select-file'
export type InputType = 'text' | 'email' | 'password' | 'textarea' | 'number' | 'tel' | 'url'

export interface SelectOption {
  title: string
  value: string
}
export interface CheckboxOption {
  label: string
  value: string
}

// Базовые поля, общие для всех типов
interface BaseFormField {
  // type,
  field: string
  label?: string
  placeholder?: string
  errorText?: string
  cols?: number // для grid-раскладки (1-12) deff 12
}

interface BaseOptions {
  disabled?: boolean
  required?: boolean
  readonly?: boolean
}

// Конкретные типы полей

interface InputOptions extends BaseOptions {
  type: InputType
}
export interface InputFormField extends BaseFormField {
  type: 'input'
  options:InputOptions
}

interface FileOptions extends BaseOptions {
  // typeInputFile: 'select' | 'upload'
}
export interface FileFormField extends BaseFormField {
  type: 'file'
  options:FileOptions
}


interface SelectFileOptions extends BaseOptions {
  // typeInputFile: 'select' | 'upload'
}
export interface SelectFileFormField extends BaseFormField {
  type: 'select-file'
  options:SelectFileOptions
}


interface SelectOptions extends BaseOptions {
  options: SelectOption[]
}
export interface SelectFormField extends BaseFormField {
  type: 'select'
  options:SelectOptions
}

export interface MultiSelectFormField extends BaseFormField {
  type: 'multi-select'
  options:SelectOptions
}


interface CheckboxOptions extends BaseOptions {
  value: string | boolean
}
export interface CheckboxFormField extends BaseFormField {
  type: 'checkbox'
  options: CheckboxOptions
}

interface QuillOptions extends BaseOptions {
  size:string
  detalis:string
}
export interface QuillFormField extends BaseFormField {
  type: 'quill'
  options?:QuillOptions
}

export interface ArrayFormField extends BaseFormField {
  type: 'array'
  arrayItem: FormField[] // вложенные поля для каждого элемента массива
}

export interface ObjectFormField extends BaseFormField {
  type: 'object'
  fieldsList: FormField[] // вложенные поля объекта
}

export type FormField =
    InputFormField
  | FileFormField
  | SelectFileFormField
  | SelectFormField
  | MultiSelectFormField
  | QuillFormField
  | CheckboxFormField
  | ArrayFormField
  | ObjectFormField

export interface FormConfig<T = unknown> {
  id: string
  lang?: Lang
  name: string
  page?: boolean
  initionalValues:T,
  fields: FormField[]
}

// ===== Pages (данные страниц) =====

export interface PageData<T extends JsonValue = JsonObject> {
  id: string
  lang?: Lang
  name: string
  type?: 'page' | 'list' // отсутствие = 'page'; 'list' — справочник, не рендерящийся контент
  page?: string
  hide?: boolean
  data: T // свободная структура, зависит от formConfig
}

// Данные справочника-списка (type:'list')
export interface OptionListData {
  items: SelectOption[]
}