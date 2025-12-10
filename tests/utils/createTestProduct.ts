/**
 * Test utility for creating mock product objects
 */

export interface TestProduct {
  id: number | string
  name: string
  slug: string
  description: string
  price: number
  category: string
  image?: string
  images?: string[]
  stock?: number
  sku?: string
  featured?: boolean
  attributes?: Record<string, any>
  created_at?: string
  updated_at?: string
}

export function createTestProduct(overrides: Partial<TestProduct> = {}): TestProduct {
  const id = overrides.id || Math.floor(Math.random() * 10000)
  const name = overrides.name || 'Test Product'
  const slug = overrides.slug || name.toLowerCase().replace(/\s+/g, '-')

  const defaultProduct: TestProduct = {
    id,
    name,
    slug,
    description: 'A test product description',
    price: 29.99,
    category: 'electronics',
    image: '/images/test-product.jpg',
    images: [
      '/images/test-product-1.jpg',
      '/images/test-product-2.jpg',
      '/images/test-product-3.jpg',
    ],
    stock: 100,
    sku: `SKU-${id}`,
    featured: false,
    attributes: {
      color: 'blue',
      size: 'medium',
      weight: '1kg',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return {
    ...defaultProduct,
    ...overrides,
    attributes: {
      ...defaultProduct.attributes,
      ...overrides.attributes,
    },
  }
}

export function createFeaturedProduct(overrides: Partial<TestProduct> = {}): TestProduct {
  return createTestProduct({
    ...overrides,
    featured: true,
  })
}

export function createOutOfStockProduct(overrides: Partial<TestProduct> = {}): TestProduct {
  return createTestProduct({
    ...overrides,
    stock: 0,
  })
}

export function createTestProducts(count: number, overrides: Partial<TestProduct> = {}): TestProduct[] {
  return Array.from({ length: count }, (_, index) =>
    createTestProduct({
      ...overrides,
      id: overrides.id ? `${overrides.id}-${index}` : index + 1,
      name: overrides.name ? `${overrides.name} ${index + 1}` : `Test Product ${index + 1}`,
    }),
  )
}
