/**
 * Composable for generating and printing order invoices
 * Uses browser's native print functionality with print-optimized styling
 */
import type { OrderData, ShippingInformation } from '~/types/checkout'

export interface InvoiceData {
  orderData: OrderData
  shippingInfo: ShippingInformation | null
  orderNumber: string
  orderDate: Date
  customerEmail?: string | null
}

export interface InvoiceResult {
  success: boolean
  error?: 'popup_blocked' | 'unknown_error'
}

export function useInvoice() {
  const { t, locale } = useI18n()

  /**
   * Format price with currency
   */
  const formatPrice = (price: number, currency: string = 'EUR'): string => {
    return new Intl.NumberFormat(locale.value, {
      style: 'currency',
      currency,
    }).format(price)
  }

  /**
   * Format date for display
   */
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat(locale.value, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  /**
   * Get localized text from a translation object or string
   */
  const getLocalizedText = (text: any): string => {
    if (!text) return ''
    if (typeof text === 'string') return text
    const localeText = text[locale.value]
    if (localeText) return localeText
    const esText = text.es
    if (esText) return esText
    const values = Object.values(text).filter((v): v is string => typeof v === 'string')
    return values[0] || ''
  }

  /**
   * Generate invoice HTML content
   */
  const generateInvoiceHTML = (data: InvoiceData): string => {
    const { orderData, shippingInfo, orderNumber, orderDate, customerEmail } = data
    const currency = orderData.currency || 'EUR'

    const itemsHTML = orderData.items.map(item => `
      <tr>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb;">
          <div style="font-weight: 500;">${getLocalizedText(item.productSnapshot?.name) || 'Product'}</div>
          ${item.productSnapshot?.sku ? `<div style="font-size: 12px; color: #6b7280;">SKU: ${item.productSnapshot.sku}</div>` : ''}
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatPrice(item.price, currency)}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 500;">${formatPrice(item.total, currency)}</td>
      </tr>
    `).join('')

    const shippingAddressHTML = shippingInfo?.address
      ? `
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px; text-transform: uppercase;">${t('invoice.shippingAddress')}</h3>
        <div style="color: #4b5563; line-height: 1.6;">
          <div style="font-weight: 500;">${shippingInfo.address.firstName} ${shippingInfo.address.lastName}</div>
          ${shippingInfo.address.company ? `<div>${shippingInfo.address.company}</div>` : ''}
          <div>${shippingInfo.address.street}</div>
          <div>${shippingInfo.address.city}, ${shippingInfo.address.postalCode}</div>
          ${shippingInfo.address.province ? `<div>${shippingInfo.address.province}</div>` : ''}
          <div>${shippingInfo.address.country}</div>
          ${shippingInfo.address.phone ? `<div>${shippingInfo.address.phone}</div>` : ''}
        </div>
      </div>
    `
      : ''

    return `
<!DOCTYPE html>
<html lang="${locale.value}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t('invoice.title')} - ${orderNumber}</title>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1f2937; line-height: 1.5; padding: 40px; max-width: 800px; margin: 0 auto; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 12px 8px; border-bottom: 2px solid #e5e7eb; font-weight: 600; color: #374151; font-size: 12px; text-transform: uppercase; }
    th:last-child, th:nth-child(3) { text-align: right; }
    th:nth-child(2) { text-align: center; }
  </style>
</head>
<body>
  <!-- Header -->
  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 2px solid #e5e7eb;">
    <div>
      <h1 style="font-size: 28px; font-weight: 700; color: #111827; margin-bottom: 4px;">Moldova Direct</h1>
      <p style="color: #6b7280; font-size: 14px;">${t('invoice.tagline')}</p>
    </div>
    <div style="text-align: right;">
      <h2 style="font-size: 24px; font-weight: 600; color: #16a34a; margin-bottom: 8px;">${t('invoice.title')}</h2>
      <div style="color: #4b5563; font-size: 14px;">
        <div><strong>${t('invoice.orderNumber')}:</strong> ${orderNumber}</div>
        <div><strong>${t('invoice.date')}:</strong> ${formatDate(orderDate)}</div>
      </div>
    </div>
  </div>

  <!-- Customer & Shipping Info -->
  <div style="display: flex; gap: 40px; margin-bottom: 32px;">
    <div style="flex: 1;">
      <h3 style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px; text-transform: uppercase;">${t('invoice.billTo')}</h3>
      <div style="color: #4b5563; line-height: 1.6;">
        ${shippingInfo?.address ? `<div style="font-weight: 500;">${shippingInfo.address.firstName} ${shippingInfo.address.lastName}</div>` : ''}
        ${customerEmail ? `<div>${customerEmail}</div>` : ''}
      </div>
    </div>
    <div style="flex: 1;">
      ${shippingAddressHTML}
    </div>
  </div>

  <!-- Order Items -->
  <div style="margin-bottom: 32px;">
    <table>
      <thead>
        <tr>
          <th style="width: 50%;">${t('invoice.product')}</th>
          <th style="width: 15%;">${t('invoice.quantity')}</th>
          <th style="width: 15%;">${t('invoice.unitPrice')}</th>
          <th style="width: 20%;">${t('invoice.total')}</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
      </tbody>
    </table>
  </div>

  <!-- Totals -->
  <div style="margin-left: auto; width: 300px;">
    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
      <span style="color: #6b7280;">${t('common.subtotal')}</span>
      <span style="font-weight: 500;">${formatPrice(orderData.subtotal, currency)}</span>
    </div>
    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
      <span style="color: #6b7280;">${t('common.shipping')}</span>
      <span style="font-weight: 500;">${orderData.shippingCost === 0 ? t('checkout.freeShipping') : formatPrice(orderData.shippingCost, currency)}</span>
    </div>
    ${orderData.tax
      ? `
    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
      <span style="color: #6b7280;">${t('common.tax')}</span>
      <span style="font-weight: 500;">${formatPrice(orderData.tax, currency)}</span>
    </div>
    `
      : ''}
    <div style="display: flex; justify-content: space-between; padding: 12px 0; background: #f3f4f6; margin: 8px -8px -8px; padding: 12px 8px; border-radius: 4px;">
      <span style="font-weight: 600; font-size: 16px;">${t('common.total')}</span>
      <span style="font-weight: 700; font-size: 18px; color: #16a34a;">${formatPrice(orderData.total, currency)}</span>
    </div>
  </div>

  <!-- Footer -->
  <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
    <p style="margin-bottom: 8px;">${t('invoice.thankYou')}</p>
    <p>${t('invoice.questions')} <a href="mailto:support@moldovadirect.com" style="color: #16a34a;">support@moldovadirect.com</a></p>
  </div>
</body>
</html>
    `
  }

  /**
   * Open invoice in a new window for printing
   * Returns a result object indicating success or failure
   *
   * @returns InvoiceResult with success status and optional error code
   */
  const printInvoice = (data: InvoiceData): InvoiceResult => {
    try {
      const html = generateInvoiceHTML(data)
      const printWindow = window.open('', '_blank')

      if (!printWindow) {
        console.error('Failed to open print window - popup might be blocked')
        return {
          success: false,
          error: 'popup_blocked',
        }
      }

      printWindow.document.write(html)
      printWindow.document.close()

      // Wait for content to load before printing
      printWindow.onload = () => {
        printWindow.focus()
        printWindow.print()
      }

      return { success: true }
    }
    catch (error) {
      console.error('Invoice print error:', error)
      return {
        success: false,
        error: 'unknown_error',
      }
    }
  }

  /**
   * Open invoice for printing/saving as PDF
   * Opens the browser's print dialog where the user can choose to print or save as PDF
   *
   * Note: This does NOT directly download a PDF file. It opens the print dialog
   * where modern browsers allow saving as PDF via the "Save as PDF" destination.
   *
   * @returns InvoiceResult with success status and optional error code
   */
  const openInvoiceForPrint = (data: InvoiceData): InvoiceResult => {
    return printInvoice(data)
  }

  return {
    printInvoice,
    openInvoiceForPrint,
    generateInvoiceHTML,
    formatPrice,
    formatDate,
    getLocalizedText,
  }
}
