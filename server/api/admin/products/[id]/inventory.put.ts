/**
 * Update Product Inventory API Endpoint
 *
 * Requirements addressed:
 * - 2.3: Inline inventory editing with input validation
 * - 2.4: Inventory update API with positive number validation
 * - 2.5: Automatic out-of-stock status updates when inventory reaches zero
 *
 * Features:
 * - Validates positive number input
 * - Automatically updates product status based on stock
 * - Logs inventory movements
 * - Real-time inventory updates
 */

import { serverSupabaseClient } from '#supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { requireAdminRole } from '~/server/utils/adminAuth'
import { z } from 'zod'

const updateInventorySchema = z.object({
  quantity: z.number().int().min(0, 'Stock quantity cannot be negative'),
  reason: z.string().optional().default('manual_adjustment'),
  notes: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    await requireAdminRole(event)
    const supabase = await serverSupabaseClient(event)
    const productId = getRouterParam(event, 'id')

    if (!productId || isNaN(Number(productId))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid product ID',
      })
    }

    // Validate request body
    const body = await readBody(event)
    const validatedData = updateInventorySchema.parse(body)

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required',
      })
    }

    // Get current product data
    const { data: currentProduct, error: fetchError } = await supabase
      .from('products')
      .select('id, stock_quantity, is_active, low_stock_threshold')
      .eq('id', productId)
      .single()

    if (fetchError || !currentProduct) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Product not found',
      })
    }

    const oldQuantity = currentProduct.stock_quantity
    const newQuantity = validatedData.quantity

    // Determine if product should be active based on stock
    // Automatically deactivate if stock reaches zero, but don't auto-activate
    let shouldUpdateStatus = false
    let newActiveStatus = currentProduct.is_active

    if (newQuantity === 0 && currentProduct.is_active) {
      // Auto-deactivate when stock reaches zero
      shouldUpdateStatus = true
      newActiveStatus = false
    }

    // Update product inventory and status if needed
    const updateData: Record<string, any> = {
      stock_quantity: newQuantity,
      updated_at: new Date().toISOString(),
    }

    if (shouldUpdateStatus) {
      updateData.is_active = newActiveStatus
    }

    const { error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', productId)

    if (updateError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update inventory',
        data: updateError,
      })
    }

    // Log inventory movement
    const movementType = newQuantity > oldQuantity
      ? 'in'
      : newQuantity < oldQuantity ? 'out' : 'adjustment'

    const { error: logError } = await supabase
      .from('inventory_movements')
      .insert({
        product_id: parseInt(productId),
        movement_type: movementType,
        quantity: Math.abs(newQuantity - oldQuantity),
        quantity_before: oldQuantity,
        quantity_after: newQuantity,
        reason: validatedData.reason,
        performed_by: user.id,
        notes: validatedData.notes,
      })

    if (logError) {
      console.error('Failed to log inventory movement:', logError)
      // Don't fail the request if logging fails
    }

    // Get updated product data to return
    const { data: updatedProduct, error: refetchError } = await supabase
      .from('products')
      .select(`
        id,
        stock_quantity,
        low_stock_threshold,
        reorder_point,
        is_active,
        updated_at
      `)
      .eq('id', productId)
      .single()

    if (refetchError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch updated product data',
      })
    }

    // Calculate stock status
    const stockStatus = updatedProduct.stock_quantity > (updatedProduct.low_stock_threshold || 5)
      ? 'high'
      : updatedProduct.stock_quantity > 0 ? 'low' : 'out'

    return {
      success: true,
      product: {
        id: updatedProduct.id,
        stockQuantity: updatedProduct.stock_quantity,
        lowStockThreshold: updatedProduct.low_stock_threshold,
        reorderPoint: updatedProduct.reorder_point,
        isActive: updatedProduct.is_active,
        stockStatus,
        updatedAt: updatedProduct.updated_at,
      },
      movement: {
        type: movementType,
        quantity: Math.abs(newQuantity - oldQuantity),
        from: oldQuantity,
        to: newQuantity,
        reason: validatedData.reason,
      },
      statusChanged: shouldUpdateStatus,
      message: shouldUpdateStatus && !newActiveStatus
        ? 'Inventory updated. Product automatically deactivated due to zero stock.'
        : 'Inventory updated successfully',
    }
  }
  catch (error: any) {
    console.error('Update inventory error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update inventory',
    })
  }
})
