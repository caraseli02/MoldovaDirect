/**
 * i18n Locale Tests
 *
 * Verifies that all locale files have complete translations
 * by comparing them against the English (en) reference locale.
 */

import { describe, expect, it } from 'vitest'
import en from '../../../i18n/locales/en.json'
import es from '../../../i18n/locales/es.json'
import ro from '../../../i18n/locales/ro.json'
import ru from '../../../i18n/locales/ru.json'

type TranslationObject = Record<string, string | TranslationObject>

/**
 * Recursively get all translation keys from an object
 */
function getAllKeys(obj: TranslationObject, prefix = ''): string[] {
  let keys: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null) {
      keys = keys.concat(getAllKeys(value as TranslationObject, fullKey))
    }
    else {
      keys.push(fullKey)
    }
  }
  return keys
}

/**
 * Get a nested value from an object using dot notation
 */
function getNestedValue(obj: TranslationObject, path: string): string | TranslationObject | undefined {
  return path.split('.').reduce<TranslationObject | string | undefined>(
    (o, k) => (o && typeof o === 'object' ? (o as TranslationObject)[k] : undefined),
    obj,
  )
}

/**
 * Find missing keys in target locale compared to reference
 */
function findMissingKeys(reference: TranslationObject, target: TranslationObject): string[] {
  const refKeys = getAllKeys(reference)
  return refKeys.filter(k => getNestedValue(target, k) === undefined)
}

describe('i18n Locales Completeness', () => {
  const enKeys = getAllKeys(en as TranslationObject)

  it('English (en) should be the reference with all keys', () => {
    expect(enKeys.length).toBeGreaterThan(2000)
  })

  it('Spanish (es) should have all English keys', () => {
    const missing = findMissingKeys(en as TranslationObject, es as TranslationObject)

    if (missing.length > 0) {
      console.log(`Spanish missing ${missing.length} keys:`)
      missing.slice(0, 10).forEach(k => console.log(`  ${k}`))
      if (missing.length > 10)
        console.log(`  ... and ${missing.length - 10} more`)
    }

    expect(missing.length).toBe(0)
  })

  it('Romanian (ro) should have all English keys', () => {
    const missing = findMissingKeys(en as TranslationObject, ro as TranslationObject)

    if (missing.length > 0) {
      console.log(`Romanian missing ${missing.length} keys:`)
      missing.slice(0, 10).forEach(k => console.log(`  ${k}`))
      if (missing.length > 10)
        console.log(`  ... and ${missing.length - 10} more`)
    }

    expect(missing.length).toBe(0)
  })

  it('Russian (ru) should have all English keys', () => {
    const missing = findMissingKeys(en as TranslationObject, ru as TranslationObject)

    if (missing.length > 0) {
      console.log(`Russian missing ${missing.length} keys:`)
      missing.slice(0, 10).forEach(k => console.log(`  ${k}`))
      if (missing.length > 10)
        console.log(`  ... and ${missing.length - 10} more`)
    }

    expect(missing.length).toBe(0)
  })
})

describe('i18n Locale Structure', () => {
  it('should not have empty translation values', () => {
    function findEmptyValues(obj: TranslationObject, prefix = ''): string[] {
      const empty: string[] = []
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key
        if (typeof value === 'string' && value.trim() === '') {
          empty.push(fullKey)
        }
        else if (typeof value === 'object' && value !== null) {
          empty.push(...findEmptyValues(value as TranslationObject, fullKey))
        }
      }
      return empty
    }

    const locales = { en, es, ro, ru }
    for (const [name, locale] of Object.entries(locales)) {
      const empty = findEmptyValues(locale as TranslationObject)
      if (empty.length > 0) {
        console.log(`${name} has ${empty.length} empty values:`, empty.slice(0, 5))
      }
      expect(empty.length, `${name} should not have empty values`).toBe(0)
    }
  })
})
