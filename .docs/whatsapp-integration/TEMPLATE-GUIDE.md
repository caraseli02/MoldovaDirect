# WhatsApp Message Templates Guide

**Created:** 2025-11-28
**Purpose:** Guide for creating and managing WhatsApp message templates

---

## Overview

WhatsApp Business API requires **pre-approved templates** for all outbound messages (business-initiated). This ensures quality and prevents spam.

### Template Categories

1. **Authentication** - Login OTPs, verification codes (higher cost)
2. **Utility** - Order updates, shipping notifications (FREE in service window)
3. **Marketing** - Promotions, offers (highest cost, requires opt-in)

---

## Template Requirements

### General Rules

- ✅ Must be approved by Meta before use (1-24 hours review time)
- ✅ Support multiple languages (Spanish, English, Romanian, Russian)
- ✅ Use placeholders for dynamic content: `{{1}}`, `{{2}}`, etc.
- ❌ Cannot include promotional content in utility templates
- ❌ Cannot use URLs unless pre-registered
- ❌ Maximum 1024 characters

### Component Structure

Templates have 4 components:

1. **Header** (optional) - Text, image, video, or document
2. **Body** (required) - Main message content with placeholders
3. **Footer** (optional) - Fixed text (no variables)
4. **Buttons** (optional) - Quick replies or call-to-action

---

## Required Templates for Moldova Direct

### 1. Order Confirmation (`order_confirmation_v1`)

**Category:** Utility
**Language:** Multilingual (es, en, ro, ru)

**Body:**
```
¡Tu pedido {{1}} ha sido confirmado! 🎉

Total: {{2}}
Nombre: {{3}}

Puedes rastrear tu pedido aquí: {{4}}

Gracias por tu compra en Moldova Direct.
```

**Parameters:**
1. Order Number (e.g., "ORD-12345")
2. Total Amount (e.g., "€49.99")
3. Customer Name (e.g., "John Doe")
4. Tracking URL (e.g., "https://moldova-direct.vercel.app/orders/abc123")

**English Version:**
```
Your order {{1}} has been confirmed! 🎉

Total: {{2}}
Name: {{3}}

Track your order here: {{4}}

Thank you for shopping with Moldova Direct.
```

**Romanian Version:**
```
Comanda ta {{1}} a fost confirmată! 🎉

Total: {{2}}
Nume: {{3}}

Urmărește comanda aici: {{4}}

Mulțumim că ai comandat de la Moldova Direct.
```

**Russian Version:**
```
Ваш заказ {{1}} подтвержден! 🎉

Сумма: {{2}}
Имя: {{3}}

Отследить заказ: {{4}}

Спасибо за покупку в Moldova Direct.
```

---

### 2. Order Shipped (`order_shipped_v1`)

**Category:** Utility

**Body (Spanish):**
```
📦 Tu pedido {{1}} ha sido enviado!

Número de seguimiento: {{2}}

Rastrea tu envío: {{3}}

Tiempo estimado de entrega: 2-5 días hábiles
```

**Parameters:**
1. Order Number
2. Tracking Number
3. Tracking URL

---

### 3. Order Delivered (`order_delivered_v1`)

**Category:** Utility

**Body (Spanish):**
```
✅ Tu pedido {{1}} ha sido entregado!

¿Disfrutaste tu pedido? Nos encantaría saber tu opinión:
{{2}}

Gracias por confiar en Moldova Direct.
```

**Parameters:**
1. Order Number
2. Review URL

---

### 4. Order Cancelled (`order_cancelled_v1`)

**Category:** Utility

**Body (Spanish):**
```
❌ Tu pedido {{1}} ha sido cancelado.

Motivo: {{2}}

Si tienes preguntas, contáctanos en support@moldovadirect.com

Lamentamos las molestias.
```

**Parameters:**
1. Order Number
2. Cancellation Reason

---

### 5. Order Processing (`order_processing_v1`)

**Category:** Utility

**Body (Spanish):**
```
⚙️ Tu pedido {{1}} está siendo procesado.

Estado: En preparación
Tiempo estimado: 1-2 días hábiles

Te notificaremos cuando sea enviado.
```

**Parameters:**
1. Order Number

---

### 6. Authentication OTP (`auth_otp_v1`)

**Category:** Authentication

**Body (Spanish):**
```
Tu código de verificación de Moldova Direct es: {{1}}

Válido por {{2}} minutos.

No compartas este código con nadie.
```

**Parameters:**
1. 6-digit OTP code (e.g., "123456")
2. Expiry time in minutes (e.g., "5")

**Footer:**
```
Moldova Direct - Seguridad
```

---

### 7. Order Issue (`order_issue_v1`)

**Category:** Utility

**Body (Spanish):**
```
⚠️ Hay un problema con tu pedido {{1}}.

Detalle: {{2}}

Nuestro equipo de soporte se pondrá en contacto contigo pronto.

Referencia: {{3}}
```

**Parameters:**
1. Order Number
2. Issue Description
3. Support Ticket ID

---

### 8. Support Ticket (Customer) (`support_ticket_customer_v1`)

**Category:** Utility

**Body (Spanish):**
```
Hemos recibido tu solicitud de soporte.

Ticket #{{1}}
Asunto: {{2}}

Nuestro equipo responderá en menos de 24 horas.

Gracias por tu paciencia.
```

**Parameters:**
1. Ticket ID
2. Subject

---

## How to Create Templates

### Via Twilio

1. Go to: https://console.twilio.com/us1/develop/sms/content-editor
2. Click **Create New Content**
3. Select **WhatsApp** as channel
4. Choose template category (Authentication, Utility, Marketing)
5. Fill in template details:
   - **Name:** `order_confirmation_v1`
   - **Language:** Spanish (es)
   - **Body:** Copy body text with placeholders
6. Add variables: Click **Add Variable** for each `{{1}}`, `{{2}}`, etc.
7. Preview the template
8. Submit for approval
9. Wait 1-24 hours for Meta approval
10. Get **Content SID** (starts with `HX...`)
11. Add to `server/utils/whatsappNotifications.ts`:

```typescript
const WHATSAPP_TEMPLATE_IDS = {
  order_confirmation: 'HXabc123...', // Your Content SID
  // ...
}
```

### Via WhatsApp Cloud API

1. Go to: https://business.facebook.com/wa/manage/message-templates/
2. Click **Create Template**
3. Fill in template name, category, languages
4. Add body with placeholders
5. Submit for approval
6. Get template name (e.g., `order_confirmation_v1`)
7. Use template name in code (no Content SID needed)

---

## Template Variables Best Practices

### Do's ✅

- Keep variables concise (under 50 characters)
- Use meaningful placeholders: `{{order_number}}` not `{{1}}`
- Validate data before sending (no null/undefined)
- Format currency consistently: `€49.99` not `49.99 EUR`
- Use E.164 phone format: `+40712345678`

### Don'ts ❌

- Don't include sensitive data (full credit card numbers, passwords)
- Don't use overly long URLs (use URL shorteners if needed)
- Don't change template structure after approval (create new version)
- Don't mix promotional content in utility templates

---

## Testing Templates

### Twilio Sandbox

1. Join sandbox: Send "join [your-code]" to Twilio WhatsApp number
2. Test templates without approval
3. Free for development
4. Limitations: Can't send to production numbers

### Test Script

```bash
# Install dependencies
npm install twilio

# Create test script
node scripts/test-whatsapp.js
```

**`scripts/test-whatsapp.js`:**
```javascript
const twilio = require('twilio');

const client = twilio(
  process.env.WHATSAPP_ACCOUNT_SID,
  process.env.WHATSAPP_AUTH_TOKEN
);

async function testTemplate() {
  const message = await client.messages.create({
    from: `whatsapp:${process.env.WHATSAPP_NUMBER}`,
    to: 'whatsapp:+YOUR_PHONE_NUMBER',
    contentSid: 'HXabc123...', // Your template SID
    contentVariables: JSON.stringify({
      1: 'ORD-12345',
      2: '€49.99',
      3: 'John Doe',
      4: 'https://moldova-direct.vercel.app/orders/test'
    })
  });

  console.log('Message sent:', message.sid);
}

testTemplate().catch(console.error);
```

---

## Template Approval Tips

### To Speed Up Approval

1. Use clear, professional language
2. Avoid excessive emojis (1-2 max)
3. Include business name
4. Be specific about purpose
5. Follow Meta's content policies

### Common Rejection Reasons

- Contains promotional language in utility template
- Missing required elements
- Grammar/spelling errors
- Misleading content
- Sensitive topics (politics, religion, etc.)

### If Rejected

1. Read rejection reason carefully
2. Fix issues
3. Resubmit with new version (e.g., `_v2`)
4. Don't spam submissions

---

## Template Versioning

Use version suffixes for iterations:

- `order_confirmation_v1` - Initial version
- `order_confirmation_v2` - Fixed typo
- `order_confirmation_v3` - Added emoji

Keep old versions for backwards compatibility.

---

## Template Localization

Create separate templates for each language:

**Option 1: Language-specific templates**
```typescript
const TEMPLATE_IDS = {
  order_confirmation_es: 'HX123...', // Spanish
  order_confirmation_en: 'HX456...', // English
  order_confirmation_ro: 'HX789...', // Romanian
  order_confirmation_ru: 'HX012...', // Russian
}
```

**Option 2: Multilingual templates (Twilio)**
```typescript
const TEMPLATE_IDS = {
  order_confirmation: 'HX123...', // Supports multiple languages
}

// Specify language in send call
sendWhatsAppMessage({
  templateId: 'HX123...',
  language: 'es', // or 'en', 'ro', 'ru'
})
```

---

## Monitoring Template Performance

Track metrics in `notification_logs` table:

```sql
SELECT
  template_id,
  COUNT(*) as sent,
  SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
  SUM(CASE WHEN status = 'read' THEN 1 ELSE 0 END) as read,
  ROUND(100.0 * SUM(CASE WHEN status = 'read' THEN 1 ELSE 0 END) / COUNT(*), 2) as read_rate
FROM notification_logs
WHERE channel = 'whatsapp'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY template_id
ORDER BY sent DESC;
```

---

## Template Updates & Maintenance

1. **Monthly Review** - Check performance metrics
2. **Quarterly Updates** - Refresh content if needed
3. **A/B Testing** - Test variations (v1 vs v2)
4. **Deprecation** - Archive unused templates after 6 months

---

## Next Steps

1. ✅ Create templates in Twilio/Meta Business Manager
2. ✅ Submit for approval
3. ✅ Get Content SIDs / Template Names
4. ✅ Update `WHATSAPP_TEMPLATE_IDS` in code
5. ✅ Test with sandbox
6. ✅ Deploy to production
7. ✅ Monitor delivery rates

---

## Resources

- [Twilio Content Templates](https://www.twilio.com/docs/content/content-api)
- [WhatsApp Template Guidelines](https://developers.facebook.com/docs/whatsapp/message-templates/guidelines)
- [Meta Template Best Practices](https://www.facebook.com/business/help/2055875911147364)
