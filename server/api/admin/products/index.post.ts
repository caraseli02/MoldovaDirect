/**
 * Create Product API Endpoint
 *
 * Requirements addressed:
 * - 1.2: Product creation with comprehensive form
 * - 1.3: Form validation using Zod schemas
 * - 1.4: Image upload support
 * - 1.5: Form submission with success/error feedback
 *
 * Features:
 * - Create new product with all fields
 * - Validate input data
 * - Handle image uploads
 * - Audit trail logging
 */

import { serverSupabaseClient } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/adminAuth'
import { z } from 'zod'

const createProductSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name_translations: z.record(z.string().min(1, 'Product name is required')),
  description_translations: z.record(z.string().optional()).optional(),
  price_eur: z.number().min(0.01, 'Price must be greater than 0'),
  compare_at_price_eur: z.number().min(0).optional().nullable(),
  stock_quantity: z.number().min(0, 'Stock quantity must be 0 or greater'),
  low_stock_threshold: z.number().min(0, 'Low stock threshold must be 0 or greater').optional(),
  category_id: z.number().min(1, 'Category is required'),
  images: z.array(z.object({
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
    const body = await readBody(event)

    // Validate input
    const validatedData = createProductSchema.parse(body)

    // Check if SKU already exists
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('sku', validatedData.sku)
      .single()

    if (existingProduct) {
      throw createError({
        statusCode: 400,
        statusMessage: 'A product with this SKU already exists'
      })
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

    // Prepare product data
    const productData = {
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Create the product
    const { data: newProduct, error: createError } = await supabase
      .from('products')
      .insert(productData)
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

    if (createError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create product'
      })
    }

    // Log the creation for audit trail
    await supabase
      .from('audit_logs')
      .insert({
        action: 'product_create',
        resource_type: 'product',
        resource_id: newProduct.id.toString(),
        old_values: null,
        new_values: productData,
        performed_by: null, // TODO: Get current admin user ID
        ip_address: getClientIP(event),
        user_agent: getHeader(event, 'user-agent')
      })

    // Record initial inventory movement if stock > 0
    if (validatedData.stock_quantity > 0) {
      await supabase
        .from('inventory_movements')
        .insert({
          product_id: newProduct.id,
          movement_type: 'in',
          quantity: validatedData.stock_quantity,
          reason: 'Initial stock',
          reference_id: `create-${newProduct.id}`,
          performed_by: null // TODO: Get current admin user ID
        })
    }

    // Transform response to match expected format
    const transformedProduct = {
      id: newProduct.id,
      sku: newProduct.sku,
      slug: newProduct.sku,
      name: newProduct.name_translations,
      description: newProduct.description_translations,
      price: newProduct.price_eur,
      comparePrice: newProduct.compare_at_price_eur,
      stockQuantity: newProduct.stock_quantity,
      lowStockThreshold: newProduct.low_stock_threshold,
      images: newProduct.images || [],
      category: newProduct.categories ? {
        id: newProduct.categories.id,
        slug: newProduct.categories.slug,
        name: newProduct.categories.name_translations
      } : null,
      attributes: newProduct.attributes || {},
      isActive: newProduct.is_active,
      createdAt: newProduct.created_at,
      updatedAt: newProduct.updated_at
    }

    return {
      success: true,
      data: transformedProduct,
      message: 'Product created successfully'
    }

  } catch (error) {
    console.error('Create product error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
