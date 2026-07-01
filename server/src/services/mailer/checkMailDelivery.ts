import { mailerTransporter } from './mailerTransporter'

export async function checkMailDelivery() {
  const from = process.env.MAILER_FROM
  if (!from) {
    console.warn('[mailer] MAILER_FROM not set, skipping delivery check')
    return
  }

  try {
    await mailerTransporter({
      email: 'check-auth@verifier.port25.com',
      subject: 'Mail delivery check',
      text: 'Automated SPF/DKIM check on server start',
      template: '',
      attachments: [],
      email_from: from,
      name_from: from,
    })
    console.log('[mailer] Delivery check sent — check inbox at', from, 'for SPF/DKIM report')
  } catch (err) {
    console.warn('[mailer] Delivery check failed:', err)
  }
}
