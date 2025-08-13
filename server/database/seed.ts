import { db } from './connection'
import { categories, products, productImages } from './schema'

// Sample categories data
const sampleCategories = [
  {
    name: {
      es: 'Vinos',
      en: 'Wines',
      ro: 'Vinuri',
      ru: 'Вина'
    },
    slug: 'wines',
    description: {
      es: 'Vinos premium de Moldavia, conocidos por su calidad excepcional',
      en: 'Premium wines from Moldova, known for their exceptional quality',
      ro: 'Vinuri premium din Moldova, cunoscute pentru calitatea lor excepțională',
      ru: 'Премиальные вина из Молдовы, известные своим исключительным качеством'
    },
    sortOrder: 1,
    isActive: true
  },
  {
    name: {
      es: 'Alimentos Tradicionales',
      en: 'Traditional Foods',
      ro: 'Alimente Tradiționale',
      ru: 'Традиционная Еда'
    },
    slug: 'traditional-foods',
    description: {
      es: 'Productos alimenticios tradicionales moldavos',
      en: 'Traditional Moldovan food products',
      ro: 'Produse alimentare tradiționale moldovenești',
      ru: 'Традиционные молдавские продукты питания'
    },
    sortOrder: 2,
    isActive: true
  },
  {
    name: {
      es: 'Conservas',
      en: 'Preserves',
      ro: 'Conserve',
      ru: 'Консервы'
    },
    slug: 'preserves',
    description: {
      es: 'Conservas caseras y mermeladas artesanales',
      en: 'Homemade preserves and artisanal jams',
      ro: 'Conserve de casă și gemuri artizanale',
      ru: 'Домашние консервы и ремесленные джемы'
    },
    sortOrder: 3,
    isActive: true
  },
  {
    name: {
      es: 'Lácteos',
      en: 'Dairy Products',
      ro: 'Produse Lactate',
      ru: 'Молочные Продукты'
    },
    slug: 'dairy',
    description: {
      es: 'Quesos y productos lácteos moldavos',
      en: 'Moldovan cheeses and dairy products',
      ro: 'Brânzeturi și produse lactate moldovenești',
      ru: 'Молдавские сыры и молочные продукты'
    },
    sortOrder: 4,
    isActive: true
  }
]

// Sample products data
const sampleProducts = [
  {
    name: {
      es: 'Vino Riesling Blanco',
      en: 'White Riesling Wine',
      ro: 'Vin Riesling Alb',
      ru: 'Белое Вино Рислинг'
    },
    slug: 'white-riesling-wine',
    description: {
      es: 'Un vino blanco seco con aroma floral y sabor afrutado. Perfecto para acompañar pescados y mariscos.',
      en: 'A dry white wine with floral aroma and fruity taste. Perfect for pairing with fish and seafood.',
      ro: 'Un vin alb sec cu aromă florală și gust fructat. Perfect pentru a fi acompaniat cu pește și fructe de mare.',
      ru: 'Сухое белое вино с цветочным ароматом и фруктовым вкусом. Идеально подходит к рыбе и морепродуктам.'
    },
    shortDescription: {
      es: 'Vino blanco seco con notas florales',
      en: 'Dry white wine with floral notes',
      ro: 'Vin alb sec cu note florale',
      ru: 'Сухое белое вино с цветочными нотами'
    },
    price: '24.99',
    comparePrice: '29.99',
    sku: 'WR-001',
    barcode: '1234567890123',
    weight: '1.2',
    stockQuantity: 50,
    minStockLevel: 10,
    categoryId: 1, // Will be updated after category insertion
    isActive: true,
    isFeatured: true,
    metaTitle: {
      es: 'Vino Riesling Blanco - Calidad Premium Moldava',
      en: 'White Riesling Wine - Premium Moldovan Quality',
      ro: 'Vin Riesling Alb - Calitate Premium Moldovenească',
      ru: 'Белое Вино Рислинг - Премиальное Молдавское Качество'
    },
    metaDescription: {
      es: 'Descubre nuestro vino Riesling blanco premium de Moldavia. Perfecto para cenas especiales.',
      en: 'Discover our premium white Riesling wine from Moldova. Perfect for special dinners.',
      ro: 'Descoperă vinul nostru Riesling alb premium din Moldova. Perfect pentru cine speciale.',
      ru: 'Откройте для себя наше премиальное белое вино Рислинг из Молдовы. Идеально для особых ужинов.'
    },
    tags: ['vino', 'blanco', 'seco', 'premium'],
    origin: 'Moldova',
    alcoholContent: '12.5',
    volume: '750'
  },
  {
    name: {
      es: 'Merlot Tinto Reserva',
      en: 'Merlot Red Reserve',
      ro: 'Merlot Roșu Rezervă',
      ru: 'Мерло Красное Резерв'
    },
    slug: 'merlot-red-reserve',
    description: {
      es: 'Vino tinto con cuerpo y sabor intenso, envejecido en barricas de roble. Ideal para carnes rojas.',
      en: 'Full-bodied red wine with intense flavor, aged in oak barrels. Ideal for red meats.',
      ro: 'Vin roșu cu corp și gust intens, îmbătrânit în butoaie de stejar. Ideal pentru carne roșie.',
      ru: 'Полнотелое красное вино с интенсивным вкусом, выдержанное в дубовых бочках. Идеально для красного мяса.'
    },
    shortDescription: {
      es: 'Vino tinto reserva envejecido en roble',
      en: 'Reserve red wine aged in oak',
      ro: 'Vin roșu rezervă îmbătrânit în stejar',
      ru: 'Резервное красное вино, выдержанное в дубе'
    },
    price: '32.50',
    sku: 'MR-002',
    weight: '1.2',
    stockQuantity: 35,
    minStockLevel: 5,
    categoryId: 1,
    isActive: true,
    isFeatured: false,
    tags: ['vino', 'tinto', 'reserva', 'roble'],
    origin: 'Moldova',
    alcoholContent: '14.0',
    volume: '750'
  },
  {
    name: {
      es: 'Queso Branza Tradicional',
      en: 'Traditional Branza Cheese',
      ro: 'Brânză Tradițională',
      ru: 'Традиционный Сыр Брынза'
    },
    slug: 'traditional-branza-cheese',
    description: {
      es: 'Queso branza tradicional moldavo, elaborado con leche fresca de oveja. Perfecto para ensaladas.',
      en: 'Traditional Moldovan branza cheese, made with fresh sheep milk. Perfect for salads.',
      ro: 'Brânză tradițională moldovenească, făcută din lapte proaspăt de oaie. Perfectă pentru salate.',
      ru: 'Традиционный молдавский сыр брынза, изготовленный из свежего овечьего молока. Идеален для салатов.'
    },
    shortDescription: {
      es: 'Queso fresco de leche de oveja',
      en: 'Fresh sheep milk cheese',
      ro: 'Brânză proaspătă din lapte de oaie',
      ru: 'Свежий сыр из овечьего молока'
    },
    price: '12.75',
    sku: 'BC-003',
    weight: '0.5',
    stockQuantity: 25,
    minStockLevel: 8,
    categoryId: 4, // Dairy
    isActive: true,
    isFeatured: true,
    tags: ['queso', 'lacteo', 'oveja', 'tradicional'],
    origin: 'Moldova',
    volume: '500'
  },
  {
    name: {
      es: 'Mermelada de Cereza Casera',
      en: 'Homemade Cherry Jam',
      ro: 'Gem de Cireșe de Casă',
      ru: 'Домашнее Вишневое Варенье'
    },
    slug: 'homemade-cherry-jam',
    description: {
      es: 'Mermelada artesanal de cerezas moldavas, sin conservantes artificiales. Ideal para desayunos.',
      en: 'Artisanal jam made from Moldovan cherries, without artificial preservatives. Ideal for breakfast.',
      ro: 'Gem artizanal făcut din cireșe moldovenești, fără conservanți artificiali. Ideal pentru micul dejun.',
      ru: 'Ремесленное варенье из молдавской вишни, без искусственных консервантов. Идеально для завтрака.'
    },
    shortDescription: {
      es: 'Mermelada artesanal sin conservantes',
      en: 'Artisanal jam without preservatives',
      ro: 'Gem artizanal fără conservanți',
      ru: 'Ремесленное варенье без консервантов'
    },
    price: '8.90',
    sku: 'CJ-004',
    weight: '0.45',
    stockQuantity: 60,
    minStockLevel: 15,
    categoryId: 3, // Preserves
    isActive: true,
    isFeatured: false,
    tags: ['mermelada', 'cereza', 'casero', 'artesanal'],
    origin: 'Moldova',
    volume: '450'
  },
  {
    name: {
      es: 'Miel de Acacia Pura',
      en: 'Pure Acacia Honey',
      ro: 'Miere de Acacia Pură',
      ru: 'Чистый Акациевый Мед'
    },
    slug: 'pure-acacia-honey',
    description: {
      es: 'Miel pura de acacia de los campos moldavos, cristalización lenta y sabor delicado.',
      en: 'Pure acacia honey from Moldovan fields, slow crystallization and delicate flavor.',
      ro: 'Miere pură de acacia din câmpurile moldovenești, cristalizare lentă și gust delicat.',
      ru: 'Чистый акациевый мед с молдавских полей, медленная кристаллизация и деликатный вкус.'
    },
    shortDescription: {
      es: 'Miel pura con cristalización lenta',
      en: 'Pure honey with slow crystallization',
      ro: 'Miere pură cu cristalizare lentă',
      ru: 'Чистый мед с медленной кристаллизацией'
    },
    price: '15.60',
    sku: 'AH-005',
    weight: '0.5',
    stockQuantity: 40,
    minStockLevel: 10,
    categoryId: 2, // Traditional Foods
    isActive: true,
    isFeatured: true,
    tags: ['miel', 'acacia', 'natural', 'puro'],
    origin: 'Moldova',
    volume: '500'
  },
  {
    name: {
      es: 'Salchicha Ahumada Moldava',
      en: 'Moldovan Smoked Sausage',
      ro: 'Cârnat Afumat Moldovenesc',
      ru: 'Молдавская Копченая Колбаса'
    },
    slug: 'moldovan-smoked-sausage',
    description: {
      es: 'Salchicha tradicional moldava ahumada con especias locales. Receta familiar transmitida por generaciones.',
      en: 'Traditional Moldovan sausage smoked with local spices. Family recipe passed down through generations.',
      ro: 'Cârnat tradițional moldovenesc afumat cu condimente locale. Rețetă de familie transmisă prin generații.',
      ru: 'Традиционная молдавская колбаса, копченая с местными специями. Семейный рецепт, передаваемый из поколения в поколение.'
    },
    shortDescription: {
      es: 'Salchicha ahumada con especias tradicionales',
      en: 'Smoked sausage with traditional spices',
      ro: 'Cârnat afumat cu condimente tradiționale',
      ru: 'Копченая колбаса с традиционными специями'
    },
    price: '18.45',
    sku: 'MS-006',
    weight: '0.6',
    stockQuantity: 20,
    minStockLevel: 5,
    categoryId: 2, // Traditional Foods
    isActive: true,
    isFeatured: false,
    tags: ['salchicha', 'ahumado', 'tradicional', 'especias'],
    origin: 'Moldova',
    volume: '600'
  }
]

// Sample product images
const sampleImages = [
  // Riesling Wine Images
  { productSlug: 'white-riesling-wine', url: 'https://images.unsplash.com/photo-1506377872008-6645d6f2b8d7?w=400', isPrimary: true, sortOrder: 1 },
  { productSlug: 'white-riesling-wine', url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400', isPrimary: false, sortOrder: 2 },
  
  // Merlot Wine Images
  { productSlug: 'merlot-red-reserve', url: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400', isPrimary: true, sortOrder: 1 },
  { productSlug: 'merlot-red-reserve', url: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400', isPrimary: false, sortOrder: 2 },
  
  // Cheese Images
  { productSlug: 'traditional-branza-cheese', url: 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=400', isPrimary: true, sortOrder: 1 },
  
  // Cherry Jam Images
  { productSlug: 'homemade-cherry-jam', url: 'https://images.unsplash.com/photo-1571197119282-bf249d5c4ace?w=400', isPrimary: true, sortOrder: 1 },
  
  // Honey Images
  { productSlug: 'pure-acacia-honey', url: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=400', isPrimary: true, sortOrder: 1 },
  
  // Sausage Images
  { productSlug: 'moldovan-smoked-sausage', url: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400', isPrimary: true, sortOrder: 1 }
]

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...')

    // Insert categories
    console.log('📂 Seeding categories...')
    const insertedCategories = await db.insert(categories).values(sampleCategories).returning()
    console.log(`✅ Inserted ${insertedCategories.length} categories`)

    // Update product category IDs
    const updatedProducts = sampleProducts.map(product => {
      let categoryId = 1 // Default to first category
      
      if (product.tags.includes('vino')) {
        categoryId = insertedCategories.find(c => c.slug === 'wines')?.id || 1
      } else if (product.tags.includes('lacteo') || product.tags.includes('queso')) {
        categoryId = insertedCategories.find(c => c.slug === 'dairy')?.id || 1
      } else if (product.tags.includes('mermelada')) {
        categoryId = insertedCategories.find(c => c.slug === 'preserves')?.id || 1
      } else {
        categoryId = insertedCategories.find(c => c.slug === 'traditional-foods')?.id || 1
      }
      
      return { ...product, categoryId }
    })

    // Insert products
    console.log('🍷 Seeding products...')
    const insertedProducts = await db.insert(products).values(updatedProducts).returning()
    console.log(`✅ Inserted ${insertedProducts.length} products`)

    // Insert product images
    console.log('🖼️ Seeding product images...')
    const productImages = sampleImages.map(img => {
      const product = insertedProducts.find(p => p.slug === img.productSlug)
      return {
        productId: product?.id || 1,
        url: img.url,
        altText: {
          es: `Imagen de ${product?.name?.es || 'producto'}`,
          en: `Image of ${product?.name?.en || 'product'}`,
          ro: `Imagine a ${product?.name?.ro || 'produs'}`,
          ru: `Изображение ${product?.name?.ru || 'продукт'}`
        },
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder
      }
    })

    await db.insert(productImages).values(productImages)
    console.log(`✅ Inserted ${productImages.length} product images`)

    console.log('🎉 Database seeding completed successfully!')
    
    return {
      categories: insertedCategories.length,
      products: insertedProducts.length,
      images: productImages.length
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}