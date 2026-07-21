import { mailerTransporter } from "./mailerTransporter";
import { DataMailerTransporter, DataMailer, TemplateData } from './mailer.type';
import * as templates from './templates/index';

const getTemplate = (t: TemplateData): string => {
  switch (t.type) {
    case 'forgotPassword':
      return templates.forgotPassword.html(t.code + "")
    case 'resetPassword':
      return ""  // templates.resetPassword.html(t.link)
    case 'registration':
      return templates.registration.html()
  }
}

const getAttachments = () => {
  return []
}

export async function mailer(data: DataMailer, templateData: TemplateData) {
  const template = getTemplate(templateData)
  const attachments = getAttachments()

  const dataTransporter:DataMailerTransporter = {
    email: data.email,
    subject: data.subject,
    text: data.text || '',
    email_from: data.email_from || process.env.MAILER_FROM || '',
    name_from: data.name_from || process.env.MAILER_FROM || '',
    template,
    attachments,
  }

  // Заглушка: реальный SMTP не поднимаем — печатаем письмо в консоль.
  // Позволяет вызывать mailer() из роутов (регистрация, восстановление пароля)
  // без настроенного SMTP-сервера. Дефолт болванки — выключено.
  if( process.env.MAILER_IS_ACTIVE !== 'true' ){
    if( process.env.NODE_ENV === 'development' ){
      console.log('[mailer] MAILER_IS_ACTIVE != true — письмо не отправлено, дамп:', dataTransporter)
    }
    return 'stubbed'
  }

  // Реальная отправка: нужна полная SMTP-конфигурация.
  // !process.env.MAILER_FROM || !process.env.MAILER_HOST || !process.env.MAILER_PORT
  // Проверяется наличие в /configs/index.ts
  // if( !process.env.MAILER_FROM || !process.env.MAILER_HOST || !process.env.MAILER_PORT ){
  //   throw new Error('MAILER_FROM, MAILER_HOST, MAILER_PORT is required')
  // }

  return mailerTransporter(dataTransporter);
}