/**
 * Delete Product API Endpoint
 *
 * Requirements addressed:
 * - 1.6: Product deletion with confirmation
 * - 5.5: Audit logging for admin actions
 *
 * Features:
 * - Delete a specific product
 * - Audit trail logging
 * - Cascade delete related data
 */

import { serverSupabaseClient } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/adminAuth'
import { invalidateMultipleScopes } from '~/server/utils/adminCache'
import { invalidatePublicCache } from '~/server/utils/publicCache'

export default defineEventHandler(async (event) => {
  await requireAdminRole(event)

  try {
    const supabase = await serverSupabaseClient(event)
    const productId = getRouterParam(event, 'id')

    if (!productId || isNaN(Number(productId))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid product ID'
      })
    }

    // Get product data for audit log
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('id, sku, name_translations, is_active')
      .eq('id', productId)
      .single()

    if (fetchError || !product) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Product not found'
      })
    }

    // Delete the product
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (deleteError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to delete product'
      })
    }

    // Log the deletion for audit trail
    await supabase
      .from('audit_logs')
      .insert({
        action: 'product_delete',
        resource_type: 'product',
        resource_id: productId,
        old_values: {
          id: product.id,
          sku: product.sku,
          name: product.name_translations,
          is_active: product.is_active
        },
        new_values: null,
        performed_by: null, // TODO: Get current admin user ID
        ip_address: getClientIP(event),
        user_agent: getHeader(event, 'user-agent')
      })

    // Invalidate related caches (both admin and public)
    await Promise.all([
      invalidateMultipleScopes(['products', 'stats']),
      invalidatePublicCache('products')
    ])

    return {
      success: true,
      data: {
        productId: Number(productId),
        message: 'Product deleted successfully'
      }
    }

  } catch (error) {
    console.error('Delete product error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})