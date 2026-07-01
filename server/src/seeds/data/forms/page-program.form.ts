import type { I18nFormConfig } from '../../seeds.types'

const initionalValues = {
  title: "",
  link: "",
  days: []
}

export const pageAboutFormConfig: I18nFormConfig<typeof initionalValues> = {
  id: "program",
  page: true,
  name: { ru: "Программа", en: "program" },
  fields: [
    {
      type: "input",
      label: { ru: "Заголовок", en: "Title" },
      placeholder: { ru: "Введите заголовок", en: "Enter title" },
      field: "title",
      options: { type: "text" },
      cols: 6
    },
    {
      type: "input",
      label: { ru: "Якорь секции (id)", en: "Section anchor (id)" },
      placeholder: { ru: "Введите id", en: "Enter id" },
      field: "id",
      options: { type: "text" },
      cols:3
    },
    {
      type: "checkbox",
      label: { ru: "Показывать блок", en: "Show block" },
      field: "isShow",
      options: { value: true },
      cols: 3
    },
    
    {
      type: "input",
      label: { ru: "Ссылка на pdf", en: "Link to pdf" },
      placeholder: { ru: "Укажите ссылку для скачивания pdf", en: "Enter link to download pdf" },
      field: "link",
      options: { type: "text" }
    },
    {
      type: "array",
      label: { ru: "Дни", en: "Days" },
      field: "days",
      arrayItem: [
        {
          type: "input",
          label: { ru: "День", en: "Day" },
          placeholder: { ru: "Укажите день", en: "Enter day" },
          field: "day",
          options: { type: "text" }
        },
        {
          type: "array",
          label: { ru: "События", en: "Events" },
          field: "events",
          arrayItem: [{
            type: "input",
            label: { ru: "Время", en: "time" },
            placeholder: { ru: "Укажите время 11:00-12:00", en: "Enter time 11:00-12:00" },
            field: "time",
            options: { type: "text" }
          },{
            type: "quill",
            label: { ru: "Описание", en: "Description" },
            placeholder: { ru: "Укажите время 11:00-12:00", en: "Enter time 11:00-12:00" },
            field: "description",
            options: { }
          }]
        }
      ]
    }
  ],
  initionalValues
}
