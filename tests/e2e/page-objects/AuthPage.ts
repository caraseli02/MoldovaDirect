/**
 * Page Object Model: Authentication Page
 *
 * Handles all authentication-related interactions
 */

import { type Page, type Locator, expect } from '@playwright/test'

export class AuthPage {
  readonly page: Page

  // Sign In Elements
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly signInButton: Locator
  readonly signUpLink: Locator
  readonly forgotPasswordLink: Locator

  // Sign Up Elements
  readonly signUpEmailInput: Locator
  readonly signUpPasswordInput: Locator
  readonly confirmPasswordInput: Locator
  readonly signUpButton: Locator
  readonly signInLink: Locator

  // Feedback Elements
  readonly errorMessage: Locator
  readonly successMessage: Locator

  constructor(page: Page) {
    this.page = page

    // Sign In
    this.emailInput = page.locator('input[type="email"]')
    this.passwordInput = page.locator('input[type="password"]').first()
    this.signInButton = page.locator('button[type="submit"]:has-text("Sign"), button[type="submit"]:has-text("Iniciar"), button[type="submit"]:has-text("Войти"), button[type="submit"]:has-text("Autentificare")')
    this.signUpLink = page.locator('a[href*="signup"], a:has-text("Sign up"), a:has-text("Regístrate")')
    this.forgotPasswordLink = page.locator('a[href*="forgot"], a:has-text("Forgot"), a:has-text("Olvidaste")')

    // Sign Up
    this.signUpEmailInput = page.locator('input[type="email"]')
    this.signUpPasswordInput = page.locator('input[type="password"]').first()
    this.confirmPasswordInput = page.locator('input[type="password"]').last()
    this.signUpButton = page.locator('button[type="submit"]:has-text("Sign"), button[type="submit"]:has-text("Regístrate")')
    this.signInLink = page.locator('a[href*="signin"], a:has-text("Sign in"), a:has-text("Iniciar sesión")')

    // Feedback
    this.errorMessage = page.locator('[class*="error"], .text-red-500, [role="alert"]')
    this.successMessage = page.locator('[class*="success"], .text-green-500')
  }

  /**
   * Navigate to sign in page
   */
  async navigateToSignIn() {
    await this.page.goto('/auth/signin')
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Navigate to sign up page
   */
  async navigateToSignUp() {
    await this.page.goto('/auth/signup')
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Sign in with credentials
   */
  async signIn(email: string, password: string) {
    await this.navigateToSignIn()
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.signInButton.click()

    // Wait for redirect to home page
    await this.page.waitForURL(/\/(en|es|ro|ru)\/?$/, { timeout: 10000 })
  }

  /**
   * Sign up with credentials
   */
  async signUp(email: string, password: string) {
    await this.navigateToSignUp()
    await this.signUpEmailInput.fill(email)
    await this.signUpPasswordInput.fill(password)
    await this.confirmPasswordInput.fill(password)
    await this.signUpButton.click()
  }

  /**
   * Check if signed in
   */
  async isSignedIn(): Promise<boolean> {
    // Check for presence of user menu or account link
    const accountLink = this.page.locator('a[href*="/account"], button:has-text("Account"), button:has-text("Cuenta")')
    return await accountLink.isVisible()
  }

  /**
   * Sign out
   */
  async signOut() {
    const signOutButton = this.page.locator('button:has-text("Sign out"), button:has-text("Cerrar sesión"), button:has-text("Выйти")')
    await signOutButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Wait for authentication to complete
   */
  async waitForAuth(timeout: number = 10000) {
    await expect(this.page).toHaveURL(/\/(en|es|ro|ru)\/?/, { timeout })
  }
}
