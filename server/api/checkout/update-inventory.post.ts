// POST /api/checkout/update-inventory - Update product inventory after order
import { serverSupabaseServiceRole } from '#supabase/server'

interface UpdateInventoryRequest {
  items: Array<{
    productId: number
    quantity: number
  }>
  orderId: number
}

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabaseServiceRole(event)

    // Parse request body
    const body = await readBody(event) as UpdateInventoryRequest

    // Validate required fields
    if (!body.items?.length || !body.orderId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields'
      })
    }

    // Process each item to update inventory
    const inventoryUpdates = []
    const outOfStockItems = []

    for (const item of body.items) {
      // Get current product stock
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, stock_quantity, name_translations')
        .eq('id', item.productId)
        .single()

      if (productError || !product) {
        console.error(`Product ${item.productId} not found:`, productError)
        continue
      }

      // Check if there's enough stock
      if (product.stock_quantity < item.quantity) {
        outOfStockItems.push({
          productId: item.productId,
          productName: product.name_translations?.en || 'Unknown Product',
          requested: item.quantity,
          available: product.stock_quantity
        })
        continue
      }

      // Update product stock
      const newStock = product.stock_quantity - item.quantity
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          stock_quantity: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.productId)

      if (updateError) {
        console.error(`Failed to update stock for product ${item.productId}:`, updateError)
        throw createError({
          statusCode: 500,
          statusMessage: `Failed to update inventory for product ${item.productId}`
        })
      }

      inventoryUpdates.push({
        productId: item.productId,
        previousStock: product.stock_quantity,
        newStock: newStock,
        quantityReduced: item.quantity
      })

      // TODO: Log inventory movement when inventory_movements table is created
      console.log(`Inventory updated for product ${item.productId}: ${product.stock_quantity} -> ${newStock}`)
    }

    // If there are out of stock items, return error
    if (outOfStockItems.length > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Some items are out of stock',
        data: {
          outOfStockItems
        }
      })
    }

    return {
      success: true,
      message: 'Inventory updated successfully',
      updates: inventoryUpdates
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Inventory update error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update inventory'
    })
  }
})
