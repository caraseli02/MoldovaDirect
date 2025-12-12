/**
 * Get Single Product API Endpoint (Admin)
 *
 * Requirements addressed:
 * - 1.4: Get product details for editing
 * - Admin-specific product data retrieval
 *
 * Features:
 * - Fetch complete product data including admin fields
 * - Include category and relationship data
 * - Transform data for admin interface
 */

import { serverSupabaseClient } from '#supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { requireAdminRole } from '~/server/utils/adminAuth'

export default defineEventHandler(async (event) => {
  await requireAdminRole(event)

  try {
    const supabase = await serverSupabaseClient(event)
    const productId = getRouterParam(event, 'id')

    if (!productId || isNaN(Number(productId))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid product ID',
      })
    }

    // Fetch product with all admin-relevant data
    const { data: product, error } = await supabase
      .from('products')
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
      .eq('id', productId)
      .single()

    if (error || !product) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Product not found',
      })
    }

    // Transform the data to match expected format
    const transformedProduct = {
      id: product.id,
      sku: product.sku,
      slug: product.sku?.toLowerCase() || `product-${product.id}`,
      name: product.name_translations,
      description: product.description_translations,
      price: product.price_eur,
      comparePrice: product.compare_at_price_eur,
      stockQuantity: product.stock_quantity,
      lowStockThreshold: product.low_stock_threshold || 5,
      stockStatus: product.stock_quantity > (product.low_stock_threshold || 5)
        ? 'high'
        : product.stock_quantity > 0 ? 'low' : 'out',
      images: Array.isArray(product.images)
        ? product.images.map((img: any, index: number) => ({
            id: img.id || `img-${index}`,
            url: img.url || img,
            altText: img.alt || img.alt_text || product.name_translations,
            isPrimary: img.is_primary || index === 0,
          }))
        : [],
      category: product.categories
        ? {
            id: product.categories.id,
            slug: product.categories.slug,
            name: product.categories.name_translations,
          }
        : null,
      attributes: {
        origin: product.attributes?.origin || '',
        volume: product.attributes?.volume ? parseInt(product.attributes.volume) : null,
        alcoholContent: product.attributes?.alcohol_content ? parseFloat(product.attributes.alcohol_content) : null,
        featured: product.attributes?.featured || false,
        ...product.attributes,
      },
      isActive: product.is_active,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    }

    return {
      success: true,
      product: transformedProduct,
    }
  }
  catch (error: any) {
    console.error('Get product error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
