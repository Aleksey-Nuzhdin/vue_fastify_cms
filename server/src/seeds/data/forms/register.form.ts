import type { I18nFormConfig } from '../../seeds.types'
import type { Register } from '@shared/types/form/pages'

const initionalValues: Register.InitionalValues = {
  email: "",
  password: "",
  name: "",
  phone:"",
  plan:"",
  interests:[],
  company:"",
  bio:"",
  city:"",
}

export const registerFormConfig: I18nFormConfig<Register.InitionalValues> = {
  id: "register",
  name: { ru: "Регистрация", en: "Registration" },
  fields: [
    //step 1
    {
      type: "input",
      label:'',
      placeholder: { ru: "Фамилия, имя, отчество", en: "Full name" },
      field: "name",
      options: {
        type: "text",
        required: true
      }
    },
    {
      type: "input",
      label:'',
      placeholder: { ru: "Email", en: "Email" },
      field: "email",
      options: {
        type: "email",
        required: true
      }
    },
    {
      type: "input",
      label:'',
      placeholder: { ru: "Пароль", en: "Password" },
      field: "password",
      options: {
        type: "password",
        required: true
      }
    },
    //step 2
    {
      type: "input",
      label:'',
      placeholder: { ru: "Телефон", en: "Phone" },
      field: "phone",
      options: {
        type: "tel",
        required: true
      }
    },{
      type: "select",
      label:'',
      placeholder: { ru: "Тариф", en: "Plan" },
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
      type: "multi-select",
      label:'',
      placeholder: { ru: "Интересы", en: "Interests" },
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
    //step 3
    {
      type: "input",
      label:'',
      placeholder: { ru: "Компания", en: "Company" },
      field: "company",
      options: {
        type: "text",
      }
    },{
      type: "input",
      label:'',
      placeholder: { ru: "О себе", en: "Bio" },
      field: "bio",
      options: {
        type: "textarea",
      }
    },{
      type: "input",
      label:'',
      placeholder: { ru: "Город", en: "City" },
      field: "city",
      options: {
        type: "text",
      }
    },
    // {
    //   type: "checkbox",
    //   label:'',
    //   placeholder: { ru: "", en: "" },
    //   field: "consent",
    //   options: {
    //     value: true
    //   }
    // },


  ],
  initionalValues
}
