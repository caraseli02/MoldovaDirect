# WhatsApp Integration Implementation Guide

**Branch:** `claude/whatsapp-auth-notifications-013rzo96peDBBGcgAHSQpCFZ`
**Created:** 2025-11-28
**Status:** Foundation Ready ✅

---

## 🎯 Overview

This guide walks you through implementing WhatsApp notifications and authentication for Moldova Direct. All foundational code has been created and is ready for deployment.

**What's Included:**
- ✅ Database schemas for notification preferences and logs
- ✅ TypeScript types for multi-channel notifications
- ✅ WhatsApp client wrapper (Twilio, Cloud API, MessageBird)
- ✅ Multi-channel notification system (Email + WhatsApp)
- ✅ Translations for 4 locales (es, en, ro, ru)
- ✅ Environment configuration structure
- ✅ Template documentation

**What's Needed:**
- WhatsApp Business API account setup
- Template approvals from Meta
- Environment variables configuration
- Database migration
- UI components (optional)
- Testing & deployment

---

## 📋 Implementation Checklist

### Phase 1: Account Setup & Approval (Days 1-3)

- [ ] **Choose WhatsApp Provider**
  - [ ] Option A: Twilio (recommended for Supabase compatibility)
  - [ ] Option B: WhatsApp Cloud API (lower cost)
  - [ ] Option C: MessageBird (European GDPR focus)
  - [ ] Option D: 360dialog (alternative Cloud API)

- [ ] **Create WhatsApp Business Account**
  - [ ] Sign up for chosen provider
  - [ ] Verify business identity
  - [ ] Register phone number for WhatsApp
  - [ ] Complete business profile

- [ ] **Create Message Templates**
  - [ ] Copy templates from `.docs/whatsapp-integration/TEMPLATE-GUIDE.md`
  - [ ] Create templates in provider dashboard
  - [ ] Submit for Meta approval (1-24 hours)
  - [ ] Get template IDs/Content SIDs
  - [ ] Create all 4 language versions (es, en, ro, ru)

**Required Templates:**
1. `order_confirmation_v1` - Order confirmations
2. `order_shipped_v1` - Shipping notifications
3. `order_delivered_v1` - Delivery confirmations
4. `order_cancelled_v1` - Cancellation notices
5. `order_processing_v1` - Processing updates
6. `auth_otp_v1` - Login OTP codes (if implementing auth)

---

### Phase 2: Database Setup (Day 4)

- [ ] **Run Database Migrations**

```bash
# Connect to Supabase
npx supabase db push

# Or manually run SQL files
psql -h your-supabase-host -U postgres -d postgres -f supabase/sql/notification-preferences-schema.sql
psql -h your-supabase-host -U postgres -d postgres -f supabase/sql/notification-logs-schema.sql
```

- [ ] **Migrate Existing Email Logs (if applicable)**

```sql
-- Run in Supabase SQL Editor
SELECT migrate_email_logs_to_notification_logs();
```

- [ ] **Verify Tables Created**

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_name IN ('notification_preferences', 'notification_logs');

-- Check RLS policies
SELECT * FROM pg_policies
WHERE tablename IN ('notification_preferences', 'notification_logs');
```

- [ ] **Create Default Preferences for Existing Users**

```sql
-- Insert default preferences for users who don't have them
INSERT INTO notification_preferences (user_id, email_enabled, whatsapp_enabled, preferred_language)
SELECT
  id,
  true,
  false, -- WhatsApp opt-in required
  COALESCE(raw_user_meta_data->>'preferred_language', 'es')
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM notification_preferences WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;
```

---

### Phase 3: Environment Configuration (Day 4)

- [ ] **Install Twilio SDK** (if using Twilio)

```bash
npm install twilio
```

- [ ] **Add Environment Variables**

Copy from `.env.whatsapp.example`:

```bash
# Local development (.env.local)
WHATSAPP_PROVIDER=twilio
WHATSAPP_ENABLED=true
WHATSAPP_ACCOUNT_SID=your_account_sid
WHATSAPP_AUTH_TOKEN=your_auth_token
WHATSAPP_NUMBER=+1234567890
```

- [ ] **Configure Vercel Environment Variables**

```bash
# Production
vercel env add WHATSAPP_ACCOUNT_SID production
vercel env add WHATSAPP_AUTH_TOKEN production
vercel env add WHATSAPP_NUMBER production
vercel env add WHATSAPP_PROVIDER production
vercel env add WHATSAPP_ENABLED production

# Preview
vercel env add WHATSAPP_ACCOUNT_SID preview
# ... repeat for all variables
```

- [ ] **Update Template IDs**

Edit `server/utils/whatsappNotifications.ts`:

```typescript
const WHATSAPP_TEMPLATE_IDS: Record<NotificationType, string> = {
  order_confirmation: 'HXabc123...', // Replace with your Content SID
  order_shipped: 'HXdef456...',
  order_delivered: 'HXghi789...',
  // ... add all template IDs
}
```

---

### Phase 4: Code Integration (Days 5-7)

- [ ] **Update Order Creation API**

Edit `server/api/orders/create.post.ts`:

```typescript
import { sendOrderConfirmationMultiChannelAsync } from '~/server/utils/multiChannelNotifications'

// After order creation
sendOrderConfirmationMultiChannelAsync(
  order,
  {
    email: customerEmail,
    phone: customerPhone, // Add phone from checkout form
    userId: userId,
    name: customerName
  },
  locale,
  supabase
)
```

- [ ] **Update Order Status API**

Edit `server/api/orders/[id]/update-status.post.ts`:

```typescript
import {
  sendOrderShippedMultiChannel,
  sendOrderDeliveredMultiChannel
} from '~/server/utils/multiChannelNotifications'

// When status changes to 'shipped'
if (status === 'shipped') {
  await sendOrderShippedMultiChannel(order, customer, trackingNumber, locale, supabase)
}

// When status changes to 'delivered'
if (status === 'delivered') {
  await sendOrderDeliveredMultiChannel(order, customer, locale, supabase)
}
```

- [ ] **Add Phone Number to Checkout Form**

Edit `pages/checkout.vue`:

```vue
<template>
  <!-- Add phone input -->
  <UiFormField>
    <UiFormLabel>{{ t('checkout.phone') }}</UiFormLabel>
    <UiInput
      v-model="phone"
      type="tel"
      placeholder="+40712345678"
      :required="whatsappEnabled"
    />
    <UiFormDescription>
      {{ t('checkout.phoneHint') }}
    </UiFormDescription>
  </UiFormField>

  <!-- WhatsApp opt-in checkbox -->
  <UiCheckbox v-model="enableWhatsApp">
    {{ t('checkout.enableWhatsAppNotifications') }}
  </UiCheckbox>
</template>
```

- [ ] **Create Notification Preferences Page**

Create `pages/account/notification-preferences.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

definePageMeta({
  middleware: 'auth',
  layout: 'account'
})

const { t } = useI18n()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const preferences = ref({
  emailEnabled: true,
  whatsappEnabled: false,
  phoneNumber: '',
  phoneVerified: false,
  emailOrderConfirmation: true,
  emailOrderUpdates: true,
  whatsappOrderConfirmation: true,
  whatsappOrderUpdates: true,
})

// Load preferences
async function loadPreferences() {
  const { data } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', user.value.id)
    .single()

  if (data) {
    preferences.value = data
  }
}

// Save preferences
async function savePreferences() {
  await supabase
    .from('notification_preferences')
    .upsert({
      user_id: user.value.id,
      ...preferences.value
    })
}

onMounted(() => {
  loadPreferences()
})
</script>

<template>
  <div>
    <h1>{{ t('notifications.preferences.title') }}</h1>

    <!-- Email Section -->
    <section>
      <h2>{{ t('notifications.preferences.emailSection') }}</h2>
      <UiSwitch v-model="preferences.emailEnabled">
        {{ t('notifications.preferences.emailEnabled') }}
      </UiSwitch>
    </section>

    <!-- WhatsApp Section -->
    <section>
      <h2>{{ t('notifications.preferences.whatsappSection') }}</h2>

      <UiSwitch v-model="preferences.whatsappEnabled">
        {{ t('notifications.preferences.whatsappEnabled') }}
      </UiSwitch>

      <UiFormField v-if="preferences.whatsappEnabled">
        <UiFormLabel>{{ t('notifications.preferences.phoneNumber') }}</UiFormLabel>
        <UiInput
          v-model="preferences.phoneNumber"
          type="tel"
          placeholder="+40712345678"
        />
        <UiButton v-if="!preferences.phoneVerified" @click="verifyPhone">
          {{ t('notifications.preferences.verifyPhone') }}
        </UiButton>
      </UiFormField>
    </section>

    <UiButton @click="savePreferences">
      {{ t('notifications.preferences.saveChanges') }}
    </UiButton>
  </div>
</template>
```

- [ ] **Add Translations**

Merge translations from `i18n/locales/whatsapp-translations.json` into:
- `i18n/locales/es.json`
- `i18n/locales/en.json`
- `i18n/locales/ro.json`
- `i18n/locales/ru.json`

---

### Phase 5: Testing (Days 8-10)

- [ ] **Local Testing**

```bash
# Start dev server
npm run dev

# Test WhatsApp send function
curl -X POST http://localhost:3000/api/test/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+YOUR_PHONE",
    "template": "order_confirmation",
    "locale": "es"
  }'
```

- [ ] **Create Test Order**

1. Go to checkout page
2. Add phone number
3. Enable WhatsApp notifications
4. Complete order
5. Check both email and WhatsApp received

- [ ] **Test All Template Types**

```typescript
// In Nuxt DevTools or browser console
const testTemplates = async () => {
  const templates = [
    'order_confirmation',
    'order_shipped',
    'order_delivered',
    'order_cancelled'
  ]

  for (const template of templates) {
    await $fetch('/api/test/whatsapp-template', {
      method: 'POST',
      body: { template, phone: '+YOUR_PHONE' }
    })

    await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2s
  }
}

testTemplates()
```

- [ ] **Test Phone Verification**

1. Go to notification preferences
2. Add phone number
3. Click "Verify Phone"
4. Receive OTP via WhatsApp
5. Enter code
6. Verify success message

- [ ] **Test Multi-Language**

Change language in app and verify:
- [ ] Spanish templates work
- [ ] English templates work
- [ ] Romanian templates work
- [ ] Russian templates work

- [ ] **Test Error Handling**

- [ ] Invalid phone number shows error
- [ ] Missing template shows fallback
- [ ] WhatsApp disabled still sends email
- [ ] Failed send creates retry entry

- [ ] **Monitor Logs**

```sql
-- Check recent notifications
SELECT
  channel,
  notification_type,
  status,
  recipient_phone,
  created_at
FROM notification_logs
WHERE created_at >= NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 50;

-- Check success rate
SELECT
  channel,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'sent' OR status = 'delivered' THEN 1 ELSE 0 END) as successful,
  ROUND(100.0 * SUM(CASE WHEN status = 'sent' OR status = 'delivered' THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
FROM notification_logs
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY channel;
```

---

### Phase 6: Production Deployment (Day 11)

- [ ] **Pre-Deployment Checklist**

- [ ] All environment variables configured in Vercel
- [ ] Templates approved by Meta (status: "APPROVED")
- [ ] Database migrations run on production
- [ ] Twilio/provider account has sufficient balance
- [ ] Rate limits configured (if needed)
- [ ] Monitoring/alerting set up

- [ ] **Deploy to Vercel**

```bash
# Commit changes
git add .
git commit -m "feat: add WhatsApp notification support"

# Push to branch
git push origin claude/whatsapp-auth-notifications-013rzo96peDBBGcgAHSQpCFZ

# Deploy
vercel --prod
```

- [ ] **Post-Deployment Verification**

- [ ] Check deployment logs for errors
- [ ] Test order creation on production
- [ ] Verify WhatsApp messages received
- [ ] Check notification_logs table populating
- [ ] Monitor error rates in Vercel dashboard

- [ ] **Enable Feature Flag Gradually**

```bash
# Start with 10% of users
# Vercel > Settings > Environment Variables
WHATSAPP_ENABLED=false # Keep disabled initially

# After 24 hours of monitoring, enable for all
WHATSAPP_ENABLED=true
```

- [ ] **Set Up Monitoring**

- [ ] Configure Sentry/error tracking
- [ ] Set up email alerts for failed sends
- [ ] Create dashboard for notification metrics
- [ ] Monitor Twilio usage/costs

---

## 📁 Files Created

### Database Schemas
```
supabase/sql/
├── notification-preferences-schema.sql  ✅ Created
└── notification-logs-schema.sql         ✅ Created
```

### TypeScript Types
```
types/
└── notifications.ts                     ✅ Created
```

### Server Utilities
```
server/utils/
├── whatsapp.ts                          ✅ Created
├── whatsappNotifications.ts             ✅ Created
└── multiChannelNotifications.ts         ✅ Created
```

### Configuration
```
.env.whatsapp.example                    ✅ Created
nuxt.config.ts                           ✅ Updated
```

### Translations
```
i18n/locales/
└── whatsapp-translations.json           ✅ Created (merge into locale files)
```

### Documentation
```
.docs/whatsapp-integration/
├── IMPLEMENTATION-GUIDE.md              ✅ This file
└── TEMPLATE-GUIDE.md                    ✅ Created
```

---

## 🔧 Common Issues & Solutions

### Issue: Templates Not Approved

**Solution:**
- Review rejection reason in provider dashboard
- Fix content issues (grammar, promotional language)
- Resubmit with new version number (_v2, _v3)
- Allow 24-48 hours for approval

### Issue: WhatsApp Messages Not Sending

**Check:**
1. Environment variables are set correctly
2. Phone number is in E.164 format (+1234567890)
3. Template IDs match approved templates
4. Twilio account has balance
5. Check `notification_logs` for error messages

**Debug:**
```typescript
// Add logging to whatsapp.ts
console.log('[WhatsApp Debug]', {
  to: params.to,
  templateId: params.templateId,
  provider: config.provider,
  hasCredentials: Boolean(config.accountSid && config.authToken)
})
```

### Issue: Phone Verification Fails

**Check:**
- Supabase phone auth is enabled
- Twilio/provider supports OTP delivery
- Phone number is valid
- Not hitting rate limits

### Issue: Database Migration Fails

**Solution:**
```sql
-- Drop and recreate if needed
DROP TABLE IF EXISTS notification_logs CASCADE;
DROP TABLE IF EXISTS notification_preferences CASCADE;

-- Re-run schema files
\i supabase/sql/notification-preferences-schema.sql
\i supabase/sql/notification-logs-schema.sql
```

### Issue: High Costs

**Optimize:**
- Use service windows (24-hour free period)
- Send utility messages only (not marketing)
- Implement user preferences (opt-out)
- Batch notifications where possible
- Monitor usage dashboard

---

## 📊 Success Metrics

### Week 1 Targets
- [ ] 100+ WhatsApp notifications sent
- [ ] >95% delivery rate
- [ ] <5% error rate
- [ ] 0 template rejections
- [ ] 10+ users opted in

### Month 1 Targets
- [ ] 1,000+ notifications sent
- [ ] >98% delivery rate
- [ ] 50+ users with WhatsApp enabled
- [ ] >80% read rate (vs ~30% email)
- [ ] Cost under budget ($150/month)

### Success Indicators
- Higher engagement than email (measure open/read rates)
- Fewer support tickets ("where's my order?")
- Positive user feedback
- No spam complaints
- Templates remain approved

---

## 🚀 Optional Enhancements

### Phase 7: WhatsApp Authentication (Optional)

- [ ] Add WhatsApp login page: `pages/auth/whatsapp-login.vue`
- [ ] Implement OTP flow using Supabase phone auth
- [ ] Add "Login with WhatsApp" button to login page
- [ ] Test phone verification flow
- [ ] Monitor authentication success rates

### Phase 8: Admin Dashboard

- [ ] Create notification logs viewer
- [ ] Add retry management UI
- [ ] Template performance dashboard
- [ ] User preference management
- [ ] Cost tracking/analytics

### Phase 9: Advanced Features

- [ ] Rich media messages (images, PDFs)
- [ ] Interactive buttons (Quick Reply, Call-to-Action)
- [ ] WhatsApp chatbot for customer support
- [ ] Automated order tracking via WhatsApp
- [ ] Review requests via WhatsApp

---

## 📞 Support & Resources

### Documentation
- This guide: `.docs/whatsapp-integration/IMPLEMENTATION-GUIDE.md`
- Template guide: `.docs/whatsapp-integration/TEMPLATE-GUIDE.md`
- WhatsApp translations: `i18n/locales/whatsapp-translations.json`

### Provider Resources
- **Twilio:** https://www.twilio.com/docs/whatsapp
- **WhatsApp Cloud API:** https://developers.facebook.com/docs/whatsapp
- **MessageBird:** https://developers.messagebird.com/
- **Supabase Auth:** https://supabase.com/docs/guides/auth/phone-login

### Code References
- WhatsApp client: `server/utils/whatsapp.ts`
- Notifications: `server/utils/whatsappNotifications.ts`
- Multi-channel: `server/utils/multiChannelNotifications.ts`
- Types: `types/notifications.ts`

---

## ✅ Final Checklist

Before marking as complete:

- [ ] All database schemas deployed
- [ ] Environment variables configured
- [ ] Templates approved and IDs updated
- [ ] Integration tested end-to-end
- [ ] UI components implemented
- [ ] Translations merged
- [ ] Production deployment successful
- [ ] Monitoring in place
- [ ] Documentation updated
- [ ] Team trained on new features

---

**Status:** Foundation Complete ✅
**Next Step:** Choose provider and create WhatsApp Business account
**Timeline:** 10-14 days to full production

Good luck with the implementation! 🎉
