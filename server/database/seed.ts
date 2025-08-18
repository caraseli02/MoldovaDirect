import { useDB, tables } from '~/server/utils/database'

// Sample categories data
const sampleCategories = [
  {
    nameTranslations: {
      es: 'Vinos',
      en: 'Wines',
      ro: 'Vinuri',
      ru: 'Вина'
    },
    slug: 'wines',
    descriptionTranslations: {
      es: 'Vinos premium de Moldavia, conocidos por su calidad excepcional',
      en: 'Premium wines from Moldova, known for their exceptional quality',
      ro: 'Vinuri premium din Moldova, cunoscute pentru calitatea lor excepțională',
      ru: 'Премиальные вина из Молдовы, известные своим исключительным качеством'
    },
    sortOrder: 1,
    isActive: true,
    parentId: null,
    imageUrl: null
  },
  {
    nameTranslations: {
      es: 'Alimentos Tradicionales',
      en: 'Traditional Foods',
      ro: 'Alimente Tradiționale',
      ru: 'Традиционная Еда'
    },
    slug: 'traditional-foods',
    descriptionTranslations: {
      es: 'Productos alimenticios tradicionales moldavos',
      en: 'Traditional Moldovan food products',
      ro: 'Produse alimentare tradiționale moldovenești',
      ru: 'Традиционные молдавские продукты питания'
    },
    sortOrder: 2,
    isActive: true,
    parentId: null,
    imageUrl: null
  },
  {
    nameTranslations: {
      es: 'Conservas',
      en: 'Preserves',
      ro: 'Conserve',
      ru: 'Консервы'
    },
    slug: 'preserves',
    descriptionTranslations: {
      es: 'Conservas caseras y mermeladas artesanales',
      en: 'Homemade preserves and artisanal jams',
      ro: 'Conserve de casă și gemuri artizanale',
      ru: 'Домашние консервы и ремесленные джемы'
    },
    sortOrder: 3,
    isActive: true,
    parentId: null,
    imageUrl: null
  },
  {
    nameTranslations: {
      es: 'Lácteos',
      en: 'Dairy Products',
      ro: 'Produse Lactate',
      ru: 'Молочные Продукты'
    },
    slug: 'dairy',
    descriptionTranslations: {
      es: 'Quesos y productos lácteos moldavos',
      en: 'Moldovan cheeses and dairy products',
      ro: 'Brânzeturi și produse lactate moldovenești',
      ru: 'Молдавские сыры и молочные продукты'
    },
    sortOrder: 4,
    isActive: true,
    parentId: null,
    imageUrl: null
  }
]

// Sample products data
const sampleProducts = [
  {
    nameTranslations: {
      es: 'Vino Riesling Blanco',
      en: 'White Riesling Wine',
      ro: 'Vin Riesling Alb',
      ru: 'Белое Вино Рислинг'
    },
    sku: 'WR-001',
    descriptionTranslations: {
      es: 'Un vino blanco seco con aroma floral y sabor afrutado. Perfecto para acompañar pescados y mariscos.',
      en: 'A dry white wine with floral aroma and fruity taste. Perfect for pairing with fish and seafood.',
      ro: 'Un vin alb sec cu aromă florală și gust fructat. Perfect pentru a fi acompaniat cu pește și fructe de mare.',
      ru: 'Сухое белое вино с цветочным ароматом и фруктовым вкусом. Идеально подходит к рыбе и морепродуктам.'
    },
    priceEur: 24.99,
    compareAtPriceEur: 29.99,
    weightKg: 1.2,
    stockQuantity: 50,
    lowStockThreshold: 10,
    categoryId: 1, // Will be updated after category insertion
    isActive: true,
    images: [
      'https://images.unsplash.com/photo-1506377872008-6645d6f2b8d7?w=400',
      'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400'
    ],
    attributes: {
      alcohol_percentage: 12.5,
      volume_ml: 750,
      year: 2022,
      origin: 'Moldova'
    }
  },
  {
    nameTranslations: {
      es: 'Merlot Tinto Reserva',
      en: 'Merlot Red Reserve',
      ro: 'Merlot Roșu Rezervă',
      ru: 'Мерло Красное Резерв'
    },
    sku: 'MR-002',
    descriptionTranslations: {
      es: 'Vino tinto con cuerpo y sabor intenso, envejecido en barricas de roble. Ideal para carnes rojas.',
      en: 'Full-bodied red wine with intense flavor, aged in oak barrels. Ideal for red meats.',
      ro: 'Vin roșu cu corp și gust intens, îmbătrânit în butoaie de stejar. Ideal pentru carne roșie.',
      ru: 'Полнотелое красное вино с интенсивным вкусом, выдержанное в дубовых бочках. Идеально для красного мяса.'
    },
    priceEur: 32.50,
    compareAtPriceEur: null,
    weightKg: 1.2,
    stockQuantity: 35,
    lowStockThreshold: 5,
    categoryId: 1,
    isActive: true,
    images: [
      'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400',
      'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400'
    ],
    attributes: {
      alcohol_percentage: 14.0,
      volume_ml: 750,
      year: 2020,
      origin: 'Moldova'
    }
  },
  {
    nameTranslations: {
      es: 'Queso Branza Tradicional',
      en: 'Traditional Branza Cheese',
      ro: 'Brânză Tradițională',
      ru: 'Традиционный Сыр Брынза'
    },
    sku: 'BC-003',
    descriptionTranslations: {
      es: 'Queso branza tradicional moldavo, elaborado con leche fresca de oveja. Perfecto para ensaladas.',
      en: 'Traditional Moldovan branza cheese, made with fresh sheep milk. Perfect for salads.',
      ro: 'Brânză tradițională moldovenească, făcută din lapte proaspăt de oaie. Perfectă pentru salate.',
      ru: 'Традиционный молдавский сыр брынза, изготовленный из свежего овечьего молока. Идеален для салатов.'
    },
    priceEur: 12.75,
    compareAtPriceEur: null,
    weightKg: 0.5,
    stockQuantity: 25,
    lowStockThreshold: 8,
    categoryId: 4, // Dairy
    isActive: true,
    images: [
      'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=400'
    ],
    attributes: {
      weight_g: 500,
      origin: 'Moldova'
    }
  },
  {
    nameTranslations: {
      es: 'Mermelada de Cereza Casera',
      en: 'Homemade Cherry Jam',
      ro: 'Gem de Cireșe de Casă',
      ru: 'Домашнее Вишневое Варенье'
    },
    sku: 'CJ-004',
    descriptionTranslations: {
      es: 'Mermelada artesanal de cerezas moldavas, sin conservantes artificiales. Ideal para desayunos.',
      en: 'Artisanal jam made from Moldovan cherries, without artificial preservatives. Ideal for breakfast.',
      ro: 'Gem artizanal făcut din cireșe moldovenești, fără conservanți artificiali. Ideal pentru micul dejun.',
      ru: 'Ремесленное варенье из молдавской вишни, без искусственных консервантов. Идеально для завтрака.'
    },
    priceEur: 8.90,
    compareAtPriceEur: null,
    weightKg: 0.45,
    stockQuantity: 60,
    lowStockThreshold: 15,
    categoryId: 3, // Preserves
    isActive: true,
    images: [
      'https://images.unsplash.com/photo-1571197119282-bf249d5c4ace?w=400'
    ],
    attributes: {
      weight_g: 450,
      origin: 'Moldova'
    }
  },
  {
    nameTranslations: {
      es: 'Miel de Acacia Pura',
      en: 'Pure Acacia Honey',
      ro: 'Miere de Acacia Pură',
      ru: 'Чистый Акациевый Мед'
    },
    sku: 'AH-005',
    descriptionTranslations: {
      es: 'Miel pura de acacia de los campos moldavos, cristalización lenta y sabor delicado.',
      en: 'Pure acacia honey from Moldovan fields, slow crystallization and delicate flavor.',
      ro: 'Miere pură de acacia din câmpurile moldovenești, cristalizare lentă și gust delicat.',
      ru: 'Чистый акациевый мед с молдавских полей, медленная кристаллизация и деликатный вкус.'
    },
    priceEur: 15.60,
    compareAtPriceEur: null,
    weightKg: 0.5,
    stockQuantity: 40,
    lowStockThreshold: 10,
    categoryId: 2, // Traditional Foods
    isActive: true,
    images: [
      'https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=400'
    ],
    attributes: {
      weight_g: 500,
      origin: 'Moldova'
    }
  },
  {
    nameTranslations: {
      es: 'Salchicha Ahumada Moldava',
      en: 'Moldovan Smoked Sausage',
      ro: 'Cârnat Afumat Moldovenesc',
      ru: 'Молдавская Копченая Колбаса'
    },
    sku: 'MS-006',
    descriptionTranslations: {
      es: 'Salchicha tradicional moldava ahumada con especias locales. Receta familiar transmitida por generaciones.',
      en: 'Traditional Moldovan sausage smoked with local spices. Family recipe passed down through generations.',
      ro: 'Cârnat tradițional moldovenesc afumat cu condimente locale. Rețetă de familie transmisă prin generații.',
      ru: 'Традиционная молдавская колбаса, копченая с местными специями. Семейный рецепт, передаваемый из поколения в поколение.'
    },
    priceEur: 18.45,
    compareAtPriceEur: null,
    weightKg: 0.6,
    stockQuantity: 20,
    lowStockThreshold: 5,
    categoryId: 2, // Traditional Foods
    isActive: true,
    images: [
      'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400'
    ],
    attributes: {
      weight_g: 600,
      origin: 'Moldova'
    }
  }
]

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...')
    
    const db = useDB()

    // Insert categories
    console.log('📂 Seeding categories...')
    const insertedCategories = await db.insert(tables.categories).values(sampleCategories).returning()
    console.log(`✅ Inserted ${insertedCategories.length} categories`)

    // Update product category IDs based on inserted categories
    const updatedProducts = sampleProducts.map(product => {
      let categoryId = 1 // Default to first category
      
      // Find the appropriate category based on SKU prefix
      if (product.sku.startsWith('WR') || product.sku.startsWith('MR')) {
        categoryId = insertedCategories.find(c => c.slug === 'wines')?.id || 1
      } else if (product.sku.startsWith('BC')) {
        categoryId = insertedCategories.find(c => c.slug === 'dairy')?.id || 1
      } else if (product.sku.startsWith('CJ')) {
        categoryId = insertedCategories.find(c => c.slug === 'preserves')?.id || 1
      } else {
        categoryId = insertedCategories.find(c => c.slug === 'traditional-foods')?.id || 1
      }
      
      return { ...product, categoryId }
    })

    // Insert products
    console.log('🍷 Seeding products...')
    const insertedProducts = await db.insert(tables.products).values(updatedProducts).returning()
    console.log(`✅ Inserted ${insertedProducts.length} products`)

    console.log('🎉 Database seeding completed successfully!')
    
    return {
      categories: insertedCategories.length,
      products: insertedProducts.length
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}