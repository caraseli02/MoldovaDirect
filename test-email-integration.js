#!/usr/bin/env node
/**
 * Simple test script for order confirmation email integration
 * Run with: node test-email-integration.js
 */

const API_URL = process.env.API_URL || 'http://localhost:3000'
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com'

console.log('🧪 Order Confirmation Email Integration Test')
console.log('=' .repeat(50))
console.log(`API URL: ${API_URL}`)
console.log(`Test Email: ${TEST_EMAIL}`)
console.log('=' .repeat(50))

async function testGuestCheckout() {
  console.log('\n📧 Test 1: Guest Checkout Order')
  console.log('-'.repeat(50))
  
  const orderData = {
    cartId: 1,
    guestEmail: TEST_EMAIL,
    shippingAddress: {
      firstName: 'Test',
      lastName: 'User',
      street: '123 Test Street',
      city: 'Madrid',
      postalCode: '28001',
      country: 'Spain',
      phone: '+34123456789'
    },
    paymentMethod: 'credit_card',
    shippingMethod: {
      id: 'standard',
      name: 'Standard Shipping',
      price: 5.99,
      estimatedDays: 5
    },
    customerNotes: 'Test order - please ignore'
  }

  try {
    const response = await fetch(`${API_URL}/api/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    })

    const result = await response.json()

    if (response.ok) {
      console.log('✅ Order created successfully!')
      console.log('Order ID:', result.data.orderId)
      console.log('Order Number:', result.data.orderNumber)
      console.log('Total:', result.data.total)
      console.log('\n📬 Check your email at:', TEST_EMAIL)
      console.log('📊 Check server logs for email sending status')
      return result.data
    } else {
      console.error('❌ Order creation failed:', result)
      return null
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message)
    return null
  }
}

async function testAuthenticatedUser(authToken) {
  console.log('\n👤 Test 2: Authenticated User Order')
  console.log('-'.repeat(50))
  
  if (!authToken) {
    console.log('⏭️  Skipping (no auth token provided)')
    console.log('   Set AUTH_TOKEN environment variable to test')
    return null
  }

  const orderData = {
    cartId: 2,
    shippingAddress: {
      firstName: 'Jane',
      lastName: 'Smith',
      street: '456 Oak Avenue',
      city: 'Barcelona',
      postalCode: '08001',
      country: 'Spain',
      phone: '+34987654321'
    },
    paymentMethod: 'paypal'
  }

  try {
    const response = await fetch(`${API_URL}/api/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(orderData)
    })

    const result = await response.json()

    if (response.ok) {
      console.log('✅ Order created successfully!')
      console.log('Order ID:', result.data.orderId)
      console.log('Order Number:', result.data.orderNumber)
      console.log('\n📬 Check user\'s registered email for confirmation')
      return result.data
    } else {
      console.error('❌ Order creation failed:', result)
      return null
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message)
    return null
  }
}

async function checkEmailLogs(orderNumber) {
  console.log('\n📊 Checking Email Logs')
  console.log('-'.repeat(50))
  console.log('Run this SQL query in your database:')
  console.log(`
SELECT 
  el.id,
  el.email_type,
  el.recipient_email,
  el.status,
  el.sent_at,
  el.failed_at,
  el.retry_count
FROM email_logs el
JOIN orders o ON o.id = el.order_id
WHERE o.order_number = '${orderNumber}'
ORDER BY el.created_at DESC;
  `)
}

async function runTests() {
  console.log('\n🚀 Starting tests...\n')

  // Test 1: Guest checkout
  const guestOrder = await testGuestCheckout()
  
  if (guestOrder) {
    await new Promise(resolve => setTimeout(resolve, 2000))
    await checkEmailLogs(guestOrder.orderNumber)
  }

  // Test 2: Authenticated user (if token provided)
  const authToken = process.env.AUTH_TOKEN
  const authOrder = await testAuthenticatedUser(authToken)
  
  if (authOrder) {
    await new Promise(resolve => setTimeout(resolve, 2000))
    await checkEmailLogs(authOrder.orderNumber)
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('📋 Test Summary')
  console.log('='.repeat(50))
  console.log('✅ Guest checkout:', guestOrder ? 'PASSED' : 'FAILED')
  console.log('✅ Authenticated user:', authOrder ? 'PASSED' : authToken ? 'FAILED' : 'SKIPPED')
  
  console.log('\n📝 Next Steps:')
  console.log('1. Check your email inbox for confirmation emails')
  console.log('2. Check server console logs for email sending status')
  console.log('3. Run the SQL queries above to verify email logs')
  console.log('4. Check email_delivery_attempts table for delivery status')
  
  console.log('\n💡 Tips:')
  console.log('- Set TEST_EMAIL env var to use your email')
  console.log('- Set AUTH_TOKEN env var to test authenticated flow')
  console.log('- Set API_URL env var if not using localhost:3000')
  console.log('\nExample:')
  console.log('TEST_EMAIL=your@email.com AUTH_TOKEN=xxx node test-email-integration.js')
}

// Run tests
runTests().catch(console.error)
