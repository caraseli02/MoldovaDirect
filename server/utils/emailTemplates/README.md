# Email Templates System

This module provides a comprehensive email template system for order confirmation emails with multi-language support, responsive design, and data validation.

## Features

- ✅ Responsive HTML email templates (desktop & mobile)
- ✅ Multi-language support (Spanish, English, Romanian, Russian)
- ✅ Locale-specific currency and date formatting
- ✅ Data transformation from database to email format
- ✅ Template variable validation
- ✅ Accessibility-compliant markup
- ✅ Brand-consistent styling

## Usage

### Basic Example

```typescript
import {
  generateOrderConfirmationTemplate,
  getOrderConfirmationSubject,
  transformOrderToEmailDataWithLocale,
  validateAndSanitizeOrderData,
} from '~/server/utils/emailTemplates'

// Transform database order to email data
const emailData = transformOrderToEmailDataWithLocale(
  databaseOrder,
  customerInfo,
  'es' // locale
)

// Validate data
const sanitizedData = validateAndSanitizeOrderData(emailData)

// Generate email HTML
const html = generateOrderConfirmationTemplate(sanitizedData)

// Get subject line
const subject = getOrderConfirmationSubject(order.order_number, 'es')

// Send email
await sendEmail({
  to: customerInfo.email,
  subject,
  html,
})
```

### Data Transformation

```typescript
import { transformOrderToEmailData } from '~/server/utils/emailTemplates'

// For authenticated users
const emailData = transformOrderToEmailData(order, userProfile)

// For guest checkout
const guestData = {
  email: 'guest@example.com',
  firstName: 'John',
  lastName: 'Doe',
  locale: 'en',
}
const emailData = transformOrderToEmailData(order, guestData)
```

### Validation

```typescript
import {
  validateOrderEmailData,
  hasRequiredFields,
  getMissingFields,
} from '~/server/utils/emailTemplates'

// Check if data has required fields
if (!hasRequiredFields(data)) {
  const missing = getMissingFields(data)
  console.error('Missing fields:', missing)
}

// Validate and get detailed results
const validation = validateOrderEmailData(data)
if (!validation.isValid) {
  console.error('Validation errors:', validation.errors)
}
if (validation.warnings.length > 0) {
  console.warn('Validation warnings:', validation.warnings)
}
```

### Formatting Utilities

```typescript
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  normalizeLocale,
} from '~/server/utils/emailTemplates'

// Format currency
const price = formatCurrency(29.99, 'es') // "29,99 €"

// Format date
const date = formatDate('2024-01-15', 'en') // "January 15, 2024"

// Format date with time
const dateTime = formatDateTime('2024-01-15T10:30:00', 'ro')

// Normalize locale
const locale = normalizeLocale('en-US') // "en"
```

### Translations

```typescript
import {
  getEmailTranslations,
  replaceTranslationPlaceholders,
} from '~/server/utils/emailTemplates'

// Get translations for a locale
const translations = getEmailTranslations('es')
console.log(translations.title) // "¡Gracias por tu pedido!"

// Replace placeholders
const text = replaceTranslationPlaceholders(
  'Hello {name}, your order {orderNumber} is ready',
  { name: 'John', orderNumber: '#12345' }
)
```

## Data Structures

### OrderEmailData

```typescript
interface OrderEmailData {
  customerName: string
  customerEmail: string
  orderNumber: string
  orderDate: string
  estimatedDelivery?: string
  orderItems: OrderItemData[]
  shippingAddress: AddressData
  billingAddress?: AddressData
  subtotal: number
  shippingCost: number
  tax: number
  total: number
  paymentMethod: string
  trackingNumber?: string
  trackingUrl?: string
  carrier?: string
  locale: string
  orderStatus?: string
  customerNotes?: string
}
```

### OrderItemData

```typescript
interface OrderItemData {
  productId: string
  name: string
  sku?: string
  quantity: number
  price: number
  total: number
  image?: string
  attributes?: Record<string, string>
}
```

### AddressData

```typescript
interface AddressData {
  firstName: string
  lastName: string
  street: string
  city: string
  postalCode: string
  province?: string
  country: string
  phone?: string
}
```

## Supported Locales

- `es` - Spanish (España)
- `en` - English (US)
- `ro` - Romanian (România)
- `ru` - Russian (Россия)

## Template Features

### Responsive Design

The email template is fully responsive and optimized for:
- Desktop email clients (Outlook, Apple Mail, Thunderbird)
- Mobile devices (iOS Mail, Gmail app, Samsung Email)
- Web email clients (Gmail, Outlook.com, Yahoo Mail)

### Accessibility

- Semantic HTML structure
- Proper ARIA labels
- Alt text for images
- High contrast colors
- Screen reader friendly

### Dark Mode Support

The template includes CSS media queries for dark mode support in compatible email clients.

## Testing

```typescript
// Example test data
const testData: OrderEmailData = {
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  orderNumber: 'MD-2024-001',
  orderDate: '2024-01-15T10:30:00Z',
  estimatedDelivery: '2024-01-20T00:00:00Z',
  orderItems: [
    {
      productId: '1',
      name: 'Moldovan Wine',
      sku: 'WINE-001',
      quantity: 2,
      price: 15.99,
      total: 31.98,
      image: 'https://example.com/wine.jpg',
    },
  ],
  shippingAddress: {
    firstName: 'John',
    lastName: 'Doe',
    street: 'Calle Mayor 123',
    city: 'Madrid',
    postalCode: '28001',
    country: 'Spain',
  },
  subtotal: 31.98,
  shippingCost: 5.00,
  tax: 7.77,
  total: 44.75,
  paymentMethod: 'credit_card',
  locale: 'es',
}

const html = generateOrderConfirmationTemplate(testData)
```

## Error Handling

All functions include proper error handling and will:
- Throw descriptive errors for invalid data
- Log warnings for non-critical issues
- Provide fallback values when appropriate
- Sanitize user input to prevent XSS

## Performance

- Templates are generated on-demand
- Formatting functions use native Intl API for performance
- Minimal dependencies
- Optimized for serverless environments
