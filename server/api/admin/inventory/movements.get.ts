/**
 * Inventory Movements API Endpoint
 *
 * Requirements addressed:
 * - 2.6: Inventory movement tracking and reporting
 *
 * Features:
 * - Fetch inventory movements with filtering
 * - Pagination support
 * - Product-specific movements
 * - Date range filtering
 * - Movement type filtering
 */

import { serverSupabaseClient } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/adminAuth'
import { z } from 'zod'

const movementsQuerySchema = z.object({
  productId: z.coerce.number().optional(),
  movementType: z.enum(['in', 'out', 'adjustment']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(['created_at', 'quantity', 'movement_type']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export default defineEventHandler(async (event) => {
  try {
    await requireAdminRole(event)
    const supabase = await serverSupabaseClient(event)
    const query = getQuery(event)

    // Validate query parameters
    const validatedQuery = movementsQuerySchema.parse(query)
    const {
      productId,
      movementType,
      startDate,
      endDate,
      page,
      limit,
      sortBy,
      sortOrder,
    } = validatedQuery

    // Build the base query
    let queryBuilder = supabase
      .from('inventory_movements')
      .select(`
        id,
        product_id,
        movement_type,
        quantity,
        quantity_before,
        quantity_after,
        reason,
        reference_id,
        notes,
        created_at,
        products (
          id,
          sku,
          name_translations
        ),
        profiles (
          id,
          name
        )
      `)

    // Apply filters
    if (productId) {
      queryBuilder = queryBuilder.eq('product_id', productId)
    }

    if (movementType) {
      queryBuilder = queryBuilder.eq('movement_type', movementType)
    }

    if (startDate) {
      queryBuilder = queryBuilder.gte('created_at', startDate)
    }

    if (endDate) {
      queryBuilder = queryBuilder.lte('created_at', endDate)
    }

    // Apply sorting
    queryBuilder = queryBuilder.order(sortBy, { ascending: sortOrder === 'asc' })

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('inventory_movements')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to get movements count',
        data: countError,
      })
    }

    // Apply pagination
    const offset = (page - 1) * limit
    queryBuilder = queryBuilder.range(offset, offset + limit - 1)

    const { data: movements, error } = await queryBuilder

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch inventory movements',
        data: error,
      })
    }

    // Transform the data
    const transformedMovements = (movements || []).map((movement: any) => ({
      id: movement.id,
      productId: movement.product_id,
      product: movement.products
        ? {
            id: movement.products.id,
            sku: movement.products.sku,
            name: movement.products.name_translations,
          }
        : null,
      movementType: movement.movement_type,
      quantity: movement.quantity,
      quantityBefore: movement.quantity_before,
      quantityAfter: movement.quantity_after,
      reason: movement.reason,
      referenceId: movement.reference_id,
      notes: movement.notes,
      performedBy: movement.profiles
        ? {
            id: movement.profiles.id,
            name: movement.profiles.name,
          }
        : null,
      createdAt: movement.created_at,
    }))

    // Calculate pagination info
    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / limit)

    return {
      movements: transformedMovements,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        productId,
        movementType,
        startDate,
        endDate,
        sortBy,
        sortOrder,
      },
    }
  }
  catch (error: unknown) {
    console.error('Inventory movements API error:', getServerErrorMessage(error))

    if (isH3Error(error)) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch inventory movements',
    })
  }
})
