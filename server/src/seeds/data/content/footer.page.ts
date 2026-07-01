import type { I18nPageData } from '../../seeds.types'

const id = 'footer'
export const data: I18nPageData = {
  ru: {
    id,
    page: "",
    lang: "ru",
    name: "Подвал",
    data: {
      nav: {
        title: "Навигация",
        links: [
          { link: "#home-baner", title: "Банер" },
          { link: "#home-program", title: "Программа" },
          { link: "#committee", title: "Комитет" },
        ]
      },
      contacts: {
        title: "Контакты",
        items: [
          { value: "+7 987 654 32 10" },
          { value: "info@site_nmae.ru" },
        ]
      },
      social: [
        { icon: "vk", url: "#" },
        { icon: "tg", url: "#" },
        { icon: "didya_maior", url: "#" }
      ]
    }
  },
  en: {
    id,
    page: "",
    lang: "en",
    name: "Footer",
    data: {
      nav: {
        title: "Navigation",
        links: [
          { link: "#home-baner", title: "Baner" },
          { link: "#home-program", title: "Program" },
           { link: "#committee", title: "Committee" },
        ]
      },
      contacts: {
        title: "Contacts",
        items: [
          { value: "+7 987 654 32 10" },
          { value: "info@site_nmae.ru" },
        ]
      },
      social: [
        { icon: "vk", url: "#" },
        { icon: "tg", url: "#" },
        { icon: "didya_maior", url: "#" }
      ]
    }
  }
}
