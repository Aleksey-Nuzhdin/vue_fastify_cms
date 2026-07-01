import type { I18nPageData } from '../../seeds.types'

export const data: I18nPageData = {
  ru: {
    id: "baner",
    lang: "ru",
    page: "home",
    name: "Банер",
    data: {
      title: "ВАЖНОЕ СОБЫТИЕ МЕСЯЦА",
      id: "home-baner",
      title_date: "30–31 февраля 3027",
      sumbtitle: "Более подробный подзаголовок события",
      buttons: [
        { title: "Регистрация", url: "/register", color: "primary" },
        { title: "программа", url: "#home-program", color: "primary", type: "outline" }
      ],
      place: "Россия",
      type: "офлайн / онлайн",
      archive: "/archive/2026"
    }
  },
  en: {
    id: "baner",
    lang: "en",
    page: "home",
    name: "Banner",
    data: {
      title: "IMPORTANT EVENT OF THE MONTH",
      id: "home-baner",
      title_date: "February 30–31, 3027",
      sumbtitle: "More detailed subtitle of the event",
      buttons: [
        { title: "Registration", url: "/register", color: "primary"},
        { title: "Program", url: "#home-program", color: "primary", type: "outline"}
      ],
      place: "Russia",
      type: "offline / online",
      archive: "/archive/2026"
    }
  }
}
