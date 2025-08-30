/**
 * Update Product Inventory API Endpoint
 * 
 * Requirements addressed:
 * - 2.3: Inline inventory editing functionality
 * - 2.4: Inventory update with validation
 * 
 * Features:
 * - Update stock quantity for a specific product
 * - Validate positive number input
 * - Track inventory movements
 */

import { serverSupabaseClient } from '#supabase/server'
import { z } from 'zod'

const updateInventorySchema = z.object({
  quantity: z.number().min(0, 'Quantity must be a positive number')
})

export default defineEventHandler(async (event) => {
  try {
    const supabase = await serverSupabaseClient(event)
    const productId = getRouterParam(event, 'id')
    const body = await readBody(event)

    // Validate input
    const { quantity } = updateInventorySchema.parse(body)

    if (!productId || isNaN(Number(productId))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid product ID'
      })
    }

    // Get current product data
    const { data: currentProduct, error: fetchError } = await supabase
      .from('products')
      .select('id, stock_quantity, name_translations')
      .eq('id', productId)
      .single()

    if (fetchError || !currentProduct) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Product not found'
      })
    }

    const oldQuantity = currentProduct.stock_quantity
    const quantityDifference = quantity - oldQuantity

    // Update product stock
    const { error: updateError } = await supabase
      .from('products')
      .update({ 
        stock_quantity: quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)

    if (updateError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update product inventory'
      })
    }

    // Record inventory movement
    if (quantityDifference !== 0) {
      const movementType = quantityDifference > 0 ? 'in' : 'out'
      const movementQuantity = Math.abs(quantityDifference)

      await supabase
        .from('inventory_movements')
        .insert({
          product_id: Number(productId),
          movement_type: movementType,
          quantity: movementQuantity,
          reason: 'Admin adjustment',
          reference_id: `admin-${Date.now()}`,
          performed_by: null // TODO: Get current admin user ID
        })
    }

    return {
      success: true,
      data: {
        productId: Number(productId),
        oldQuantity,
        newQuantity: quantity,
        difference: quantityDifference
      }
    }

  } catch (error) {
    console.error('Update inventory error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})