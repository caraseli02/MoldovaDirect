/**
 * Bulk Update Products API Endpoint
 *
 * Requirements addressed:
 * - 1.6: Bulk operations for multiple product management
 * - 6.6: Progress indicators for bulk operations
 * - 5.5: Audit logging for admin actions
 *
 * Features:
 * - Update multiple products at once
 * - Support for status changes and other bulk updates
 * - Audit trail logging
 * - Error handling for partial failures
 */

import { serverSupabaseClient } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/adminAuth'
import { z } from 'zod'

const bulkUpdateSchema = z.object({
  productIds: z.array(z.number()).min(1, 'At least one product ID is required'),
  updates: z.object({
    isActive: z.boolean().optional(),
    price: z.number().positive().optional(),
    stockQuantity: z.number().min(0).optional(),
    categoryId: z.number().optional(),
  }).refine(
    data => Object.keys(data).length > 0,
    { message: 'At least one update field is required' },
  ),
})

export default defineEventHandler(async (event) => {
  try {
    await requireAdminRole(event)
    const supabase = await serverSupabaseClient(event)
    const body = await readBody(event)

    // Validate input
    const { productIds, updates } = bulkUpdateSchema.parse(body)

    // Get current products data for audit log
    const { data: currentProducts, error: fetchError } = await supabase
      .from('products')
      .select('id, sku, name_translations, is_active, price_eur, stock_quantity, category_id')
      .in('id', productIds)

    if (fetchError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch products for update',
      })
    }

    if (!currentProducts || currentProducts.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No products found to update',
      })
    }

    const foundIds = currentProducts.map(p => p.id)
    const notFoundIds = productIds.filter(id => !foundIds.includes(id))

    // Build update object
    const updateData = {
      updated_at: new Date().toISOString(),
    }

    if (updates.isActive !== undefined) {
      updateData.is_active = updates.isActive
    }
    if (updates.price !== undefined) {
      updateData.price_eur = updates.price
    }
    if (updates.stockQuantity !== undefined) {
      updateData.stock_quantity = updates.stockQuantity
    }
    if (updates.categoryId !== undefined) {
      updateData.category_id = updates.categoryId
    }

    // Update the products
    const { error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .in('id', foundIds)

    if (updateError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update products',
      })
    }

    // Log the bulk update for audit trail
    const auditLogs = currentProducts.map(product => ({
      action: 'product_bulk_update',
      resource_type: 'product',
      resource_id: product.id.toString(),
      old_values: {
        id: product.id,
        sku: product.sku,
        name: product.name_translations,
        is_active: product.is_active,
        price_eur: product.price_eur,
        stock_quantity: product.stock_quantity,
        category_id: product.category_id,
      },
      new_values: updateData,
      performed_by: null, // TODO: Get current admin user ID
      ip_address: getClientIP(event),
      user_agent: getHeader(event, 'user-agent'),
    }))

    await supabase
      .from('audit_logs')
      .insert(auditLogs)

    // If stock quantity was updated, record inventory movements
    if (updates.stockQuantity !== undefined) {
      const inventoryMovements = currentProducts.map((product) => {
        const oldQuantity = product.stock_quantity
        const newQuantity = updates.stockQuantity!
        const difference = newQuantity - oldQuantity

        if (difference !== 0) {
          return {
            product_id: product.id,
            movement_type: difference > 0 ? 'in' : 'out',
            quantity: Math.abs(difference),
            reason: 'Bulk admin adjustment',
            reference_id: `bulk-admin-${Date.now()}`,
            performed_by: null, // TODO: Get current admin user ID
          }
        }
        return null
      }).filter(Boolean)

      if (inventoryMovements.length > 0) {
        await supabase
          .from('inventory_movements')
          .insert(inventoryMovements)
      }
    }

    return {
      success: true,
      data: {
        updatedCount: foundIds.length,
        updatedIds: foundIds,
        notFoundIds,
        updates: updateData,
        message: `${foundIds.length} products updated successfully`,
      },
    }
  }
  catch (error: any) {
    console.error('Bulk update products error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
