import type { I18nFormConfig } from '../../seeds.types'
const initionalValues = {
    title: "",
    isShow: true,
    id: "",
    members: [] as { name: { last: string; first: string; middle: string }; description: string; image: string }[]
}
export const pageCommitteeFormConfig: I18nFormConfig<typeof initionalValues> = {
  id: "committee",
  page: true,
  name: { ru: "Программный комитет", en: "Program Committee" },
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
      cols: 3
    },
    {
      type: "checkbox",
      label: { ru: "Показывать блок", en: "Show block" },
      field: "isShow",
      options: { value: true },
      cols: 3
    },
    {
      type: "array",
      label: { ru: "Участники", en: "Members" },
      field: "members",
      arrayItem: [
        {
          type: "object",
          label: { ru: "Фамилия, Имя, Отчество", en: "Full name" },
          field: "name",
          fieldsList: [
            {
              type: "input",
              label: { ru: "Фамилия", en: "Last name" },
              placeholder: { ru: "Введите фамилию", en: "Enter last name" },
              field: "last",
              options: { type: "text" },
              cols: 4,
            },
            {
              type: "input",
              label: { ru: "Имя", en: "First name" },
              placeholder: { ru: "Введите имя", en: "Enter first name" },
              field: "first",
              options: { type: "text" },
              cols: 4,
            },
            {
              type: "input",
              label: { ru: "Отчество", en: "Middle name" },
              placeholder: { ru: "Введите отчество", en: "Enter middle name" },
              field: "middle",
              options: { type: "text" },
              cols: 4,
            }
          ]
        },
        {
          type: "input",
          label: { ru: "Описание", en: "Description" },
          placeholder: { ru: "Введите описание", en: "Enter description" },
          field: "description",
          options: { type: "text" }
        },
        {
          type: "select-file",
          label: { ru: "Фото", en: "Photo" },
          placeholder: { ru: "Введите URL фото", en: "Enter photo URL" },
          field: "image",
          options: { }
        }
      ]
    }
  ],
  initionalValues
}