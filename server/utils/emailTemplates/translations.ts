/**
 * Email template translations
 * Supports Spanish, English, Romanian, and Russian
 */

export interface EmailTranslations {
  subject: string
  preheader: string
  title: string
  greeting: string
  message: string
  orderNumber: string
  orderDate: string
  estimatedDelivery: string
  orderDetails: string
  product: string
  quantity: string
  price: string
  total: string
  subtotal: string
  shipping: string
  tax: string
  orderTotal: string
  shippingAddress: string
  billingAddress: string
  paymentMethod: string
  paymentMethods: {
    cash: string
    credit_card: string
    paypal: string
    bank_transfer: string
  }
  trackingInfo: string
  trackingNumber: string
  trackOrder: string
  thankYou: string
  footer: string
  signature: string
  companyInfo: string
  contactSupport: string
  supportEmail: string
  viewOrder: string
}

export const emailTranslations: Record<string, EmailTranslations> = {
  es: {
    subject: 'Confirmación de pedido #{orderNumber} - Moldova Direct',
    preheader: 'Tu pedido {orderNumber} ha sido confirmado',
    title: '¡Gracias por tu pedido!',
    greeting: 'Hola {name},',
    message: 'Hemos recibido tu pedido y lo estamos procesando. A continuación encontrarás los detalles de tu compra:',
    orderNumber: 'Número de pedido',
    orderDate: 'Fecha del pedido',
    estimatedDelivery: 'Entrega estimada',
    orderDetails: 'Detalles del pedido',
    product: 'Producto',
    quantity: 'Cantidad',
    price: 'Precio',
    total: 'Total',
    subtotal: 'Subtotal',
    shipping: 'Envío',
    tax: 'IVA',
    orderTotal: 'Total del pedido',
    shippingAddress: 'Dirección de envío',
    billingAddress: 'Dirección de facturación',
    paymentMethod: 'Método de pago',
    paymentMethods: {
      cash: 'Pago contra reembolso',
      credit_card: 'Tarjeta de crédito',
      paypal: 'PayPal',
      bank_transfer: 'Transferencia bancaria',
    },
    trackingInfo: 'Información de seguimiento',
    trackingNumber: 'Número de seguimiento',
    trackOrder: 'Seguir pedido',
    thankYou: '¡Gracias por tu compra!',
    footer: 'Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.',
    signature: 'Equipo de Moldova Direct',
    companyInfo: 'Moldova Direct - Productos auténticos de Moldavia en España',
    contactSupport: 'Contactar soporte',
    supportEmail: 'soporte@moldovadirect.com',
    viewOrder: 'Ver pedido',
  },
  en: {
    subject: 'Order confirmation #{orderNumber} - Moldova Direct',
    preheader: 'Your order {orderNumber} has been confirmed',
    title: 'Thank you for your order!',
    greeting: 'Hello {name},',
    message: 'We have received your order and are processing it. Below you will find the details of your purchase:',
    orderNumber: 'Order number',
    orderDate: 'Order date',
    estimatedDelivery: 'Estimated delivery',
    orderDetails: 'Order details',
    product: 'Product',
    quantity: 'Quantity',
    price: 'Price',
    total: 'Total',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    tax: 'VAT',
    orderTotal: 'Order total',
    shippingAddress: 'Shipping address',
    billingAddress: 'Billing address',
    paymentMethod: 'Payment method',
    paymentMethods: {
      cash: 'Cash on delivery',
      credit_card: 'Credit card',
      paypal: 'PayPal',
      bank_transfer: 'Bank transfer',
    },
    trackingInfo: 'Tracking information',
    trackingNumber: 'Tracking number',
    trackOrder: 'Track order',
    thankYou: 'Thank you for your purchase!',
    footer: 'If you have any questions about your order, please do not hesitate to contact us.',
    signature: 'Moldova Direct Team',
    companyInfo: 'Moldova Direct - Authentic Moldovan products in Spain',
    contactSupport: 'Contact support',
    supportEmail: 'support@moldovadirect.com',
    viewOrder: 'View order',
  },
  ro: {
    subject: 'Confirmare comandă #{orderNumber} - Moldova Direct',
    preheader: 'Comanda ta {orderNumber} a fost confirmată',
    title: 'Mulțumim pentru comanda ta!',
    greeting: 'Salut {name},',
    message: 'Am primit comanda ta și o procesăm. Mai jos vei găsi detaliile achiziției tale:',
    orderNumber: 'Număr comandă',
    orderDate: 'Data comenzii',
    estimatedDelivery: 'Livrare estimată',
    orderDetails: 'Detalii comandă',
    product: 'Produs',
    quantity: 'Cantitate',
    price: 'Preț',
    total: 'Total',
    subtotal: 'Subtotal',
    shipping: 'Livrare',
    tax: 'TVA',
    orderTotal: 'Total comandă',
    shippingAddress: 'Adresă de livrare',
    billingAddress: 'Adresă de facturare',
    paymentMethod: 'Metodă de plată',
    paymentMethods: {
      cash: 'Plată la livrare',
      credit_card: 'Card de credit',
      paypal: 'PayPal',
      bank_transfer: 'Transfer bancar',
    },
    trackingInfo: 'Informații de urmărire',
    trackingNumber: 'Număr de urmărire',
    trackOrder: 'Urmărește comanda',
    thankYou: 'Mulțumim pentru achiziție!',
    footer: 'Dacă ai întrebări despre comanda ta, nu ezita să ne contactezi.',
    signature: 'Echipa Moldova Direct',
    companyInfo: 'Moldova Direct - Produse autentice moldovenești în Spania',
    contactSupport: 'Contactează suportul',
    supportEmail: 'suport@moldovadirect.com',
    viewOrder: 'Vezi comanda',
  },
  ru: {
    subject: 'Подтверждение заказа #{orderNumber} - Moldova Direct',
    preheader: 'Ваш заказ {orderNumber} подтвержден',
    title: 'Спасибо за ваш заказ!',
    greeting: 'Привет, {name}!',
    message: 'Мы получили ваш заказ и обрабатываем его. Ниже вы найдете детали вашей покупки:',
    orderNumber: 'Номер заказа',
    orderDate: 'Дата заказа',
    estimatedDelivery: 'Ожидаемая доставка',
    orderDetails: 'Детали заказа',
    product: 'Товар',
    quantity: 'Количество',
    price: 'Цена',
    total: 'Итого',
    subtotal: 'Промежуточный итог',
    shipping: 'Доставка',
    tax: 'НДС',
    orderTotal: 'Итого заказ',
    shippingAddress: 'Адрес доставки',
    billingAddress: 'Адрес для выставления счета',
    paymentMethod: 'Способ оплаты',
    paymentMethods: {
      cash: 'Оплата при доставке',
      credit_card: 'Кредитная карта',
      paypal: 'PayPal',
      bank_transfer: 'Банковский перевод',
    },
    trackingInfo: 'Информация об отслеживании',
    trackingNumber: 'Номер отслеживания',
    trackOrder: 'Отследить заказ',
    thankYou: 'Спасибо за покупку!',
    footer: 'Если у вас есть вопросы о вашем заказе, пожалуйста, свяжитесь с нами.',
    signature: 'Команда Moldova Direct',
    companyInfo: 'Moldova Direct - Аутентичные молдавские продукты в Испании',
    contactSupport: 'Связаться с поддержкой',
    supportEmail: 'support@moldovadirect.com',
    viewOrder: 'Посмотреть заказ',
  },
}

/**
 * Get translations for a specific locale
 * Falls back to Spanish if locale not found
 */
export function getEmailTranslations(locale: string): EmailTranslations {
  return emailTranslations[locale] || emailTranslations.es || {} as EmailTranslations
}

/**
 * Replace placeholders in translation strings
 */
export function replaceTranslationPlaceholders(
  text: string,
  replacements: Record<string, string>,
): string {
  let result = text
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
  }
  return result
}
