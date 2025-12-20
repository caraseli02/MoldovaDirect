/**
 * Mock data generators for testing
 * Centralized mock data to be used across admin testing endpoints
 */

// User data
export const firstNames = [
  'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'James', 'Lisa',
  'Robert', 'Maria', 'William', 'Anna', 'Richard', 'Patricia', 'Thomas',
  'Elena', 'Alexandru', 'Natalia', 'Igor', 'Olga', 'Dmitri', 'Svetlana',
  'Andrei', 'Irina', 'Vasile', 'Tatiana', 'Sergiu', 'Ludmila', 'Victor', 'Marina',
]

export const lastNames = [
  'Smith', 'Johnson', 'Brown', 'Wilson', 'Taylor', 'Anderson', 'Martinez',
  'Garcia', 'Rodriguez', 'Popescu', 'Ionescu', 'Moraru', 'Popa', 'Rusu',
  'Volkov', 'Ivanov', 'Petrov', 'Sidorov', 'Kozlov', 'Novak', 'Moldovan',
  'Cojocaru', 'Stan', 'Lupu', 'Diaconu', 'Ciobanu',
]

export const cities = [
  'Chisinau', 'Balti', 'Tiraspol', 'Bender', 'Cahul', 'Soroca', 'Ungheni',
  'Orhei', 'Comrat', 'Edinet', 'Causeni', 'Drochia', 'Hincesti', 'Straseni',
  'Floresti', 'Singerei', 'Rezina', 'Calarasi', 'Nisporeni', 'Anenii Noi',
]

export const streets = [
  'Stefan cel Mare', 'Mihai Eminescu', 'Alexandru cel Bun', 'Decebal',
  'Columna', 'Puskin', 'Independentei', 'Bucuresti', '31 August', 'Izmail',
  'Dacia', 'Vasile Alecsandri', 'Cuza Voda', 'Maria Cibotari', 'Ismail',
]

export const languages = ['es', 'en', 'ro', 'ru']

export const phonePrefix = ['+373', '+40', '+34']

export const emailDomains = ['example.com', 'test.com', 'demo.com', 'mail.md', 'testuser.md']

// Product data
export const productTemplates = [
  {
    name: 'Traditional Wine',
    category: 'wine-spirits',
    priceMin: 15,
    priceMax: 50,
    descriptions: {
      en: 'Authentic Moldovan traditional wine',
      es: 'Auténtico vino tradicional moldavo',
      ro: 'Vin tradițional moldovenesc autentic',
      ru: 'Подлинное молдавское традиционное вино',
    },
  },
  {
    name: 'Handcrafted Pottery',
    category: 'pottery',
    priceMin: 25,
    priceMax: 100,
    descriptions: {
      en: 'Authentic Moldovan handcrafted pottery',
      es: 'Auténtica cerámica artesanal moldava',
      ro: 'Ceramică artizanală moldovenească autentică',
      ru: 'Подлинная молдавская керамика ручной работы',
    },
  },
  {
    name: 'Organic Honey',
    category: 'food',
    priceMin: 10,
    priceMax: 30,
    descriptions: {
      en: 'Authentic Moldovan organic honey',
      es: 'Auténtica miel orgánica moldava',
      ro: 'Miere organică moldovenească autentică',
      ru: 'Подлинный молдавский органический мед',
    },
  },
  {
    name: 'Wool Blanket',
    category: 'textiles',
    priceMin: 60,
    priceMax: 150,
    descriptions: {
      en: 'Authentic Moldovan wool blanket',
      es: 'Auténtica manta de lana moldava',
      ro: 'Pătură de lână moldovenească autentică',
      ru: 'Подлинное молдавское шерстяное одеяло',
    },
  },
  {
    name: 'Embroidered Shirt',
    category: 'textiles',
    priceMin: 40,
    priceMax: 90,
    descriptions: {
      en: 'Authentic Moldovan embroidered shirt',
      es: 'Auténtica camisa bordada moldava',
      ro: 'Cămașă brodată moldovenească autentică',
      ru: 'Подлинная молдавская вышитая рубашка',
    },
  },
  {
    name: 'Ceramic Vase',
    category: 'pottery',
    priceMin: 30,
    priceMax: 120,
    descriptions: {
      en: 'Authentic Moldovan ceramic vase',
      es: 'Auténtico jarrón de cerámica moldavo',
      ro: 'Vază de ceramică moldovenească autentică',
      ru: 'Подлинная молдавская керамическая ваза',
    },
  },
  {
    name: 'Plum Brandy',
    category: 'wine-spirits',
    priceMin: 20,
    priceMax: 60,
    descriptions: {
      en: 'Authentic Moldovan plum brandy',
      es: 'Auténtico aguardiente de ciruela moldavo',
      ro: 'Țuică de prune moldovenească autentică',
      ru: 'Подлинная молдавская сливовая водка',
    },
  },
  {
    name: 'Handwoven Carpet',
    category: 'textiles',
    priceMin: 100,
    priceMax: 300,
    descriptions: {
      en: 'Authentic Moldovan handwoven carpet',
      es: 'Auténtica alfombra tejida a mano moldava',
      ro: 'Covor țesut manual moldovenesc autentic',
      ru: 'Подлинный молдавский ковер ручной работы',
    },
  },
  {
    name: 'Traditional Cheese',
    category: 'food',
    priceMin: 12,
    priceMax: 35,
    descriptions: {
      en: 'Authentic Moldovan traditional cheese',
      es: 'Auténtico queso tradicional moldavo',
      ro: 'Brânză tradițională moldovenească autentică',
      ru: 'Подлинный молдавский традиционный сыр',
    },
  },
  {
    name: 'Painted Easter Eggs',
    category: 'handicrafts',
    priceMin: 15,
    priceMax: 45,
    descriptions: {
      en: 'Authentic Moldovan painted easter eggs',
      es: 'Auténticos huevos de pascua pintados moldavos',
      ro: 'Ouă de Paște pictate moldovenești autentice',
      ru: 'Подлинные молдавские расписные пасхальные яйца',
    },
  },
]

// Order data
export const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
export const paymentStatuses = ['paid', 'pending', 'failed']
export const paymentMethods = ['stripe', 'paypal', 'cash_on_delivery']

// Category data
export const categoryData = [
  {
    slug: 'wine-spirits',
    name_translations: {
      en: 'Wine & Spirits',
      es: 'Vinos y Licores',
      ro: 'Vin și Spirtoase',
      ru: 'Вино и Спиртные напитки',
    },
    description_translations: {
      en: 'Traditional Moldovan wines and spirits',
      es: 'Vinos y licores tradicionales de Moldavia',
      ro: 'Vinuri și băuturi spirtoase tradiționale moldovenești',
      ru: 'Традиционные молдавские вина и спиртные напитки',
    },
    is_active: true,
  },
  {
    slug: 'handicrafts',
    name_translations: {
      en: 'Handicrafts',
      es: 'Artesanías',
      ro: 'Artizanat',
      ru: 'Ремесла',
    },
    description_translations: {
      en: 'Handmade traditional crafts',
      es: 'Artesanías tradicionales hechas a mano',
      ro: 'Meșteșuguri tradiționale făcute manual',
      ru: 'Традиционные ремесла ручной работы',
    },
    is_active: true,
  },
  {
    slug: 'food',
    name_translations: {
      en: 'Food & Delicacies',
      es: 'Alimentos y Delicias',
      ro: 'Alimente și Delicatese',
      ru: 'Еда и Деликатесы',
    },
    description_translations: {
      en: 'Traditional Moldovan food products',
      es: 'Productos alimenticios tradicionales de Moldavia',
      ro: 'Produse alimentare tradiționale moldovenești',
      ru: 'Традиционные молдавские продукты питания',
    },
    is_active: true,
  },
  {
    slug: 'textiles',
    name_translations: {
      en: 'Textiles',
      es: 'Textiles',
      ro: 'Textile',
      ru: 'Текстиль',
    },
    description_translations: {
      en: 'Traditional clothing and fabrics',
      es: 'Ropa y telas tradicionales',
      ro: 'Îmbrăcăminte și țesături tradiționale',
      ru: 'Традиционная одежда и ткани',
    },
    is_active: true,
  },
  {
    slug: 'pottery',
    name_translations: {
      en: 'Pottery & Ceramics',
      es: 'Cerámica',
      ro: 'Ceramică',
      ru: 'Керамика',
    },
    description_translations: {
      en: 'Handcrafted pottery and ceramic items',
      es: 'Cerámica artesanal',
      ro: 'Ceramică artizanală',
      ru: 'Ручная керамика',
    },
    is_active: true,
  },
]

// Helper functions
export function randomItem<T>(array: T[]): T {
  const index = Math.floor(Math.random() * array.length)
  const item = array[index]
  if (item === undefined) {
    throw new Error('Array is empty or index out of bounds')
  }
  return item
}

export function generateEmail(firstName: string, lastName: string): string {
  const timestamp = Date.now().toString().slice(-4)
  const random = Math.floor(Math.random() * 1000)
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${timestamp}.${random}@${randomItem(emailDomains)}`
}

export function generatePhone(): string {
  const prefix = randomItem(phonePrefix)
  const number = Math.floor(Math.random() * 90000000) + 10000000
  return `${prefix}${number}`
}

export function generateAddress(type: 'billing' | 'shipping') {
  return {
    type,
    street: `${randomItem(streets)} ${Math.floor(Math.random() * 150) + 1}`,
    city: randomItem(cities),
    postal_code: `MD-${Math.floor(Math.random() * 9000) + 1000}`,
    province: randomItem(cities),
    country: 'MD',
    is_default: type === 'shipping',
  }
}

export function generateMockUser() {
  const firstName = randomItem(firstNames)
  const lastName = randomItem(lastNames)

  return {
    firstName,
    lastName,
    email: generateEmail(firstName, lastName),
    name: `${firstName} ${lastName}`,
    phone: generatePhone(),
    preferredLanguage: randomItem(languages),
  }
}

export function generatePassword(): string {
  return `TestPass${Math.floor(Math.random() * 10000)}!`
}
