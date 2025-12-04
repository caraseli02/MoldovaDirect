// Cookie Debug Script
// Run this in browser console to inspect checkout cookie

function analyzeCookie() {
  console.log('=== COOKIE ANALYSIS ===\n')

  // Get all cookies
  const cookies = document.cookie.split(';').map(c => c.trim())

  console.log('All cookies:', cookies.length)
  cookies.forEach(cookie => {
    const [name] = cookie.split('=')
    console.log(`  - ${name}`)
  })

  // Find checkout cookie
  const checkoutCookie = cookies.find(c => c.startsWith('checkout_session='))

  if (!checkoutCookie) {
    console.log('\n❌ No checkout_session cookie found!')
    return
  }

  const [, encodedValue] = checkoutCookie.split('=')

  console.log('\n✅ checkout_session cookie found')
  console.log('Raw cookie size:', encodedValue.length, 'bytes')
  console.log('Encoded value (first 100 chars):', encodedValue.substring(0, 100))

  try {
    // Try to decode the cookie value
    const decodedValue = decodeURIComponent(encodedValue)
    console.log('\nDecoded size:', decodedValue.length, 'bytes')
    console.log('Decoded value (first 200 chars):', decodedValue.substring(0, 200))

    // Try to parse as JSON
    const parsed = JSON.parse(decodedValue)
    console.log('\n✅ Successfully parsed as JSON')
    console.log('Keys:', Object.keys(parsed))
    console.log('Has orderData:', !!parsed.orderData)
    if (parsed.orderData) {
      console.log('orderData keys:', Object.keys(parsed.orderData))
      console.log('orderId:', parsed.orderData.orderId)
      console.log('orderNumber:', parsed.orderData.orderNumber)
    }

    // Calculate actual data size
    const jsonString = JSON.stringify(parsed)
    console.log('\nJSON string size:', jsonString.length, 'bytes')

    // Check against 4KB limit
    const limit = 4096
    if (jsonString.length > limit) {
      console.log('⚠️  WARNING: Cookie exceeds 4KB limit!')
      console.log('Overage:', jsonString.length - limit, 'bytes')
    } else {
      console.log('✅ Cookie size OK:', ((jsonString.length / limit) * 100).toFixed(1) + '% of 4KB limit')
    }

  } catch (error) {
    console.error('❌ Failed to parse cookie:', error.message)
  }
}

// Run on navigation
console.log('Cookie state BEFORE navigation:')
analyzeCookie()

// Store the function globally so it can be called after navigation
window.analyzeCookieAfterNav = () => {
  console.log('\n\nCookie state AFTER navigation:')
  analyzeCookie()
}

console.log('\n\n📝 To check cookie after navigating to confirmation page, run:')
console.log('   window.analyzeCookieAfterNav()')
