import type { I18nPageData } from '../../seeds.types'

export const data: I18nPageData = {
  ru: {
    id: "program",
    lang: "ru",
    page: "home",
    name: "Программа",
    data: {
      title: "Программа",
      isShow: true,
      id: "home-program",
      link: "https://ya.ru",
      days: [{
        day: "День 1",
        events: [{
          time: "09:30-10:00",
          description: "<p>Регистрация участников и приветственный кофе</p>"
        },{
          time: "10:00-11:30",
          description: "<p><strong>Пленарное заседание:</strong> открытие форума и приветственное слово организаторов</p>"
        },{
          time: "11:30-13:00",
          description: "<p>Панельная дискуссия «Тренды индустрии: чего ждать в ближайшие годы»</p>"
        },{
          time: "13:00-14:00",
          description: "<p>Обеденный перерыв</p>"
        },{
          time: "14:00-15:30",
          description: "<p>Мастер-класс для практиков: разбор реальных кейсов</p>"
        }]
      },{
        day: "День 2",
        events: [{
          time: "10:00-11:30",
          description: "<p>Секция докладов: выступления приглашённых спикеров</p>"
        },{
          time: "11:30-13:00",
          description: "<p>Нетворкинг-сессия и работа выставочных стендов</p>"
        },{
          time: "13:00-14:00",
          description: "<p>Обеденный перерыв</p>"
        },{
          time: "14:00-15:00",
          description: "<p>Подведение итогов, награждение и торжественное закрытие форума</p>"
        }],
      }]
    }
  },
  en: {
    id: "program",
    lang: "en",
    page: "home",
    name: "Program",
    data: {
      title: "Program",
      isShow: true,
      id: "home-program",
      link: "https://ya.ru",
      days: [{
        day: "Day 1",
        events: [{
          time: "09:30-10:00",
          description: "<p>Registration and welcome coffee</p>"
        },{
          time: "10:00-11:30",
          description: "<p><strong>Plenary session:</strong> forum opening and welcome address by the organizers</p>"
        },{
          time: "11:30-13:00",
          description: "<p>Panel discussion: “Industry trends and what to expect in the coming years”</p>"
        },{
          time: "13:00-14:00",
          description: "<p>Lunch break</p>"
        },{
          time: "14:00-15:30",
          description: "<p>Hands-on workshop: real-world case studies</p>"
        }]
      },{
        events: [{
          time: "10:00-11:30",
          description: "<p>Talks session: presentations by invited speakers</p>"
        },{
          time: "11:30-13:00",
          description: "<p>Networking session and exhibition stands</p>"
        },{
          time: "13:00-14:00",
          description: "<p>Lunch break</p>"
        },{
          time: "14:00-15:00",
          description: "<p>Wrap-up, awards and closing ceremony</p>"
        }],
        day: "Day 2"
      }]
    },
  }
}