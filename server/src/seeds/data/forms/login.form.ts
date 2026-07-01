import type { I18nFormConfig } from '../../seeds.types'
import type { Login } from '@shared/types/form/pages'

const initionalValues: Login.InitionalValues = {
  email: "",
  password: "",
  remember: false
}

export const loginFormConfig: I18nFormConfig<Login.InitionalValues> = {
  id: "login",
  name: { ru: "Логин", en: "Login" },
  fields: [
    {
      type: "input",
      label: "",
      placeholder: { ru: "Email", en: "Email" },
      field: "email",
      options: {
        type: "email",
        required: true
      }
    },
    {
      type: "input",
      label: "",
      placeholder: { ru: "Пароль", en: "Password" },
      field: "password",
      options: {
        type: "password",
        required: true
      }
    },
    {
      type: "checkbox",
      label: { ru: "Запомнить меня", en: "Remember me" },
      field: "remember",
      options: {
        value: true
      }
    }
  ],
  initionalValues
}
