/**
 * Page Object Model: Profile Page
 *
 * Handles all interactions on the user profile page (/account/profile)
 */

import { type Page, type Locator, expect } from '@playwright/test'

export class ProfilePage {
  readonly page: Page

  // Locators
  readonly title: Locator
  readonly avatarSection: Locator
  readonly cameraButton: Locator
  readonly profileCompletion: Locator
  readonly saveStatusIndicator: Locator
  readonly saveStatusText: Locator

  // Accordion Trigger Locators
  readonly personalInfoAccordion: Locator
  readonly preferencesAccordion: Locator
  readonly addressesAccordion: Locator
  readonly securityAccordion: Locator

  // Form Field Locators
  readonly nameInput: Locator
  readonly emailInput: Locator
  readonly phoneInput: Locator
  readonly languageSelect: Locator
  readonly currencySelect: Locator

  // Address Locators
  readonly addAddressButton: Locator
  readonly addressCards: Locator
  readonly addressNames: Locator
  readonly editAddressButtons: Locator
  readonly deleteAddressButtons: Locator

  // Address Modal Locators
  readonly addressDialog: Locator
  readonly addrFirstNameInput: Locator
  readonly addrLastNameInput: Locator
  readonly addrCompanyInput: Locator
  readonly addrStreetInput: Locator
  readonly addrCityInput: Locator
  readonly addrPostalCodeInput: Locator
  readonly addrProvinceInput: Locator
  readonly addrCountrySelect: Locator
  readonly addrPhoneInput: Locator
  readonly addrDefaultCheckbox: Locator
  readonly addrSaveButton: Locator
  readonly addrCancelButton: Locator

  // Delete Confirmation
  readonly deleteConfirmDialog: Locator
  readonly deleteConfirmButton: Locator

  constructor(page: Page) {
    this.page = page

    // Header & Section Locators
    this.title = page.locator('h1, h2').first()
    this.avatarSection = page.locator('.relative.group, [class*="avatar"]').first()
    this.cameraButton = page.locator('button[aria-label*="picture" i], button[aria-label*="foto" i], .absolute button').first()
    this.profileCompletion = page.locator('[data-testid="profile-completion"]')

    // Save state
    this.saveStatusIndicator = page.locator('[data-testid="save-status"]')
    this.saveStatusText = this.saveStatusIndicator.locator('span')

    // Accordions (using data-testid added in previous step)
    const accordionButtons = page.locator('main [data-testid="profile-accordion-button"]')
    this.personalInfoAccordion = accordionButtons.nth(0)
    this.preferencesAccordion = accordionButtons.nth(1)
    this.addressesAccordion = accordionButtons.nth(2)
    this.securityAccordion = accordionButtons.nth(3)

    // Form Fields
    this.nameInput = page.locator('input[id="name"]')
    this.emailInput = page.locator('input[id="email"]')
    this.phoneInput = page.locator('input[id="phone"]')
    this.languageSelect = page.locator('select[id="language"]')
    this.currencySelect = page.locator('select[id="currency"]')

    // Addresses (Scoped to accordion)
    const addressSection = page.locator('main').filter({ hasText: /direcciones|addresses/i })
    this.addAddressButton = addressSection.locator('button:has-text("Añadir dirección"), button:has-text("Add Address")')
    this.addressCards = addressSection.locator('.p-4.rounded-lg.border')
    this.addressNames = this.addressCards.locator('span.font-semibold')
    this.editAddressButtons = this.addressCards.locator('button[aria-label*="editar" i], button[aria-label*="Edit" i]')
    this.deleteAddressButtons = this.addressCards.locator('button[aria-label*="eliminar" i], button[aria-label*="Delete" i]')

    // Address Modal (Scoped to Dialog)
    this.addressDialog = page.locator('role=dialog')
    this.addrFirstNameInput = this.addressDialog.locator('input[id="firstName"]')
    this.addrLastNameInput = this.addressDialog.locator('input[id="lastName"]')
    this.addrCompanyInput = this.addressDialog.locator('input[id="company"]')
    this.addrStreetInput = this.addressDialog.locator('input[id="street"]')
    this.addrCityInput = this.addressDialog.locator('input[id="city"]')
    this.addrPostalCodeInput = this.addressDialog.locator('input[id="postalCode"]')
    this.addrProvinceInput = this.addressDialog.locator('input[id="province"]')
    this.addrCountrySelect = this.addressDialog.locator('select[id="country"]')
    this.addrPhoneInput = this.addressDialog.locator('input[id="phone"]')
    this.addrDefaultCheckbox = this.addressDialog.locator('input[id="isDefault"]')
    this.addrSaveButton = this.addressDialog.getByRole('button', { name: /save|guardar|actualizar/i })
    this.addrCancelButton = this.addressDialog.getByRole('button', { name: /cancel|cancelar/i })

    // Delete Confirmation
    this.deleteConfirmDialog = page.locator('role=dialog').filter({ hasText: /eliminar|delete/i })
    this.deleteConfirmButton = this.deleteConfirmDialog.getByRole('button', { name: /eliminar|delete/i })
  }

  // ===========================================
  // Navigation & Setup
  // ===========================================

  async goto() {
    await this.page.goto('/account/profile')
    await this.page.waitForLoadState('networkidle')
    // Ensure any overlays (like locale switcher) are closed
    await this.closeLocaleSwitcher()
  }

  async closeLocaleSwitcher() {
    const localeSwitcher = this.page.locator('[data-testid="locale-switcher"]')
    if (await localeSwitcher.isVisible()) {
      await this.page.keyboard.press('Escape')
      await this.page.waitForTimeout(500)
    }
  }

  // ===========================================
  // Accordion Actions
  // ===========================================

  async toggleAccordion(accordion: Locator, state: 'open' | 'closed') {
    const currentState = await accordion.getAttribute('aria-expanded') === 'true' ? 'open' : 'closed'
    if (currentState !== state) {
      await accordion.click()
      // Wait for transition
      await this.page.waitForTimeout(500)
    }
  }

  async expandAllAccordions() {
    const buttons = await this.page.locator('main [data-testid="profile-accordion-button"]').all()
    for (const button of buttons) {
      await this.toggleAccordion(button, 'open')
    }
  }

  // ===========================================
  // Form Interaction
  // ===========================================

  async updateName(name: string) {
    await this.toggleAccordion(this.personalInfoAccordion, 'open')
    await this.nameInput.fill(name)
    await this.waitForSave()
  }

  async updatePhone(phone: string) {
    await this.toggleAccordion(this.personalInfoAccordion, 'open')
    await this.phoneInput.fill(phone)
    await this.waitForSave()
  }

  async setLanguage(lang: string) {
    await this.toggleAccordion(this.preferencesAccordion, 'open')
    await this.languageSelect.selectOption(lang)
    await this.waitForSave()
  }

  // ===========================================
  // Save Status Verification
  // ===========================================

  async waitForSave() {
    // Wait for "Saving..." to appear and then change to "Saved"
    await expect(this.saveStatusText).toHaveText(/saved|guardado|сохранено|salvat/i, { timeout: 10000 })
  }

  async getSaveStatus(): Promise<string> {
    const text = await this.saveStatusText.textContent()
    return text?.trim() || ''
  }

  // ===========================================
  // Address Management
  // ===========================================

  async addAddress(address: Record<string, any>) {
    await this.toggleAccordion(this.addressesAccordion, 'open')
    await this.addAddressButton.click()
    await this.fillAddressForm(address)
    await this.addrSaveButton.click()
    // Wait for modal to close
    await expect(this.addressDialog).not.toBeVisible()
  }

  async editAddress(index: number, address: Record<string, any>) {
    await this.toggleAccordion(this.addressesAccordion, 'open')
    await this.editAddressButtons.nth(index).click()
    await this.fillAddressForm(address)
    await this.addrSaveButton.click()
    await expect(this.addressDialog).not.toBeVisible()
  }

  async deleteAddress(index: number) {
    await this.toggleAccordion(this.addressesAccordion, 'open')
    await this.deleteAddressButtons.nth(index).click()
    await this.deleteConfirmButton.click()
    await expect(this.deleteConfirmDialog).not.toBeVisible()
  }

  async fillAddressForm(address: Record<string, any>) {
    if (address.firstName) await this.addrFirstNameInput.fill(address.firstName)
    if (address.lastName) await this.addrLastNameInput.fill(address.lastName)
    if (address.company) await this.addrCompanyInput.fill(address.company)
    if (address.street) await this.addrStreetInput.fill(address.street)
    if (address.city) await this.addrCityInput.fill(address.city)
    if (address.postalCode) await this.addrPostalCodeInput.fill(address.postalCode)
    if (address.province) await this.addrProvinceInput.fill(address.province)
    if (address.country) await this.addrCountrySelect.selectOption(address.country)
    if (address.phone) await this.addrPhoneInput.fill(address.phone)
    if (address.isDefault !== undefined) {
      const isChecked = await this.addrDefaultCheckbox.isChecked()
      if (isChecked !== address.isDefault) {
        await this.addrDefaultCheckbox.click()
      }
    }
  }

  async getAddressCount(): Promise<number> {
    await this.toggleAccordion(this.addressesAccordion, 'open')
    return await this.addressCards.count()
  }

  // ===========================================
  // Visibility & State helpers
  // ===========================================

  async isFieldEditable(field: Locator): Promise<boolean> {
    return await field.isEditable()
  }
}
