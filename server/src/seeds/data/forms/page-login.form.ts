import type { I18nFormConfig } from '../../seeds.types'

const initionalValues = {
  title: "",
  button: ""
}

export const pageLoginFormConfig: I18nFormConfig<typeof initionalValues> = {
  id: "page-login",
  page: true,
  name: { ru: "Страница логина", en: "Login page" },
  fields: [
    {
      type: "input",
      label: { ru: "Заголовок", en: "Title" },
      placeholder: { ru: "Введите заголовок", en: "Enter title" },
      field: "title",
      options: { type: "text" }
    },
    {
      type: "input",
      label: { ru: "Текст кнопки", en: "Button text" },
      placeholder: { ru: "Введите текст кнопки", en: "Enter button text" },
      field: "button",
      options: { type: "text" }
    }
  ],
  initionalValues
}
