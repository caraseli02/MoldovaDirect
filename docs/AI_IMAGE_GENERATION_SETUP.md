# AI Image Generation Setup Guide

This guide walks you through setting up FREE AI-powered product image generation for MoldovaDirect using Hugging Face.

## 🎯 Overview

The AI Image Generation feature allows you to:
- ✅ **Remove backgrounds** from product images (FREE - Hugging Face)
- ✅ **Generate new images** from prompts (Coming Soon)
- ✅ **Enhance image quality** (Coming Soon)
- ✅ **Upscale images** (Coming Soon)

**Current Status:** Background removal is fully functional and 100% FREE using Hugging Face's briaai/RMBG-1.4 model.

---

## 📋 Prerequisites

1. Supabase project (you already have this)
2. FREE Hugging Face account
3. Supabase CLI installed (for deploying Edge Functions)

---

## 🚀 Setup Steps

### Step 1: Get Hugging Face API Token (FREE)

1. Go to [Hugging Face](https://huggingface.co/)
2. Create a free account or sign in
3. Navigate to [Settings → Access Tokens](https://huggingface.co/settings/tokens)
4. Click **"New token"**
5. Name it: `moldovadirect-ai-images`
6. Role: **Read** (free tier)
7. Click **"Generate token"**
8. Copy the token (starts with `hf_...`)

**Note:** The free tier gives you a few hundred requests per hour - plenty for testing!

### Step 2: Add Token to Supabase

#### Option A: Via Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your MoldovaDirect project
3. Navigate to **Project Settings** → **Edge Functions**
4. Scroll to **"Secrets"** section
5. Click **"Add Secret"**
6. Name: `HUGGINGFACE_API_TOKEN`
7. Value: Paste your Hugging Face token
8. Click **"Save"**

#### Option B: Via Supabase CLI

```bash
# Set the secret
supabase secrets set HUGGINGFACE_API_TOKEN=hf_your_token_here
```

### Step 3: Run Database Migration

The migration creates:
- Storage bucket for product images
- Storage policies for secure access
- `ai_image_logs` table for tracking AI operations
- Cleanup functions for old logs

```bash
# Navigate to your project directory
cd /path/to/MoldovaDirect

# Run the migration
supabase db push

# Or if you prefer SQL directly:
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/20251123_ai_image_generation.sql
```

**Verify migration:**
```sql
-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'product-images';

-- Check if table exists
SELECT * FROM ai_image_logs LIMIT 1;
```

### Step 4: Deploy Edge Function

The Edge Function processes images using Hugging Face API.

```bash
# Make sure you're in the project root
cd /path/to/MoldovaDirect

# Login to Supabase (if not already)
supabase login

# Link your project (if not already)
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy ai-image-processor

# Verify deployment
supabase functions list
```

**Expected output:**
```
┌──────────────────────┬────────────┬─────────┐
│ NAME                 │ STATUS     │ REGION  │
├──────────────────────┼────────────┼─────────┤
│ ai-image-processor   │ ACTIVE     │ global  │
└──────────────────────┴────────────┴─────────┘
```

### Step 5: Test the Setup

#### Option 1: Via Admin UI (Easiest)

1. Go to your admin panel: `/admin/ai-images`
2. Paste a product image URL
3. Click **"Remove Background"**
4. Wait a few seconds
5. Download or copy the processed image

#### Option 2: Via API Call

```bash
# Test the Edge Function directly
curl -X POST \
  "https://your-project-ref.supabase.co/functions/v1/ai-image-processor" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/product.jpg",
    "operation": "background_removal",
    "options": {
      "saveToProduct": false
    }
  }'
```

**Expected response:**
```json
{
  "success": true,
  "url": "https://your-project.supabase.co/storage/v1/object/public/product-images/ai-processed/background_removal/1234567890-abc123.png",
  "operation": "background_removal",
  "provider": "huggingface",
  "model": "briaai/RMBG-1.4",
  "processingTime": 2345,
  "fileName": "ai-processed/background_removal/1234567890-abc123.png"
}
```

---

## 💡 Usage Guide

### From Admin Panel

1. **Navigate to AI Images:**
   - Go to `/admin/ai-images`

2. **Optional - Select Product:**
   - Choose a product from the dropdown to automatically add the generated image
   - Or leave it as "None" for standalone processing

3. **Enter Image URL:**
   - Paste the URL of the product image you want to process
   - Can be from any public source (Unsplash, direct URLs, etc.)

4. **Select Operation:**
   - Choose **"Remove Background"** (currently available)
   - Other operations coming soon

5. **Process:**
   - Click the button to process
   - Wait 2-5 seconds for processing
   - View the result

6. **Save or Download:**
   - Copy the URL to use elsewhere
   - Download the image
   - If product was selected, image is automatically added

### From Product Edit Form

The AI Image Generator component is integrated into the product edit form:

```vue
<template>
  <AdminUtilsAIImageGenerator
    :product-id="product.id"
    @image-generated="handleNewImage"
  />
</template>
```

---

## 🔧 Technical Details

### Architecture

```
User → Nuxt API (/api/admin/products/ai-process-image)
  ↓
Supabase Edge Function (ai-image-processor)
  ↓
Hugging Face Inference API (briaai/RMBG-1.4)
  ↓
Supabase Storage (product-images bucket)
  ↓
Database (ai_image_logs + products.images)
```

### Storage Structure

```
product-images/
├── ai-processed/
│   ├── background_removal/
│   │   ├── 1700000000000-abc123.png
│   │   └── 1700000001000-def456.png
│   ├── generation/
│   ├── enhancement/
│   └── upscale/
```

### Database Schema

**ai_image_logs table:**
```sql
- id: Serial primary key
- product_id: Reference to products table (optional)
- original_url: Source image URL
- generated_url: Processed image URL in Supabase Storage
- ai_provider: 'huggingface' | 'replicate' | 'openai' | 'stability'
- ai_model: Model name (e.g., 'briaai/RMBG-1.4')
- operation: 'background_removal' | 'generation' | 'enhancement' | 'upscale'
- processing_time_ms: Time taken in milliseconds
- status: 'pending' | 'processing' | 'completed' | 'failed'
- error_message: Error details if failed
- metadata: Additional operation details (JSONB)
- created_by: User who triggered the operation
- created_at: Timestamp
```

### API Endpoints

**POST /api/admin/products/ai-process-image**
```typescript
{
  productId?: number           // Optional product ID
  imageUrl: string            // Source image URL
  operation: string           // 'background_removal' | etc.
  options?: {
    saveToProduct?: boolean   // Auto-add to product
    prompt?: string          // For generation (future)
    model?: string           // Override default model
  }
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    url: string              // Generated image URL
    operation: string        // Operation performed
    provider: string         // AI provider used
    model: string           // Model used
    processingTime: number   // Time in ms
    fileName: string         // Storage path
  }
}
```

---

## 💰 Cost Analysis

### Hugging Face Free Tier

- **Cost:** $0 (completely free)
- **Rate Limit:** A few hundred requests/hour
- **Quota:** Free monthly credits (refreshes monthly)
- **Models Available:**
  - briaai/RMBG-1.4 (background removal)
  - Stable Diffusion (image generation)
  - Various enhancement models

### Upgrade Options

If you exceed free tier limits:

**Hugging Face PRO ($9/month):**
- Higher rate limits
- Priority processing
- More compute time
- Worth it if processing >1000 images/month

**Paid Alternatives (for later):**
- Claid.ai: $59 one-time for 1000 images
- Photoroom: $12.99/month
- Remove.bg: $0.20-0.09 per image
- Replicate: Pay-per-use ($0.001-0.01 per run)

---

## 🛠️ Troubleshooting

### Issue: "HUGGINGFACE_API_TOKEN environment variable is not set"

**Solution:**
1. Verify token is set in Supabase Dashboard
2. Redeploy Edge Function after adding token:
   ```bash
   supabase functions deploy ai-image-processor
   ```

### Issue: "Storage bucket not found"

**Solution:**
1. Check if migration ran successfully
2. Manually create bucket in Supabase Dashboard:
   - Storage → New bucket
   - Name: `product-images`
   - Public: Yes
   - File size limit: 5MB

### Issue: "Background removal fails with 503 error"

**Solution:**
- Hugging Face model might be loading (cold start)
- Wait 30 seconds and try again
- Model should stay warm after first use

### Issue: "Rate limit exceeded"

**Solution:**
- You've hit the free tier limit (few hundred requests/hour)
- Wait for the limit to reset (usually hourly)
- Or upgrade to Hugging Face PRO ($9/month)

### Issue: "Image too large"

**Solution:**
- Current limit: 5MB per image
- Compress image before uploading
- Or increase limit in migration file:
  ```sql
  file_size_limit = 10485760  -- 10MB
  ```

---

## 🚀 Next Steps

### Phase 2: Image Generation

Add support for generating new product images from text prompts:

```typescript
{
  operation: 'generation',
  options: {
    prompt: 'Professional wine bottle on wooden table, warm lighting, Romanian vineyard background',
    model: 'stable-diffusion-xl'
  }
}
```

### Phase 3: Wine-Specific Integration

Integrate BottleShots.ai for wine bottle specific images:

```typescript
{
  operation: 'wine_bottle_generation',
  options: {
    labelUrl: 'https://example.com/label.pdf',
    bottleType: 'bordeaux',
    background: 'elegant_cellar'
  }
}
```

### Phase 4: Batch Processing

Process multiple images at once:

```typescript
{
  operation: 'batch_background_removal',
  imageUrls: ['url1', 'url2', 'url3'],
  productIds: [1, 2, 3]
}
```

---

## 📚 Additional Resources

- [Hugging Face Inference API Docs](https://huggingface.co/docs/api-inference/index)
- [briaai/RMBG-1.4 Model Card](https://huggingface.co/briaai/RMBG-1.4)
- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)

---

## 🤝 Support

If you encounter issues:

1. Check Supabase Edge Function logs:
   ```bash
   supabase functions logs ai-image-processor
   ```

2. Check browser console for API errors

3. Verify Hugging Face token is valid:
   ```bash
   curl -H "Authorization: Bearer hf_your_token" \
     https://huggingface.co/api/whoami
   ```

4. Test Edge Function directly (see Step 5 above)

---

## ✅ Checklist

Before going live:

- [ ] Hugging Face token created and added to Supabase
- [ ] Database migration executed successfully
- [ ] Edge Function deployed
- [ ] Test image processed successfully
- [ ] Storage bucket publicly accessible
- [ ] Admin UI accessible at `/admin/ai-images`
- [ ] Monitoring set up for failed operations
- [ ] Cleanup function scheduled (optional)

---

**Status:** ✅ Ready for Production (Background Removal)

**Last Updated:** November 23, 2025

**Free Tier Active:** Yes (Hugging Face)

**Monthly Cost:** $0
