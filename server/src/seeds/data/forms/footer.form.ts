import type { I18nFormConfig, I18nFormField } from '../../seeds.types'
import type { Footer } from '@shared/types/form/pages'

const initionalValues: Footer.InitionalValues = {
  nav: {
    title: "",
    links: []
  },
  contacts: {
    title: "",
    items: []
  },
  social: []
}

const navLinkItem: I18nFormField[] = [
  {
    type: "input",
    label: { ru: "Название", en: "Title" },
    placeholder: { ru: "Введите название", en: "Enter title" },
    field: "title",
    options: { type: "text", required: true },
    cols: 6
  },
  {
    type: "input",
    label: { ru: "Ссылка", en: "Link" },
    placeholder: { ru: "Введите ссылку", en: "Enter link" },
    field: "url",
    options: { type: "text", required: true },
    cols: 6
  }
]

const socialItem: I18nFormField[] = [
  {
    type: "select",
    label: { ru: "Иконка", en: "Icon" },
    placeholder: { ru: "Выберите иконку", en: "Select icon" },
    field: "icon",
    options: {
      options: [
        { value: "vk", title: "VK" },
        { value: "tg", title: "Telegram" },
        { value: "didya_maior", title: "Буэ-макс" }
      ]
    },
    cols: 6
  },
  {
    type: "input",
    label: { ru: "Ссылка", en: "Link" },
    placeholder: { ru: "Введите URL", en: "Enter URL" },
    field: "url",
    options: { type: "url", required: true },
    cols: 6
  }
]

export const footerFormConfig: I18nFormConfig<Footer.InitionalValues> = {
  id: "footer",
  page: true,
  name: { ru: "Подвал", en: "Footer" },
  fields: [
    {
      type: "object",
      label: { ru: "Навигация", en: "Navigation" },
      field: "nav",
      fieldsList: [
        {
          type: "input",
          label: { ru: "Заголовок", en: "Title" },
          placeholder: { ru: "Введите заголовок", en: "Enter title" },
          field: "title",
          options: { type: "text" }
        },
        {
          type: "array",
          label: { ru: "Ссылки", en: "Links" },
          field: "links",
          arrayItem: navLinkItem
        }
      ]
    },
    {
      type: "object",
      label: { ru: "Контакты", en: "Contacts" },
      field: "contacts",
      fieldsList: [
        {
          type: "input",
          label: { ru: "Заголовок", en: "Title" },
          placeholder: { ru: "Введите заголовок", en: "Enter title" },
          field: "title",
          options: { type: "text" }
        },
        {
          type: "array",
          label: { ru: "Список контактов", en: "Contact list" },
          field: "items",
          arrayItem: [
            {
              type: "input",
              label: { ru: "Контакт (телефон или email)", en: "Contact (phone or email)" },
              placeholder: { ru: "Введите контакт", en: "Enter contact" },
              field: "value",
              options: { type: "text", required: true }
            }
          ]
        }
      ]
    },
    {
      type: "array",
      label: { ru: "Социальные сети", en: "Social networks" },
      field: "social",
      arrayItem: socialItem
    }
  ],
  initionalValues
}
