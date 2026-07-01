import type { I18nFormConfig } from '../../seeds.types'
import type { Header } from '@shared/types/form/pages'
import type { I18nFormField } from '../../seeds.types'

const initionalValues: Header.InitionalValues = {
  sections:[]
}

const sectionItem: I18nFormField[] = [{
  type: "input",
  label: {ru:"Заголовок", en:"Title"},
  placeholder: { ru: "Введите название", en: "Enter name" },
  field: "title",
  options: {
    type:'text',
    required: true
  },
  cols: 6
},{
  type: "input",
  label: {ru:"Ссылка", en:"Link"},
  placeholder: { ru: "Введите ссылку", en: "Enter link" },
  field: "link",
  options: {
    type:'text',
    required: true
  },
  cols: 6
}]

export const loginFormConfig: I18nFormConfig<Header.InitionalValues> = {
  id: "header",
  page: true,
  name: { ru: "Шапка", en: "Header" },
  fields: [{
    type: "array",
    label: { ru: "Список ссылок", en: "List of links" },
    field: "sections",
    arrayItem: sectionItem
  }],
  initionalValues
}
