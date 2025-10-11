/**
 * Order Status Email Templates
 * Templates for different order status notification types
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { getEmailTranslations, replaceTranslationPlaceholders } from './translations'
import { formatCurrency, formatDate, normalizeLocale } from './formatters'
import type { OrderEmailData, OrderItemData, AddressData } from './types'

/**
 * Status-specific translations
 */
interface StatusTranslations {
  subject: string
  preheader: string
  title: string
  message: string
  statusLabel: string
  nextSteps?: string
  ctaButton?: string
  ctaUrl?: string
}

/**
 * Get translations for order processing email
 */
function getProcessingTranslations(locale: string, orderNumber: string): StatusTranslations {
  const translations: Record<string, StatusTranslations> = {
    es: {
      subject: `Tu pedido #${orderNumber} está siendo procesado - Moldova Direct`,
      preheader: `Estamos preparando tu pedido ${orderNumber}`,
      title: '¡Tu pedido está siendo procesado!',
      message: 'Hemos comenzado a preparar tu pedido. Te notificaremos cuando sea enviado.',
      statusLabel: 'En proceso',
      nextSteps: 'Estamos preparando tus productos cuidadosamente. Recibirás un correo de confirmación cuando tu pedido sea enviado con información de seguimiento.',
      ctaButton: 'Ver estado del pedido',
      ctaUrl: `/account/orders/${orderNumber}`
    },
    en: {
      subject: `Your order #${orderNumber} is being processed - Moldova Direct`,
      preheader: `We are preparing your order ${orderNumber}`,
      title: 'Your order is being processed!',
      message: 'We have started preparing your order. We will notify you when it is shipped.',
      statusLabel: 'Processing',
      nextSteps: 'We are carefully preparing your products. You will receive a confirmation email when your order is shipped with tracking information.',
      ctaButton: 'View order status',
      ctaUrl: `/account/orders/${orderNumber}`
    },
    ro: {
      subject: `Comanda ta #${orderNumber} este în curs de procesare - Moldova Direct`,
      preheader: `Pregătim comanda ta ${orderNumber}`,
      title: 'Comanda ta este în curs de procesare!',
      message: 'Am început să pregătim comanda ta. Te vom notifica când va fi expediată.',
      statusLabel: 'În procesare',
      nextSteps: 'Pregătim cu grijă produsele tale. Vei primi un email de confirmare când comanda ta va fi expediată cu informații de urmărire.',
      ctaButton: 'Vezi starea comenzii',
      ctaUrl: `/account/orders/${orderNumber}`
    },
    ru: {
      subject: `Ваш заказ #${orderNumber} обрабатывается - Moldova Direct`,
      preheader: `Мы готовим ваш заказ ${orderNumber}`,
      title: 'Ваш заказ обрабатывается!',
      message: 'Мы начали готовить ваш заказ. Мы уведомим вас, когда он будет отправлен.',
      statusLabel: 'В обработке',
      nextSteps: 'Мы тщательно готовим ваши товары. Вы получите подтверждение по электронной почте, когда ваш заказ будет отправлен с информацией об отслеживании.',
      ctaButton: 'Посмотреть статус заказа',
      ctaUrl: `/account/orders/${orderNumber}`
    }
  }
  
  return translations[locale] || translations.en
}

/**
 * Get translations for order shipped email
 */
function getShippedTranslations(locale: string, orderNumber: string): StatusTranslations {
  const translations: Record<string, StatusTranslations> = {
    es: {
      subject: `Tu pedido #${orderNumber} ha sido enviado - Moldova Direct`,
      preheader: `Tu pedido ${orderNumber} está en camino`,
      title: '¡Tu pedido ha sido enviado!',
      message: 'Tu pedido está en camino. Puedes seguir su progreso usando el número de seguimiento a continuación.',
      statusLabel: 'Enviado',
      nextSteps: 'Tu paquete está en camino. Puedes usar el número de seguimiento para ver actualizaciones en tiempo real sobre la ubicación de tu pedido.',
      ctaButton: 'Seguir envío',
      ctaUrl: ''
    },
    en: {
      subject: `Your order #${orderNumber} has been shipped - Moldova Direct`,
      preheader: `Your order ${orderNumber} is on its way`,
      title: 'Your order has been shipped!',
      message: 'Your order is on its way. You can track its progress using the tracking number below.',
      statusLabel: 'Shipped',
      nextSteps: 'Your package is on its way. You can use the tracking number to see real-time updates on your order location.',
      ctaButton: 'Track shipment',
      ctaUrl: ''
    },
    ro: {
      subject: `Comanda ta #${orderNumber} a fost expediată - Moldova Direct`,
      preheader: `Comanda ta ${orderNumber} este în drum`,
      title: 'Comanda ta a fost expediată!',
      message: 'Comanda ta este în drum. Poți urmări progresul folosind numărul de urmărire de mai jos.',
      statusLabel: 'Expediată',
      nextSteps: 'Pachetul tău este în drum. Poți folosi numărul de urmărire pentru a vedea actualizări în timp real despre locația comenzii tale.',
      ctaButton: 'Urmărește expedierea',
      ctaUrl: ''
    },
    ru: {
      subject: `Ваш заказ #${orderNumber} отправлен - Moldova Direct`,
      preheader: `Ваш заказ ${orderNumber} в пути`,
      title: 'Ваш заказ отправлен!',
      message: 'Ваш заказ в пути. Вы можете отследить его прогресс, используя номер отслеживания ниже.',
      statusLabel: 'Отправлен',
      nextSteps: 'Ваша посылка в пути. Вы можете использовать номер отслеживания, чтобы видеть обновления в реальном времени о местоположении вашего заказа.',
      ctaButton: 'Отследить отправление',
      ctaUrl: ''
    }
  }
  
  return translations[locale] || translations.en
}

/**
 * Get translations for order delivered email
 */
function getDeliveredTranslations(locale: string, orderNumber: string): StatusTranslations {
  const translations: Record<string, StatusTranslations> = {
    es: {
      subject: `Tu pedido #${orderNumber} ha sido entregado - Moldova Direct`,
      preheader: `Tu pedido ${orderNumber} ha llegado`,
      title: '¡Tu pedido ha sido entregado!',
      message: 'Tu pedido ha sido entregado con éxito. Esperamos que disfrutes de tus productos.',
      statusLabel: 'Entregado',
      nextSteps: '¿Te gustó tu compra? Nos encantaría conocer tu opinión. Tu feedback nos ayuda a mejorar nuestro servicio.',
      ctaButton: 'Dejar una reseña',
      ctaUrl: `/account/orders/${orderNumber}/review`
    },
    en: {
      subject: `Your order #${orderNumber} has been delivered - Moldova Direct`,
      preheader: `Your order ${orderNumber} has arrived`,
      title: 'Your order has been delivered!',
      message: 'Your order has been successfully delivered. We hope you enjoy your products.',
      statusLabel: 'Delivered',
      nextSteps: 'Did you like your purchase? We would love to hear your feedback. Your review helps us improve our service.',
      ctaButton: 'Leave a review',
      ctaUrl: `/account/orders/${orderNumber}/review`
    },
    ro: {
      subject: `Comanda ta #${orderNumber} a fost livrată - Moldova Direct`,
      preheader: `Comanda ta ${orderNumber} a sosit`,
      title: 'Comanda ta a fost livrată!',
      message: 'Comanda ta a fost livrată cu succes. Sperăm că te bucuri de produsele tale.',
      statusLabel: 'Livrată',
      nextSteps: 'Ți-a plăcut achiziția? Ne-ar plăcea să auzim părerea ta. Recenzia ta ne ajută să îmbunătățim serviciul nostru.',
      ctaButton: 'Lasă o recenzie',
      ctaUrl: `/account/orders/${orderNumber}/review`
    },
    ru: {
      subject: `Ваш заказ #${orderNumber} доставлен - Moldova Direct`,
      preheader: `Ваш заказ ${orderNumber} прибыл`,
      title: 'Ваш заказ доставлен!',
      message: 'Ваш заказ успешно доставлен. Надеемся, вам понравятся ваши товары.',
      statusLabel: 'Доставлен',
      nextSteps: 'Вам понравилась покупка? Мы будем рады услышать ваше мнение. Ваш отзыв помогает нам улучшить наш сервис.',
      ctaButton: 'Оставить отзыв',
      ctaUrl: `/account/orders/${orderNumber}/review`
    }
  }
  
  return translations[locale] || translations.en
}

/**
 * Get translations for order cancelled email
 */
function getCancelledTranslations(locale: string, orderNumber: string): StatusTranslations {
  const translations: Record<string, StatusTranslations> = {
    es: {
      subject: `Tu pedido #${orderNumber} ha sido cancelado - Moldova Direct`,
      preheader: `Pedido ${orderNumber} cancelado`,
      title: 'Tu pedido ha sido cancelado',
      message: 'Tu pedido ha sido cancelado. Si realizaste un pago, se procesará un reembolso completo.',
      statusLabel: 'Cancelado',
      nextSteps: 'Si pagaste con tarjeta de crédito o PayPal, el reembolso se procesará en 5-10 días hábiles. Si tienes alguna pregunta, no dudes en contactarnos.',
      ctaButton: 'Contactar soporte',
      ctaUrl: '/contact'
    },
    en: {
      subject: `Your order #${orderNumber} has been cancelled - Moldova Direct`,
      preheader: `Order ${orderNumber} cancelled`,
      title: 'Your order has been cancelled',
      message: 'Your order has been cancelled. If you made a payment, a full refund will be processed.',
      statusLabel: 'Cancelled',
      nextSteps: 'If you paid by credit card or PayPal, the refund will be processed within 5-10 business days. If you have any questions, please do not hesitate to contact us.',
      ctaButton: 'Contact support',
      ctaUrl: '/contact'
    },
    ro: {
      subject: `Comanda ta #${orderNumber} a fost anulată - Moldova Direct`,
      preheader: `Comandă ${orderNumber} anulată`,
      title: 'Comanda ta a fost anulată',
      message: 'Comanda ta a fost anulată. Dacă ai efectuat o plată, se va procesa o rambursare completă.',
      statusLabel: 'Anulată',
      nextSteps: 'Dacă ai plătit cu card de credit sau PayPal, rambursarea va fi procesată în 5-10 zile lucrătoare. Dacă ai întrebări, nu ezita să ne contactezi.',
      ctaButton: 'Contactează suportul',
      ctaUrl: '/contact'
    },
    ru: {
      subject: `Ваш заказ #${orderNumber} отменен - Moldova Direct`,
      preheader: `Заказ ${orderNumber} отменен`,
      title: 'Ваш заказ отменен',
      message: 'Ваш заказ был отменен. Если вы совершили платеж, будет обработан полный возврат средств.',
      statusLabel: 'Отменен',
      nextSteps: 'Если вы оплатили кредитной картой или PayPal, возврат будет обработан в течение 5-10 рабочих дней. Если у вас есть вопросы, пожалуйста, свяжитесь с нами.',
      ctaButton: 'Связаться с поддержкой',
      ctaUrl: '/contact'
    }
  }
  
  return translations[locale] || translations.en
}

/**
 * Get translations for order issue email
 */
function getIssueTranslations(locale: string, orderNumber: string): StatusTranslations {
  const translations: Record<string, StatusTranslations> = {
    es: {
      subject: `Problema con tu pedido #${orderNumber} - Moldova Direct`,
      preheader: `Necesitamos tu atención para el pedido ${orderNumber}`,
      title: 'Problema con tu pedido',
      message: 'Hemos encontrado un problema con tu pedido que requiere tu atención. Por favor, revisa los detalles a continuación.',
      statusLabel: 'Requiere atención',
      nextSteps: 'Nuestro equipo de soporte está trabajando para resolver este problema. Te contactaremos pronto con más información. Si tienes preguntas urgentes, no dudes en contactarnos.',
      ctaButton: 'Contactar soporte',
      ctaUrl: '/contact'
    },
    en: {
      subject: `Issue with your order #${orderNumber} - Moldova Direct`,
      preheader: `We need your attention for order ${orderNumber}`,
      title: 'Issue with your order',
      message: 'We have encountered an issue with your order that requires your attention. Please review the details below.',
      statusLabel: 'Requires attention',
      nextSteps: 'Our support team is working to resolve this issue. We will contact you soon with more information. If you have urgent questions, please do not hesitate to contact us.',
      ctaButton: 'Contact support',
      ctaUrl: '/contact'
    },
    ro: {
      subject: `Problemă cu comanda ta #${orderNumber} - Moldova Direct`,
      preheader: `Avem nevoie de atenția ta pentru comanda ${orderNumber}`,
      title: 'Problemă cu comanda ta',
      message: 'Am întâmpinat o problemă cu comanda ta care necesită atenția ta. Te rugăm să verifici detaliile de mai jos.',
      statusLabel: 'Necesită atenție',
      nextSteps: 'Echipa noastră de suport lucrează pentru a rezolva această problemă. Te vom contacta în curând cu mai multe informații. Dacă ai întrebări urgente, nu ezita să ne contactezi.',
      ctaButton: 'Contactează suportul',
      ctaUrl: '/contact'
    },
    ru: {
      subject: `Проблема с вашим заказом #${orderNumber} - Moldova Direct`,
      preheader: `Нам нужно ваше внимание к заказу ${orderNumber}`,
      title: 'Проблема с вашим заказом',
      message: 'Мы столкнулись с проблемой с вашим заказом, которая требует вашего внимания. Пожалуйста, ознакомьтесь с деталями ниже.',
      statusLabel: 'Требует внимания',
      nextSteps: 'Наша команда поддержки работает над решением этой проблемы. Мы свяжемся с вами в ближайшее время с дополнительной информацией. Если у вас есть срочные вопросы, пожалуйста, свяжитесь с нами.',
      ctaButton: 'Связаться с поддержкой',
      ctaUrl: '/contact'
    }
  }
  
  return translations[locale] || translations.en
}

/**
 * Generate base email template structure
 */
function generateBaseTemplate(
  data: OrderEmailData,
  statusTranslations: StatusTranslations,
  locale: string,
  includeOrderDetails: boolean = true
): string {
  const baseTranslations = getEmailTranslations(locale)
  const formattedDate = formatDate(data.orderDate, locale)
  const greeting = replaceTranslationPlaceholders(statusTranslations.title, { name: data.customerName })

  let orderDetailsSection = ''
  if (includeOrderDetails) {
    orderDetailsSection = `
      <!-- Order items summary -->
      <h2 style="margin: 30px 0 15px 0; font-size: 18px; color: #e74c3c; font-weight: bold;">
        ${baseTranslations.orderDetails}
      </h2>
      
      ${generateOrderItemsSummary(data.orderItems, baseTranslations, locale)}
      
      <!-- Order total -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
        <tr>
          <td style="padding: 0;">
            <table role="presentation" width="300" cellpadding="0" cellspacing="0" border="0" align="right" style="max-width: 100%;">
              <tr style="border-top: 2px solid #333333;">
                <td style="padding: 12px 0 0 0; font-size: 16px; color: #333333; font-weight: bold;">
                  ${baseTranslations.orderTotal}:
                </td>
                <td style="padding: 12px 0 0 0; text-align: right; font-size: 16px; color: #e74c3c; font-weight: bold;">
                  ${formatCurrency(data.total, locale)}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `
  }

  return `
<!DOCTYPE html>
<html lang="${locale}" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${statusTranslations.subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      min-width: 100%;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      background-color: #f4f4f4;
    }
    table { border-collapse: collapse; border-spacing: 0; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; max-width: 100% !important; }
      .mobile-padding { padding: 15px !important; }
      .mobile-hide { display: none !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4;">
  <!-- Preheader -->
  <div style="display: none; max-height: 0; overflow: hidden;" aria-hidden="true">
    ${statusTranslations.preheader}
  </div>
  
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #e74c3c; padding: 30px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">
                Moldova Direct
              </h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">
                ${statusTranslations.title}
              </p>
            </td>
          </tr>
          
          <!-- Main content -->
          <tr>
            <td class="mobile-padding" style="padding: 30px 40px;">
              <!-- Status badge -->
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="display: inline-block; padding: 8px 16px; background-color: #f0f0f0; color: #333; border-radius: 20px; font-size: 14px; font-weight: bold;">
                  ${statusTranslations.statusLabel}
                </span>
              </div>
              
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #333333;">
                ${replaceTranslationPlaceholders(baseTranslations.greeting, { name: data.customerName })}
              </p>
              
              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #333333;">
                ${statusTranslations.message}
              </p>
              
              <!-- Order info -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9f9f9; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #333333;">
                      <strong>${baseTranslations.orderNumber}:</strong> ${data.orderNumber}
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #333333;">
                      <strong>${baseTranslations.orderDate}:</strong> ${formattedDate}
                    </p>
                  </td>
                </tr>
              </table>
              
              ${orderDetailsSection}
              
              <!-- Next steps -->
              ${statusTranslations.nextSteps ? `
              <div style="background-color: #f0f8ff; border-left: 4px solid #e74c3c; padding: 15px; margin: 30px 0;">
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #333333;">
                  ${statusTranslations.nextSteps}
                </p>
              </div>
              ` : ''}
              
              <!-- CTA Button -->
              ${statusTranslations.ctaButton && statusTranslations.ctaUrl ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${statusTranslations.ctaUrl}" style="display: inline-block; padding: 14px 32px; background-color: #e74c3c; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
                  ${statusTranslations.ctaButton}
                </a>
              </div>
              ` : ''}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f4; padding: 30px 40px; text-align: center; border-top: 1px solid #dddddd;">
              <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6; color: #666666;">
                ${baseTranslations.footer}
              </p>
              <p style="margin: 0 0 15px 0; font-size: 14px; color: #666666;">
                <strong>${baseTranslations.signature}</strong>
              </p>
              <p style="margin: 0; font-size: 12px; color: #999999;">
                ${baseTranslations.companyInfo}
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Generate tracking information section
 */
function generateTrackingSection(data: OrderEmailData, translations: any, locale: string): string {
  const estimatedDelivery = data.estimatedDelivery ? formatDate(data.estimatedDelivery, locale) : null
  
  return `
    <!-- Tracking information -->
    <div style="background-color: #f0f8ff; border: 2px solid #e74c3c; border-radius: 8px; padding: 20px; margin: 30px 0;">
      <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #e74c3c; font-weight: bold;">
        ${translations.trackingInfo}
      </h3>
      
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding-bottom: 12px;">
            <p style="margin: 0; font-size: 14px; color: #666666;">
              <strong style="color: #333333;">${translations.trackingNumber}:</strong>
            </p>
            <p style="margin: 5px 0 0 0; font-size: 16px; color: #333333; font-weight: bold; font-family: monospace;">
              ${data.trackingNumber}
            </p>
          </td>
        </tr>
        ${data.carrier ? `
        <tr>
          <td style="padding-bottom: 12px;">
            <p style="margin: 0; font-size: 14px; color: #666666;">
              <strong style="color: #333333;">Carrier:</strong>
            </p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #333333; text-transform: uppercase;">
              ${data.carrier}
            </p>
          </td>
        </tr>
        ` : ''}
        ${estimatedDelivery ? `
        <tr>
          <td style="padding-bottom: 12px;">
            <p style="margin: 0; font-size: 14px; color: #666666;">
              <strong style="color: #333333;">${translations.estimatedDelivery}:</strong>
            </p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #333333;">
              ${estimatedDelivery}
            </p>
          </td>
        </tr>
        ` : ''}
        ${data.trackingUrl ? `
        <tr>
          <td style="padding-top: 15px;">
            <a href="${data.trackingUrl}" style="display: inline-block; padding: 12px 24px; background-color: #e74c3c; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 14px; font-weight: bold;">
              ${translations.trackOrder}
            </a>
          </td>
        </tr>
        ` : ''}
      </table>
    </div>
  `
}

/**
 * Generate order items summary (simplified version)
 */
function generateOrderItemsSummary(items: OrderItemData[], translations: any, locale: string): string {
  const rows = items.map(item => `
    <tr>
      <td style="padding: 12px 10px; border-bottom: 1px solid #eeeeee;">
        <p style="margin: 0 0 5px 0; font-size: 14px; color: #333333; font-weight: bold;">
          ${item.name}
        </p>
        <p style="margin: 0; font-size: 12px; color: #999999;">
          ${translations.quantity}: ${item.quantity} × ${formatCurrency(item.price, locale)}
        </p>
      </td>
      <td style="padding: 12px 10px; border-bottom: 1px solid #eeeeee; text-align: right; vertical-align: middle;">
        <span style="font-size: 14px; color: #333333; font-weight: bold;">${formatCurrency(item.total, locale)}</span>
      </td>
    </tr>
  `).join('')

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
      <tbody>
        ${rows}
      </tbody>
    </table>
  `
}

/**
 * Generate order processing email template
 */
export function generateOrderProcessingTemplate(data: OrderEmailData): string {
  const locale = normalizeLocale(data.locale)
  const statusTranslations = getProcessingTranslations(locale, data.orderNumber)
  return generateBaseTemplate(data, statusTranslations, locale, true)
}

/**
 * Generate order shipped email template with tracking information
 */
export function generateOrderShippedTemplate(data: OrderEmailData): string {
  const locale = normalizeLocale(data.locale)
  const statusTranslations = getShippedTranslations(locale, data.orderNumber)
  const baseTranslations = getEmailTranslations(locale)
  
  // Update CTA URL with tracking URL if available
  if (data.trackingUrl) {
    statusTranslations.ctaUrl = data.trackingUrl
  }
  
  // Generate base template
  let template = generateBaseTemplate(data, statusTranslations, locale, true)
  
  // Add tracking information section if available
  if (data.trackingNumber) {
    const trackingSection = generateTrackingSection(data, baseTranslations, locale)
    
    // Insert tracking section before the next steps section
    const nextStepsMarker = '<!-- Next steps -->'
    template = template.replace(nextStepsMarker, `${trackingSection}\n              ${nextStepsMarker}`)
  }
  
  return template
}

/**
 * Generate order delivered email template
 */
export function generateOrderDeliveredTemplate(data: OrderEmailData): string {
  const locale = normalizeLocale(data.locale)
  const statusTranslations = getDeliveredTranslations(locale, data.orderNumber)
  return generateBaseTemplate(data, statusTranslations, locale, true)
}

/**
 * Generate order cancelled email template
 */
export function generateOrderCancelledTemplate(data: OrderEmailData): string {
  const locale = normalizeLocale(data.locale)
  const statusTranslations = getCancelledTranslations(locale, data.orderNumber)
  return generateBaseTemplate(data, statusTranslations, locale, false)
}

/**
 * Generate order issue email template
 */
export function generateOrderIssueTemplate(data: OrderEmailData, issueDescription?: string): string {
  const locale = normalizeLocale(data.locale)
  const statusTranslations = getIssueTranslations(locale, data.orderNumber)
  
  // Add issue description if provided
  if (issueDescription) {
    statusTranslations.message = `${statusTranslations.message}\n\n${issueDescription}`
  }
  
  return generateBaseTemplate(data, statusTranslations, locale, true)
}

/**
 * Get subject line for order status email
 */
export function getOrderStatusSubject(emailType: string, orderNumber: string, locale: string): string {
  const normalizedLocale = normalizeLocale(locale)
  
  switch (emailType) {
    case 'order_processing':
      return getProcessingTranslations(normalizedLocale, orderNumber).subject
    case 'order_shipped':
      return getShippedTranslations(normalizedLocale, orderNumber).subject
    case 'order_delivered':
      return getDeliveredTranslations(normalizedLocale, orderNumber).subject
    case 'order_cancelled':
      return getCancelledTranslations(normalizedLocale, orderNumber).subject
    case 'order_issue':
      return getIssueTranslations(normalizedLocale, orderNumber).subject
    default:
      return `Order update #${orderNumber} - Moldova Direct`
  }
}
