import type { I18nFormConfig } from '../../seeds.types'
import type { Profile } from '@shared/types/form/pages'

const initionalValues: Profile.InitionalValues = {
  name:"",
  email:"",
  phone:"",
  plan:"",
  interests:[],
  company:"",
  bio:"",
  city:"",
  _id:'',
  role:'user',
}

export const profileFormConfig: I18nFormConfig<Profile.InitionalValues> = {
  id: "profile",
  name: { ru: "Профиль", en: "Profile" },
  fields: [
     {
      type: "input",
      label: { ru: "Фамилия, Имя, Отчество", en: "Full name" },
      placeholder: { ru: "Введите свое ФИО", en: "Enter your full name" },
      field: "name",
      cols: 4,
      options: {
        type: "text",
      }
    },
    {
      type: "input",
      label: "Email",
      placeholder: { ru: "Введите свой email", en: "Enter your email" },
      field: "email",
      cols: 4,
      options: {
        type: "email",
        readonly: true
      }
    },
    {
      cols: 4,
      type: "input",
      label: { ru: "Телефон", en: "Phone" },
      placeholder: { ru: "", en: "" },
      field: "phone",
      options: {
        type: "tel",
      }
    },{
      cols: 4,
      type: "select",
      label: { ru: "Тариф", en: "Plan" },
      placeholder: { ru: "", en: "" },
      field: "plan",
      options: {
        options:[{
          value: "basic",
          title: { ru: "Базовый", en: "Basic" }
        },{
          value: "pro",
          title: { ru: "Про", en: "Pro" }
        },{
          value: "enterprise",
          title: { ru: "Корпоративный", en: "Enterprise" }
        }]
      }
    },{
      cols: 4,
      type: "multi-select",
      label: { ru: "Интересы", en: "Interests" },
      placeholder: { ru: "", en: "" },
      field: "interests",
      options: {
        options:[{
          value: "design",
          title: { ru: "Дизайн", en: "Design" }
        },{
          value: "development",
          title: { ru: "Разработка", en: "Development" }
        },{
          value: "marketing",
          title: { ru: "Маркетинг", en: "Marketing" }
        }]
      }
    },
    {
      cols: 4,
      type: "input",
      label: { ru: "Компания", en: "Company" },
      placeholder: { ru: "", en: "" },
      field: "company",
      options: {
        type: "text",
      }
    },{
      cols: 4,
      type: "input",
      label: { ru: "О себе", en: "Bio" },
      placeholder: { ru: "", en: "" },
      field: "bio",
      options: {
        type: "textarea",
      }
    },{
      cols: 4,
      type: "input",
      label: { ru: "Город", en: "City" },
      placeholder: { ru: "", en: "" },
      field: "city",
      options: {
        type: "text",
      }
    },
  ],
  initionalValues
}
