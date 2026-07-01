import type { I18nPageData } from '../../seeds.types'

export const data: I18nPageData = {
  ru: {
    id: "page-register",
    lang: "ru",
    page: "register",
    name: "Регистрация",
    data: {
      title: "Регистрация",
      submitButton: "Зарегистрироваться",
      isShow: true,
      consentLink: "",
    }
  },
  en: {
    id: "page-register",
    lang: "en",
    page: "register",
    name: "Registration",
    data: {
      title: "Registration",
      submitButton: "Register",
      isShow: true,
      consentLink: ""
    }
  }
}
