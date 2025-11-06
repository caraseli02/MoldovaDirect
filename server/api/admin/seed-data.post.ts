/**
 * Comprehensive Test Data Generator
 * POST /api/admin/seed-data
 *
 * Generates complete test datasets with presets for different scenarios
 *
 * Presets:
 * - "empty": Clean database (no data)
 * - "minimal": Basic setup (5 users, 10 products, 5 orders)
 * - "development": Development testing (20 users, 50 products, 100 orders)
 * - "demo": Demo/presentation (50 users, 100 products, 300 orders, realistic data)
 * - "stress": Stress testing (200 users, 500 products, 2000 orders)
 * - "low-stock": Low stock scenario (products with low inventory)
 * - "holiday-rush": Holiday season simulation (high order volume)
 * - "new-store": New store launch (few orders, many products)
 */

import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdminTestingAccess, logAdminAction } from '~/server/utils/adminAuth'
import type { SeedOptions, SeedDataResponse, SeedStep } from '~/types/admin-testing'
import {
  generateMockUser,
  generatePassword,
  categoryData,
  productTemplates,
  randomItem,
  orderStatuses,
  paymentStatuses,
  streets,
  cities
} from '~/server/data/mockData'

export default defineEventHandler(async (event) => {
  // Verify admin access and non-production environment
  const adminId = await requireAdminTestingAccess(event)

  const supabase = serverSupabaseServiceRole(event)
  const body = await readBody(event).catch(() => ({})) as SeedOptions

  // Get preset configuration
  const preset = body.preset || 'minimal'
  let config = getPresetConfig(preset)

  // Allow override with specific values
  if (body.users !== undefined) config.users = body.users
  if (body.products !== undefined) config.products = body.products
  if (body.orders !== undefined) config.orders = body.orders
  if (body.categories !== undefined) config.categories = body.categories
  if (body.clearExisting !== undefined) config.clearExisting = body.clearExisting

  const results = {
    preset,
    startTime: new Date().toISOString(),
    steps: [] as Array<{ step: string; duration: number; count: number }>,
    errors: [] as Array<{ step: string; error: string }>
  }

  try {
    // Step 1: Clear existing data if requested
    if (config.clearExisting) {
      const stepStart = Date.now()
      await clearTestData(supabase)
      results.steps.push({
        step: 'Clear existing data',
        duration: Date.now() - stepStart,
        count: 0
      })
    }

    // Step 2: Create categories if requested
    if (config.categories) {
      const stepStart = Date.now()
      const count = await seedCategories(supabase)
      results.steps.push({
        step: 'Create categories',
        duration: Date.now() - stepStart,
        count
      })
    }

    // Step 3: Create products
    if (config.products > 0) {
      const stepStart = Date.now()
      const count = await seedProducts(supabase, config.products, config.lowStock)
      results.steps.push({
        step: 'Create products',
        duration: Date.now() - stepStart,
        count
      })
    }

    // Step 4: Create users
    if (config.users > 0) {
      const stepStart = Date.now()
      const userIds = await seedUsers(supabase, config.users)
      results.steps.push({
        step: 'Create users',
        duration: Date.now() - stepStart,
        count: userIds.length
      })

      // Step 5: Create orders
      if (config.orders > 0 && userIds.length > 0) {
        const stepStart = Date.now()
        const count = await seedOrders(supabase, config.orders, userIds, config.orderPattern)
        results.steps.push({
          step: 'Create orders',
          duration: Date.now() - stepStart,
          count
        })
      }
    }

    // Log admin action
    await logAdminAction(event, adminId, 'seed-data', {
      preset,
      config,
      results: results.steps.map(s => ({ step: s.step, count: s.count }))
    })

    return {
      success: true,
      message: `Successfully seeded ${preset} dataset`,
      results,
      endTime: new Date().toISOString(),
      totalDuration: results.steps.reduce((sum, step) => sum + step.duration, 0)
    }

  } catch (error: any) {
    console.error('Seed data error:', error)
    await logAdminAction(event, adminId, 'seed-data-failed', { preset, error: error.message })
    return {
      success: false,
      message: 'Failed to seed data',
      error: error.message,
      results
    }
  }
})

// Preset configurations
function getPresetConfig(preset: string) {
  const configs = {
    empty: {
      users: 0,
      products: 0,
      orders: 0,
      categories: false,
      clearExisting: true,
      lowStock: false,
      orderPattern: 'normal'
    },
    minimal: {
      users: 5,
      products: 10,
      orders: 5,
      categories: true,
      clearExisting: false,
      lowStock: false,
      orderPattern: 'normal'
    },
    development: {
      users: 20,
      products: 50,
      orders: 100,
      categories: true,
      clearExisting: false,
      lowStock: false,
      orderPattern: 'normal'
    },
    demo: {
      users: 50,
      products: 100,
      orders: 300,
      categories: true,
      clearExisting: false,
      lowStock: false,
      orderPattern: 'realistic'
    },
    stress: {
      users: 200,
      products: 500,
      orders: 2000,
      categories: true,
      clearExisting: false,
      lowStock: false,
      orderPattern: 'random'
    },
    'low-stock': {
      users: 15,
      products: 30,
      orders: 50,
      categories: true,
      clearExisting: false,
      lowStock: true,
      orderPattern: 'normal'
    },
    'holiday-rush': {
      users: 100,
      products: 75,
      orders: 500,
      categories: true,
      clearExisting: false,
      lowStock: false,
      orderPattern: 'rush'
    },
    'new-store': {
      users: 10,
      products: 100,
      orders: 5,
      categories: true,
      clearExisting: false,
      lowStock: false,
      orderPattern: 'sparse'
    }
  }

  return configs[preset as keyof typeof configs] || configs.minimal
}

// Clear test data (keeps structure)
async function clearTestData(supabase: any) {
  // Delete in order to respect foreign key constraints
  await supabase.from('order_items').delete().neq('id', 0)
  await supabase.from('orders').delete().neq('id', 0)
  await supabase.from('cart_items').delete().neq('id', 0)
  await supabase.from('carts').delete().neq('id', 0)
  await supabase.from('addresses').delete().neq('id', 0)
  await supabase.from('inventory_logs').delete().neq('id', 0)
  await supabase.from('products').delete().neq('id', 0)
  await supabase.from('categories').delete().neq('id', 0)

  // Delete user profiles (Supabase auth users will remain)
  await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000')
}

// Seed categories
async function seedCategories(supabase: any): Promise<number> {
  const { data, error } = await supabase
    .from('categories')
    .upsert(categoryData, { onConflict: 'slug' })
    .select()

  if (error) {
    console.error('Failed to seed categories:', error)
    return 0
  }

  return data?.length || 0
}

// Seed products
async function seedProducts(supabase: any, count: number, lowStock: boolean): Promise<number> {
  const productTemplates = [
    // Wine & Spirits (30 varieties)
    { name: 'Fetească Neagră', category: 'wine-spirits', priceMin: 18, priceMax: 45, description: 'Premium red wine from indigenous Moldovan grapes', image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800' },
    { name: 'Rara Neagră Reserve', category: 'wine-spirits', priceMin: 22, priceMax: 55, description: 'Aged red wine with complex flavor profile', image: 'https://images.unsplash.com/photo-1586370434639-0fe43b2d32d6?w=800' },
    { name: 'Traminer Rosé', category: 'wine-spirits', priceMin: 16, priceMax: 35, description: 'Aromatic rosé wine with floral notes', image: 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800' },
    { name: 'Sauvignon Blanc', category: 'wine-spirits', priceMin: 15, priceMax: 38, description: 'Crisp white wine with citrus notes', image: 'https://images.unsplash.com/photo-1566933293069-b55c7f326dd4?w=800' },
    { name: 'Cabernet Sauvignon', category: 'wine-spirits', priceMin: 20, priceMax: 50, description: 'Full-bodied red wine aged in oak barrels', image: 'https://images.unsplash.com/photo-1474722883778-792f7c5e9ec4?w=800' },
    { name: 'Merlot Classic', category: 'wine-spirits', priceMin: 17, priceMax: 42, description: 'Smooth red wine with berry flavors', image: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=800' },
    { name: 'Chardonnay Barrel', category: 'wine-spirits', priceMin: 19, priceMax: 44, description: 'Oak-aged white wine with buttery notes', image: 'https://images.unsplash.com/photo-1585553616435-2dc0a54e271d?w=800' },
    { name: 'Pinot Noir Reserve', category: 'wine-spirits', priceMin: 24, priceMax: 58, description: 'Elegant red wine with silky tannins', image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800' },
    { name: 'Divin VSOP', category: 'wine-spirits', priceMin: 35, priceMax: 75, description: 'Aged Moldovan brandy, 8 years old', image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800' },
    { name: 'Divin XO Premium', category: 'wine-spirits', priceMin: 55, priceMax: 120, description: 'Premium brandy aged 15+ years', image: 'https://images.unsplash.com/photo-1527281400-e15ad8da1e42?w=800' },
    { name: 'Țuică de Prune', category: 'wine-spirits', priceMin: 25, priceMax: 50, description: 'Traditional plum brandy', image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800' },
    { name: 'Vișinată Liqueur', category: 'wine-spirits', priceMin: 18, priceMax: 35, description: 'Sweet cherry liqueur', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800' },
    { name: 'Ice Wine Dessert', category: 'wine-spirits', priceMin: 32, priceMax: 68, description: 'Sweet dessert wine from frozen grapes', image: 'https://images.unsplash.com/photo-1586370434639-0fe43b2d32d6?w=800' },
    { name: 'Sparkling Brut Nature', category: 'wine-spirits', priceMin: 22, priceMax: 48, description: 'Dry sparkling wine, traditional method', image: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=800' },
    { name: 'Sparkling Rosé', category: 'wine-spirits', priceMin: 20, priceMax: 45, description: 'Elegant pink sparkling wine', image: 'https://images.unsplash.com/photo-1529256872347-a804c80b6b87?w=800' },
    { name: 'Muscat Ottonel', category: 'wine-spirits', priceMin: 14, priceMax: 32, description: 'Aromatic sweet white wine', image: 'https://images.unsplash.com/photo-1584580670812-a5c7e1e2b01e?w=800' },
    { name: 'Aligoté Dry White', category: 'wine-spirits', priceMin: 13, priceMax: 28, description: 'Light and refreshing white wine', image: 'https://images.unsplash.com/photo-1574922690914-7711e5ea7d93?w=800' },
    { name: 'Riesling Classic', category: 'wine-spirits', priceMin: 16, priceMax: 36, description: 'Crisp white wine with mineral notes', image: 'https://images.unsplash.com/photo-1567856405875-f3bc0253e1b8?w=800' },
    { name: 'Syrah Reserve', category: 'wine-spirits', priceMin: 21, priceMax: 52, description: 'Bold red wine with spicy notes', image: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=800' },
    { name: 'Fetească Albă', category: 'wine-spirits', priceMin: 15, priceMax: 33, description: 'Indigenous white grape variety', image: 'https://images.unsplash.com/photo-1597096594816-44f0be1d3862?w=800' },
    { name: 'Orange Wine Natural', category: 'wine-spirits', priceMin: 23, priceMax: 48, description: 'Skin-contact white wine', image: 'https://images.unsplash.com/photo-1558346547-4439467fc4b6?w=800' },
    { name: 'Vintage Port Style', category: 'wine-spirits', priceMin: 38, priceMax: 85, description: 'Fortified dessert wine', image: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=800' },
    { name: 'Grappa Artisan', category: 'wine-spirits', priceMin: 28, priceMax: 55, description: 'Grape pomace brandy', image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800' },
    { name: 'Rosé Sec Classic', category: 'wine-spirits', priceMin: 14, priceMax: 30, description: 'Dry rosé wine for summer', image: 'https://images.unsplash.com/photo-1587402092301-725e37c70fd8?w=800' },
    { name: 'Bio Organic Red', category: 'wine-spirits', priceMin: 19, priceMax: 42, description: 'Certified organic red wine', image: 'https://images.unsplash.com/photo-1565184849045-a1c452c51c5f?w=800' },
    { name: 'Bio Organic White', category: 'wine-spirits', priceMin: 17, priceMax: 38, description: 'Certified organic white wine', image: 'https://images.unsplash.com/photo-1596378119327-c8fe523551d5?w=800' },
    { name: 'Wine Gift Set Duo', category: 'wine-spirits', priceMin: 35, priceMax: 70, description: 'Two premium wines in gift box', image: 'https://images.unsplash.com/photo-1513618827672-0d7c5ad591b1?w=800' },
    { name: 'Wine Tasting Collection', category: 'wine-spirits', priceMin: 45, priceMax: 95, description: 'Six bottles variety pack', image: 'https://images.unsplash.com/photo-1586450960945-0f7a0b37ae00?w=800' },
    { name: 'Aged Cognac Style', category: 'wine-spirits', priceMin: 48, priceMax: 110, description: '12-year aged grape spirit', image: 'https://images.unsplash.com/photo-1564758866047-60ce05d54148?w=800' },
    { name: 'Sparkling Wine Trio', category: 'wine-spirits', priceMin: 52, priceMax: 115, description: 'Three sparkling wines gift set', image: 'https://images.unsplash.com/photo-1502173830693-732b66a0f76e?w=800' },

    // Food & Delicacies (35 varieties)
    { name: 'Acacia Honey', category: 'food', priceMin: 12, priceMax: 24, description: 'Pure organic acacia honey', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784eaf?w=800' },
    { name: 'Forest Honey Dark', category: 'food', priceMin: 14, priceMax: 28, description: 'Wild forest honey with herbs', image: 'https://images.unsplash.com/photo-1558642891-54be180ea339?w=800' },
    { name: 'Sunflower Honey', category: 'food', priceMin: 10, priceMax: 20, description: 'Golden sunflower honey', image: 'https://images.unsplash.com/photo-1516759882488-03c21f547c4e?w=800' },
    { name: 'Brânză de Burduf', category: 'food', priceMin: 18, priceMax: 35, description: 'Traditional cheese in pine bark', image: 'https://images.unsplash.com/photo-1559561853-08451507cbe7?w=800' },
    { name: 'Caș Traditional', category: 'food', priceMin: 8, priceMax: 16, description: 'Fresh sheep cheese', image: 'https://images.unsplash.com/photo-1556648288-6c58d8e5b48e?w=800' },
    { name: 'Smoked Cheese Roll', category: 'food', priceMin: 12, priceMax: 24, description: 'Smoked cheese with herbs', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800' },
    { name: 'Walnut Preserve', category: 'food', priceMin: 11, priceMax: 22, description: 'Sweet walnut preserve', image: 'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?w=800' },
    { name: 'Sour Cherry Jam', category: 'food', priceMin: 9, priceMax: 18, description: 'Homemade cherry jam', image: 'https://images.unsplash.com/photo-1574890854647-0ba57a028e3b?w=800' },
    { name: 'Apricot Compote', category: 'food', priceMin: 8, priceMax: 16, description: 'Traditional preserved apricots', image: 'https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=800' },
    { name: 'Pickled Vegetables Mix', category: 'food', priceMin: 10, priceMax: 20, description: 'Assorted pickled vegetables', image: 'https://images.unsplash.com/photo-1531844251246-9a1bfaae09fc?w=800' },
    { name: 'Smoked Sausage', category: 'food', priceMin: 15, priceMax: 30, description: 'Traditional smoked sausage', image: 'https://images.unsplash.com/photo-1613059262497-51d005b7dd1d?w=800' },
    { name: 'Dried Plums', category: 'food', priceMin: 7, priceMax: 14, description: 'Sun-dried plums', image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800' },
    { name: 'Organic Almonds', category: 'food', priceMin: 13, priceMax: 26, description: 'Roasted almonds', image: 'https://images.unsplash.com/photo-1508841787812-0ba4c9f7dbe2?w=800' },
    { name: 'Walnuts Premium', category: 'food', priceMin: 11, priceMax: 22, description: 'High-quality walnuts', image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800' },
    { name: 'Hazelnut Mix', category: 'food', priceMin: 12, priceMax: 24, description: 'Roasted hazelnuts', image: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=800' },
    { name: 'Pumpkin Seeds', category: 'food', priceMin: 8, priceMax: 16, description: 'Roasted pumpkin seeds', image: 'https://images.unsplash.com/photo-1609781289907-431d84eb6bed?w=800' },
    { name: 'Sunflower Seeds', category: 'food', priceMin: 6, priceMax: 12, description: 'Salted sunflower seeds', image: 'https://images.unsplash.com/photo-1612170153139-6f881ff067e0?w=800' },
    { name: 'Dried Apples Chips', category: 'food', priceMin: 9, priceMax: 18, description: 'Crispy apple chips', image: 'https://images.unsplash.com/photo-1579613832107-64359da23b0c?w=800' },
    { name: 'Herb Tea Mix', category: 'food', priceMin: 10, priceMax: 20, description: 'Mountain herbs tea blend', image: 'https://images.unsplash.com/photo-1597481499666-5d19e0191208?w=800' },
    { name: 'Linden Blossom Tea', category: 'food', priceMin: 11, priceMax: 22, description: 'Organic linden tea', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800' },
    { name: 'Rose Hip Tea', category: 'food', priceMin: 12, priceMax: 24, description: 'Vitamin-rich rose hip tea', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800' },
    { name: 'Gourmet Gift Basket', category: 'food', priceMin: 45, priceMax: 95, description: 'Assorted Moldovan delicacies', image: 'https://images.unsplash.com/photo-1511081692775-05d0f180a065?w=800' },
    { name: 'Chocolate Pralines', category: 'food', priceMin: 16, priceMax: 32, description: 'Handmade chocolate pralines', image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=800' },
    { name: 'Traditional Cookies', category: 'food', priceMin: 8, priceMax: 16, description: 'Homemade butter cookies', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800' },
    { name: 'Cozonac Sweet Bread', category: 'food', priceMin: 14, priceMax: 28, description: 'Traditional sweet bread', image: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=800' },
    { name: 'Organic Grape Juice', category: 'food', priceMin: 9, priceMax: 18, description: 'Fresh pressed grape juice', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800' },
    { name: 'Apple Cider', category: 'food', priceMin: 10, priceMax: 20, description: 'Natural apple cider', image: 'https://images.unsplash.com/photo-1610184345065-4d6b85f4cc13?w=800' },
    { name: 'Quince Paste', category: 'food', priceMin: 11, priceMax: 22, description: 'Traditional quince paste', image: 'https://images.unsplash.com/photo-1547558840-8ad6d53592d6?w=800' },
    { name: 'Mixed Berry Jam', category: 'food', priceMin: 10, priceMax: 20, description: 'Forest berries jam', image: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=800' },
    { name: 'Blackcurrant Preserve', category: 'food', priceMin: 11, priceMax: 22, description: 'Sweet blackcurrant preserve', image: 'https://images.unsplash.com/photo-1553532435-9d2e65e4f1f6?w=800' },
    { name: 'Tomato Sauce Homemade', category: 'food', priceMin: 7, priceMax: 14, description: 'Traditional tomato sauce', image: 'https://images.unsplash.com/photo-1603042341632-31815d62a7ed?w=800' },
    { name: 'Ajika Spicy Sauce', category: 'food', priceMin: 8, priceMax: 16, description: 'Spicy pepper sauce', image: 'https://images.unsplash.com/photo-1531457628205-d9a98024632e?w=800' },
    { name: 'Horseradish Sauce', category: 'food', priceMin: 6, priceMax: 12, description: 'Sharp horseradish sauce', image: 'https://images.unsplash.com/photo-1543349036-9795ee5cdb97?w=800' },
    { name: 'Farmer Cheese Fresh', category: 'food', priceMin: 9, priceMax: 18, description: 'Fresh farmer cheese', image: 'https://images.unsplash.com/photo-1589881133595-a6e83abe50fa?w=800' },
    { name: 'Delicacies Sampler Box', category: 'food', priceMin: 38, priceMax: 75, description: 'Mixed food delicacies', image: 'https://images.unsplash.com/photo-1604926329143-7230c1ea9abb?w=800' },

    // Handicrafts (20 varieties)
    { name: 'Wooden Carved Box', category: 'handicrafts', priceMin: 25, priceMax: 55, description: 'Hand-carved wooden jewelry box', image: 'https://images.unsplash.com/photo-1582053433556-47caa1b3ea34?w=800' },
    { name: 'Easter Eggs Set', category: 'handicrafts', priceMin: 18, priceMax: 38, description: 'Hand-painted Easter eggs', image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800' },
    { name: 'Wooden Spoon Set', category: 'handicrafts', priceMin: 15, priceMax: 30, description: 'Handmade wooden spoons', image: 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800' },
    { name: 'Folk Art Doll', category: 'handicrafts', priceMin: 22, priceMax: 45, description: 'Traditional costume doll', image: 'https://images.unsplash.com/photo-1557682257-2f9c37a3a5f3?w=800' },
    { name: 'Woven Basket', category: 'handicrafts', priceMin: 20, priceMax: 40, description: 'Natural willow basket', image: 'https://images.unsplash.com/photo-1553948923-9ce6fbb77a1f?w=800' },
    { name: 'Decorative Wall Plate', category: 'handicrafts', priceMin: 28, priceMax: 58, description: 'Hand-painted ceramic plate', image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800' },
    { name: 'Leather Wallet', category: 'handicrafts', priceMin: 35, priceMax: 70, description: 'Handmade leather wallet', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800' },
    { name: 'Beaded Necklace', category: 'handicrafts', priceMin: 24, priceMax: 48, description: 'Traditional beaded jewelry', image: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=800' },
    { name: 'Embroidered Icon', category: 'handicrafts', priceMin: 40, priceMax: 85, description: 'Hand-embroidered religious icon', image: 'https://images.unsplash.com/photo-1565538420870-da08ff76d4c8?w=800' },
    { name: 'Decorative Towel', category: 'handicrafts', priceMin: 18, priceMax: 36, description: 'Embroidered decorative towel', image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800' },
    { name: 'Wooden Chess Set', category: 'handicrafts', priceMin: 55, priceMax: 115, description: 'Hand-carved chess pieces', image: 'https://images.unsplash.com/photo-1611195974226-ef7f0ca3773f?w=800' },
    { name: 'Clay Bell Collection', category: 'handicrafts', priceMin: 16, priceMax: 32, description: 'Set of ceramic bells', image: 'https://images.unsplash.com/photo-1582582621959-48d27397dc69?w=800' },
    { name: 'Macramé Wall Hanging', category: 'handicrafts', priceMin: 32, priceMax: 65, description: 'Handmade macramé decoration', image: 'https://images.unsplash.com/photo-1614963366795-bd6e8fe5c0dd?w=800' },
    { name: 'Candle Holder Set', category: 'handicrafts', priceMin: 22, priceMax: 44, description: 'Ceramic candle holders', image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800' },
    { name: 'Corn Husk Doll', category: 'handicrafts', priceMin: 14, priceMax: 28, description: 'Traditional corn husk doll', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800' },
    { name: 'Painted Wooden Egg', category: 'handicrafts', priceMin: 12, priceMax: 24, description: 'Decorative painted egg', image: 'https://images.unsplash.com/photo-1600456899121-68eda5705257?w=800' },
    { name: 'Straw Ornament Set', category: 'handicrafts', priceMin: 20, priceMax: 40, description: 'Woven straw decorations', image: 'https://images.unsplash.com/photo-1576619379994-59148ad77be9?w=800' },
    { name: 'Wooden Picture Frame', category: 'handicrafts', priceMin: 18, priceMax: 36, description: 'Carved wooden frame', image: 'https://images.unsplash.com/photo-1565183997392-2f5e86eb0f03?w=800' },
    { name: 'Folk Art Magnet Set', category: 'handicrafts', priceMin: 10, priceMax: 20, description: 'Set of decorative magnets', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800' },
    { name: 'Artisan Gift Box', category: 'handicrafts', priceMin: 48, priceMax: 98, description: 'Mixed handicrafts collection', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800' },

    // Pottery & Ceramics (15 varieties)
    { name: 'Ceramic Vase Blue', category: 'pottery', priceMin: 32, priceMax: 68, description: 'Hand-painted blue ceramic vase', image: 'https://images.unsplash.com/photo-1578500351865-d6d6594d5abe?w=800' },
    { name: 'Terracotta Pot Set', category: 'pottery', priceMin: 28, priceMax: 58, description: 'Set of three terracotta pots', image: 'https://images.unsplash.com/photo-1624880339074-dcc75a594ec0?w=800' },
    { name: 'Ceramic Bowl Large', category: 'pottery', priceMin: 25, priceMax: 52, description: 'Large decorative bowl', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800' },
    { name: 'Clay Pitcher', category: 'pottery', priceMin: 22, priceMax: 45, description: 'Traditional water pitcher', image: 'https://images.unsplash.com/photo-1583829482836-a0b6804ec8cb?w=800' },
    { name: 'Dinner Plate Set', category: 'pottery', priceMin: 45, priceMax: 95, description: 'Set of 6 ceramic plates', image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800' },
    { name: 'Coffee Mug Pair', category: 'pottery', priceMin: 18, priceMax: 36, description: 'Two hand-painted mugs', image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800' },
    { name: 'Ceramic Serving Dish', category: 'pottery', priceMin: 38, priceMax: 78, description: 'Large serving platter', image: 'https://images.unsplash.com/photo-1584555684040-bad07f6c62f2?w=800' },
    { name: 'Decorative Tiles Set', category: 'pottery', priceMin: 42, priceMax: 88, description: 'Hand-painted tile collection', image: 'https://images.unsplash.com/photo-1604077025217-69c2de1f6834?w=800' },
    { name: 'Clay Sculpture', category: 'pottery', priceMin: 55, priceMax: 115, description: 'Artistic clay sculpture', image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800' },
    { name: 'Tea Set Complete', category: 'pottery', priceMin: 65, priceMax: 135, description: 'Traditional tea service', image: 'https://images.unsplash.com/photo-1571424717919-0afa8f3e2b40?w=800' },
    { name: 'Ceramic Candlestick', category: 'pottery', priceMin: 24, priceMax: 48, description: 'Glazed ceramic candlestick', image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800' },
    { name: 'Pottery Bowl Set', category: 'pottery', priceMin: 35, priceMax: 72, description: 'Set of mixing bowls', image: 'https://images.unsplash.com/photo-1619032527460-75659f3c2a9e?w=800' },
    { name: 'Ceramic Plant Pot', category: 'pottery', priceMin: 20, priceMax: 42, description: 'Decorative plant container', image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800' },
    { name: 'Handmade Tile Coasters', category: 'pottery', priceMin: 16, priceMax: 32, description: 'Set of 4 tile coasters', image: 'https://images.unsplash.com/photo-1604077025217-69c2de1f6834?w=800' },
    { name: 'Ceramic Art Collection', category: 'pottery', priceMin: 88, priceMax: 180, description: 'Curated pottery gift set', image: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=800' },

    // Textiles (20 varieties)
    { name: 'Embroidered Blouse', category: 'textiles', priceMin: 45, priceMax: 95, description: 'Traditional embroidered shirt', image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=800' },
    { name: 'Wool Shawl', category: 'textiles', priceMin: 38, priceMax: 78, description: 'Hand-woven wool shawl', image: 'https://images.unsplash.com/photo-1584697964328-b1e7f76c0e3f?w=800' },
    { name: 'Linen Tablecloth', category: 'textiles', priceMin: 42, priceMax: 88, description: 'Embroidered linen tablecloth', image: 'https://images.unsplash.com/photo-1604762524889-8e75d1643c62?w=800' },
    { name: 'Wool Blanket', category: 'textiles', priceMin: 65, priceMax: 135, description: 'Pure wool blanket', image: 'https://images.unsplash.com/photo-1592294871576-a1e09c72c0ad?w=800' },
    { name: 'Embroidered Pillowcase', category: 'textiles', priceMin: 22, priceMax: 45, description: 'Decorative pillow cover', image: 'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=800' },
    { name: 'Cotton Table Runner', category: 'textiles', priceMin: 28, priceMax: 58, description: 'Embroidered table runner', image: 'https://images.unsplash.com/photo-1600176465108-e5a1e1e5c1eb?w=800' },
    { name: 'Traditional Vest', category: 'textiles', priceMin: 55, priceMax: 115, description: 'Embroidered folk vest', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800' },
    { name: 'Wool Socks Pair', category: 'textiles', priceMin: 15, priceMax: 30, description: 'Hand-knit wool socks', image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800' },
    { name: 'Linen Napkin Set', category: 'textiles', priceMin: 32, priceMax: 65, description: 'Set of 6 linen napkins', image: 'https://images.unsplash.com/photo-1562569633-622303bafef5?w=800' },
    { name: 'Woven Carpet', category: 'textiles', priceMin: 120, priceMax: 280, description: 'Large handwoven carpet', image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800' },
    { name: 'Silk Scarf', category: 'textiles', priceMin: 35, priceMax: 72, description: 'Hand-painted silk scarf', image: 'https://images.unsplash.com/photo-1544441892-794166f1e3be?w=800' },
    { name: 'Kitchen Towel Set', category: 'textiles', priceMin: 18, priceMax: 36, description: 'Embroidered kitchen towels', image: 'https://images.unsplash.com/photo-1582735689355-904c94386d62?w=800' },
    { name: 'Baby Blanket', category: 'textiles', priceMin: 42, priceMax: 88, description: 'Soft cotton baby blanket', image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800' },
    { name: 'Embroidered Apron', category: 'textiles', priceMin: 28, priceMax: 58, description: 'Traditional embroidered apron', image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800' },
    { name: 'Wool Hat Winter', category: 'textiles', priceMin: 24, priceMax: 48, description: 'Hand-knit wool hat', image: 'https://images.unsplash.com/photo-1604176354204-9268737df4e4?w=800' },
    { name: 'Linen Bedding Set', category: 'textiles', priceMin: 95, priceMax: 195, description: 'Complete linen bed set', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800' },
    { name: 'Decorative Cushion', category: 'textiles', priceMin: 32, priceMax: 65, description: 'Embroidered throw pillow', image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800' },
    { name: 'Traditional Belt', category: 'textiles', priceMin: 25, priceMax: 52, description: 'Woven traditional belt', image: 'https://images.unsplash.com/photo-1624222247344-550fb60583e2?w=800' },
    { name: 'Curtain Panel Pair', category: 'textiles', priceMin: 75, priceMax: 155, description: 'Embroidered curtain panels', image: 'https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?w=800' },
    { name: 'Textile Gift Collection', category: 'textiles', priceMin: 85, priceMax: 175, description: 'Curated textile gift set', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800' }
  ]

  // Get category IDs
  const { data: categories } = await supabase.from('categories').select('id, slug')
  const categoryMap = new Map(categories?.map((c: any) => [c.slug, c.id]))

  const products = []

  for (let i = 0; i < count; i++) {
    const template = productTemplates[i % productTemplates.length]
    const basePrice = Math.random() * (template.priceMax - template.priceMin) + template.priceMin
    const price = Math.round(basePrice * 100) / 100

    // Occasionally add a compare price for sale items
    const onSale = Math.random() > 0.8 // 20% chance of being on sale
    const comparePrice = onSale ? Math.round(price * 1.25 * 100) / 100 : null

    const stockQty = lowStock
      ? Math.floor(Math.random() * 5) // 0-4 for low stock
      : Math.floor(Math.random() * 100) + 10

    const volume = template.category === 'wine-spirits' ? [375, 500, 750, 1000][Math.floor(Math.random() * 4)] : null
    const alcoholContent = template.category === 'wine-spirits' ? (10 + Math.random() * 10).toFixed(1) : null

    products.push({
      sku: `PROD-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
      category_id: categoryMap.get(template.category),
      name_translations: {
        en: `${template.name} ${i > productTemplates.length ? '#' + (Math.floor(i / productTemplates.length) + 1) : ''}`.trim(),
        es: `${template.name} ${i > productTemplates.length ? '#' + (Math.floor(i / productTemplates.length) + 1) : ''}`.trim(),
        ro: `${template.name} ${i > productTemplates.length ? '#' + (Math.floor(i / productTemplates.length) + 1) : ''}`.trim(),
        ru: `${template.name} ${i > productTemplates.length ? '#' + (Math.floor(i / productTemplates.length) + 1) : ''}`.trim()
      },
      description_translations: {
        en: template.description,
        es: template.description,
        ro: template.description,
        ru: template.description
      },
      price_eur: price,
      compare_at_price_eur: comparePrice,
      stock_quantity: stockQty,
      low_stock_threshold: 5,
      reorder_point: 10,
      is_active: true,
      images: [
        {
          url: template.image,
          alt_text: template.name,
          is_primary: true
        }
      ],
      attributes: {
        origin: 'Moldova',
        volume: volume,
        alcohol_content: alcoholContent,
        featured: Math.random() > 0.9 // 10% featured
      }
    })
  }

  const { data, error } = await supabase
    .from('products')
    .insert(products)
    .select()

  if (error) {
    console.error('Failed to seed products:', error)
    return 0
  }

  return data?.length || 0
}

// Seed users
async function seedUsers(supabase: any, count: number): Promise<string[]> {
  const userIds: string[] = []

  for (let i = 0; i < count; i++) {
    const mockUser = generateMockUser()
    const password = generatePassword()

    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: mockUser.email,
        password,
        email_confirm: true,
        user_metadata: {
          name: mockUser.name,
          preferred_language: mockUser.preferredLanguage
        }
      })

      if (data?.user) {
        userIds.push(data.user.id)

        // Create profile
        await supabase.from('profiles').upsert({
          id: data.user.id,
          name: mockUser.name,
          phone: mockUser.phone,
          role: 'customer',
          preferred_language: mockUser.preferredLanguage
        })
      }
    } catch (error) {
      console.error(`Failed to create user ${mockUser.email}:`, error)
    }
  }

  return userIds
}

// Seed orders
async function seedOrders(
  supabase: any,
  count: number,
  userIds: string[],
  pattern: string
): Promise<number> {
  const { data: products } = await supabase.from('products').select('id, sku, name_translations, price_eur').limit(50)

  if (!products || products.length === 0) {
    console.warn('No products available for order creation')
    return 0
  }

  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
  const paymentStatuses = ['paid', 'pending', 'failed']
  let createdCount = 0

  for (let i = 0; i < count; i++) {
    const userId = userIds[Math.floor(Math.random() * userIds.length)]
    const product = products[Math.floor(Math.random() * products.length)]
    const quantity = Math.floor(Math.random() * 3) + 1
    const subtotal = product.price_eur * quantity
    const shippingCost = 5.99
    const tax = subtotal * 0.19
    const total = subtotal + shippingCost + tax

    // Adjust date based on pattern
    const daysAgo = pattern === 'rush'
      ? Math.floor(Math.random() * 7) // Last week for rush
      : pattern === 'sparse'
      ? Math.floor(Math.random() * 180) // Last 6 months for sparse
      : Math.floor(Math.random() * 30) // Last month for normal

    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - daysAgo)

    const order = {
      order_number: `ORD-${Date.now()}-${i}`,
      user_id: userId,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      payment_method: 'stripe',
      payment_status: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
      subtotal_eur: subtotal,
      shipping_cost_eur: shippingCost,
      tax_eur: tax,
      total_eur: total,
      shipping_address: {
        street: 'Test Street 123',
        city: 'Chisinau',
        postalCode: 'MD-2001',
        country: 'Moldova'
      },
      billing_address: {
        street: 'Test Street 123',
        city: 'Chisinau',
        postalCode: 'MD-2001',
        country: 'Moldova'
      },
      created_at: createdAt.toISOString()
    }

    const { data: insertedOrder, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single()

    if (insertedOrder) {
      await supabase.from('order_items').insert({
        order_id: insertedOrder.id,
        product_id: product.id,
        product_snapshot: {
          name: product.name_translations.en,
          sku: product.sku,
          nameTranslations: product.name_translations
        },
        quantity,
        price_eur: product.price_eur,
        total_eur: product.price_eur * quantity
      })

      createdCount++
    }
  }

  return createdCount
}
