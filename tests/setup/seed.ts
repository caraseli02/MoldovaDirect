import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321'
const supabaseKey = process.env.SUPABASE_KEY || 'test-key'

// Create Supabase client for testing
export const supabase = createClient(supabaseUrl, supabaseKey)

// Sample test data
const testCategories = [
  {
    slug: 'test-wines',
    name_translations: {
      es: 'Vinos de Prueba',
      en: 'Test Wines',
      ro: 'Vinuri Test',
      ru: 'Тестовые Вина',
    },
    description_translations: {
      es: 'Categoría de vinos para pruebas',
      en: 'Wine category for testing',
      ro: 'Categoria de vinuri pentru teste',
      ru: 'Категория вин для тестирования',
    },
    image_url: '/categories/test-wines.jpg',
    sort_order: 1,
    parent_id: null,
  },
]

const testProducts = [
  {
    slug: 'test-wine-1',
    sku: 'TEST-WINE-001',
    name_translations: {
      es: 'Vino de Prueba 1',
      en: 'Test Wine 1',
      ro: 'Vin Test 1',
      ru: 'Тестовое Вино 1',
    },
    description_translations: {
      es: 'Un vino de prueba para testing',
      en: 'A test wine for testing purposes',
      ro: 'Un vin de test pentru testare',
      ru: 'Тестовое вино для целей тестирования',
    },
    price: 25.99,
    compare_at_price: 35.99,
    stock_quantity: 100,
    is_featured: true,
    is_active: true,
    weight: 750,
    images: ['/products/test-wine-1.jpg'],
    category_slug: 'test-wines',
  },
  {
    slug: 'test-wine-2',
    sku: 'TEST-WINE-002',
    name_translations: {
      es: 'Vino de Prueba 2',
      en: 'Test Wine 2',
      ro: 'Vin Test 2',
      ru: 'Тестовое Вино 2',
    },
    description_translations: {
      es: 'Otro vino de prueba',
      en: 'Another test wine',
      ro: 'Alt vin de test',
      ru: 'Другое тестовое вино',
    },
    price: 19.99,
    compare_at_price: null,
    stock_quantity: 50,
    is_featured: false,
    is_active: true,
    weight: 750,
    images: ['/products/test-wine-2.jpg'],
    category_slug: 'test-wines',
  },
]

export async function seedDatabase() {
  try {
    console.log('🌱 Starting test database seeding...')

    // Clean existing test data
    await supabase.from('products').delete().like('slug', 'test-%')
    await supabase.from('categories').delete().like('slug', 'test-%')

    // Insert test categories
    console.log('📂 Inserting test categories...')
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .insert(testCategories)
      .select('*')

    if (categoryError) {
      console.error('❌ Category insertion error:', categoryError)
      throw categoryError
    }

    console.log(`✅ Inserted ${categoryData?.length || 0} test categories`)

    // Get category ID for products
    const testCategory = categoryData?.[0]
    if (!testCategory) {
      throw new Error('Test category not found after insertion')
    }

    // Update products with correct category_id
    const productsWithCategoryId = testProducts.map(product => ({
      ...product,
      category_id: testCategory.id,
    }))

    // Insert test products
    console.log('🛍️ Inserting test products...')
    const { data: productData, error: productError } = await supabase
      .from('products')
      .insert(productsWithCategoryId)
      .select('*')

    if (productError) {
      console.error('❌ Product insertion error:', productError)
      throw productError
    }

    console.log(`✅ Inserted ${productData?.length || 0} test products`)
    console.log('🎉 Test database seeding completed successfully!')

    return {
      categories: categoryData,
      products: productData,
    }
  }
  catch (error: any) {
    console.error('❌ Database seeding failed:', error)
    throw error
  }
}

export async function cleanupTestData() {
  try {
    console.log('🧹 Cleaning up test data...')

    await supabase.from('products').delete().like('slug', 'test-%')
    await supabase.from('categories').delete().like('slug', 'test-%')

    console.log('✅ Test data cleanup completed')
  }
  catch (error: any) {
    console.error('❌ Test data cleanup failed:', error)
    throw error
  }
}

// Export test data for use in tests
export { testCategories, testProducts }
