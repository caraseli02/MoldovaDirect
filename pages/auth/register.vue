<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-[var(--md-cream)] via-[var(--md-cream-light)] to-[var(--md-cream-dark)] dark:from-[var(--md-charcoal)] dark:via-[var(--md-charcoal-light)] dark:to-[var(--md-black)]">
    <!-- Mobile-optimized container -->
    <main class="flex-1 flex items-center justify-center px-6 py-8 sm:px-8 lg:px-12">
      <div class="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8">
        <!-- Logo/Brand area -->
        <div class="text-center space-y-2">
          <div class="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-[var(--md-wine-muted)] dark:bg-[var(--md-wine)]/20 rounded-2xl mb-4">
            <svg
              class="w-10 h-10 sm:w-12 sm:h-12 text-[var(--md-wine)] dark:text-[var(--md-gold)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h2 class="font-[family-name:var(--md-font-serif)] text-2xl sm:text-3xl font-normal text-[var(--md-charcoal)] dark:text-[var(--md-cream)]">
            {{ $t('auth.createAccount') }}
          </h2>
          <p class="text-sm sm:text-base text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)]">
            {{ $t('auth.haveAccount') }}
            <NuxtLink
              :to="localePath('/auth/login')"
              class="font-semibold text-[var(--md-wine)] hover:text-[var(--md-wine-light)] dark:text-[var(--md-gold)] dark:hover:text-[var(--md-gold-light)] transition-colors"
            >
              {{ $t('auth.signIn') }}
            </NuxtLink>
          </p>
        </div>

        <!-- Card container -->
        <div class="bg-[var(--md-cream-light)] dark:bg-[var(--md-charcoal-light)] rounded-2xl shadow-xl dark:shadow-none dark:border dark:border-[var(--md-gray-700)] p-6 sm:p-8">
          <form
            class="space-y-5"
            @submit.prevent="handleRegister"
          >
            <!-- Alert messages -->
            <Transition name="slide-fade">
              <Alert
                v-if="error"
                variant="destructive"
                class="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                data-testid="auth-error"
              >
                <AlertCircle
                  class="h-5 w-5 text-red-500 dark:text-red-400"
                  aria-hidden="true"
                />
                <AlertDescription class="text-sm text-red-800 dark:text-red-300">
                  {{ error }}
                </AlertDescription>
              </Alert>
            </Transition>

            <Transition name="slide-fade">
              <Alert
                v-if="success"
                class="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                data-testid="auth-success"
              >
                <CheckCircle2
                  class="h-5 w-5 text-green-500 dark:text-green-400"
                  aria-hidden="true"
                />
                <AlertDescription class="text-sm text-green-800 dark:text-green-300">
                  {{ success }}
                </AlertDescription>
              </Alert>
            </Transition>

            <!-- Input fields with mobile optimization and accessibility -->
            <div class="space-y-4">
              <div class="space-y-2">
                <Label
                  for="name"
                  class="text-sm font-medium text-[var(--md-gray-700)] dark:text-[var(--md-gray-300)]"
                  :class="{ 'text-red-600 dark:text-red-400': nameError }"
                >
                  {{ $t('auth.fullName') }}
                </Label>
                <Input
                  id="name"
                  v-model="form.name"
                  name="name"
                  type="text"
                  autocomplete="name"
                  autocapitalize="words"
                  autocorrect="on"
                  spellcheck="true"
                  required
                  data-testid="name-input"
                  :aria-invalid="nameError ? 'true' : 'false'"
                  :aria-describedby="nameError ? 'name-error' : undefined"
                  :placeholder="$t('auth.fullName')"
                  class="h-11 border-2 border-[var(--md-gray-200)] bg-white text-[var(--md-charcoal)] placeholder:text-[var(--md-gray-500)] focus:border-[var(--md-gold)] focus:ring-[var(--md-gold)]/20 dark:border-[var(--md-gray-600)] dark:bg-[var(--md-charcoal)] dark:text-[var(--md-cream)] dark:placeholder:text-[var(--md-gray-400)]"
                  :class="{ 'border-red-500 dark:border-red-400': nameError }"
                  @blur="validateNameField"
                />
                <p
                  v-if="nameError"
                  id="name-error"
                  class="text-sm text-red-600 dark:text-red-400"
                  role="alert"
                >
                  {{ nameError }}
                </p>
              </div>

              <div class="space-y-2">
                <Label
                  for="email"
                  class="text-sm font-medium text-[var(--md-gray-700)] dark:text-[var(--md-gray-300)]"
                  :class="{ 'text-red-600 dark:text-red-400': emailError }"
                >
                  {{ $t('auth.email') }}
                </Label>
                <Input
                  id="email"
                  v-model="form.email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  autocapitalize="none"
                  autocorrect="off"
                  spellcheck="false"
                  inputmode="email"
                  required
                  data-testid="email-input"
                  :aria-invalid="emailError ? 'true' : 'false'"
                  :aria-describedby="emailError ? 'email-error' : undefined"
                  :placeholder="$t('auth.email')"
                  class="h-11 border-2 border-[var(--md-gray-200)] bg-white text-[var(--md-charcoal)] placeholder:text-[var(--md-gray-500)] focus:border-[var(--md-gold)] focus:ring-[var(--md-gold)]/20 dark:border-[var(--md-gray-600)] dark:bg-[var(--md-charcoal)] dark:text-[var(--md-cream)] dark:placeholder:text-[var(--md-gray-400)]"
                  :class="{ 'border-red-500 dark:border-red-400': emailError }"
                  @blur="validateEmailField"
                />
                <p
                  v-if="emailError"
                  id="email-error"
                  class="text-sm text-red-600 dark:text-red-400"
                  role="alert"
                >
                  {{ emailError }}
                </p>
              </div>

              <div class="space-y-2">
                <Label
                  for="phone"
                  class="text-sm font-medium text-[var(--md-gray-700)] dark:text-[var(--md-gray-300)]"
                  :class="{ 'text-red-600 dark:text-red-400': phoneError }"
                >
                  {{ $t('auth.phone') }}
                  <span class="text-xs font-normal text-[var(--md-gray-500)] dark:text-[var(--md-gray-400)]">
                    ({{ $t('common.optional') }})
                  </span>
                </Label>
                <Input
                  id="phone"
                  v-model="form.phone"
                  name="phone"
                  type="tel"
                  autocomplete="tel"
                  autocapitalize="none"
                  autocorrect="off"
                  spellcheck="false"
                  inputmode="tel"
                  data-testid="phone-input"
                  :aria-invalid="phoneError ? 'true' : 'false'"
                  :aria-describedby="phoneError ? 'phone-error' : 'phone-desc'"
                  :placeholder="$t('auth.phone')"
                  class="h-11 border-2 border-[var(--md-gray-200)] bg-white text-[var(--md-charcoal)] placeholder:text-[var(--md-gray-500)] focus:border-[var(--md-gold)] focus:ring-[var(--md-gold)]/20 dark:border-[var(--md-gray-600)] dark:bg-[var(--md-charcoal)] dark:text-[var(--md-cream)] dark:placeholder:text-[var(--md-gray-400)]"
                  :class="{ 'border-red-500 dark:border-red-400': phoneError }"
                  @blur="validatePhoneField"
                />
                <div
                  id="phone-desc"
                  class="sr-only"
                >
                  {{ $t('auth.accessibility.phoneOptional') }}
                </div>
                <p
                  v-if="phoneError"
                  id="phone-error"
                  class="text-sm text-red-600 dark:text-red-400"
                  role="alert"
                >
                  {{ phoneError }}
                </p>
              </div>

              <div class="space-y-2">
                <Label
                  for="password"
                  class="text-sm font-medium text-[var(--md-gray-700)] dark:text-[var(--md-gray-300)]"
                  :class="{ 'text-red-600 dark:text-red-400': passwordError }"
                >
                  {{ $t('auth.password') }}
                </Label>
                <div class="relative">
                  <Input
                    id="password"
                    v-model="form.password"
                    name="password"
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="new-password"
                    autocapitalize="none"
                    autocorrect="off"
                    spellcheck="false"
                    required
                    minlength="8"
                    data-testid="password-input"
                    :aria-invalid="passwordError ? 'true' : 'false'"
                    :aria-describedby="passwordError ? 'password-error password-strength-status' : 'password-strength-status password-requirements'"
                    :placeholder="$t('auth.password')"
                    class="h-11 border-2 border-[var(--md-gray-200)] bg-white pr-12 text-[var(--md-charcoal)] placeholder:text-[var(--md-gray-500)] focus:border-[var(--md-gold)] focus:ring-[var(--md-gold)]/20 dark:border-[var(--md-gray-600)] dark:bg-[var(--md-charcoal)] dark:text-[var(--md-cream)] dark:placeholder:text-[var(--md-gray-400)]"
                    :class="{ 'border-red-500 dark:border-red-400': passwordError }"
                    @input="validatePasswordField"
                    @blur="validatePasswordField"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--md-gray-600)] dark:text-[var(--md-gray-300)] hover:text-[var(--md-charcoal)] dark:hover:text-[var(--md-cream)]"
                    data-testid="password-toggle"
                    :aria-label="showPassword ? $t('auth.accessibility.hidePassword') : $t('auth.accessibility.showPassword')"
                    :aria-pressed="showPassword"
                    @click="togglePasswordVisibility"
                  >
                    <svg
                      v-if="!showPassword"
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <svg
                      v-else
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  </Button>
                </div>

                <!-- Password strength meter -->
                <PasswordStrengthMeter
                  :password="form.password"
                  :show-requirements="true"
                  class="mt-2"
                />

                <p
                  v-if="passwordError"
                  id="password-error"
                  class="text-sm text-red-600 dark:text-red-400"
                  role="alert"
                >
                  {{ passwordError }}
                </p>
                <div
                  id="password-requirements"
                  class="sr-only"
                >
                  {{ $t('auth.accessibility.passwordRequirements') }}
                </div>
              </div>

              <div class="space-y-2">
                <Label
                  for="confirmPassword"
                  class="text-sm font-medium text-[var(--md-gray-700)] dark:text-[var(--md-gray-300)]"
                  :class="{
                    'text-red-600 dark:text-red-400': confirmPasswordError,
                    'text-green-600 dark:text-green-300': form.confirmPassword && !confirmPasswordError && form.password === form.confirmPassword,
                  }"
                >
                  {{ $t('auth.confirmPassword') }}
                </Label>
                <div class="relative">
                  <Input
                    id="confirmPassword"
                    v-model="form.confirmPassword"
                    name="confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    autocomplete="new-password"
                    autocapitalize="none"
                    autocorrect="off"
                    spellcheck="false"
                    required
                    data-testid="confirm-password-input"
                    :aria-invalid="confirmPasswordError ? 'true' : 'false'"
                    :aria-describedby="confirmPasswordError ? 'confirm-password-error' : 'confirm-password-desc'"
                    :placeholder="$t('auth.confirmPassword')"
                    class="h-11 border-2 border-[var(--md-gray-200)] bg-white pr-12 text-[var(--md-charcoal)] placeholder:text-[var(--md-gray-500)] focus:border-[var(--md-gold)] focus:ring-[var(--md-gold)]/20 dark:border-[var(--md-gray-600)] dark:bg-[var(--md-charcoal)] dark:text-[var(--md-cream)] dark:placeholder:text-[var(--md-gray-400)]"
                    :class="[
                      confirmPasswordError ? 'border-red-500 dark:border-red-400' : '',
                      form.confirmPassword && !confirmPasswordError && form.password === form.confirmPassword
                        ? 'border-green-500 dark:border-green-400'
                        : '',
                    ]"
                    @input="validateConfirmPasswordField"
                    @blur="validateConfirmPasswordField"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    data-testid="confirm-password-toggle"
                    class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--md-gray-600)] dark:text-[var(--md-gray-300)] hover:text-[var(--md-charcoal)] dark:hover:text-[var(--md-cream)]"
                    :aria-label="showConfirmPassword ? $t('auth.accessibility.hidePassword') : $t('auth.accessibility.showPassword')"
                    :aria-pressed="showConfirmPassword"
                    @click="toggleConfirmPasswordVisibility"
                  >
                    <svg
                      v-if="!showConfirmPassword"
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <svg
                      v-else
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  </Button>
                </div>

                <div
                  id="confirm-password-desc"
                  class="sr-only"
                >
                  {{ $t('auth.accessibility.confirmPasswordDescription') }}
                </div>
                <p
                  v-if="confirmPasswordError"
                  id="confirm-password-error"
                  class="text-sm text-red-600 dark:text-red-400"
                  role="alert"
                >
                  {{ confirmPasswordError }}
                </p>
                <p
                  v-else-if="form.confirmPassword && form.password === form.confirmPassword"
                  class="text-sm text-green-600 dark:text-green-300"
                  data-testid="password-match-indicator"
                >
                  <svg
                    class="w-4 h-4 inline mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {{ $t('auth.validation.password.match') }}
                </p>
              </div>
            </div>

            <!-- Terms checkbox with accessibility improvements -->
            <div class="flex items-start">
              <Checkbox
                id="terms"
                v-model:checked="form.acceptTerms"
                name="terms"
                required
                :aria-invalid="termsError ? 'true' : 'false'"
                :aria-describedby="termsError ? 'terms-error' : 'terms-desc'"
                class="mt-1 h-5 w-5 border-[var(--md-gray-300)] data-[state=checked]:bg-[var(--md-wine)] data-[state=checked]:border-[var(--md-wine)]"
                @update:checked="validateTermsField"
              />
              <div class="ml-3 space-y-2">
                <Label
                  for="terms"
                  class="text-sm text-[var(--md-gray-700)] dark:text-[var(--md-gray-200)] leading-relaxed"
                >
                  {{ $t('auth.acceptTerms') }}
                  <NuxtLink
                    :to="localePath('/terms')"
                    data-testid="terms-link"
                    class="font-medium text-[var(--md-wine)] hover:text-[var(--md-wine-light)] dark:text-[var(--md-gold)] dark:hover:text-[var(--md-gold-light)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--md-gold)]/20 rounded"
                    target="_blank"
                    rel="noopener noreferrer"
                    :aria-label="$t('auth.accessibility.termsLink')"
                  >
                    {{ $t('footer.terms') }}
                  </NuxtLink>
                  {{ $t('common.and') }}
                  <NuxtLink
                    :to="localePath('/privacy')"
                    data-testid="privacy-link"
                    class="font-medium text-[var(--md-wine)] hover:text-[var(--md-wine-light)] dark:text-[var(--md-gold)] dark:hover:text-[var(--md-gold-light)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--md-gold)]/20 rounded"
                    target="_blank"
                    rel="noopener noreferrer"
                    :aria-label="$t('auth.accessibility.privacyLink')"
                  >
                    {{ $t('footer.privacy') }}
                  </NuxtLink>
                </Label>
                <div
                  id="terms-desc"
                  class="sr-only"
                >
                  {{ $t('auth.accessibility.termsDescription') }}
                </div>
                <p
                  v-if="termsError"
                  id="terms-error"
                  class="text-sm text-red-600 dark:text-red-400"
                  role="alert"
                >
                  {{ termsError }}
                </p>
              </div>
            </div>

            <!-- Submit button with accessibility improvements -->
            <Button
              type="submit"
              :disabled="loading || !isFormValid"
              data-testid="register-button"
              class="relative w-full flex justify-center items-center py-4 px-4 min-h-[48px] text-base font-semibold rounded-xl shadow-lg transition-all bg-[var(--md-wine)] text-white hover:bg-[var(--md-wine-light)] focus-visible:ring-2 focus-visible:ring-[var(--md-gold)] focus-visible:ring-offset-2"
              :aria-label="loading ? $t('auth.accessibility.creatingAccount') : $t('auth.accessibility.createAccountButton')"
              :aria-describedby="loading ? 'register-status' : undefined"
            >
              <svg
                v-if="loading"
                class="animate-spin -ml-1 mr-3 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {{ loading ? $t('common.loading') : $t('auth.signUp') }}
            </Button>
            <div
              v-if="loading"
              id="register-status"
              class="sr-only"
              aria-live="polite"
            >
              {{ $t('auth.accessibility.processingRegistration') }}
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2 } from 'lucide-vue-next'
import PasswordStrengthMeter from '@/components/auth/PasswordStrengthMeter.vue'

// Apply guest middleware - redirect authenticated users
definePageMeta({
  middleware: 'guest',
})

const supabase = useSupabaseClient()
const _user = useSupabaseUser()
const { t, locale } = useI18n()
const localePath = useLocalePath()

const form = ref({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
})

// Expose form for E2E testing (only in development/test, client-side only)
if (import.meta.dev && import.meta.client) {
  (window as any).__testForm = form
  ;(window as any).__setAcceptTerms = (value: boolean) => {
    form.value.acceptTerms = value
  }
}

const error = ref('')
const success = ref('')
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Field-level validation errors
const nameError = ref('')
const emailError = ref('')
const phoneError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const termsError = ref('')

// Validation composable
const { validateEmail, validatePassword, validatePasswordMatch: _validatePasswordMatch, validateTermsAcceptance } = useAuthValidation()

// Form validation
const isFormValid = computed(() => {
  return form.value.name
    && form.value.email
    && form.value.password
    && form.value.confirmPassword
    && form.value.acceptTerms
    && !nameError.value
    && !emailError.value
    && !phoneError.value
    && !passwordError.value
    && !confirmPasswordError.value
    && !termsError.value
    && form.value.password === form.value.confirmPassword
})

// Field validation methods
const validateNameField = () => {
  if (!form.value.name) {
    nameError.value = ''
    return
  }

  if (form.value.name.length < 2) {
    nameError.value = t('auth.validation.name.minLength')
  }
  else if (!/^[a-zA-ZÀ-ÿ\u0100-\u017F\u0400-\u04FF\s'-]+$/.test(form.value.name)) {
    nameError.value = t('auth.validation.name.invalid')
  }
  else {
    nameError.value = ''
  }
}

const validateEmailField = () => {
  if (!form.value.email) {
    emailError.value = ''
    return
  }

  const result = validateEmail(form.value.email)
  emailError.value = result.isValid ? '' : result.errors[0]?.message || ''
}

const validatePhoneField = () => {
  if (!form.value.phone) {
    phoneError.value = ''
    return
  }

  if (!/^[+]?[1-9]\d{0,15}$/.test(form.value.phone)) {
    phoneError.value = t('auth.validation.phone.invalid')
  }
  else {
    phoneError.value = ''
  }
}

const validatePasswordField = () => {
  if (!form.value.password) {
    passwordError.value = ''
    return
  }

  const result = validatePassword(form.value.password)
  passwordError.value = result.isValid ? '' : result.errors[0]?.message || ''

  // Also validate confirm password if it exists
  if (form.value.confirmPassword) {
    validateConfirmPasswordField()
  }
}

const validateConfirmPasswordField = () => {
  if (!form.value.confirmPassword) {
    confirmPasswordError.value = ''
    return
  }

  if (form.value.password !== form.value.confirmPassword) {
    confirmPasswordError.value = t('auth.validation.password.mismatch')
  }
  else {
    confirmPasswordError.value = ''
  }
}

const validateTermsField = () => {
  const result = validateTermsAcceptance(form.value.acceptTerms)
  termsError.value = result.isValid ? '' : result.errors[0]?.message || ''
}

// Password visibility toggles with accessibility
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
  announcePasswordVisibility(showPassword.value)
}

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
  announcePasswordVisibility(showConfirmPassword.value)
}

const announcePasswordVisibility = (isVisible: boolean) => {
  const message = isVisible
    ? t('auth.accessibility.passwordVisible')
    : t('auth.accessibility.passwordHidden')

  // Create temporary announcement element
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', 'polite')
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  document.body.appendChild(announcement)

  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

const handleRegister = async () => {
  error.value = ''
  success.value = ''

  if (form.value.password !== form.value.confirmPassword) {
    error.value = t('auth.passwordMismatch')
    return
  }

  if (form.value.password.length < 8) {
    error.value = t('auth.passwordTooShort')
    return
  }

  loading.value = true

  try {
    const { error: authError } = await supabase.auth.signUp({
      email: form.value.email,
      password: form.value.password,
      options: {
        data: {
          name: form.value.name,
          phone: form.value.phone || null,
          preferred_language: locale.value,
        },
        emailRedirectTo: `${window.location.origin}${localePath('/auth/confirm')}`,
      },
    })

    if (authError) {
      throw authError
    }

    success.value = t('auth.registrationSuccess')
  }
  catch (err: any) {
    error.value = err.message || t('auth.registerError')
  }
  finally {
    loading.value = false
  }
}

useHead({
  title: t('auth.createAccount'),
})
</script>
