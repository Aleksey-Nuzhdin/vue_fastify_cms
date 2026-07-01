import Mail from "nodemailer/lib/mailer";

export interface DataMailerTransporter {
  email:string // email получателя
  subject:string // тема письма
  text:string // текст письма
  attachments:Mail.Attachment[] // прикрепленные файлы
  email_from:string // email отправителя
  name_from:string // имя отправителя
  template:string,

}

export interface DataMailer{
  email:string // email получателя
  subject:string // тема письма
  text:string // текст письма
  email_from?:string // email отправителя
  name_from?:string // имя отправителя
}


export type TemplateData =
  | { type: 'forgotPassword'; code: number }
  | { type: 'resetPassword'; link: string }
  | { type: 'registration' }

