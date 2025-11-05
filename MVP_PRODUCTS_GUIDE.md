# MVP Product Seeding Guide

## Overview
This guide explains how to populate your Moldova Direct store with 100+ realistic products with proper images for MVP testing.

## What Was Fixed

### Issues Identified
1. ✅ **Landing page images** - Already working (uses Unsplash URLs)
2. ❌ **Products had no images** - Seed data didn't include image arrays
3. ❌ **Only 10 product templates** - Not enough variety for MVP

### Solutions Implemented
1. **Enhanced Seed Script** (`server/api/admin/seed-data.post.ts`)
   - Added 120 unique product templates across 5 categories
   - Each product includes proper image URLs from Unsplash
   - Realistic Moldovan product names and descriptions

2. **Admin Seeding Interface** (`pages/admin/seed-products.vue`)
   - Easy-to-use UI for seeding products
   - Multiple preset options (MVP: 120, Demo: 100, Development: 50, Minimal: 20)
   - Option to clear existing products or add to catalog
   - Real-time progress and success feedback

3. **Dashboard Integration** (`components/admin/Dashboard/Overview.vue`)
   - Added "Seed Products (MVP)" quick action
   - Easy access from admin dashboard

## Product Categories

### Wine & Spirits (30 varieties)
- Moldovan wines (Fetească Neagră, Rara Neagră, etc.)
- Brandies (Divin VSOP, Divin XO)
- Traditional spirits (Țuică, Vișinată)
- Gift sets

### Food & Delicacies (35 varieties)
- Honey (Acacia, Forest, Sunflower)
- Cheese (Brânză de Burduf, Caș)
- Preserves and jams
- Nuts and dried fruits
- Teas and beverages

### Handicrafts (20 varieties)
- Wooden items (boxes, spoons, chess sets)
- Traditional dolls and decorations
- Beaded jewelry
- Easter eggs

### Pottery & Ceramics (15 varieties)
- Vases and pots
- Dinner sets
- Decorative items
- Tea sets

### Textiles (20 varieties)
- Embroidered clothing
- Wool blankets and shawls
- Linen tablecloths
- Traditional vests and accessories

## How to Seed Products

### Option 1: Using Admin Dashboard
1. Log in as admin
2. Go to Admin Dashboard (`/admin`)
3. Click "Seed Products (MVP)" in the Execution Center
4. Select your preset (recommend "MVP" for 120 products)
5. Choose whether to clear existing products
6. Click "Create Products"
7. Wait for completion (takes ~1 minute)

### Option 2: Direct Page Access
1. Navigate to `/admin/seed-products`
2. Follow steps 4-7 from Option 1

### Option 3: API Call
```bash
curl -X POST https://your-domain.com/api/admin/seed-data \
  -H "Content-Type: application/json" \
  -d '{
    "preset": "demo",
    "products": 120,
    "categories": true,
    "clearExisting": false
  }'
```

## Product Features

Each product includes:
- ✅ **Images**: High-quality Unsplash images
- ✅ **Multilingual names**: EN, ES, RO, RU translations
- ✅ **Descriptions**: Realistic product descriptions
- ✅ **Pricing**: Varied prices appropriate to category
- ✅ **Stock levels**: Random stock quantities (10-110 units)
- ✅ **Sale items**: 20% of products have compare prices
- ✅ **Featured products**: 10% marked as featured
- ✅ **Attributes**: Origin, volume, alcohol content (for wines)

## Verification

After seeding, verify the products appear correctly:

1. **Landing Page** (`/`)
   - Check Featured Products section
   - Verify images load properly
   - Confirm product cards display correctly

2. **Products Page** (`/products`)
   - Browse all products
   - Test filtering by category
   - Verify images appear in product cards
   - Check product details page

3. **Admin Products** (`/admin/products`)
   - View all products in admin
   - Verify images and data are correct

## Troubleshooting

### Images Not Showing
- Check browser console for CORS errors
- Verify Unsplash URLs are accessible
- Ensure `images` array is properly formatted

### Products Not Appearing
- Verify `is_active` is `true`
- Check category assignments
- Ensure stock quantities > 0 for "In Stock" filter

### Slow Loading
- This is normal for 100+ products
- Consider using pagination
- Enable image lazy loading (already implemented)

## Next Steps

After seeding products:
1. Test the user flow from landing to purchase
2. Verify cart functionality with product images
3. Test checkout process
4. Review product detail pages
5. Check mobile responsiveness

## Technical Details

### Image Schema
```typescript
{
  url: string,           // Unsplash image URL
  alt_text: string,      // Product name for accessibility
  is_primary: boolean    // First image is primary
}
```

### Product Template Structure
Each template includes:
- `name`: Product name
- `category`: Category slug
- `priceMin/priceMax`: Price range
- `description`: Product description
- `image`: Unsplash image URL

## Support

For issues or questions:
1. Check this guide first
2. Review server logs for errors
3. Verify admin permissions
4. Check database connection

---

**Ready for MVP!** Your Moldova Direct store now has realistic products with proper images.
