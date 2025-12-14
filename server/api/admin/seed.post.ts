import { serverSupabaseClient } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/adminAuth'

// Sample data for seeding
const sampleCategories = [
  {
    slug: 'wines',
    name_translations: {
      es: 'Vinos',
      en: 'Wines',
      ro: 'Vinuri',
      ru: 'Вина',
    },
    description_translations: {
      es: 'Vinos premium de Moldova con denominación de origen',
      en: 'Premium wines from Moldova with designation of origin',
      ro: 'Vinuri premium din Moldova cu denumire de origine',
      ru: 'Премиальные вина из Молдовы с наименованием по происхождению',
    },
    image_url: '/categories/wines.jpg',
    sort_order: 1,
    parent_id: null,
  },
  {
    slug: 'red-wines',
    name_translations: {
      es: 'Vinos Tintos',
      en: 'Red Wines',
      ro: 'Vinuri Roșii',
      ru: 'Красные Вина',
    },
    description_translations: {
      es: 'Vinos tintos robustos y elegantes',
      en: 'Robust and elegant red wines',
      ro: 'Vinuri roșii robuste și elegante',
      ru: 'Крепкие и элегантные красные вина',
    },
    image_url: '/categories/red-wines.jpg',
    sort_order: 1,
    parent_slug: 'wines',
  },
  {
    slug: 'white-wines',
    name_translations: {
      es: 'Vinos Blancos',
      en: 'White Wines',
      ro: 'Vinuri Albe',
      ru: 'Белые Вина',
    },
    description_translations: {
      es: 'Vinos blancos frescos y aromáticos',
      en: 'Fresh and aromatic white wines',
      ro: 'Vinuri albe proaspete și aromatice',
      ru: 'Свежие и ароматные белые вина',
    },
    image_url: '/categories/white-wines.jpg',
    sort_order: 2,
    parent_slug: 'wines',
  },
  {
    slug: 'food',
    name_translations: {
      es: 'Alimentos',
      en: 'Food',
      ro: 'Alimente',
      ru: 'Продукты',
    },
    description_translations: {
      es: 'Productos alimentarios tradicionales de Moldova',
      en: 'Traditional food products from Moldova',
      ro: 'Produse alimentare tradiționale din Moldova',
      ru: 'Традиционные продукты питания из Молдовы',
    },
    image_url: '/categories/food.jpg',
    sort_order: 2,
    parent_id: null,
  },
  {
    slug: 'preserves',
    name_translations: {
      es: 'Conservas',
      en: 'Preserves',
      ro: 'Conserve',
      ru: 'Консервы',
    },
    description_translations: {
      es: 'Conservas artesanales y mermeladas',
      en: 'Artisanal preserves and jams',
      ro: 'Conserve artizanale și dulcețuri',
      ru: 'Ремесленные консервы и джемы',
    },
    image_url: '/categories/preserves.jpg',
    sort_order: 1,
    parent_slug: 'food',
  },
]

const sampleProducts = [
  {
    sku: 'WINE-MALBEC-001',
    category_slug: 'red-wines',
    name_translations: {
      es: 'Purcari Malbec 2021',
      en: 'Purcari Malbec 2021',
      ro: 'Purcari Malbec 2021',
      ru: 'Пуркарь Мальбек 2021',
    },
    description_translations: {
      es: 'Vino tinto premium de Moldova con notas frutales intensas y taninos suaves. Perfecto para acompañar carnes rojas y quesos curados.',
      en: 'Premium red wine from Moldova with intense fruity notes and smooth tannins. Perfect to accompany red meats and aged cheeses.',
      ro: 'Vin roșu premium din Moldova cu note fructate intense și tanini netezi. Perfect pentru a însoți carnea roșie și brânzeturile maturate.',
      ru: 'Премиальное красное вино из Молдовы с интенсивными фруктовыми нотами и мягкими танинами. Идеально подходит к красному мясу и выдержанным сырам.',
    },
    price_eur: 24.99,
    compare_at_price_eur: 29.99,
    stock_quantity: 50,
    low_stock_threshold: 5,
    images: [
      {
        url: '/products/purcari-malbec-2021-1.jpg',
        alt_text: 'Purcari Malbec 2021 bottle front view',
        sort_order: 0,
        is_primary: true,
      },
      {
        url: '/products/purcari-malbec-2021-2.jpg',
        alt_text: 'Purcari Malbec 2021 bottle back label',
        sort_order: 1,
        is_primary: false,
      },
    ],
    attributes: {
      vintage: '2021',
      alcohol_content: '14.5%',
      region: 'Purcari',
      grape_variety: 'Malbec',
      serving_temperature: '16-18°C',
      bottle_size: '750ml',
    },
  },
  {
    sku: 'WINE-CHARDONNAY-001',
    category_slug: 'white-wines',
    name_translations: {
      es: 'Cricova Chardonnay Reserve 2022',
      en: 'Cricova Chardonnay Reserve 2022',
      ro: 'Cricova Chardonnay Reserve 2022',
      ru: 'Крикова Шардоне Резерв 2022',
    },
    description_translations: {
      es: 'Vino blanco elegante con crianza en barrica de roble. Notas de vainilla y frutas tropicales con un final persistente.',
      en: 'Elegant white wine aged in oak barrels. Notes of vanilla and tropical fruits with a persistent finish.',
      ro: 'Vin alb elegant îmbătrânit în butoaie de stejar. Note de vanilie și fructe tropicale cu un final persistent.',
      ru: 'Элегантное белое вино, выдержанное в дубовых бочках. Ноты ванили и тропических фруктов с продолжительным послевкусием.',
    },
    price_eur: 19.99,
    stock_quantity: 30,
    low_stock_threshold: 5,
    images: [
      {
        url: '/products/cricova-chardonnay-2022-1.jpg',
        alt_text: 'Cricova Chardonnay Reserve 2022 bottle',
        sort_order: 0,
        is_primary: true,
      },
    ],
    attributes: {
      vintage: '2022',
      alcohol_content: '13.5%',
      region: 'Cricova',
      grape_variety: 'Chardonnay',
      serving_temperature: '8-10°C',
      bottle_size: '750ml',
      aging: '6 months in oak',
    },
  },
  {
    sku: 'FOOD-JAM-001',
    category_slug: 'preserves',
    name_translations: {
      es: 'Mermelada de Ciruela Moldava',
      en: 'Moldovan Plum Jam',
      ro: 'Dulceață de Prune Moldovenești',
      ru: 'Молдавское сливовое варенье',
    },
    description_translations: {
      es: 'Mermelada artesanal elaborada con ciruelas moldavas seleccionadas. Sin conservantes artificiales, solo fruta natural y azúcar.',
      en: 'Artisanal jam made with selected Moldovan plums. No artificial preservatives, just natural fruit and sugar.',
      ro: 'Dulceață artizanală făcută din prune moldovenești selectate. Fără conservanți artificiali, doar fructe naturale și zahăr.',
      ru: 'Ремесленное варенье из отборных молдавских слив. Без искусственных консервантов, только натуральные фрукты и сахар.',
    },
    price_eur: 8.99,
    stock_quantity: 25,
    low_stock_threshold: 3,
    images: [
      {
        url: '/products/plum-jam-1.jpg',
        alt_text: 'Moldovan plum jam jar',
        sort_order: 0,
        is_primary: true,
      },
    ],
    attributes: {
      weight: '450g',
      ingredients: 'Plums, sugar',
      origin: 'Moldova',
      shelf_life: '24 months',
      storage: 'Cool, dry place',
    },
  },
  {
    sku: 'WINE-CABERNET-001',
    category_slug: 'red-wines',
    name_translations: {
      es: 'Château Vartely Cabernet Sauvignon 2020',
      en: 'Château Vartely Cabernet Sauvignon 2020',
      ro: 'Château Vartely Cabernet Sauvignon 2020',
      ru: 'Шато Вартели Каберне Совиньон 2020',
    },
    description_translations: {
      es: 'Vino tinto de cuerpo completo con aromas a cassis y especias. Ideal para ocasiones especiales y maridajes gourmet.',
      en: 'Full-bodied red wine with cassis and spice aromas. Ideal for special occasions and gourmet pairings.',
      ro: 'Vin roșu cu corp plin cu arome de coacăze negre și condimente. Ideal pentru ocazii speciale și combinații gourmet.',
      ru: 'Полнотелое красное вино с ароматами черной смородины и специй. Идеально для особых случаев и гурманских сочетаний.',
    },
    price_eur: 32.99,
    stock_quantity: 15,
    low_stock_threshold: 5,
    images: [
      {
        url: '/products/vartely-cabernet-2020-1.jpg',
        alt_text: 'Château Vartely Cabernet Sauvignon 2020 bottle',
        sort_order: 0,
        is_primary: true,
      },
    ],
    attributes: {
      vintage: '2020',
      alcohol_content: '14.8%',
      region: 'Orhei',
      grape_variety: 'Cabernet Sauvignon',
      serving_temperature: '16-18°C',
      bottle_size: '750ml',
      aging: '12 months in French oak',
    },
  },
  {
    sku: 'WINE-SAUVIGNON-001',
    category_slug: 'white-wines',
    name_translations: {
      es: 'Asconi Sauvignon Blanc 2023',
      en: 'Asconi Sauvignon Blanc 2023',
      ro: 'Asconi Sauvignon Blanc 2023',
      ru: 'Аскони Совиньон Блан 2023',
    },
    description_translations: {
      es: 'Vino blanco fresco y vibrante con notas herbáceas y cítricas. Perfecto como aperitivo o con mariscos.',
      en: 'Fresh and vibrant white wine with herbaceous and citrus notes. Perfect as an aperitif or with seafood.',
      ro: 'Vin alb proaspăt și vibrant cu note erbacee și citrice. Perfect ca aperitiv sau cu fructe de mare.',
      ru: 'Свежее и яркое белое вино с травянистыми и цитрусовыми нотами. Идеально в качестве аперитива или с морепродуктами.',
    },
    price_eur: 16.99,
    stock_quantity: 40,
    low_stock_threshold: 5,
    images: [
      {
        url: '/products/asconi-sauvignon-2023-1.jpg',
        alt_text: 'Asconi Sauvignon Blanc 2023 bottle',
        sort_order: 0,
        is_primary: true,
      },
    ],
    attributes: {
      vintage: '2023',
      alcohol_content: '12.5%',
      region: 'Puhoi',
      grape_variety: 'Sauvignon Blanc',
      serving_temperature: '6-8°C',
      bottle_size: '750ml',
    },
  },
]

export default defineEventHandler(async (event) => {
  try {
    await requireAdminRole(event)
    const supabase = await serverSupabaseClient(event)

    // Check if this is a POST request
    if (getMethod(event) !== 'POST') {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method not allowed',
      })
    }

    const body = await readBody(event)
    const { force = false } = body

    // Check if data already exists (unless force is true)
    if (!force) {
      const { count: categoryCount } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })

      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      if ((categoryCount && categoryCount > 0) || (productCount && productCount > 0)) {
        return {
          message: 'Database already contains data. Use force=true to override.',
          existing: {
            categories: categoryCount || 0,
            products: productCount || 0,
          },
        }
      }
    }

    const results: {
      categories: any[]
      products: any[]
      errors: string[]
    } = {
      categories: [],
      products: [],
      errors: [],
    }

    // Insert categories first
    for (const categoryData of sampleCategories) {
      try {
        let parentId = null

        // If this category has a parent, find the parent ID
        if (categoryData.parent_slug) {
          const { data: parentCategory } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', categoryData.parent_slug)
            .single()

          if (parentCategory) {
            parentId = parentCategory.id
          }
        }

        const { data: category, error } = await supabase
          .from('categories')
          .upsert({
            slug: categoryData.slug,
            parent_id: parentId,
            name_translations: categoryData.name_translations,
            description_translations: categoryData.description_translations,
            image_url: categoryData.image_url,
            sort_order: categoryData.sort_order,
            is_active: true,
          })
          .select()
          .single()

        if (error) {
          results.errors.push(`Category ${categoryData.slug}: ${error.message}`)
        }
        else if (category) {
          results.categories.push(category)
        }
      }
      catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        results.errors.push(`Category ${categoryData.slug}: ${errorMessage}`)
      }
    }

    // Insert products
    for (const productData of sampleProducts) {
      try {
        // Find category ID by slug
        const { data: category } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', productData.category_slug)
          .single()

        if (!category) {
          results.errors.push(`Product ${productData.sku}: Category ${productData.category_slug} not found`)
          continue
        }

        const { data: product, error } = await supabase
          .from('products')
          .upsert({
            sku: productData.sku,
            category_id: category.id,
            name_translations: productData.name_translations,
            description_translations: productData.description_translations,
            price_eur: productData.price_eur,
            compare_at_price_eur: productData.compare_at_price_eur,
            stock_quantity: productData.stock_quantity,
            low_stock_threshold: productData.low_stock_threshold,
            images: productData.images,
            attributes: productData.attributes,
            is_active: true,
          })
          .select()
          .single()

        if (error) {
          results.errors.push(`Product ${productData.sku}: ${error.message}`)
        }
        else if (product) {
          results.products.push(product)
        }
      }
      catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        results.errors.push(`Product ${productData.sku}: ${errorMessage}`)
      }
    }

    return {
      message: 'Database seeding completed',
      results: {
        categoriesCreated: results.categories.length,
        productsCreated: results.products.length,
        errors: results.errors,
      },
      data: {
        categories: results.categories,
        products: results.products,
      },
    }
  }
  catch (error: any) {
    console.error('Seed API error:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error during seeding',
    })
  }
})
