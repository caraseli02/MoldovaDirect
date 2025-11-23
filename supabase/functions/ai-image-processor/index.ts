/**
 * AI Image Processor Edge Function
 *
 * This function handles AI-powered product image operations using free AI services:
 * - Background removal (Hugging Face - briaai/RMBG-1.4)
 * - Image generation (Replicate/Hugging Face - free tier)
 * - Image enhancement and upscaling
 *
 * Stores processed images in Supabase Storage and updates product records.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  productId?: number
  imageUrl: string
  operation: 'background_removal' | 'generation' | 'enhancement' | 'upscale'
  options?: {
    prompt?: string
    model?: string
    saveTo Product?: boolean
  }
}

/**
 * Call Hugging Face Inference API for background removal
 */
async function removeBackgroundHuggingFace(imageUrl: string, hfToken: string): Promise<Blob> {
  const startTime = Date.now()

  // Fetch the original image
  const imageResponse = await fetch(imageUrl)
  const imageBlob = await imageResponse.blob()

  // Call Hugging Face Inference API
  const response = await fetch(
    'https://api-inference.huggingface.co/models/briaai/RMBG-1.4',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfToken}`,
        'Content-Type': 'application/octet-stream',
      },
      body: imageBlob,
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Hugging Face API error: ${error}`)
  }

  const resultBlob = await response.blob()
  const processingTime = Date.now() - startTime

  console.log(`Background removal completed in ${processingTime}ms`)

  return resultBlob
}

/**
 * Upload processed image to Supabase Storage
 */
async function uploadToStorage(
  supabase: any,
  imageBlob: Blob,
  fileName: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, imageBlob, {
      contentType: 'image/png',
      upsert: false,
    })

  if (error) {
    throw new Error(`Storage upload error: ${error.message}`)
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName)

  return publicUrl
}

/**
 * Log AI operation to database
 */
async function logAIOperation(
  supabase: any,
  params: {
    productId?: number
    originalUrl: string
    generatedUrl: string
    provider: string
    model: string
    operation: string
    processingTime: number
    status: 'completed' | 'failed'
    errorMessage?: string
    metadata?: any
  }
) {
  const { error } = await supabase
    .from('ai_image_logs')
    .insert({
      product_id: params.productId,
      original_url: params.originalUrl,
      generated_url: params.generatedUrl,
      ai_provider: params.provider,
      ai_model: params.model,
      operation: params.operation,
      processing_time_ms: params.processingTime,
      status: params.status,
      error_message: params.errorMessage,
      metadata: params.metadata,
    })

  if (error) {
    console.error('Failed to log AI operation:', error)
  }
}

/**
 * Update product images array with new generated image
 */
async function updateProductImages(
  supabase: any,
  productId: number,
  imageUrl: string
) {
  // Get current product images
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('images')
    .eq('id', productId)
    .single()

  if (fetchError) {
    throw new Error(`Failed to fetch product: ${fetchError.message}`)
  }

  // Add new image to array
  const currentImages = Array.isArray(product.images) ? product.images : []
  const newImages = [
    ...currentImages,
    {
      url: imageUrl,
      alt_text: 'AI generated product image',
      is_primary: currentImages.length === 0, // Set as primary if no images exist
      generated_by_ai: true,
    },
  ]

  // Update product
  const { error: updateError } = await supabase
    .from('products')
    .update({ images: newImages })
    .eq('id', productId)

  if (updateError) {
    throw new Error(`Failed to update product: ${updateError.message}`)
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const hfToken = Deno.env.get('HUGGINGFACE_API_TOKEN')!

    if (!hfToken) {
      throw new Error('HUGGINGFACE_API_TOKEN environment variable is not set')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse request body
    const body: RequestBody = await req.json()
    const { productId, imageUrl, operation, options = {} } = body

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'imageUrl is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const startTime = Date.now()
    let resultBlob: Blob
    let aiProvider = 'huggingface'
    let aiModel = 'briaai/RMBG-1.4'

    // Process based on operation type
    switch (operation) {
      case 'background_removal':
        resultBlob = await removeBackgroundHuggingFace(imageUrl, hfToken)
        break

      default:
        throw new Error(`Unsupported operation: ${operation}`)
    }

    const processingTime = Date.now() - startTime

    // Generate unique filename
    const timestamp = Date.now()
    const randomId = crypto.randomUUID().slice(0, 8)
    const fileName = `ai-processed/${operation}/${timestamp}-${randomId}.png`

    // Upload to Supabase Storage
    const publicUrl = await uploadToStorage(supabase, resultBlob, fileName)

    // Log operation
    await logAIOperation(supabase, {
      productId,
      originalUrl: imageUrl,
      generatedUrl: publicUrl,
      provider: aiProvider,
      model: aiModel,
      operation,
      processingTime,
      status: 'completed',
      metadata: options,
    })

    // Update product if requested and productId is provided
    if (options.saveToProduct && productId) {
      await updateProductImages(supabase, productId, publicUrl)
    }

    return new Response(
      JSON.stringify({
        success: true,
        url: publicUrl,
        operation,
        provider: aiProvider,
        model: aiModel,
        processingTime,
        fileName,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('AI Image Processor error:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

/*
 * To deploy this function:
 *
 * 1. Set environment variable in Supabase Dashboard:
 *    HUGGINGFACE_API_TOKEN=your_token_here
 *
 * 2. Deploy function:
 *    supabase functions deploy ai-image-processor
 *
 * 3. Test locally:
 *    supabase functions serve ai-image-processor
 *
 * 4. Example request:
 *    curl -X POST https://your-project.supabase.co/functions/v1/ai-image-processor \
 *      -H "Authorization: Bearer YOUR_ANON_KEY" \
 *      -H "Content-Type: application/json" \
 *      -d '{
 *        "productId": 1,
 *        "imageUrl": "https://example.com/product.jpg",
 *        "operation": "background_removal",
 *        "options": {
 *          "saveToProduct": true
 *        }
 *      }'
 */
