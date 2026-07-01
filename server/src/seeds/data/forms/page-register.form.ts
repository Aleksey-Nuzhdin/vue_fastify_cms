import type { I18nFormConfig } from '../../seeds.types'

const initionalValues = {
  title: "",
  submitButton: "",
  isShow: true,
  consentLink: ""
}

export const pageRegisterFormConfig: I18nFormConfig<typeof initionalValues> = {
  id: "page-register",
  page: true,
  name: { ru: "Страница регистрации", en: "Registration page" },
  fields: [
    {
      type: "input",
      label: { ru: "Заголовок", en: "Title" },
      placeholder: { ru: "Введите заголовок", en: "Enter title" },
      field: "title",
      options: { type: "text" },
      cols:8,
    },
    {
      type: "checkbox",
      label: { ru: "Открыть регистрацию", en: "Open registration" },
      placeholder: { ru: "Введите заголовок", en: "Enter title" },
      field: "isShow",
      options: { value:true },
      cols:4,
    },
    {
      type: "input",
      label: { ru: "Текст кнопки", en: "Button text" },
      placeholder: { ru: "Введите текст кнопки", en: "Enter button text" },
      field: "submitButton",
      options: { type: "text" }
    },
    {
      type: "input",
      label: { ru: "Ссылка на согласие", en: "Link to consent" },
      placeholder: { ru: "Введите URL", en: "Enter URL" },
      field: "consentLink",
      options: { type: "text" }
    }
  ],
  initionalValues
}
