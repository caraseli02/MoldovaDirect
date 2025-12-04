# Testing Guide: Order Confirmation Email Integration

## Prerequisites

Before testing, ensure:
1. ✅ Development server is running (`npm run dev`)
2. ✅ Supabase is configured and running
3. ✅ Email service (Resend) is configured with API key
4. ✅ Database has test cart and product data
5. ✅ Email templates are deployed

## Testing Methods

### Method 1: Manual API Testing (Recommended for Quick Verification)

#### Step 1: Prepare Test Data
```bash
# Make sure you have a cart with items in the database
# You can create one through the UI or directly in Supabase
```

#### Step 2: Test Guest Checkout
```bash
chmod +x test-order-creation.sh
./test-order-creation.sh
```

Or use curl directly:
```bash
curl -X POST http://localhost:3000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "cartId": 1,
    "guestEmail": "your-test-email@example.com",
    "shippingAddress": {
      "firstName": "Test",
      "lastName": "User",
      "street": "123 Test St",
      "city": "Madrid",
      "postalCode": "28001",
      "country": "Spain",
      "phone": "+34123456789"
    },
    "paymentMethod": "credit_card",
    "shippingMethod": {
      "id": "standard",
      "name": "Standard Shipping",
      "price": 5.99,
      "estimatedDays": 5
    }
  }'
```

#### Step 3: Verify Results

**A. Check Server Console**
Look for these log messages:
```
✅ Order confirmation email sent successfully for order ORD-XXXXX
```

Or if there's an issue:
```
❌ Failed to send order confirmation email for order ORD-XXXXX: [error details]
```

**B. Check Email Inbox**
- Open the email address you used in the test
- Look for "Order confirmation #ORD-XXXXX - Moldova Direct"
- Verify email contains:
  - Order number
  - Order items with correct quantities and prices
  - Shipping address
  - Order total breakdown
  - Correct customer name

**C. Check Database**
Run the SQL queries in `check-email-logs.sql`:
```bash
# Connect to your Supabase database and run:
psql $DATABASE_URL -f check-email-logs.sql
```

Or check in Supabase Studio:
1. Go to Table Editor
2. Open `email_logs` table
3. Filter by `email_type = 'order_confirmation'`
4. Check the most recent entry

### Method 2: Using Postman/Insomnia

1. **Import Collection**
   - Create a new request
   - Method: POST
   - URL: `http://localhost:3000/api/orders/create`
   - Headers: `Content-Type: application/json`
   - Body: Use the JSON from the curl example above

2. **Test Scenarios**
   - Guest checkout (with `guestEmail`)
   - Authenticated user (with `Authorization: Bearer <token>`)
   - Different locales (add `locale` to shipping address)
   - Different payment methods

### Method 3: Integration Tests

Run the test suite:
```bash
# Run all tests
npm run test

# Run only order creation tests
npm run test server/api/orders/__tests__/create.test.ts

# Run with coverage
npm run test:coverage
```

### Method 4: End-to-End Testing (Through UI)

1. **Start the application**
   ```bash
   npm run dev
   ```

2. **Create an order through the UI**
   - Add products to cart
   - Go to checkout
   - Fill in shipping information
   - Use a real email address you can access
   - Complete the order

3. **Verify email received**
   - Check inbox for confirmation email
   - Verify all order details are correct

## Verification Checklist

After running tests, verify:

### ✅ Order Creation
- [ ] Order is created in database
- [ ] Order has correct status (`pending`)
- [ ] Order items are created
- [ ] Order number is generated
- [ ] Response returns immediately (not blocked by email)

### ✅ Email Sending
- [ ] Email log entry is created
- [ ] Email delivery attempt is recorded
- [ ] Email is sent to correct address
- [ ] Email contains all required information
- [ ] Email uses correct locale/language

### ✅ Error Handling
- [ ] Order succeeds even if email fails
- [ ] Email failures are logged
- [ ] Invalid orders don't send emails
- [ ] Retry mechanism works for failed emails

### ✅ User Scenarios
- [ ] Guest checkout receives email at provided address
- [ ] Authenticated user receives email at profile address
- [ ] Customer name is correct in both scenarios
- [ ] Locale preference is respected

## Common Issues & Solutions

### Issue: Email not received
**Check:**
1. Server logs for email sending errors
2. Email service (Resend) API key is valid
3. Email address is valid
4. Check spam folder
5. Verify `email_logs` table for status

**Solution:**
```sql
-- Check email log status
SELECT * FROM email_logs 
WHERE recipient_email = 'your-test-email@example.com' 
ORDER BY created_at DESC LIMIT 1;

-- Retry failed email
-- Use the retry API endpoint or email admin interface
```

### Issue: Order creation fails
**Check:**
1. Cart exists and has items
2. Products are in stock
3. Required fields are provided
4. Database connection is working

### Issue: Wrong customer information
**Check:**
1. User profile has correct `full_name` and `preferred_locale`
2. Guest checkout has correct `firstName` and `lastName`
3. Shipping address data is complete

### Issue: Email sent but data is wrong
**Check:**
1. Product snapshots in order_items
2. Address data format in orders table
3. Locale detection logic
4. Template rendering

## Performance Testing

### Test Email Sending Speed
```bash
# Time the order creation
time curl -X POST http://localhost:3000/api/orders/create \
  -H "Content-Type: application/json" \
  -d @test-order-data.json
```

**Expected Results:**
- Order creation response: < 2 seconds
- Email sent: within 30 seconds (async)
- Total time should not be blocked by email

### Load Testing
```bash
# Install k6 if not already installed
brew install k6

# Run load test (create multiple orders)
k6 run load-test-orders.js
```

## Monitoring in Production

### Key Metrics to Track
1. **Email delivery rate**: % of emails successfully sent
2. **Email delivery time**: Time from order creation to email sent
3. **Failed email count**: Number of emails that failed
4. **Retry success rate**: % of retries that succeed

### Queries for Monitoring
```sql
-- Daily email stats
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total,
  SUM(CASE WHEN status IN ('sent', 'delivered') THEN 1 ELSE 0 END) as successful,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
FROM email_logs
WHERE email_type = 'order_confirmation'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## Next Steps

After successful testing:
1. ✅ Deploy to staging environment
2. ✅ Run tests in staging
3. ✅ Monitor email delivery rates
4. ✅ Set up alerts for failed emails
5. ✅ Deploy to production
6. ✅ Monitor production metrics

## Support

If you encounter issues:
1. Check server logs
2. Check email_logs table
3. Verify email service status
4. Review this testing guide
5. Check the implementation summary document
