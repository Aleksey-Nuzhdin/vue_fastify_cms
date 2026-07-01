import type { I18nPageData } from '../../seeds.types'

export const data: I18nPageData = {
  ru: {
    id: "page-login",
    lang: "ru",
    page: "login",
    name: "Логин",
    data: {
      title: "Вход",
      button: "Войти"
    }
  },
  en: {
    id: "page-login",
    lang: "en",
    page: "login",
    name: "Login",
    data: {
      title: "Sign In",
      button: "Sign In"
    }
  }
}
