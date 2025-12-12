/**
 * Order Confirmation Email Template
 * Responsive HTML email template for order confirmations
 * Supports multiple languages and accessibility features
 */

import { getEmailTranslations, replaceTranslationPlaceholders } from './translations'
import { formatCurrency, formatDate, normalizeLocale } from './formatters'
import type { OrderEmailData, OrderItemData, AddressData } from './types'

/**
 * Generate responsive HTML email template for order confirmation
 */
export function generateOrderConfirmationTemplate(data: OrderEmailData): string {
  const locale = normalizeLocale(data.locale)
  const translations = getEmailTranslations(locale)
  const formattedDate = formatDate(data.orderDate, locale)
  const formattedDelivery = data.estimatedDelivery ? formatDate(data.estimatedDelivery, locale) : null

  // Replace placeholders in subject and preheader
  const subject = replaceTranslationPlaceholders(translations.subject, { orderNumber: data.orderNumber })
  const preheader = replaceTranslationPlaceholders(translations.preheader, { orderNumber: data.orderNumber })
  const greeting = replaceTranslationPlaceholders(translations.greeting, { name: data.customerName })

  return `
<!DOCTYPE html>
<html lang="${locale}" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${subject}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
  <style>
    /* Reset styles */
    body {
      margin: 0;
      padding: 0;
      min-width: 100%;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      background-color: #f4f4f4;
    }
    
    table {
      border-collapse: collapse;
      border-spacing: 0;
    }
    
    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }
    
    /* Responsive styles */
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
        max-width: 100% !important;
      }
      
      .mobile-padding {
        padding: 15px !important;
      }
      
      .mobile-hide {
        display: none !important;
      }
      
      .mobile-center {
        text-align: center !important;
      }
      
      .order-item-image {
        width: 60px !important;
        height: 60px !important;
      }
      
      .order-table td {
        font-size: 13px !important;
      }
    }
    
    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .dark-mode-bg {
        background-color: #1a1a1a !important;
      }
      
      .dark-mode-text {
        color: #ffffff !important;
      }
      
      .dark-mode-secondary {
        color: #cccccc !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4;">
  <!-- Preheader text -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;" aria-hidden="true">
    ${preheader}
  </div>
  
  <!-- Main container -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <!-- Email wrapper -->
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; margin: 0 auto;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #e74c3c; padding: 30px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; line-height: 1.2;">
                Moldova Direct
              </h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; line-height: 1.4;">
                ${translations.title}
              </p>
            </td>
          </tr>
          
          <!-- Main content -->
          <tr>
            <td class="mobile-padding" style="padding: 30px 40px;">
              <!-- Greeting -->
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #333333;">
                ${greeting}
              </p>
              
              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #333333;">
                ${translations.message}
              </p>
              
              <!-- Order info box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9f9f9; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-bottom: 10px;">
                          <strong style="color: #333333; font-size: 14px;">${translations.orderNumber}:</strong>
                          <span style="color: #666666; font-size: 14px; margin-left: 10px;">${data.orderNumber}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 10px;">
                          <strong style="color: #333333; font-size: 14px;">${translations.orderDate}:</strong>
                          <span style="color: #666666; font-size: 14px; margin-left: 10px;">${formattedDate}</span>
                        </td>
                      </tr>
                      ${formattedDelivery
                        ? `
                      <tr>
                        <td>
                          <strong style="color: #333333; font-size: 14px;">${translations.estimatedDelivery}:</strong>
                          <span style="color: #666666; font-size: 14px; margin-left: 10px;">${formattedDelivery}</span>
                        </td>
                      </tr>
                      `
                        : ''}
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Order items -->
              <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #e74c3c; font-weight: bold;">
                ${translations.orderDetails}
              </h2>
              
              ${generateOrderItemsTable(data.orderItems, translations, locale)}
              
              <!-- Order totals -->
              ${generateOrderTotals(data, translations, locale)}
              
              <!-- Shipping address -->
              <h2 style="margin: 30px 0 15px 0; font-size: 20px; color: #e74c3c; font-weight: bold;">
                ${translations.shippingAddress}
              </h2>
              
              ${generateAddressBlock(data.shippingAddress)}
              
              <!-- Payment method -->
              <h2 style="margin: 30px 0 15px 0; font-size: 20px; color: #e74c3c; font-weight: bold;">
                ${translations.paymentMethod}
              </h2>
              
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9f9f9; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 15px;">
                    <p style="margin: 0; color: #333333; font-size: 14px;">
                      ${getPaymentMethodLabel(data.paymentMethod, translations)}
                    </p>
                  </td>
                </tr>
              </table>
              
              ${data.trackingNumber ? generateTrackingInfo(data.trackingNumber, data.trackingUrl, translations) : ''}
              
              <!-- Thank you message -->
              <div style="text-align: center; margin: 40px 0 20px 0;">
                <p style="margin: 0; font-size: 18px; color: #333333; font-weight: bold;">
                  ${translations.thankYou}
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f4; padding: 30px 40px; text-align: center; border-top: 1px solid #dddddd;">
              <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6; color: #666666;">
                ${translations.footer}
              </p>
              
              <p style="margin: 0 0 15px 0; font-size: 14px; color: #666666;">
                <strong style="color: #333333;">${translations.signature}</strong>
              </p>
              
              <p style="margin: 0; font-size: 12px; color: #999999;">
                ${translations.companyInfo}
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

function generateOrderItemsTable(items: OrderItemData[], translations: any, locale: string): string {
  const rows = items.map(item => `
    <tr>
      <td style="padding: 15px 10px; border-bottom: 1px solid #eeeeee; vertical-align: middle;">
        ${item.image
          ? `
        <img src="${item.image}" alt="${item.name}" class="order-item-image" width="80" height="80" style="display: block; border-radius: 4px; object-fit: cover;">
        `
          : ''}
      </td>
      <td style="padding: 15px 10px; border-bottom: 1px solid #eeeeee; vertical-align: middle;">
        <p style="margin: 0 0 5px 0; font-size: 14px; color: #333333; font-weight: bold;">
          ${item.name}
        </p>
        ${item.sku
          ? `
        <p style="margin: 0; font-size: 12px; color: #999999;">
          SKU: ${item.sku}
        </p>
        `
          : ''}
      </td>
      <td style="padding: 15px 10px; border-bottom: 1px solid #eeeeee; text-align: center; vertical-align: middle;">
        <span style="font-size: 14px; color: #666666;">${item.quantity}</span>
      </td>
      <td style="padding: 15px 10px; border-bottom: 1px solid #eeeeee; text-align: right; vertical-align: middle;">
        <span style="font-size: 14px; color: #666666;">${formatCurrency(item.price, locale)}</span>
      </td>
      <td style="padding: 15px 10px; border-bottom: 1px solid #eeeeee; text-align: right; vertical-align: middle;">
        <span style="font-size: 14px; color: #333333; font-weight: bold;">${formatCurrency(item.total, locale)}</span>
      </td>
    </tr>
  `).join('')

  return `
    <table role="presentation" class="order-table" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
      <thead>
        <tr style="background-color: #f4f4f4;">
          <th style="padding: 12px 10px; text-align: left; font-size: 13px; color: #666666; font-weight: 600; border-bottom: 2px solid #dddddd;" class="mobile-hide"></th>
          <th style="padding: 12px 10px; text-align: left; font-size: 13px; color: #666666; font-weight: 600; border-bottom: 2px solid #dddddd;">
            ${translations.product}
          </th>
          <th style="padding: 12px 10px; text-align: center; font-size: 13px; color: #666666; font-weight: 600; border-bottom: 2px solid #dddddd;">
            ${translations.quantity}
          </th>
          <th style="padding: 12px 10px; text-align: right; font-size: 13px; color: #666666; font-weight: 600; border-bottom: 2px solid #dddddd;">
            ${translations.price}
          </th>
          <th style="padding: 12px 10px; text-align: right; font-size: 13px; color: #666666; font-weight: 600; border-bottom: 2px solid #dddddd;">
            ${translations.total}
          </th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `
}

function generateOrderTotals(data: OrderEmailData, translations: any, locale: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0 30px 0;">
      <tr>
        <td style="padding: 0;">
          <table role="presentation" width="300" cellpadding="0" cellspacing="0" border="0" align="right" style="max-width: 100%;">
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: #666666;">
                ${translations.subtotal}:
              </td>
              <td style="padding: 8px 0; text-align: right; font-size: 14px; color: #666666;">
                ${formatCurrency(data.subtotal, locale)}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: #666666;">
                ${translations.shipping}:
              </td>
              <td style="padding: 8px 0; text-align: right; font-size: 14px; color: #666666;">
                ${formatCurrency(data.shippingCost, locale)}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: #666666;">
                ${translations.tax}:
              </td>
              <td style="padding: 8px 0; text-align: right; font-size: 14px; color: #666666;">
                ${formatCurrency(data.tax, locale)}
              </td>
            </tr>
            <tr style="border-top: 2px solid #333333;">
              <td style="padding: 12px 0 0 0; font-size: 18px; color: #333333; font-weight: bold;">
                ${translations.orderTotal}:
              </td>
              <td style="padding: 12px 0 0 0; text-align: right; font-size: 18px; color: #e74c3c; font-weight: bold;">
                ${formatCurrency(data.total, locale)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `
}

function generateAddressBlock(address: AddressData): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9f9f9; border-radius: 8px; margin-bottom: 20px;">
      <tr>
        <td style="padding: 15px;">
          <p style="margin: 0 0 5px 0; font-size: 14px; color: #333333; font-weight: bold;">
            ${address.firstName} ${address.lastName}
          </p>
          <p style="margin: 0 0 5px 0; font-size: 14px; color: #666666; line-height: 1.6;">
            ${address.street}<br>
            ${address.city}, ${address.postalCode}<br>
            ${address.province ? address.province + '<br>' : ''}
            ${address.country}
          </p>
        </td>
      </tr>
    </table>
  `
}

function generateTrackingInfo(trackingNumber: string, trackingUrl: string | undefined, translations: any): string {
  return `
    <h2 style="margin: 30px 0 15px 0; font-size: 20px; color: #e74c3c; font-weight: bold;">
      ${translations.trackingInfo}
    </h2>
    
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9f9f9; border-radius: 8px; margin-bottom: 20px;">
      <tr>
        <td style="padding: 15px;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #333333;">
            <strong>${translations.trackingNumber}:</strong> ${trackingNumber}
          </p>
          ${trackingUrl
            ? `
          <p style="margin: 0;">
            <a href="${trackingUrl}" style="display: inline-block; padding: 10px 20px; background-color: #e74c3c; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 14px; font-weight: bold;">
              ${translations.trackOrder}
            </a>
          </p>
          `
            : ''}
        </td>
      </tr>
    </table>
  `
}

function getPaymentMethodLabel(method: string, translations: any): string {
  const methodMap: Record<string, string> = {
    cash: translations.paymentMethods.cash,
    credit_card: translations.paymentMethods.credit_card,
    paypal: translations.paymentMethods.paypal,
    bank_transfer: translations.paymentMethods.bank_transfer,
  }

  return methodMap[method] || method
}

/**
 * Get subject line for order confirmation email
 */
export function getOrderConfirmationSubject(orderNumber: string, locale: string): string {
  const normalizedLocale = normalizeLocale(locale)
  const translations = getEmailTranslations(normalizedLocale)
  return replaceTranslationPlaceholders(translations.subject, { orderNumber })
}
