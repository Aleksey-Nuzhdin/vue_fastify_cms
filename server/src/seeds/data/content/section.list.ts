import type { I18nPageData } from '../../seeds.types'

export const data: I18nPageData = {
  ru: {
    id: "section",
    lang: "ru",
    type: "list",
    name: "Секции",
    data: {
      items: [
        {
          value: "one",
          title: "Книга в социальных  коммуникациях",
        },
        {
          value: "two",
          title: "Чтение в историческом  измерении",
        },
      ]
    },
  },
  en: {
    id: "section",
    lang: "en",
    type: "list",
    name: "Sections",
    data: {
      items: [
        {
          value: "one",
          title: "Book in social communication",
        },
        {
          value: "two",
          title: "Reading in the historical dimension",
        },
      ]
    },
  }
}
