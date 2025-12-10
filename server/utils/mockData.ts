/**
 * Mock Data for Admin Dashboard
 *
 * Provides fallback data when database is unavailable
 */

export interface MockProduct {
  id: number
  sku: string
  slug: string
  name: Record<string, string>
  description: Record<string, string>
  price: number
  comparePrice?: number
  stockQuantity: number
  lowStockThreshold: number
  reorderPoint: number
  stockStatus: 'high' | 'medium' | 'low' | 'out'
  images: Array<{
    url: string
    altText: Record<string, string>
    isPrimary: boolean
  }>
  category: {
    id: number
    slug: string
    name: Record<string, string>
  } | null
  attributes: Record<string, any>
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export const MOCK_CATEGORIES = [
  {
    id: 1,
    slug: 'electronics',
    name: { en: 'Electronics', es: 'Electrónicos', ro: 'Electronice' },
  },
  {
    id: 2,
    slug: 'clothing',
    name: { en: 'Clothing', es: 'Ropa', ro: 'Îmbrăcăminte' },
  },
  {
    id: 3,
    slug: 'home-garden',
    name: { en: 'Home & Garden', es: 'Casa y Jardín', ro: 'Casă și Grădină' },
  },
]

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: 1,
    sku: 'PHONE-001',
    slug: 'smartphone-x1',
    name: {
      en: 'Smartphone X1',
      es: 'Smartphone X1',
      ro: 'Smartphone X1',
    },
    description: {
      en: 'Latest smartphone with advanced features',
      es: 'Último smartphone con características avanzadas',
      ro: 'Cel mai nou smartphone cu funcții avansate',
    },
    price: 599.99,
    comparePrice: 699.99,
    stockQuantity: 25,
    lowStockThreshold: 5,
    reorderPoint: 10,
    stockStatus: 'high',
    images: [
      {
        url: '/images/mock/phone-x1.jpg',
        altText: { en: 'Smartphone X1', es: 'Smartphone X1', ro: 'Smartphone X1' },
        isPrimary: true,
      },
    ],
    category: MOCK_CATEGORIES[0] ?? null,
    attributes: {
      color: 'Black',
      storage: '128GB',
      brand: 'TechCorp',
    },
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z',
  },
  {
    id: 2,
    sku: 'LAPTOP-002',
    slug: 'laptop-pro-15',
    name: {
      en: 'Laptop Pro 15"',
      es: 'Laptop Pro 15"',
      ro: 'Laptop Pro 15"',
    },
    description: {
      en: 'Professional laptop for work and gaming',
      es: 'Laptop profesional para trabajo y juegos',
      ro: 'Laptop profesional pentru muncă și jocuri',
    },
    price: 1299.99,
    stockQuantity: 8,
    lowStockThreshold: 5,
    reorderPoint: 10,
    stockStatus: 'medium',
    images: [
      {
        url: '/images/mock/laptop-pro.jpg',
        altText: { en: 'Laptop Pro 15"', es: 'Laptop Pro 15"', ro: 'Laptop Pro 15"' },
        isPrimary: true,
      },
    ],
    category: MOCK_CATEGORIES[0] ?? null,
    attributes: {
      cpu: 'Intel i7',
      ram: '16GB',
      storage: '512GB SSD',
    },
    isActive: true,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-18T12:00:00Z',
  },
  {
    id: 3,
    sku: 'TSHIRT-003',
    slug: 'cotton-t-shirt',
    name: {
      en: 'Cotton T-Shirt',
      es: 'Camiseta de Algodón',
      ro: 'Tricou de Bumbac',
    },
    description: {
      en: 'Comfortable cotton t-shirt for everyday wear',
      es: 'Camiseta de algodón cómoda para uso diario',
      ro: 'Tricou confortabil din bumbac pentru purtarea zilnică',
    },
    price: 24.99,
    comparePrice: 34.99,
    stockQuantity: 3,
    lowStockThreshold: 5,
    reorderPoint: 15,
    stockStatus: 'low',
    images: [
      {
        url: '/images/mock/tshirt-blue.jpg',
        altText: { en: 'Blue Cotton T-Shirt', es: 'Camiseta Azul de Algodón', ro: 'Tricou Albastru de Bumbac' },
        isPrimary: true,
      },
    ],
    category: MOCK_CATEGORIES[1] ?? null,
    attributes: {
      color: 'Blue',
      size: 'M',
      material: '100% Cotton',
    },
    isActive: true,
    createdAt: '2024-01-05T14:00:00Z',
    updatedAt: '2024-01-22T09:15:00Z',
  },
  {
    id: 4,
    sku: 'CHAIR-004',
    slug: 'office-chair-ergonomic',
    name: {
      en: 'Ergonomic Office Chair',
      es: 'Silla de Oficina Ergonómica',
      ro: 'Scaun de Birou Ergonomic',
    },
    description: {
      en: 'Comfortable ergonomic chair for long work sessions',
      es: 'Silla ergonómica cómoda para largas sesiones de trabajo',
      ro: 'Scaun ergonomic confortabil pentru sesiuni lungi de muncă',
    },
    price: 199.99,
    stockQuantity: 0,
    lowStockThreshold: 3,
    reorderPoint: 8,
    stockStatus: 'out',
    images: [
      {
        url: '/images/mock/office-chair.jpg',
        altText: { en: 'Black Ergonomic Office Chair', es: 'Silla Negra Ergonómica de Oficina', ro: 'Scaun Negru Ergonomic de Birou' },
        isPrimary: true,
      },
    ],
    category: MOCK_CATEGORIES[2] ?? null,
    attributes: {
      color: 'Black',
      material: 'Mesh + Plastic',
      adjustable: true,
    },
    isActive: false,
    createdAt: '2024-01-01T12:00:00Z',
    updatedAt: '2024-01-25T16:45:00Z',
  },
  {
    id: 5,
    sku: 'WATCH-005',
    slug: 'smartwatch-sport',
    name: {
      en: 'Sport Smartwatch',
      es: 'Smartwatch Deportivo',
      ro: 'Smartwatch Sport',
    },
    description: {
      en: 'Advanced smartwatch for fitness tracking',
      es: 'Smartwatch avanzado para seguimiento de fitness',
      ro: 'Smartwatch avansat pentru urmărirea fitness-ului',
    },
    price: 249.99,
    stockQuantity: 15,
    lowStockThreshold: 8,
    reorderPoint: 20,
    stockStatus: 'high',
    images: [
      {
        url: '/images/mock/smartwatch.jpg',
        altText: { en: 'Sport Smartwatch', es: 'Smartwatch Deportivo', ro: 'Smartwatch Sport' },
        isPrimary: true,
      },
    ],
    category: MOCK_CATEGORIES[0] ?? null,
    attributes: {
      color: 'Silver',
      waterproof: true,
      battery: '7 days',
    },
    isActive: true,
    createdAt: '2024-01-12T11:30:00Z',
    updatedAt: '2024-01-23T14:20:00Z',
  },
]

/**
 * Get paginated mock products with filtering and sorting
 */
export function getMockProducts(options: {
  page?: number
  limit?: number
  search?: string
  categoryId?: number
  active?: boolean
  inStock?: boolean
  outOfStock?: boolean
  lowStock?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}) {
  let filteredProducts = [...MOCK_PRODUCTS]

  // Apply filters
  if (options.search) {
    const searchTerm = options.search.toLowerCase()
    filteredProducts = filteredProducts.filter(product =>
      Object.values(product.name).some(name =>
        name.toLowerCase().includes(searchTerm),
      )
      || Object.values(product.description).some(desc =>
        desc.toLowerCase().includes(searchTerm),
      )
      || product.sku.toLowerCase().includes(searchTerm)
      || (product.category && Object.values(product.category.name).some(name =>
        name.toLowerCase().includes(searchTerm),
      )),
    )
  }

  if (options.categoryId) {
    filteredProducts = filteredProducts.filter(product =>
      product.category?.id === options.categoryId,
    )
  }

  if (options.active !== undefined) {
    filteredProducts = filteredProducts.filter(product =>
      product.isActive === options.active,
    )
  }

  if (options.inStock) {
    filteredProducts = filteredProducts.filter(product =>
      product.stockQuantity > 0,
    )
  }
  else if (options.outOfStock) {
    filteredProducts = filteredProducts.filter(product =>
      product.stockQuantity === 0,
    )
  }
  else if (options.lowStock) {
    filteredProducts = filteredProducts.filter(product =>
      product.stockQuantity > 0 && product.stockQuantity <= product.lowStockThreshold,
    )
  }

  // Apply sorting
  if (options.sortBy) {
    filteredProducts.sort((a, b) => {
      let aValue: any, bValue: any

      switch (options.sortBy) {
        case 'name':
          aValue = Object.values(a.name)[0] || ''
          bValue = Object.values(b.name)[0] || ''
          break
        case 'price':
          aValue = a.price
          bValue = b.price
          break
        case 'stock':
          aValue = a.stockQuantity
          bValue = b.stockQuantity
          break
        case 'created_at':
        default:
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
      }

      if (typeof aValue === 'string') {
        const comparison = aValue.localeCompare(bValue)
        return options.sortOrder === 'asc' ? comparison : -comparison
      }
      else {
        return options.sortOrder === 'asc' ? aValue - bValue : bValue - aValue
      }
    })
  }

  // Apply pagination
  const page = options.page || 1
  const limit = options.limit || 20
  const offset = (page - 1) * limit
  const paginatedProducts = filteredProducts.slice(offset, offset + limit)

  const totalPages = Math.ceil(filteredProducts.length / limit)

  return {
    products: paginatedProducts,
    pagination: {
      page,
      limit,
      total: filteredProducts.length,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  }
}

/**
 * Get mock inventory reports data
 */
export function getMockInventoryReports(reportType: string) {
  switch (reportType) {
    case 'stock-levels':
      return {
        summary: {
          totalProducts: MOCK_PRODUCTS.length,
          outOfStock: MOCK_PRODUCTS.filter(p => p.stockStatus === 'out').length,
          lowStock: MOCK_PRODUCTS.filter(p => p.stockStatus === 'low').length,
          mediumStock: MOCK_PRODUCTS.filter(p => p.stockStatus === 'medium').length,
          highStock: MOCK_PRODUCTS.filter(p => p.stockStatus === 'high').length,
          totalStockValue: MOCK_PRODUCTS.reduce((sum, p) => sum + (p.stockQuantity * p.price), 0),
        },
        products: MOCK_PRODUCTS.map(product => ({
          productId: product.id,
          sku: product.sku,
          name: product.name,
          category: product.category?.name,
          stockQuantity: product.stockQuantity,
          lowThreshold: product.lowStockThreshold,
          reorderPoint: product.reorderPoint,
          status: product.stockStatus,
          stockValue: product.stockQuantity * product.price,
          isActive: product.isActive,
        })),
      }

    case 'low-stock':
      const lowStockProducts = MOCK_PRODUCTS.filter(p =>
        p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold,
      )
      return {
        totalLowStockProducts: lowStockProducts.length,
        totalValue: lowStockProducts.reduce((sum, p) => sum + (p.stockQuantity * p.price), 0),
        products: lowStockProducts.map(product => ({
          productId: product.id,
          sku: product.sku,
          name: product.name,
          category: product.category?.name,
          stockQuantity: product.stockQuantity,
          lowThreshold: product.lowStockThreshold,
          reorderPoint: product.reorderPoint,
          stockValue: product.stockQuantity * product.price,
          daysUntilOutOfStock: Math.floor(product.stockQuantity / 1),
          isActive: product.isActive,
        })),
      }

    case 'reorder-alerts':
      const reorderProducts = MOCK_PRODUCTS.filter(p =>
        p.stockQuantity <= p.reorderPoint,
      )
      return {
        totalReorderProducts: reorderProducts.length,
        totalEstimatedCost: reorderProducts.reduce((sum, p) => {
          const quantity = Math.max(p.reorderPoint * 2 - p.stockQuantity, p.reorderPoint)
          return sum + (quantity * p.price)
        }, 0),
        byPriority: {
          critical: reorderProducts.filter(p => p.stockQuantity === 0).length,
          high: reorderProducts.filter(p => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold).length,
          medium: reorderProducts.filter(p => p.stockQuantity > p.lowStockThreshold && p.stockQuantity <= p.reorderPoint).length,
        },
        products: reorderProducts.map((product) => {
          const reorderQuantity = Math.max(product.reorderPoint * 2 - product.stockQuantity, product.reorderPoint)
          return {
            productId: product.id,
            sku: product.sku,
            name: product.name,
            category: product.category?.name,
            stockQuantity: product.stockQuantity,
            reorderPoint: product.reorderPoint,
            recommendedOrderQuantity: reorderQuantity,
            estimatedCost: reorderQuantity * product.price,
            supplierInfo: null,
            priority: product.stockQuantity === 0
              ? 'critical'
              : product.stockQuantity <= product.lowStockThreshold ? 'high' : 'medium',
            isActive: product.isActive,
          }
        }),
      }

    default:
      return { message: 'Mock data not available for this report type' }
  }
}
