export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { country, orderTotal } = query

    // Simulate shipping method calculation based on destination
    const shippingMethods = []

    // Standard shipping - available everywhere
    shippingMethods.push({
      id: 'standard',
      name: 'Standard Shipping',
      description: 'Delivery in 3-5 business days',
      price: 5.99,
      estimatedDays: 4,
    })

    // Express shipping - available in EU countries
    const euCountries = ['ES', 'RO', 'MD', 'FR', 'DE', 'IT']
    if (euCountries.includes(country as string)) {
      shippingMethods.push({
        id: 'express',
        name: 'Express Shipping',
        description: 'Delivery in 1-2 business days',
        price: 12.99,
        estimatedDays: 1,
      })
    }

    // Free shipping for orders over €50
    const total = parseFloat(orderTotal as string) || 0
    if (total >= 50) {
      shippingMethods.unshift({
        id: 'free',
        name: 'Free Shipping',
        description: 'Delivery in 5-7 business days (orders over €50)',
        price: 0,
        estimatedDays: 6,
      })
    }

    return {
      success: true,
      methods: shippingMethods,
    }
  }
  catch (error: any) {
    // Log full error details for debugging
    console.error('[shipping-methods.get] Error calculating shipping methods:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      query: getQuery(event),
      timestamp: new Date().toISOString(),
    })

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to calculate shipping methods',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    })
  }
})
