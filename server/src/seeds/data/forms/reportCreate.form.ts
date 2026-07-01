import type { I18nFormConfig, I18nFormField } from '../../seeds.types'
import type { ReportCreate } from '@shared/types/form/pages'

const initionalValues: ReportCreate.InitionalValues = {
  authors: [],
  title: '',
  description: '',
  fileAnnotation: '',
  section: '',
}

const AuthorItem: I18nFormField[] = [
  {
    type: 'input',
    label: { ru: "Фамилия, Имя, Отчество", en: "Full name" },
    placeholder: { ru: "Введите ФИО", en: "Enter full name" },
    field: "name",
    cols: 4,
    options: { type: 'text' }
  },
  {
    type: 'input',
    label: "Email",
    placeholder: { ru: "Введите email", en: "Enter email" },
    field: "email",
    cols: 4,
    options: { type: 'text' }
  },
  {
    type: 'select',
    label: { ru: "Форма участия", en: "Participation type" },
    placeholder: { ru: "Выберите форму участия", en: "Select participation type" },
    field: "participation",
    cols: 4,
    options: {
      options: [
        { title: { ru: 'Онлайн докладчик', en: 'Online speaker' }, value: 'online-reporter' },
        { title: { ru: 'Офлайн докладчик', en: 'Offline speaker' }, value: 'offline-reporter' },
        { title: { ru: 'Слушатель', en: 'Listener' }, value: 'listner' }
      ]
    }
  },
  {
    type: 'input',
    label: { ru: "Организация", en: "Organization" },
    cols: 4,
    placeholder: { ru: "Введите Организацию", en: "Enter organization" },
    field: "organization",
    options: { type: 'text' }
  },
  {
    type: 'input',
    label: { ru: "Должность", en: "Position" },
    placeholder: { ru: "Введите должность", en: "Enter position" },
    field: "position",
    options: { type: 'text' },
    cols: 4,
  },
  {
    type: 'input',
    label: { ru: "Город", en: "City" },
    placeholder: { ru: "Введите город", en: "Enter city" },
    field: "city",
    options: { type: 'text' },
    cols: 4,
  }
]

export const reportCreateFormConfig: I18nFormConfig<ReportCreate.InitionalValues> = {
  id: "reportCreate",
  name: { ru: "Создание доклада", en: "Create report" },
  fields: [
    {
      type: "input",
      label: { ru: "Название доклада", en: "Report title" },
      placeholder: { ru: "Введите название", en: "Enter title" },
      field: "title",
      options: { type: 'text', required: true }
    },
    {
      type: "select",
      label: { ru: "Секция", en: "Section" },
      placeholder: { ru: "Выберите секцию", en: "Select section" },
      field: "section",
      cols: 6,
      options: { options: [], required: true }
    },
    {
      type: "file",
      label: { ru: "Дополнительные материалы (.docx / .txt / .pdf)", en: "Additional materials (.docx / .txt / .pdf)" },
      placeholder: { ru: "Выберите файл", en: "Select file" },
      field: "fileAnnotation",
      cols: 6,
      options: { typeInputFile: 'upload' }
    },
    {
      type: "quill",
      label: { ru: "Аннотация", en: "Annotation" },
      placeholder: { ru: "Добавьте аннотацию (не более 200 слов)", en: "Add annotation (max 200 words)" },
      field: "description",
    },
    {
      type: 'array',
      label: { ru: 'Информация об авторах', en: 'Author info' },
      field: 'authors',
      arrayItem: AuthorItem
    }
  ],
  initionalValues
}
