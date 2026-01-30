# Product Image Management - Complete User Journey & Edge Cases

**Document Version:** 1.0
**Created:** 2026-01-28
**Status:** Review Complete

---

## 1. Full User Flow Overview

### 1.1 Create New Product (Admin)

**Step-by-Step Journey:**

1. **Navigation**
   - Admin clicks "New Product" button from `/admin/products`
   - Navigates to `/admin/products/new`

2. **Product Details Entry**
   - Fills in Basic Information (name, SKU, category) - Section 1
   - Fills in Description (multi-language) - Section 2
   - Fills in Pricing (price, compare price) - Section 3
   - Fills in Inventory (stock quantity, low stock threshold) - Section 4

3. **Image Upload** (Section 5) 🖼
   - Admin scrolls to "Product Images" section
   - Chooses one of these methods:
     - **Option A:** Click "Upload images" button → File picker opens
     - **Option B:** Drag & drop images onto drop zone
   - Selects multiple image files (up to 5)
   - Images appear in preview grid immediately
   - For each image, admin can:
     - View preview (thumbnail to full-size)
     - Set as **primary** image (badged "Primary")
     - Edit **alt text** for accessibility
     - **Remove** image (clicking X button)

4. **Product Attributes** (Section 6)
   - Fills in origin, volume, alcohol content
   - Toggles "Featured" checkbox

5. **Status & Visibility** (Section 7)
   - Toggles "Product is active and visible to customers"
   - Sees live preview of product

6. **Form Submission**
   - Clicks "Create Product" button (desktop) or "Create" (mobile sticky bar)
   - Images are currently **NOT uploaded** (this is the bug! 🔴)
   - Form submits with empty image array
   - Product is created in database WITHOUT images
   - Success message displays: "Product created successfully!"

7. **Result**
   - Product appears in `/admin/products` table
   - Product displays in shop at `/products/[slug]`
   - **PROBLEM:** Product has no images → shows placeholder image

---

### 1.2 Update Existing Product (Admin)

**Step-by-Step Journey:**

1. **Navigation**
   - Admin clicks "Edit" button on product in `/admin/products`
   - Navigates to `/admin/products/[productId]`

2. **Load Existing Data**
   - Page fetches product from `/api/admin/products/[productId]`
   - Form populates with existing product data
   - **BUT:** Existing images are NOT loaded (no upload happened!)

3. **Image Management** (Section 5)
   - Admin sees empty image upload section
   - Can upload NEW images
   - Can't see/remove existing images
   - **Problem:** Can't manage existing images at all

4. **Form Submission**
   - Clicks "Update Product" button
   - Images array submitted (all NEW images)
   - Product updated in database
   - Old images (if any) are NOT deleted from storage
   - New images are stored (but NOT uploaded yet!)

5. **Result**
   - Product shows new images (if upload worked)
   - Old orphaned images remain in Supabase Storage (waste!)

---

### 1.3 Product Display (Shop)

**Files:**
- `/pages/products/[slug].vue` - Product detail page
- `/components/product/detail/gallery.vue` - Image gallery component
- `/components/product/detail/Gallery.vue` - Thumbnail navigation

**User Experience:**

1. **Load Product**
   - User navigates to `/products/red-wine-2024`
   - Page loads product data from API
   - Images array passed to gallery

2. **Main Image Display**
   - **Primary image** (first or marked as `isPrimary: true`) displays large
   - Shows featured badge (if product is featured)
   - Shows sale badge (if compare price > price)
   - Clicking image opens zoom modal

3. **Thumbnail Navigation**
   - Below main image, horizontal scroll of all images
   - User clicks thumbnail → Main image updates
   - Active thumbnail has blue border

4. **Image Zoom Modal**
   - Click main image → Full-screen modal opens
   - Previous/Next buttons navigate through all images
   - Close button returns to product

**Edge Cases - Product Display:**
- ✅ **Product with no images** → Shows placeholder image from `/images/product-placeholder.png`
- ✅ **Single image** → Shows image, no thumbnails
- ✅ **Multiple images** → Shows main image + thumbnails
- ❌ **Primary image not set** → First image shown (fallback logic?)
- ❌ **Image URL broken** → Alt text shows, placeholder fallback?

---

## 2. Edge Cases - Detailed Analysis

### 2.1 Image Upload Edge Cases

| # | Scenario | Current Behavior | Expected Behavior |
|---|-----------|------------------|------------------|
| 1 | **Single image upload** | UI works, no backend | Upload succeeds, product has 1 image |
| 2 | **Multiple image upload (2-5)** | UI works, no backend | All images upload, product has all |
| 3 | **Drag & drop** | UI works, no backend | Files processed, upload starts |
| 4 | **File too large (>5MB)** | Validation in UI | Error shown: "File size must be less than 5MB" |
| 5 | **Invalid file type (PDF, doc)** | Validation in UI | Error shown: "File must be an image" |
| 6 | **More than 5 images** | UI shows error | Error: "Maximum 5 images allowed" |
| 7 | **Duplicate files** | All accepted | Deduplication? or all accepted? |
| 8 | **Network disconnects during upload** | ❌ No retry logic | Upload pauses, retry on reconnect |
| 9 | **Server timeout** | ❌ No timeout handling | Show "Upload taking longer than expected..." |
| 10 | **Upload 3/5 succeeds, 2 fail** | ❌ No partial success handling | Save 3, show error for 2 |
| 11 | **User closes tab during upload** | ❌ No cleanup | Cancel uploads, warn about unsaved changes |
| 12 | **Set primary before upload completes** | ❌ No state persistence | Remember primary selection after upload |
| 13 | **Edit alt text before upload completes** | ❌ No state persistence | Remember alt text after upload |

---

### 2.2 Product Management Edge Cases

| # | Scenario | Current Behavior | Expected Behavior |
|---|-----------|------------------|------------------|
| 1 | **Update product, keep existing images** | ❌ Can't see existing images | Show current images, allow adding/removing |
| 2 | **Update product, add 1 new image** | ❌ Existing images invisible | Add to existing array, all visible |
| 3 | **Update product, remove 1 image** | ❌ Can't remove existing | Delete image from DB + storage |
| 4 | **Update product, replace all images** | ❌ Can't manage | Delete old images from storage, add new |
| 5 | **Delete product** | ❌ No image cleanup | Delete all images from Supabase Storage |
| 6 | **Product with no images** | ✅ Shows placeholder | Placeholder displays correctly |
| 7 | **Primary image deleted** | ❌ No auto-reassign | Next image becomes primary |
| 8 | **Update product, image order changes** | ❌ No reordering support | Respect new order in display |

---

### 2.3 Storage & Data Edge Cases

| # | Scenario | Current Behavior | Expected Behavior |
|---|-----------|------------------|------------------|
| 1 | **Orphaned images** (deleted from product) | ❌ Images remain forever | Cleanup job: Delete images not referenced |
| 2 | **Same image used by 2 products** | ❌ Duplicate storage | Reference counting: Don't delete if still in use |
| 3 | **Storage bucket full** | ❌ No handling | Error: "Storage quota exceeded" |
| 4 | **Image URL expires** (signed URLs) | ❓ Unknown | Use public URLs (no expiration) |
| 5 | **Image optimization needed** | ❌ No compression | Auto-generate WebP, thumbnails |
| 6 | **CDN caching issues** | ❓ Unknown | Cache busting on image update |

---

### 2.4 Admin UX Edge Cases

| # | Scenario | Current Behavior | Expected Behavior |
|---|-----------|------------------|------------------|
| 1 | **Mobile upload** | ✅ UI responsive | Touch-friendly, sticky action bar |
| 2 | **Slow connection** | ❌ No progress indication | Real-time progress bar per image |
| 3 | **Multiple admins uploading simultaneously** | ❓ Unknown | Race condition handling |
| 4 | **Browser tab switch during upload** | ❌ Background not supported | Continue upload in background |
| 5 | **Undo/Redo** | ❓ Unknown | Save state for undo/redo |

---

## 3. Technical Implementation Gaps

### 3.1 Backend Missing Components

| Component | Status | Priority | Effort |
|-----------|--------|----------|---------|
| `/api/upload` endpoint | ❌ Missing | Critical | 2-3 hours |
| `product-images` Supabase bucket | ❓ Not verified | Critical | 0.5 hours |
| Image deletion from storage | ❌ Missing | High | 1-2 hours |
| Orphaned image cleanup | ❌ Missing | Medium | 2-4 hours |
| Thumbnail generation | ❌ Missing | Low | 4-8 hours |
| WebP conversion | ❌ Missing | Low | 4-6 hours |

---

### 3.2 Frontend Missing Components

| Component | Status | Priority | Effort |
|-----------|--------|----------|---------|
| Display existing images (edit mode) | ❌ Missing | Critical | 1-2 hours |
| Reorder images (drag & drop) | ❌ Missing | Medium | 2-3 hours |
| Upload retry logic | ❌ Missing | High | 1-2 hours |
| Upload cancellation | ❌ Missing | High | 1 hour |
| Image preview zoom | ✅ Exists | - | - |
| Alt text editor | ✅ Exists | - | - |

---

## 4. User Journey Scenarios - Before & After

### Scenario 1: Admin Creates Product with Images

**BEFORE (Current - Broken):**
1. Admin uploads 3 images
2. Images preview in UI
3. Admin clicks "Create Product"
4. ❌ Images NOT uploaded to storage
5. ❌ Product saved with empty image array
6. ❌ Product shows placeholder in shop
7. ❌ Admin must re-upload images manually via Supabase

**AFTER (Fixed):**
1. Admin uploads 3 images
2. Images preview in UI
3. Progress bars show upload progress
4. Each image uploads to Supabase Storage (`/api/upload`)
5. Image URLs returned from server
6. Admin clicks "Create Product"
7. ✅ Product saved with image URLs
8. ✅ Product displays with images in shop

---

### Scenario 2: Admin Updates Product - Adds 1 Image

**BEFORE (Current - Broken):**
1. Admin edits product
2. Uploads 1 new image
3. ❌ Can't see existing images
4. Updates product
5. ❌ Only new image shows (if uploaded)
6. ❌ Unknown if old images preserved

**AFTER (Fixed):**
1. Admin edits product
2. ✅ Sees all existing images
3. Uploads 1 new image
4. ✅ Reorders images if needed
5. ✅ Sets new image as primary
6. Updates product
7. ✅ All images saved (old + new)

---

### Scenario 3: Admin Updates Product - Removes Image

**BEFORE (Current - Broken):**
1. Admin edits product
2. ❌ Can't see existing images to remove
3. ❌ Can't remove images

**AFTER (Fixed):**
1. Admin edits product
2. ✅ Sees all existing images
3. ✅ Clicks "Remove" on image 2
4. ✅ Image removed from UI
5. ✅ Image deleted from Supabase Storage
6. ✅ Product updated with remaining images
7. ✅ Auto-reassigns primary if needed

---

### Scenario 4: Network Failure During Upload

**BEFORE (Current - Broken):**
1. Admin uploads image
2. Network drops
3. ❌ Progress bar stuck at 45%
4. ❌ No error shown
5. ❌ No retry option
6. ❌ User closes tab, tries again

**AFTER (Fixed):**
1. Admin uploads image
2. Network drops at 45%
3. ✅ Error shown: "Upload failed. Check your connection."
4. ✅ Image marked as failed (red border)
5. ✅ "Retry" button appears
6. ✅ Admin clicks "Retry" → Upload resumes from 45%

---

### Scenario 5: Admin Deletes Product

**BEFORE (Current - Broken):**
1. Admin deletes product
2. ❌ Product deleted from database
3. ❌ Images remain in Supabase Storage (orphaned)
4. ❌ Storage fills up with unused files
5. ❌ Wasted storage costs

**AFTER (Fixed):**
1. Admin deletes product
2. ✅ Product deleted from database
3. ✅ Trigger cleanup job
4. ✅ All product images deleted from Supabase Storage
5. ✅ Storage usage optimized

---

## 5. Implementation Priority Matrix

| Feature | User Impact | Tech Complexity | Effort | Priority |
|----------|--------------|-----------------|---------|----------|
| **Create `/api/upload` endpoint** | Critical (unblocks images) | Medium | 2-3 hrs | **P0** |
| **Display existing images on edit** | Critical (can't manage) | Low | 1-2 hrs | **P0** |
| **Image deletion from storage** | Critical (orphaned files) | Medium | 1-2 hrs | **P1** |
| **Upload retry logic** | High (UX improvement) | Medium | 1-2 hrs | **P1** |
| **Orphaned image cleanup** | Medium (cost optimization) | High | 2-4 hrs | **P2** |
| **Image reordering** | Medium (UX improvement) | Medium | 2-3 hrs | **P2** |
| **Thumbnail generation** | Low (performance) | High | 4-8 hrs | **P3** |
| **WebP conversion** | Low (performance) | High | 4-6 hrs | **P3** |

---

## 6. Next Steps

### Phase 1: Unblocking (P0) - 3-5 hours
1. ✅ Create Supabase `product-images` bucket
2. ✅ Create `/api/upload` endpoint
3. ✅ Test single & multiple image upload
4. ✅ Update product creation to use uploaded images

### Phase 2: Editing & Management (P0-P1) - 3-5 hours
1. ✅ Load and display existing images on product edit
2. ✅ Add image deletion from Supabase Storage
3. ✅ Update product to preserve/merge existing images
4. ✅ Test product update flow

### Phase 3: UX Improvements (P1-P2) - 4-6 hours
1. ✅ Add upload retry logic
2. ✅ Add upload cancellation
3. ✅ Improve error messages
4. ✅ Add image reordering (drag & drop)

### Phase 4: Optimization (P2-P3) - 8-14 hours
1. ✅ Implement orphaned image cleanup
2. ✅ Generate thumbnails on upload
3. ✅ Convert to WebP
4. ✅ Add CDN caching headers

---

## 7. Questions for Review

**For Vlad (Product Owner):**

1. **Primary Image Logic:** Should first image always be primary? Or explicit selection?
2. **Orphaned Cleanup:** Should we implement a scheduled cleanup job?
3. **Image Limits:** Is 5 images per product sufficient? Or should be configurable?
4. **Image Sizes:** Do we need fixed dimensions? Or allow any size?
5. **Compression:** Should we compress images automatically? To what quality?
6. **Watermarks:** Should we add watermarks automatically?
7. **CDN:** Should we use Supabase CDN? Or external CDN service?

**For Rudic (AI Assistant):**

1. Should I implement the `/api/upload` endpoint next?
2. Should I create a test plan for all edge cases?
3. Should I start with Phase 1 (unblocking) or focus on UX first?

---

*Document Complete*
*Total Estimated Effort: 18-30 hours*
*Critical Path: Phase 1 (5 hours) → Phase 2 (5 hours) = 10 hours minimum*
