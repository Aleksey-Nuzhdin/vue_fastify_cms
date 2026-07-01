import type { I18nFormConfig } from '../../seeds.types'

const initionalValues = {
  title: "",
  id: "",
  title_date: "",
  sumbtitle: "",
  buttons: [] as { title: string; url: string; color: string; type?: string }[],
  place: "",
  type: "",
  archive: ""
}

export const pageBanerFormConfig: I18nFormConfig<typeof initionalValues> = {
  id: "baner",
  page: true,
  name: { ru: "Главная Банер", en: "Home Banner" },
  fields: [
    {
      type: "input",
      label: { ru: "Заголовок", en: "Title" },
      placeholder: { ru: "Введите заголовок", en: "Enter title" },
      field: "title",
      options: { type: "text" },
      cols: 8
    },
    {
      type: "input",
      label: { ru: "Якорь секции (id)", en: "Section anchor (id)" },
      placeholder: { ru: "Введите id", en: "Enter id" },
      field: "id",
      options: { type: "text" },
      cols: 4
    },
    {
      type: "input",
      label: { ru: "Дата", en: "Date" },
      placeholder: { ru: "Введите дату", en: "Enter date" },
      field: "title_date",
      options: { type: "text" },
      cols: 6
    },
    {
      type: "select-file",
      label: { ru: "Картинка", en: "Image" },
      placeholder: { ru: "Введите изображение", en: "Select image" },
      field: "baner_img",
      options: {  },
      cols: 6
    },
    {
      type: "input",
      label: { ru: "Подзаголовок", en: "Subtitle" },
      placeholder: { ru: "Введите подзаголовок", en: "Enter subtitle" },
      field: "sumbtitle",
      options: { type: "text" },
    },
    {
      type: "array",
      label: { ru: "Кнопки", en: "Buttons" },
      field: "buttons",
      arrayItem: [
        {
          type: "input",
          label: { ru: "Текст кнопки", en: "Button text" },
          placeholder: { ru: "Введите текст", en: "Enter text" },
          field: "title",
          options: { type: "text" },
          cols: 3,
        },
        {
          type: "input",
          label: { ru: "Ссылка", en: "Link" },
          placeholder: { ru: "Введите URL", en: "Enter URL" },
          field: "url",
          options: { type: "text" },
          cols: 3,
        },
        {
          type: "select",
          label: { ru: "Цвет", en: "Color" },
          placeholder: { ru: "Выберите цвет", en: "Select color" },
          field: "color",
          options: { options:[
            { value: 'primary', title: { ru: 'Оранжевый', en: 'Dark' } },
            { value: 'accent', title: { ru: 'Синий', en: 'Blue' } }
          ]},
          cols: 3
        },
        {
          type: "select",
          label: { ru: "Тип", en: "Type" },
          placeholder: { ru: "Выберите тип (рамка или закрашенная)", en: "Select type (outline or filled)" },
          field: "type",
          options: { options: [{ value: "outline", title: "Рамка" }, { value: "filled", title: "Закрашенная" }] },
          cols: 2
        },
        {
          type: "checkbox",
          label: { ru: "Скрыть", en: "Hide" },
          placeholder: { ru: "Выберите тип (рамка или закрашенная)", en: "Select type (outline or filled)" },
          field: "isHide",
          options: { value: true },
          cols: 1
        },
      ]
    },
    {
      type: "input",
      label: { ru: "Место проведения", en: "Venue" },
      placeholder: { ru: "Введите место", en: "Enter venue" },
      field: "place",
      options: { type: "text" }
    },
    {
      type: "input",
      label: { ru: "Формат", en: "Format" },
      placeholder: { ru: "офлайн / онлайн", en: "offline / online" },
      field: "type",
      options: { type: "text" }
    },
    {
      type: "input",
      label: { ru: "Архив", en: "Archive" },
      placeholder: { ru: "Введите ссылку на архив", en: "Enter archive link" },
      field: "archive",
      options: { type: "url" }
    }
  ],
  initionalValues
}
