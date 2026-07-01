import type { I18nFormConfig } from '../../seeds.types'

const initionalValues = {
  sections: [] as { value: string; title: string }[]
}

export const pageSectionFormConfig: I18nFormConfig<typeof initionalValues> = {
  id: "section",
  page: true,
  name: { ru: "Секции", en: "Sections" },
  fields: [
    {
      type: "array",
      label: { ru: "Секции", en: "Sections" },
      field: "sections",
      arrayItem: [
        {
          type: "input",
          label: { ru: "Заголовок", en: "Title" },
          placeholder: { ru: "Введите заголовок", en: "Enter title" },
          field: "title",
          options: { type: "text" },
          cols: 8,
        },{
          type: "input",
          label: { ru: "Уникальный id", en: "Id" },
          placeholder: { ru: "Укажите уникальный id", en: "Enter id" },
          field: "value",
          options: { type: "text", required: true },
          cols: 4
        }
      ]
    }
  ],
  initionalValues
}