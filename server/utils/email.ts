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
        message: 'Email simulated in development mode' 
      }
    }

    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Moldova Direct <noreply@moldovadirect.com>',
      to,
      subject,
      html
    })

    if (error) {
      console.error('❌ Email send error:', error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    console.log('✅ Email sent successfully:', data?.id)
    return { success: true, id: data?.id }
  } catch (error: any) {
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
      signature: 'Equipo de Moldova Direct'
    },
    en: {
      subject: 'Verify your account - Moldova Direct',
      title: 'Welcome to Moldova Direct!',
      greeting: `Hello ${name},`,
      message: 'Thank you for signing up for Moldova Direct. To activate your account, click the button below:',
      button: 'Verify Account',
      expiry: 'This link will expire in 24 hours.',
      footer: 'If you did not create this account, you can safely ignore this email.',
      signature: 'Moldova Direct Team'
    },
    ro: {
      subject: 'Verifică-ți contul - Moldova Direct',
      title: 'Bun venit la Moldova Direct!',
      greeting: `Salut ${name},`,
      message: 'Mulțumim că te-ai înregistrat la Moldova Direct. Pentru a-ți activa contul, fă clic pe butonul de mai jos:',
      button: 'Verifică Contul',
      expiry: 'Acest link va expira în 24 de ore.',
      footer: 'Dacă nu ai creat acest cont, poți ignora acest email.',
      signature: 'Echipa Moldova Direct'
    },
    ru: {
      subject: 'Подтвердите ваш аккаунт - Moldova Direct',
      title: 'Добро пожаловать в Moldova Direct!',
      greeting: `Привет, ${name}!`,
      message: 'Спасибо за регистрацию в Moldova Direct. Чтобы активировать ваш аккаунт, нажмите на кнопку ниже:',
      button: 'Подтвердить Аккаунт',
      expiry: 'Эта ссылка истечет через 24 часа.',
      footer: 'Если вы не создавали этот аккаунт, можете проигнорировать это письмо.',
      signature: 'Команда Moldova Direct'
    }
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
      signature: 'Equipo de Moldova Direct'
    },
    en: {
      subject: 'Reset your password - Moldova Direct',
      title: 'Reset your password',
      greeting: `Hello ${name},`,
      message: 'We received a request to reset the password for your account. Click the button below to create a new password:',
      button: 'Reset Password',
      expiry: 'This link will expire in 30 minutes.',
      footer: 'If you did not request this change, you can safely ignore this email and your password will remain unchanged.',
      signature: 'Moldova Direct Team'
    },
    ro: {
      subject: 'Resetează parola - Moldova Direct',
      title: 'Resetează-ți parola',
      greeting: `Salut ${name},`,
      message: 'Am primit o cerere pentru resetarea parolei contului tău. Fă clic pe butonul de mai jos pentru a crea o parolă nouă:',
      button: 'Resetează Parola',
      expiry: 'Acest link va expira în 30 de minute.',
      footer: 'Dacă nu ai solicitat această schimbare, poți ignora acest email și parola ta va rămâne neschimbată.',
      signature: 'Echipa Moldova Direct'
    },
    ru: {
      subject: 'Сброс пароля - Moldova Direct',
      title: 'Сброс пароля',
      greeting: `Привет, ${name}!`,
      message: 'Мы получили запрос на сброс пароля для вашего аккаунта. Нажмите на кнопку ниже, чтобы создать новый пароль:',
      button: 'Сбросить Пароль',
      expiry: 'Эта ссылка истечет через 30 минут.',
      footer: 'Если вы не запрашивали это изменение, можете проигнорировать это письмо, и ваш пароль останется неизменным.',
      signature: 'Команда Moldova Direct'
    }
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

export
 function generateOrderConfirmationEmailHtml(name: string, order: any, locale: string = 'es') {
  const translations = {
    es: {
      subject: `Confirmación de pedido #${order.order_number}`,
      title: '¡Gracias por tu pedido!',
      greeting: `Hola ${name},`,
      message: 'Hemos recibido tu pedido y lo estamos procesando. A continuación encontrarás los detalles de tu compra:',
      orderNumber: 'Número de pedido',
      orderDate: 'Fecha del pedido',
      orderDetails: 'Detalles del pedido',
      product: 'Producto',
      quantity: 'Cantidad',
      price: 'Precio',
      total: 'Total',
      shippingAddress: 'Dirección de envío',
      paymentMethod: 'Método de pago',
      paymentMethods: {
        cash: 'Pago contra reembolso',
        credit_card: 'Tarjeta de crédito',
        paypal: 'PayPal',
        bank_transfer: 'Transferencia bancaria'
      },
      subtotal: 'Subtotal',
      shipping: 'Envío',
      tax: 'IVA',
      orderTotal: 'Total del pedido',
      trackOrder: 'Seguir pedido',
      footer: 'Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.',
      signature: 'Equipo de Moldova Direct',
      thankYou: 'Gracias por tu compra'
    },
    en: {
      subject: `Order confirmation #${order.order_number}`,
      title: 'Thank you for your order!',
      greeting: `Hello ${name},`,
      message: 'We have received your order and are processing it. Below you will find the details of your purchase:',
      orderNumber: 'Order number',
      orderDate: 'Order date',
      orderDetails: 'Order details',
      product: 'Product',
      quantity: 'Quantity',
      price: 'Price',
      total: 'Total',
      shippingAddress: 'Shipping address',
      paymentMethod: 'Payment method',
      paymentMethods: {
        cash: 'Cash on delivery',
        credit_card: 'Credit card',
        paypal: 'PayPal',
        bank_transfer: 'Bank transfer'
      },
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      tax: 'VAT',
      orderTotal: 'Order total',
      trackOrder: 'Track order',
      footer: 'If you have any questions about your order, please do not hesitate to contact us.',
      signature: 'Moldova Direct Team',
      thankYou: 'Thank you for your purchase'
    },
    ro: {
      subject: `Confirmare comandă #${order.order_number}`,
      title: 'Mulțumim pentru comanda ta!',
      greeting: `Salut ${name},`,
      message: 'Am primit comanda ta și o procesăm. Mai jos vei găsi detaliile achiziției tale:',
      orderNumber: 'Număr comandă',
      orderDate: 'Data comenzii',
      orderDetails: 'Detalii comandă',
      product: 'Produs',
      quantity: 'Cantitate',
      price: 'Preț',
      total: 'Total',
      shippingAddress: 'Adresă de livrare',
      paymentMethod: 'Metodă de plată',
      paymentMethods: {
        cash: 'Plată la livrare',
        credit_card: 'Card de credit',
        paypal: 'PayPal',
        bank_transfer: 'Transfer bancar'
      },
      subtotal: 'Subtotal',
      shipping: 'Livrare',
      tax: 'TVA',
      orderTotal: 'Total comandă',
      trackOrder: 'Urmărește comanda',
      footer: 'Dacă ai întrebări despre comanda ta, nu ezita să ne contactezi.',
      signature: 'Echipa Moldova Direct',
      thankYou: 'Mulțumim pentru achiziție'
    },
    ru: {
      subject: `Подтверждение заказа #${order.order_number}`,
      title: 'Спасибо за ваш заказ!',
      greeting: `Привет, ${name}!`,
      message: 'Мы получили ваш заказ и обрабатываем его. Ниже вы найдете детали вашей покупки:',
      orderNumber: 'Номер заказа',
      orderDate: 'Дата заказа',
      orderDetails: 'Детали заказа',
      product: 'Товар',
      quantity: 'Количество',
      price: 'Цена',
      total: 'Итого',
      shippingAddress: 'Адрес доставки',
      paymentMethod: 'Способ оплаты',
      paymentMethods: {
        cash: 'Оплата при доставке',
        credit_card: 'Кредитная карта',
        paypal: 'PayPal',
        bank_transfer: 'Банковский перевод'
      },
      subtotal: 'Промежуточный итог',
      shipping: 'Доставка',
      tax: 'НДС',
      orderTotal: 'Итого заказ',
      trackOrder: 'Отследить заказ',
      footer: 'Если у вас есть вопросы о вашем заказе, пожалуйста, свяжитесь с нами.',
      signature: 'Команда Moldova Direct',
      thankYou: 'Спасибо за покупку'
    }
  }

  const t = translations[locale as keyof typeof translations] || translations.es

  // Format order date
  const orderDate = new Date(order.created_at).toLocaleDateString(locale === 'es' ? 'es-ES' : locale === 'en' ? 'en-US' : locale === 'ro' ? 'ro-RO' : 'ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'es' ? 'es-ES' : locale === 'en' ? 'en-US' : locale === 'ro' ? 'ro-RO' : 'ru-RU', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  // Generate order items HTML
  const orderItemsHtml = order.order_items?.map((item: any) => {
    const productName = item.product_snapshot?.name_translations?.[locale] || item.product_snapshot?.name_translations?.en || 'Product'
    return `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${productName}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.price_eur)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${formatCurrency(item.total_eur)}</td>
      </tr>
    `
  }).join('') || ''

  // Format shipping address
  const shippingAddr = order.shipping_address
  const shippingAddressHtml = shippingAddr ? `
    ${shippingAddr.firstName} ${shippingAddr.lastName}<br>
    ${shippingAddr.street}<br>
    ${shippingAddr.city}, ${shippingAddr.postalCode}<br>
    ${shippingAddr.province ? shippingAddr.province + '<br>' : ''}
    ${shippingAddr.country}
  ` : 'N/A'

  // Get payment method label
  const paymentMethodLabel = t.paymentMethods[order.payment_method as keyof typeof t.paymentMethods] || order.payment_method

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${t.subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background-color: white; }
        .header { text-align: center; padding: 30px 20px; background-color: #e74c3c; color: white; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px 20px; }
        .order-info { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .order-info p { margin: 5px 0; }
        .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .order-table th { background-color: #f4f4f4; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
        .order-table th:last-child, .order-table td:last-child { text-align: right; }
        .totals { margin: 20px 0; }
        .totals table { width: 100%; max-width: 300px; margin-left: auto; }
        .totals td { padding: 5px 10px; }
        .totals .total-row { font-size: 18px; font-weight: bold; border-top: 2px solid #333; }
        .button { display: inline-block; padding: 12px 30px; background-color: #e74c3c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .button:hover { background-color: #c0392b; }
        .footer { text-align: center; padding: 20px; background-color: #f4f4f4; color: #666; font-size: 14px; }
        .section-title { font-size: 18px; font-weight: bold; margin: 20px 0 10px 0; color: #e74c3c; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Moldova Direct</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">${t.title}</p>
        </div>
        <div class="content">
          <p>${t.greeting}</p>
          <p>${t.message}</p>
          
          <div class="order-info">
            <p><strong>${t.orderNumber}:</strong> ${order.order_number}</p>
            <p><strong>${t.orderDate}:</strong> ${orderDate}</p>
          </div>

          <div class="section-title">${t.orderDetails}</div>
          <table class="order-table">
            <thead>
              <tr>
                <th>${t.product}</th>
                <th style="text-align: center;">${t.quantity}</th>
                <th style="text-align: right;">${t.price}</th>
                <th style="text-align: right;">${t.total}</th>
              </tr>
            </thead>
            <tbody>
              ${orderItemsHtml}
            </tbody>
          </table>

          <div class="totals">
            <table>
              <tr>
                <td>${t.subtotal}:</td>
                <td style="text-align: right;">${formatCurrency(order.subtotal_eur)}</td>
              </tr>
              <tr>
                <td>${t.shipping}:</td>
                <td style="text-align: right;">${formatCurrency(order.shipping_cost_eur)}</td>
              </tr>
              <tr>
                <td>${t.tax}:</td>
                <td style="text-align: right;">${formatCurrency(order.tax_eur)}</td>
              </tr>
              <tr class="total-row">
                <td>${t.orderTotal}:</td>
                <td style="text-align: right;">${formatCurrency(order.total_eur)}</td>
              </tr>
            </table>
          </div>

          <div class="section-title">${t.shippingAddress}</div>
          <div class="order-info">
            ${shippingAddressHtml}
          </div>

          <div class="section-title">${t.paymentMethod}</div>
          <div class="order-info">
            <p>${paymentMethodLabel}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p>${t.thankYou}!</p>
          </div>
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
