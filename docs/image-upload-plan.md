# Image Upload Implementation Plan

## Current State (2026-01-28)

### What Works ✅
1. **Frontend Product Form** - `components/admin/Products/Form.vue`
   - Has image upload UI (Section 5)
   - Uses `AdminUtilsImageUpload` component
   - Supports up to 5 images, 5MB max per file
   - Drag & drop, multiple file upload
   - Alt text editing, primary image selection

2. **Image Upload Component** - `components/admin/Utils/ImageUpload.vue`
   - Beautiful UI with progress bars
   - Previews images before upload
   - Set primary image
   - Edit alt text
   - **BUT**: Uploads to `/api/upload` which doesn't exist

3. **Product Creation API** - `server/api/admin/products/index.post.ts`
   - Expects `images` array with URLs
   - Stores images in Supabase database
   - Validates image data format
   - Has audit trail for changes

### What's Broken ❌

| Component | Status | Issue |
|-----------|--------|--------|
| `AdminUtilsImageUpload` | Partially working | Uploads to non-existent `/api/upload` endpoint |
| Product Form | Partially working | Can select images but they never upload |
| Product API | Works but useless | Expects image URLs, but no way to get URLs |

## Root Cause

**No `/api/upload` endpoint exists** in the codebase.

The `ImageUpload.vue` component calls:
```typescript
const response = await $fetch<{ success: boolean, data: { url: string } }>('/api/upload', {
  method: 'POST',
  body: formData,
})
```

But there's NO `server/api/upload.ts` file to handle this request.

## Implementation Plan

### Phase 1: Create Image Storage Backend (Priority: High)

**Option A: Supabase Storage** ✅ **CHOSEN**
- Pros: Already configured for avatars, easy integration, no extra service
- Bucket name: `product-images` (new bucket needed)
- Pattern: Follows `useProfilePicture.ts` composable pattern
- Effort: 2-3 hours

**Option B: Local Storage with Vercel Blob**
- Pros: Simple, no extra service
- Cons: Not permanent, no CDN
- Effort: 1-2 hours

**Option C: Cloudinary / ImageKit**
- Pros: Optimized images, CDN, transformations
- Cons: External service, API key management
- Effort: 2-4 hours

### Phase 2: Create `/api/upload` Endpoint (Priority: Critical)

**File to create:** `server/api/upload.post.ts`

**Requirements:**
1. Accept multipart/form-data with `file` field
2. Validate file type (images only)
3. Validate file size (max 5MB)
4. Upload to Supabase Storage bucket `product-images`
5. Get public URL from Supabase
6. Return response: `{ success: true, data: { url: string } }`
7. Add authentication check (admin only)
8. Add audit logging

**Supabase Storage Pattern (from `useProfilePicture.ts`):**
```typescript
// Upload to Supabase Storage
const fileExt = file.name.split('.').pop() || 'jpg'
const fileName = `products/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`

const { error: uploadError } = await supabase.storage
  .from('product-images')
  .upload(fileName, file, { upsert: true })

if (uploadError) throw uploadError

// Get public URL
const { data } = supabase.storage
  .from('product-images')
  .getPublicUrl(fileName)

const publicUrl = data.publicUrl
```

**Draft endpoint signature:**
```typescript
// server/api/upload.post.ts
export default defineEventHandler(async (event) => {
  // 1. Require admin authentication
  const adminId = await requireAdminRole(event)

  // 2. Parse multipart form data
  const formData = await readFormData(event)
  const file = formData.get('file') as File
  const type = formData.get('type') as string // 'product' for products

  // 3. Validate file
  if (!file || !file.type.startsWith('image/')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid file type. Images only.' })
  }
  if (file.size > 5 * 1024 * 1024) {
    throw createError({ statusCode: 400, statusMessage: 'File too large. Max 5MB.' })
  }

  // 4. Validate allowed MIME types
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    throw createError({ statusCode: 400, statusMessage: 'Unsupported image format' })
  }

  // 5. Upload to Supabase Storage
  const supabase = await serverSupabaseClient(event)
  const fileExt = file.name.split('.').pop() || 'jpg'
  const fileName = `products/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, {
      upsert: false,
      cacheControl: '31536000', // Cache for 1 year
    })

  if (uploadError) {
    console.error('Upload error:', uploadError)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to upload image to storage',
    })
  }

  // 6. Get public URL
  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName)

  const publicUrl = data.publicUrl

  // 7. Log upload for audit
  await supabase.from('audit_logs').insert({
    action: 'image_upload',
    resource_type: 'product_image',
    resource_id: null,
    old_values: null,
    new_values: { fileName, fileSize: file.size, mimeType: file.type, publicUrl },
    user_id: adminId,
    ip_address: getRequestIP(event),
    user_agent: getHeader(event, 'user-agent'),
  })

  // 8. Return success
  return {
    success: true,
    data: {
      url: publicUrl,
      fileName,
    }
  }
})
```

### Phase 3: Update Form Integration (Priority: Medium)

**Files to update:**
- `components/admin/Products/Form.vue` - Better error handling
- `pages/admin/products/[productId].vue` - Update product with images

**Requirements:**
1. Handle upload errors gracefully
2. Show progress feedback
3. Allow reordering images
4. Support image deletion (if previously uploaded)

### Phase 4: Image Processing & Optimization (Priority: Low)

**Nice-to-have features:**
- Auto-generate thumbnails
- WebP conversion for better performance
- Lazy loading support
- Image compression
- Watermark option

## Database Schema Check

**Products table should have:**
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  -- ... other fields ...
  images JSONB DEFAULT '[]',  -- Array of image objects
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Image object format:**
```typescript
interface ProductImage {
  url: string        // Public URL of image
  altText?: string  // Alt text for accessibility
  isPrimary?: boolean  // Is this the main product image?
}
```

## Testing Checklist

- [ ] Upload single image
- [ ] Upload multiple images
- [ ] Drag and drop works
- [ ] File validation (size, type)
- [ ] Progress bar shows correctly
- [ ] Set primary image
- [ ] Edit alt text
- [ ] Delete image
- [ ] Product with images saves to database
- [ ] Product without images saves
- [ ] Update product with new images
- [ ] Update product with removed images
- [ ] Mobile responsive (upload, preview, actions)
- [ ] Error handling (network, server, validation)
- [ ] Image URL works in production
- [ ] Cached properly for performance

## Additional Files Needed

**Constants file** (`composables/product/image-constants.ts`):
```typescript
export const PRODUCT_IMAGE_VALIDATION = {
  /** Maximum file size for image upload (5MB) */
  MAX_SIZE: 5 * 1024 * 1024,

  /** Accepted MIME types for image upload */
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],

  /** Maximum number of images per product */
  MAX_IMAGES: 5,

  /** Supabase storage bucket name for product images */
  STORAGE_BUCKET: 'product-images',

  /** Cache duration for images (1 year) */
  CACHE_DURATION: 31536000,
} as const
```

**Delete image endpoint** (`server/api/upload/[fileName].delete.ts`):
- Remove image from Supabase Storage
- Verify admin permissions
- Log deletion to audit trail

## Security Considerations

1. **Authentication** - Only admins can upload
2. **File validation** - MIME type check, not just extension
3. **Size limits** - Prevent DOS attacks
4. **Sanitization** - Remove EXIF data (location info)
5. **Rate limiting** - Prevent bulk abuse
6. **Audit trail** - Log all uploads

## Next Steps

**For Rudic (AI Assistant):**
1. ✅ Review complete
2. ⏭ Implement `/api/upload` endpoint (Phase 2)
3. ⏭ Test image upload flow
4. ⏭ Handle product creation with images

**For Vlad (Human):**
1. Decide on storage backend (Supabase vs Vercel vs Cloudinary)
2. Configure storage service credentials
3. Review implementation before merging
4. Test on staging environment

---

*Created: 2026-01-28*
*Status: Planning Phase Complete*
