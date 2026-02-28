import nodemailer from 'nodemailer'

export async function sendSmtpEmail(
  connectionConfig: { host: string; port: number; user: string; pass: string },
  to: string,
  subject: string,
  body: string,
  cc?: string
) {
  const transporter = nodemailer.createTransport({
    host: connectionConfig.host,
    port: connectionConfig.port,
    secure: connectionConfig.port === 465,
    auth: {
      user: connectionConfig.user,
      pass: connectionConfig.pass,
    },
  })

  const result = await transporter.sendMail({
    from: connectionConfig.user,
    to,
    cc: cc || undefined,
    subject,
    text: body,
  })

  return result
}
