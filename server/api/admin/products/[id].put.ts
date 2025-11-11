/**
 * Update Product API Endpoint
 *
 * Requirements addressed:
 * - 1.4: Product editing with comprehensive form
 * - 1.5: Form submission with success/error feedback
 * - 5.5: Audit logging for admin actions
 *
 * Features:
 * - Update existing product with all fields
 * - Validate input data
 * - Handle image updates
 * - Track inventory changes
 * - Audit trail logging
 */

import { serverSupabaseClient } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/adminAuth'
import { invalidateMultipleScopes } from '~/server/utils/adminCache'
import { z } from 'zod'

const updateProductSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name_translations: z.record(z.string().min(1, 'Product name is required')),
  description_translations: z.record(z.string().optional()).optional(),
  price_eur: z.number().min(0.01, 'Price must be greater than 0'),
  compare_at_price_eur: z.number().min(0).optional().nullable(),
  stock_quantity: z.number().min(0, 'Stock quantity must be 0 or greater'),
  low_stock_threshold: z.number().min(0, 'Low stock threshold must be 0 or greater').optional(),
  category_id: z.number().min(1, 'Category is required'),
  images: z.array(z.object({
    id: z.string().optional(),
    url: z.string().url(),
    altText: z.string().optional(),
    isPrimary: z.boolean().optional()
  })).optional(),
  attributes: z.object({
    origin: z.string().optional(),
    volume: z.string().optional(),
    alcohol_content: z.string().optional(),
    featured: z.boolean().optional()
  }).optional(),
  is_active: z.boolean().default(true)
})

export default defineEventHandler(async (event) => {
  await requireAdminRole(event)

  try {
    const supabase = await serverSupabaseClient(event)
    const productId = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!productId || isNaN(Number(productId))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid product ID'
      })
    }

    // Validate input
    const validatedData = updateProductSchema.parse(body)

    // Get current product data for audit log and validation
    const { data: currentProduct, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (fetchError || !currentProduct) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Product not found'
      })
    }

    // Check if SKU is being changed and if it conflicts with another product
    if (validatedData.sku !== currentProduct.sku) {
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('sku', validatedData.sku)
        .neq('id', productId)
        .single()

      if (existingProduct) {
        throw createError({
          statusCode: 400,
          statusMessage: 'A product with this SKU already exists'
        })
      }
    }

    // Verify category exists
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', validatedData.category_id)
      .single()

    if (categoryError || !category) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid category selected'
      })
    }

    // Prepare update data
    const updateData = {
      sku: validatedData.sku,
      name_translations: validatedData.name_translations,
      description_translations: validatedData.description_translations || {},
      price_eur: validatedData.price_eur,
      compare_at_price_eur: validatedData.compare_at_price_eur,
      stock_quantity: validatedData.stock_quantity,
      low_stock_threshold: validatedData.low_stock_threshold || 5,
      category_id: validatedData.category_id,
      images: validatedData.images || [],
      attributes: validatedData.attributes || {},
      is_active: validatedData.is_active,
      updated_at: new Date().toISOString()
    }

    // Update the product
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .select(`
        id,
        sku,
        name_translations,
        description_translations,
        price_eur,
        compare_at_price_eur,
        stock_quantity,
        low_stock_threshold,
        images,
        attributes,
        is_active,
        created_at,
        updated_at,
        categories (
          id,
          slug,
          name_translations
        )
      `)
      .single()

    if (updateError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update product'
      })
    }

    // Log the update for audit trail
    await supabase
      .from('audit_logs')
      .insert({
        action: 'product_update',
        resource_type: 'product',
        resource_id: productId,
        old_values: currentProduct,
        new_values: updateData,
        performed_by: null, // TODO: Get current admin user ID
        ip_address: getClientIP(event),
        user_agent: getHeader(event, 'user-agent')
      })

    // Record inventory movement if stock quantity changed
    const oldQuantity = currentProduct.stock_quantity
    const newQuantity = validatedData.stock_quantity
    const quantityDifference = newQuantity - oldQuantity

    if (quantityDifference !== 0) {
      const movementType = quantityDifference > 0 ? 'in' : 'out'
      const movementQuantity = Math.abs(quantityDifference)

      await supabase
        .from('inventory_movements')
        .insert({
          product_id: Number(productId),
          movement_type: movementType,
          quantity: movementQuantity,
          reason: 'Admin update',
          reference_id: `update-${productId}-${Date.now()}`,
          performed_by: null // TODO: Get current admin user ID
        })
    }

    // Invalidate related caches
    await invalidateMultipleScopes(['products', 'stats'])

    // Transform response to match expected format
    const transformedProduct = {
      id: updatedProduct.id,
      sku: updatedProduct.sku,
      slug: updatedProduct.sku,
      name: updatedProduct.name_translations,
      description: updatedProduct.description_translations,
      price: updatedProduct.price_eur,
      comparePrice: updatedProduct.compare_at_price_eur,
      stockQuantity: updatedProduct.stock_quantity,
      lowStockThreshold: updatedProduct.low_stock_threshold,
      images: updatedProduct.images || [],
      category: updatedProduct.categories ? {
        id: updatedProduct.categories.id,
        slug: updatedProduct.categories.slug,
        name: updatedProduct.categories.name_translations
      } : null,
      attributes: updatedProduct.attributes || {},
      isActive: updatedProduct.is_active,
      createdAt: updatedProduct.created_at,
      updatedAt: updatedProduct.updated_at
    }

    return {
      success: true,
      data: transformedProduct,
      message: 'Product updated successfully'
    }

  } catch (error) {
    console.error('Update product error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
