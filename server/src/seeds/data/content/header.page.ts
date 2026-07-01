import type { I18nPageData } from '../../seeds.types'

const id = 'header'
export const data: I18nPageData = {
  ru: {
    id,
    page: "",
    lang: "ru",
    name: "Шапка",
    data: {
      sections: [
        { link: "#home-baner", title: "банер" },
        { link: "#home-program", title: "программа" },
        { link: "#committee", title: "Комитет" },
      ]
    }
  },
  en: {
    id,
    page:"",
    lang: "en",
    name: "Header",
    data: {
      sections: [
        { link: "#home-baner", title: "Baner" },
        { link: "#section", title: "Sections" },
        { link: "#committee", title: "Committee" },
      ]
    }
  }
}
