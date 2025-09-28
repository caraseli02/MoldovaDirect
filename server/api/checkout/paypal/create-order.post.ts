export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { amount, currency = 'EUR' } = body

    // Validate required fields
    if (!amount) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required field: amount'
      })
    }

    // Validate amount
    const numericAmount = parseFloat(amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Amount must be a positive number'
      })
    }

    const runtimeConfig = useRuntimeConfig()
    const clientId = runtimeConfig.paypalClientId
    const clientSecret = runtimeConfig.paypalClientSecret
    const environment = runtimeConfig.paypalEnvironment || 'sandbox'

    if (!clientId || !clientSecret) {
      throw createError({
        statusCode: 503,
        statusMessage: 'PayPal payments are currently unavailable - service not configured'
      })
    }

    // Get PayPal access token
    const authUrl = environment === 'production' 
      ? 'https://api-m.paypal.com/v1/oauth2/token'
      : 'https://api-m.sandbox.paypal.com/v1/oauth2/token'

    const authResponse = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    })

    if (!authResponse.ok) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to authenticate with PayPal'
      })
    }

    const authData = await authResponse.json()
    const accessToken = authData.access_token

    // Create PayPal order
    const orderUrl = environment === 'production'
      ? 'https://api-m.paypal.com/v2/checkout/orders'
      : 'https://api-m.sandbox.paypal.com/v2/checkout/orders'

    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: numericAmount.toFixed(2)
        },
        description: 'Moldovan Products Order'
      }],
      application_context: {
        brand_name: 'Moldovan Products',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${getHeader(event, 'origin')}/checkout/confirmation`,
        cancel_url: `${getHeader(event, 'origin')}/checkout/payment`
      }
    }

    const orderResponse = await fetch(orderUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      },
      body: JSON.stringify(orderData)
    })

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json()
      console.error('PayPal order creation failed:', errorData)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create PayPal order'
      })
    }

    const order = await orderResponse.json()

    return {
      success: true,
      orderID: order.id,
      order
    }

  } catch (error) {
    console.error('PayPal order creation error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create PayPal order'
    })
  }
})