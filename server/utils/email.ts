import { Resend } from 'resend'

let resend: Resend | null = null

// Initialize Resend only if API key is available
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY)
}

export interface EmailTemplate {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailTemplate) {
  try {
    if (!process.env.RESEND_API_KEY || !resend) {
      console.log('📧 Development mode: Email would be sent to:', to)
      console.log('📧 Subject:', subject)
      console.log('📧 RESEND_API_KEY not configured, simulating email send')

      // In development, log the email details
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email HTML preview:')
        console.log('---START EMAIL---')
        console.log(html.substring(0, 500) + '...')
        console.log('---END EMAIL---')
      }

      return {
        success: true,
        id: 'dev-mock-email-' + Date.now(),
        message: 'Email simulated in development mode',
      }
    }

    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Moldova Direct <noreply@moldovadirect.com>',
      to,
      subject,
      html,
    })

    if (error) {
      console.error('❌ Email send error:', error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    console.log('✅ Email sent successfully:', data?.id)
    return { success: true, id: data?.id }
  }
  catch (error: any) {
    console.error('❌ Email service error:', error)
    throw error
  }
}

export function generateVerificationEmailHtml(name: string, verificationUrl: string, locale: string = 'es') {
  const translations = {
    es: {
      subject: 'Verifica tu cuenta - Moldova Direct',
      title: '¡Bienvenido a Moldova Direct!',
      greeting: `Hola ${name},`,
      message: 'Gracias por registrarte en Moldova Direct. Para activar tu cuenta, haz clic en el botón de abajo:',
      button: 'Verificar Cuenta',
      expiry: 'Este enlace expirará en 24 horas.',
      footer: 'Si no creaste esta cuenta, puedes ignorar este email.',
      signature: 'Equipo de Moldova Direct',
    },
    en: {
      subject: 'Verify your account - Moldova Direct',
      title: 'Welcome to Moldova Direct!',
      greeting: `Hello ${name},`,
      message: 'Thank you for signing up for Moldova Direct. To activate your account, click the button below:',
      button: 'Verify Account',
      expiry: 'This link will expire in 24 hours.',
      footer: 'If you did not create this account, you can safely ignore this email.',
      signature: 'Moldova Direct Team',
    },
    ro: {
      subject: 'Verifică-ți contul - Moldova Direct',
      title: 'Bun venit la Moldova Direct!',
      greeting: `Salut ${name},`,
      message: 'Mulțumim că te-ai înregistrat la Moldova Direct. Pentru a-ți activa contul, fă clic pe butonul de mai jos:',
      button: 'Verifică Contul',
      expiry: 'Acest link va expira în 24 de ore.',
      footer: 'Dacă nu ai creat acest cont, poți ignora acest email.',
      signature: 'Echipa Moldova Direct',
    },
    ru: {
      subject: 'Подтвердите ваш аккаунт - Moldova Direct',
      title: 'Добро пожаловать в Moldova Direct!',
      greeting: `Привет, ${name}!`,
      message: 'Спасибо за регистрацию в Moldova Direct. Чтобы активировать ваш аккаунт, нажмите на кнопку ниже:',
      button: 'Подтвердить Аккаунт',
      expiry: 'Эта ссылка истечет через 24 часа.',
      footer: 'Если вы не создавали этот аккаунт, можете проигнорировать это письмо.',
      signature: 'Команда Moldova Direct',
    },
  }

  const t = translations[locale as keyof typeof translations] || translations.es

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${t.subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #e74c3c; }
        .header h1 { color: #e74c3c; margin: 0; }
        .content { padding: 30px 20px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #e74c3c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .button:hover { background-color: #c0392b; }
        .footer { text-align: center; padding: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
        .expiry { color: #666; font-size: 14px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Moldova Direct</h1>
        </div>
        <div class="content">
          <h2>${t.title}</h2>
          <p>${t.greeting}</p>
          <p>${t.message}</p>
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">${t.button}</a>
          </div>
          <p class="expiry">${t.expiry}</p>
        </div>
        <div class="footer">
          <p>${t.footer}</p>
          <p><strong>${t.signature}</strong></p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function generatePasswordResetEmailHtml(name: string, resetUrl: string, locale: string = 'es') {
  const translations = {
    es: {
      subject: 'Restablecer contraseña - Moldova Direct',
      title: 'Restablecer tu contraseña',
      greeting: `Hola ${name},`,
      message: 'Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón de abajo para crear una nueva contraseña:',
      button: 'Restablecer Contraseña',
      expiry: 'Este enlace expirará en 30 minutos.',
      footer: 'Si no solicitaste este cambio, puedes ignorar este email y tu contraseña permanecerá sin cambios.',
      signature: 'Equipo de Moldova Direct',
    },
    en: {
      subject: 'Reset your password - Moldova Direct',
      title: 'Reset your password',
      greeting: `Hello ${name},`,
      message: 'We received a request to reset the password for your account. Click the button below to create a new password:',
      button: 'Reset Password',
      expiry: 'This link will expire in 30 minutes.',
      footer: 'If you did not request this change, you can safely ignore this email and your password will remain unchanged.',
      signature: 'Moldova Direct Team',
    },
    ro: {
      subject: 'Resetează parola - Moldova Direct',
      title: 'Resetează-ți parola',
      greeting: `Salut ${name},`,
      message: 'Am primit o cerere pentru resetarea parolei contului tău. Fă clic pe butonul de mai jos pentru a crea o parolă nouă:',
      button: 'Resetează Parola',
      expiry: 'Acest link va expira în 30 de minute.',
      footer: 'Dacă nu ai solicitat această schimbare, poți ignora acest email și parola ta va rămâne neschimbată.',
      signature: 'Echipa Moldova Direct',
    },
    ru: {
      subject: 'Сброс пароля - Moldova Direct',
      title: 'Сброс пароля',
      greeting: `Привет, ${name}!`,
      message: 'Мы получили запрос на сброс пароля для вашего аккаунта. Нажмите на кнопку ниже, чтобы создать новый пароль:',
      button: 'Сбросить Пароль',
      expiry: 'Эта ссылка истечет через 30 минут.',
      footer: 'Если вы не запрашивали это изменение, можете проигнорировать это письмо, и ваш пароль останется неизменным.',
      signature: 'Команда Moldova Direct',
    },
  }

  const t = translations[locale as keyof typeof translations] || translations.es

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${t.subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #e74c3c; }
        .header h1 { color: #e74c3c; margin: 0; }
        .content { padding: 30px 20px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #e74c3c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .button:hover { background-color: #c0392b; }
        .footer { text-align: center; padding: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
        .expiry { color: #666; font-size: 14px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Moldova Direct</h1>
        </div>
        <div class="content">
          <h2>${t.title}</h2>
          <p>${t.greeting}</p>
          <p>${t.message}</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">${t.button}</a>
          </div>
          <p class="expiry">${t.expiry}</p>
        </div>
        <div class="footer">
          <p>${t.footer}</p>
          <p><strong>${t.signature}</strong></p>
        </div>
      </div>
    </body>
    </html>
  `
}
