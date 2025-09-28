export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { orderID } = body

    // Validate required fields
    if (!orderID) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required field: orderID'
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

    // Capture PayPal order
    const captureUrl = environment === 'production'
      ? `https://api-m.paypal.com/v2/checkout/orders/${orderID}/capture`
      : `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}/capture`

    const captureResponse = await fetch(captureUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': `capture-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
    })

    if (!captureResponse.ok) {
      const errorData = await captureResponse.json()
      console.error('PayPal order capture failed:', errorData)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to capture PayPal order'
      })
    }

    const captureData = await captureResponse.json()

    // Check if capture was successful
    if (captureData.status === 'COMPLETED') {
      return {
        success: true,
        orderID: captureData.id,
        status: captureData.status,
        captureData,
        transactionId: captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id,
        amount: captureData.purchase_units?.[0]?.payments?.captures?.[0]?.amount
      }
    } else {
      return {
        success: false,
        error: 'Payment capture failed',
        status: captureData.status,
        captureData
      }
    }

  } catch (error) {
    console.error('PayPal order capture error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to capture PayPal order'
    })
  }
})