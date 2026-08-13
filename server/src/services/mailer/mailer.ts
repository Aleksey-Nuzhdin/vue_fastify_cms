import { mailerTransporter } from "./mailerTransporter";
import { DataMailerTransporter, DataMailer, TemplateData } from './mailer.type';
import * as templates from './templates/index';
import type { FastifyBaseLogger } from 'fastify';

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

// Логгер приложения внедряется здесь, а не тащится через контроллер и сервис:
// причина сбоя отправки нужна только этой функции, наружу она не уходит —
// в теле ответа клиент видит константное 'Internal server error'
export function createMailer(log: FastifyBaseLogger) {
  return async function mailer(data: DataMailer, templateData: TemplateData) {
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

    try {
      return await mailerTransporter(dataTransporter);
    } catch (error) {
      // Единственное место, где сохраняется настоящая причина: вызывающий код
      // её либо подменяет AppError'ом, либо глотает. Значение пишем как есть —
      // mailerTransporter умеет отклоняться не Error'ом (`reject('bad email')`),
      // у такого значения нет ни .message, ни стека
      log.error({ err: error, to: data.email }, 'mailer: письмо не отправлено')
      throw error
    }
  }
}

export type Mailer = ReturnType<typeof createMailer>