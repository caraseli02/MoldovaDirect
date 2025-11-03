/**
 * Support Ticket Email Templates
 * Templates for customer confirmation and staff notification emails
 */

import { formatCurrency, formatDate } from './formatters'

interface SupportTicketData {
  ticketNumber: string
  customerName: string
  customerEmail: string
  subject: string
  category: string
  priority: string
  message: string
  orderNumber?: string
  orderStatus?: string
  orderTotal?: number
  locale: string
}

/**
 * Translations for support ticket emails
 */
const translations = {
  en: {
    customerSubject: 'Support Ticket Created - #{ticketNumber}',
    staffSubject: 'New Support Ticket - #{ticketNumber} [{priority}]',
    customerHeading: 'Support Ticket Received',
    staffHeading: 'New Support Ticket',
    customerMessage: 'Thank you for contacting us. We have received your support request and will respond within 24 hours.',
    staffMessage: 'A new support ticket has been created and requires attention.',
    ticketDetails: 'Ticket Details',
    ticketNumber: 'Ticket Number',
    subject: 'Subject',
    category: 'Category',
    priority: 'Priority',
    message: 'Message',
    orderDetails: 'Related Order',
    orderNumber: 'Order Number',
    orderStatus: 'Order Status',
    orderTotal: 'Order Total',
    customerInfo: 'Customer Information',
    customerName: 'Name',
    customerEmail: 'Email',
    nextSteps: 'Next Steps',
    customerNextSteps: [
      'Our support team will review your request',
      'You will receive updates via email',
      'Expected response time: 24 hours'
    ],
    staffNextSteps: [
      'Review ticket details and customer information',
      'Respond to customer via support system',
      'Update ticket status when resolved'
    ],
    viewTicket: 'View Ticket',
    categories: {
      order_status: 'Order Status',
      shipping: 'Shipping',
      product_issue: 'Product Issue',
      payment: 'Payment',
      return: 'Return',
      other: 'Other'
    }
  },
  es: {
    customerSubject: 'Ticket de Soporte Creado - #{ticketNumber}',
    staffSubject: 'Nuevo Ticket de Soporte - #{ticketNumber} [{priority}]',
    customerHeading: 'Ticket de Soporte Recibido',
    staffHeading: 'Nuevo Ticket de Soporte',
    customerMessage: 'Gracias por contactarnos. Hemos recibido su solicitud de soporte y responderemos dentro de 24 horas.',
    staffMessage: 'Se ha creado un nuevo ticket de soporte que requiere atención.',
    ticketDetails: 'Detalles del Ticket',
    ticketNumber: 'Número de Ticket',
    subject: 'Asunto',
    category: 'Categoría',
    priority: 'Prioridad',
    message: 'Mensaje',
    orderDetails: 'Pedido Relacionado',
    orderNumber: 'Número de Pedido',
    orderStatus: 'Estado del Pedido',
    orderTotal: 'Total del Pedido',
    customerInfo: 'Información del Cliente',
    customerName: 'Nombre',
    customerEmail: 'Correo Electrónico',
    nextSteps: 'Próximos Pasos',
    customerNextSteps: [
      'Nuestro equipo revisará su solicitud',
      'Recibirá actualizaciones por correo electrónico',
      'Tiempo de respuesta esperado: 24 horas'
    ],
    staffNextSteps: [
      'Revisar detalles del ticket e información del cliente',
      'Responder al cliente a través del sistema de soporte',
      'Actualizar el estado del ticket cuando se resuelva'
    ],
    viewTicket: 'Ver Ticket',
    categories: {
      order_status: 'Estado del Pedido',
      shipping: 'Envío',
      product_issue: 'Problema con Producto',
      payment: 'Pago',
      return: 'Devolución',
      other: 'Otro'
    }
  },
  ro: {
    customerSubject: 'Tichet de Asistență Creat - #{ticketNumber}',
    staffSubject: 'Tichet Nou de Asistență - #{ticketNumber} [{priority}]',
    customerHeading: 'Tichet de Asistență Primit',
    staffHeading: 'Tichet Nou de Asistență',
    customerMessage: 'Vă mulțumim că ne-ați contactat. Am primit cererea dvs. de asistență și vom răspunde în 24 de ore.',
    staffMessage: 'Un nou tichet de asistență a fost creat și necesită atenție.',
    ticketDetails: 'Detalii Tichet',
    ticketNumber: 'Număr Tichet',
    subject: 'Subiect',
    category: 'Categorie',
    priority: 'Prioritate',
    message: 'Mesaj',
    orderDetails: 'Comandă Asociată',
    orderNumber: 'Număr Comandă',
    orderStatus: 'Stare Comandă',
    orderTotal: 'Total Comandă',
    customerInfo: 'Informații Client',
    customerName: 'Nume',
    customerEmail: 'Email',
    nextSteps: 'Pașii Următori',
    customerNextSteps: [
      'Echipa noastră va revizui cererea dvs.',
      'Veți primi actualizări prin email',
      'Timp de răspuns așteptat: 24 ore'
    ],
    staffNextSteps: [
      'Revizuiți detaliile tichetului și informațiile clientului',
      'Răspundeți clientului prin sistemul de asistență',
      'Actualizați starea tichetului când este rezolvat'
    ],
    viewTicket: 'Vezi Tichet',
    categories: {
      order_status: 'Stare Comandă',
      shipping: 'Livrare',
      product_issue: 'Problemă Produs',
      payment: 'Plată',
      return: 'Retur',
      other: 'Altele'
    }
  },
  ru: {
    customerSubject: 'Тикет поддержки создан - #{ticketNumber}',
    staffSubject: 'Новый тикет поддержки - #{ticketNumber} [{priority}]',
    customerHeading: 'Тикет поддержки получен',
    staffHeading: 'Новый тикет поддержки',
    customerMessage: 'Спасибо за обращение. Мы получили ваш запрос и ответим в течение 24 часов.',
    staffMessage: 'Создан новый тикет поддержки, который требует внимания.',
    ticketDetails: 'Детали тикета',
    ticketNumber: 'Номер тикета',
    subject: 'Тема',
    category: 'Категория',
    priority: 'Приоритет',
    message: 'Сообщение',
    orderDetails: 'Связанный заказ',
    orderNumber: 'Номер заказа',
    orderStatus: 'Статус заказа',
    orderTotal: 'Итого заказа',
    customerInfo: 'Информация о клиенте',
    customerName: 'Имя',
    customerEmail: 'Email',
    nextSteps: 'Следующие шаги',
    customerNextSteps: [
      'Наша команда рассмотрит ваш запрос',
      'Вы получите обновления по электронной почте',
      'Ожидаемое время ответа: 24 часа'
    ],
    staffNextSteps: [
      'Просмотрите детали тикета и информацию о клиенте',
      'Ответьте клиенту через систему поддержки',
      'Обновите статус тикета при решении'
    ],
    viewTicket: 'Просмотреть тикет',
    categories: {
      order_status: 'Статус заказа',
      shipping: 'Доставка',
      product_issue: 'Проблема с товаром',
      payment: 'Оплата',
      return: 'Возврат',
      other: 'Другое'
    }
  }
}

/**
 * Get translations for locale
 */
function getTranslations(locale: string) {
  return translations[locale as keyof typeof translations] || translations.en
}

/**
 * Generate customer confirmation email
 */
export function generateCustomerConfirmationTemplate(data: SupportTicketData): string {
  const t = getTranslations(data.locale)
  const categoryLabel = t.categories[data.category as keyof typeof t.categories] || data.category

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.customerSubject.replace('{ticketNumber}', data.ticketNumber)}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 2px solid #10b981;">
              <h1 style="margin: 0; color: #10b981; font-size: 28px; font-weight: 600;">${t.customerHeading}</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.5;">
                ${t.customerMessage}
              </p>

              <!-- Ticket Details -->
              <div style="background-color: #f9fafb; border-radius: 6px; padding: 24px; margin: 24px 0;">
                <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 18px; font-weight: 600;">${t.ticketDetails}</h2>

                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">${t.ticketNumber}:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${data.ticketNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">${t.subject}:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">${data.subject}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">${t.category}:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">${categoryLabel}</td>
                  </tr>
                </table>
              </div>

              ${data.orderNumber ? `
              <!-- Order Details -->
              <div style="background-color: #eff6ff; border-radius: 6px; padding: 24px; margin: 24px 0;">
                <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 18px; font-weight: 600;">${t.orderDetails}</h2>

                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">${t.orderNumber}:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${data.orderNumber}</td>
                  </tr>
                  ${data.orderStatus ? `
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">${t.orderStatus}:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">${data.orderStatus}</td>
                  </tr>
                  ` : ''}
                  ${data.orderTotal ? `
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">${t.orderTotal}:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${formatCurrency(data.orderTotal, data.locale)}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
              ` : ''}

              <!-- Next Steps -->
              <div style="margin: 24px 0;">
                <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 18px; font-weight: 600;">${t.nextSteps}</h2>
                <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                  ${t.customerNextSteps.map(step => `<li>${step}</li>`).join('')}
                </ul>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #6b7280; font-size: 14px; text-align: center;">
                If you have any questions, please reply to this email or contact our support team.
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
 * Generate staff notification email
 */
export function generateStaffNotificationTemplate(data: SupportTicketData): string {
  const t = getTranslations(data.locale)
  const categoryLabel = t.categories[data.category as keyof typeof t.categories] || data.category

  const priorityColor = data.priority === 'high' ? '#ef4444' : data.priority === 'medium' ? '#f59e0b' : '#6b7280'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.staffSubject.replace('{ticketNumber}', data.ticketNumber).replace('{priority}', data.priority.toUpperCase())}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 2px solid ${priorityColor};">
              <h1 style="margin: 0; color: ${priorityColor}; font-size: 28px; font-weight: 600;">${t.staffHeading}</h1>
              <p style="margin: 10px 0 0; color: #6b7280; font-size: 14px;">
                Priority: <span style="color: ${priorityColor}; font-weight: 600; text-transform: uppercase;">${data.priority}</span>
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.5;">
                ${t.staffMessage}
              </p>

              <!-- Ticket Details -->
              <div style="background-color: #f9fafb; border-radius: 6px; padding: 24px; margin: 24px 0;">
                <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 18px; font-weight: 600;">${t.ticketDetails}</h2>

                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">${t.ticketNumber}:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${data.ticketNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">${t.subject}:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">${data.subject}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">${t.category}:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">${categoryLabel}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">${t.priority}:</td>
                    <td style="padding: 8px 0; color: ${priorityColor}; font-size: 14px; font-weight: 600; text-align: right; text-transform: uppercase;">${data.priority}</td>
                  </tr>
                </table>
              </div>

              <!-- Customer Message -->
              <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 24px 0;">
                <h3 style="margin: 0 0 12px; color: #1f2937; font-size: 16px; font-weight: 600;">${t.message}</h3>
                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
              </div>

              <!-- Customer Info -->
              <div style="background-color: #f0f9ff; border-radius: 6px; padding: 24px; margin: 24px 0;">
                <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 18px; font-weight: 600;">${t.customerInfo}</h2>

                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">${t.customerName}:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">${data.customerName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">${t.customerEmail}:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">
                      <a href="mailto:${data.customerEmail}" style="color: #2563eb; text-decoration: none;">${data.customerEmail}</a>
                    </td>
                  </tr>
                </table>
              </div>

              ${data.orderNumber ? `
              <!-- Order Details -->
              <div style="background-color: #eff6ff; border-radius: 6px; padding: 24px; margin: 24px 0;">
                <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 18px; font-weight: 600;">${t.orderDetails}</h2>

                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">${t.orderNumber}:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${data.orderNumber}</td>
                  </tr>
                  ${data.orderStatus ? `
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">${t.orderStatus}:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">${data.orderStatus}</td>
                  </tr>
                  ` : ''}
                  ${data.orderTotal ? `
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">${t.orderTotal}:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${formatCurrency(data.orderTotal, data.locale)}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
              ` : ''}

              <!-- Next Steps -->
              <div style="margin: 24px 0;">
                <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 18px; font-weight: 600;">${t.nextSteps}</h2>
                <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                  ${t.staffNextSteps.map(step => `<li>${step}</li>`).join('')}
                </ul>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #6b7280; font-size: 14px; text-align: center;">
                This is an automated notification. Please respond to tickets through the support system.
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
 * Get subject line for support ticket emails
 */
export function getSupportTicketSubject(emailType: 'customer' | 'staff', ticketNumber: string, priority: string, locale: string): string {
  const t = getTranslations(locale)

  if (emailType === 'customer') {
    return t.customerSubject.replace('{ticketNumber}', ticketNumber)
  } else {
    return t.staffSubject
      .replace('{ticketNumber}', ticketNumber)
      .replace('{priority}', priority.toUpperCase())
  }
}

export { SupportTicketData }
