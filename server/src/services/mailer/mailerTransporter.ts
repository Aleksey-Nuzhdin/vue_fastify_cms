import nodemailer from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'
import { DataMailerTransporter } from './mailer.type';

const transporter = nodemailer.createTransport({
  host: process.env.MAILER_HOST,
  port: Number(process.env.MAILER_PORT) || 25,
});

export function mailerTransporter(data:DataMailerTransporter) {
  const { email, subject, text, attachments, email_from, name_from, template } = data
  
  
  return new Promise(async (resolve, reject) => {
    const mailConfig:Mail.Options = {
      from: { name: name_from, address: email_from },
      to: email,
      subject: subject,
      text: text,
      html: template || `<p>${text}</p>`,
      attachments: attachments,
    };
    
    transporter.sendMail(mailConfig, function(err, info) {
      if(err){
        reject(err);
      }
      if(info) {
        if(info.rejected.length > 0) {
          reject('bad email');
        } else {
          resolve(info.messageId);
        }
      }
    });
  });
};
