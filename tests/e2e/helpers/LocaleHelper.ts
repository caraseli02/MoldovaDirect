/**
 * Helper: Locale and Internationalization
 *
 * Provides utilities for testing multi-language functionality
 */

import type { Page } from '@playwright/test'

type Locale = 'es' | 'en' | 'ro' | 'ru'

interface ExpressCheckoutTranslations {
  title: string
  description: string
  useButton: string
  editButton: string
  countdownTitle: string
  countdownMessage: string
  cancelButton: string
  preferredShipping: string
  addressLoaded: string
  selectShipping: string
}

export class LocaleHelper {
  readonly page: Page
  readonly locale: Locale

  // Translation dictionaries
  private static readonly translations: Record<Locale, ExpressCheckoutTranslations> = {
    es: {
      title: 'Pago Express Disponible',
      description: 'Usa tu dirección guardada y preferencias para una experiencia de pago más rápida',
      useButton: 'Usar Pago Express',
      editButton: 'Editar Detalles',
      countdownTitle: 'Pago express activado',
      countdownMessage: 'Redirigiendo al pago en',
      cancelButton: 'Espera, déjame revisar',
      preferredShipping: 'Envío preferido',
      addressLoaded: 'Dirección cargada',
      selectShipping: 'Por favor selecciona un método de envío',
    },
    en: {
      title: 'Express Checkout Available',
      description: 'Use your saved address and preferences for a faster checkout experience',
      useButton: 'Use Express Checkout',
      editButton: 'Edit Details',
      countdownTitle: 'Express checkout activated',
      countdownMessage: 'Redirecting to payment in',
      cancelButton: 'Wait, let me review',
      preferredShipping: 'Preferred shipping',
      addressLoaded: 'Address loaded',
      selectShipping: 'Please select a shipping method',
    },
    ro: {
      title: 'Plată Expresă Disponibilă',
      description: 'Folosește adresa și preferințele salvate pentru o experiență de plată mai rapidă',
      useButton: 'Folosește Plată Expresă',
      editButton: 'Editează Detalii',
      countdownTitle: 'Plată expresă activată',
      countdownMessage: 'Redirecționare către plată în',
      cancelButton: 'Așteaptă, vreau să revizuiesc',
      preferredShipping: 'Transport preferat',
      addressLoaded: 'Adresa încărcată',
      selectShipping: 'Te rugăm să selectezi o metodă de transport',
    },
    ru: {
      title: 'Экспресс-оплата Доступна',
      description: 'Используйте сохраненный адрес и настройки для быстрой оплаты',
      useButton: 'Использовать Экспресс-оплату',
      editButton: 'Редактировать Детали',
      countdownTitle: 'Экспресс-оплата активирована',
      countdownMessage: 'Перенаправление к оплате через',
      cancelButton: 'Подождите, я хочу проверить',
      preferredShipping: 'Предпочитаемая доставка',
      addressLoaded: 'Адрес загружен',
      selectShipping: 'Пожалуйста, выберите способ доставки',
    },
  }

  constructor(page: Page, locale: Locale) {
    this.page = page
    this.locale = locale
  }

  /**
   * Set the locale for the session
   */
  async setLocale(): Promise<void> {
    // Navigate to home page with locale prefix
    await this.page.goto(`/${this.locale}`)
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Get express checkout translations for current locale
   */
  getExpressCheckoutTranslations(): ExpressCheckoutTranslations {
    return LocaleHelper.translations[this.locale]
  }

  /**
   * Get translation for a specific key
   */
  getTranslation(key: keyof ExpressCheckoutTranslations): string {
    return LocaleHelper.translations[this.locale][key]
  }

  /**
   * Verify page is in expected locale
   */
  async verifyLocale(): Promise<boolean> {
    const url = this.page.url()
    return url.includes(`/${this.locale}`)
  }

  /**
   * Switch to different locale
   */
  async switchLocale(newLocale: Locale): Promise<void> {
    const localeSwitcher = this.page.locator('[class*="locale"], [class*="language"]')

    if (await localeSwitcher.isVisible()) {
      await localeSwitcher.click()
      const localeOption = this.page.locator(`text=/^${newLocale.toUpperCase()}$/i`)
      await localeOption.click()
    }
    else {
      // Fallback: navigate directly
      const currentPath = this.page.url().replace(/\/(es|en|ro|ru)/, '')
      await this.page.goto(`/${newLocale}${currentPath}`)
    }

    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Get all supported locales
   */
  static getSupportedLocales(): Locale[] {
    return ['es', 'en', 'ro', 'ru']
  }

  /**
   * Format date for locale
   */
  formatDate(date: Date): string {
    const localeMap: Record<Locale, string> = {
      es: 'es-ES',
      en: 'en-US',
      ro: 'ro-RO',
      ru: 'ru-RU',
    }

    return date.toLocaleDateString(localeMap[this.locale])
  }

  /**
   * Format currency for locale
   */
  formatCurrency(amount: number): string {
    const localeMap: Record<Locale, string> = {
      es: 'es-ES',
      en: 'en-US',
      ro: 'ro-RO',
      ru: 'ru-RU',
    }

    return new Intl.NumberFormat(localeMap[this.locale], {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }
}
