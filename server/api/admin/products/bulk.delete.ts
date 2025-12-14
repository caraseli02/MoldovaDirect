/**
 * Bulk Delete Products API Endpoint
 *
 * Requirements addressed:
 * - 1.6: Bulk operations for multiple product management
 * - 6.6: Progress indicators for bulk operations
 * - 5.5: Audit logging for admin actions
 *
 * Features:
 * - Delete multiple products at once
 * - Audit trail logging
 * - Error handling for partial failures
 */

import { serverSupabaseClient } from '#supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { H3Event } from 'h3'
import { requireAdminRole } from '~/server/utils/adminAuth'
import { z } from 'zod'

/**
 * Get client IP address from request
 */
function getClientIP(event: H3Event): string | null {
  const headers = getHeaders(event)
  return (
    headers['x-forwarded-for']?.split(',')[0]?.trim()
    || headers['x-real-ip']
    || headers['cf-connecting-ip']
    || getRequestIP(event)
    || null
  )
}

const bulkDeleteSchema = z.object({
  productIds: z.array(z.number()).min(1, 'At least one product ID is required'),
})

export default defineEventHandler(async (event) => {
  try {
    await requireAdminRole(event)
    const supabase = await serverSupabaseClient(event)
    const body = await readBody(event)

    // Validate input
    const { productIds } = bulkDeleteSchema.parse(body)

    // Get products data for audit log
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, sku, name_translations, is_active')
      .in('id', productIds)

    if (fetchError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch products for deletion',
      })
    }

    if (!products || products.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No products found to delete',
      })
    }

    const foundIds = products.map(p => p.id)
    const notFoundIds = productIds.filter(id => !foundIds.includes(id))

    // Delete the products
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .in('id', foundIds)

    if (deleteError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to delete products',
      })
    }

    // Log the bulk deletion for audit trail
    const auditLogs = products.map(product => ({
      action: 'product_bulk_delete',
      resource_type: 'product',
      resource_id: product.id.toString(),
      old_values: {
        id: product.id,
        sku: product.sku,
        name: product.name_translations,
        is_active: product.is_active,
      },
      new_values: null,
      performed_by: null, // TODO: Get current admin user ID
      ip_address: getClientIP(event),
      user_agent: getHeader(event, 'user-agent'),
    }))

    await supabase
      .from('audit_logs')
      .insert(auditLogs)

    return {
      success: true,
      data: {
        deletedCount: foundIds.length,
        deletedIds: foundIds,
        notFoundIds,
        message: `${foundIds.length} products deleted successfully`,
      },
    }
  }
  catch (error: any) {
    console.error('Bulk delete products error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
