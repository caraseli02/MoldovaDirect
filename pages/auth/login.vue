<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-[var(--md-cream)] via-[var(--md-cream-light)] to-[var(--md-cream-dark)] dark:from-[var(--md-charcoal)] dark:via-[var(--md-charcoal-light)] dark:to-[var(--md-black)]">
    <!-- Mobile-optimized header -->
    <main class="flex-1 flex items-center justify-center px-6 py-8 sm:px-8 lg:px-12">
      <div class="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8">
        <!-- Logo/Brand area with better mobile spacing -->
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 class="font-[family-name:var(--md-font-serif)] text-2xl sm:text-3xl font-normal text-[var(--md-charcoal)] dark:text-[var(--md-cream)]">
            {{ $t('auth.signIn') }}
          </h2>
          <p class="text-sm sm:text-base text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)]">
            {{ $t('auth.noAccount') }}
            <NuxtLink
              :to="localePath('/auth/register')"
              class="font-semibold text-[var(--md-wine)] hover:text-[var(--md-wine-light)] dark:text-[var(--md-gold)] dark:hover:text-[var(--md-gold-light)] transition-colors"
            >
              {{ $t('auth.signUp') }}
            </NuxtLink>
          </p>
        </div>

        <!-- Card container for form -->
        <div class="bg-[var(--md-cream-light)] dark:bg-[var(--md-charcoal-light)] rounded-2xl shadow-xl dark:shadow-none dark:border dark:border-[var(--md-gray-700)] p-6 sm:p-8">
          <!-- Alert messages with improved mobile styling -->
          <Transition name="slide-fade">
            <Alert
              v-if="displayError"
              variant="destructive"
              class="mb-5 border-[var(--md-wine)]/20 bg-[var(--md-wine)]/10 dark:border-[var(--md-wine)]/40 dark:bg-[var(--md-wine)]/15"
              data-testid="auth-error"
            >
              <AlertCircle
                class="h-5 w-5 text-[var(--md-wine)] dark:text-[var(--md-wine-light)]"
                aria-hidden="true"
              />
              <AlertDescription :class="cn('text-sm text-[var(--md-wine-dark)] dark:text-white')">
                {{ displayError }}
              </AlertDescription>
            </Alert>
          </Transition>

          <Transition name="slide-fade">
            <Alert
              v-if="success"
              class="mb-5 border-[var(--md-success)]/20 bg-[var(--md-success)]/10 dark:border-[var(--md-success)]/40 dark:bg-[var(--md-success)]/15"
              data-testid="auth-success"
            >
              <CheckCircle2
                class="h-5 w-5 text-[var(--md-success)] dark:text-emerald-400"
                aria-hidden="true"
              />
              <AlertDescription class="text-sm text-[var(--md-success)] dark:text-emerald-300">
                {{ success }}
              </AlertDescription>
            </Alert>
          </Transition>

          <!-- Tabbed Interface for Auth Methods -->
          <Tabs
            v-model="activeTab"
            class="w-full"
          >
            <TabsList class="grid w-full grid-cols-2 mb-6">
              <TabsTrigger
                value="password"
                class="text-base"
              >
                <svg
                  class="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                {{ $t('auth.withPassword') }}
              </TabsTrigger>
              <TabsTrigger
                value="magiclink"
                class="text-base"
              >
                <svg
                  class="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                {{ $t('auth.withMagicLink') }}
              </TabsTrigger>
            </TabsList>

            <!-- Password Tab Content -->
            <TabsContent value="password">
              <form
                class="space-y-5"
                @submit.prevent="handleLogin"
              >
                <!-- Modern input fields with mobile optimization and accessibility -->
                <div class="space-y-4">
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
                        autocomplete="current-password"
                        autocapitalize="none"
                        autocorrect="off"
                        spellcheck="false"
                        required
                        minlength="8"
                        data-testid="password-input"
                        :aria-invalid="passwordError ? 'true' : 'false'"
                        :aria-describedby="passwordError ? 'password-error' : 'password-toggle-desc'"
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
                        data-testid="password-toggle"
                        class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--md-gray-600)] dark:text-[var(--md-gray-300)] hover:text-[var(--md-charcoal)] dark:hover:text-[var(--md-cream)]"
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
                    <div
                      id="password-toggle-desc"
                      class="sr-only"
                    >
                      {{ $t('auth.accessibility.passwordToggleDescription') }}
                    </div>
                    <p
                      v-if="passwordError"
                      id="password-error"
                      class="text-sm text-red-600 dark:text-red-400"
                      role="alert"
                    >
                      {{ passwordError }}
                    </p>
                  </div>
                </div>

                <!-- Remember me and forgot password with mobile-optimized layout -->
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div class="flex items-center">
                    <Checkbox
                      id="remember"
                      v-model:checked="rememberMe"
                      :aria-describedby="'remember-desc'"
                      class="h-5 w-5 border-[var(--md-gray-300)] data-[state=checked]:bg-[var(--md-wine)] data-[state=checked]:border-[var(--md-wine)]"
                    />
                    <Label
                      for="remember"
                      class="ml-3 text-sm text-[var(--md-gray-700)] dark:text-[var(--md-gray-200)] select-none"
                    >
                      {{ $t('auth.rememberMe') }}
                    </Label>
                    <div
                      id="remember-desc"
                      class="sr-only"
                    >
                      {{ $t('auth.accessibility.rememberMeDescription') }}
                    </div>
                  </div>
                  <NuxtLink
                    :to="localePath('/auth/forgot-password')"
                    data-testid="forgot-password"
                    class="inline-flex items-center justify-center min-h-[44px] px-3 py-2 text-sm font-medium text-[var(--md-wine)] hover:text-[var(--md-wine-light)] dark:text-[var(--md-gold)] dark:hover:text-[var(--md-gold-light)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--md-gold)]/20 rounded-md"
                    :aria-label="$t('auth.accessibility.forgotPasswordLink')"
                  >
                    {{ $t('auth.forgotPassword') }}
                  </NuxtLink>
                </div>

                <!-- Primary action button with mobile optimization and accessibility -->
                <Button
                  type="submit"
                  :disabled="isLoginDisabled"
                  :aria-disabled="isLoginDisabled"
                  data-testid="login-button"
                  class="relative w-full flex justify-center items-center py-4 px-4 min-h-[48px] text-base font-semibold rounded-xl shadow-[var(--md-wine-shadow)] transition-all bg-[var(--md-wine-btn)] text-white hover:bg-[var(--md-wine-btn-hover)] focus-visible:ring-2 focus-visible:ring-[var(--md-gold)] focus-visible:ring-offset-2"
                  :class="{ 'opacity-60 cursor-not-allowed pointer-events-none': isLoginDisabled }"
                  :aria-label="loading ? $t('auth.accessibility.signingIn') : $t('auth.accessibility.signInButton')"
                  :aria-describedby="loading ? 'login-status' : undefined"
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
                  {{ loading ? $t('common.loading') : $t('auth.signIn') }}
                </Button>
                <div
                  v-if="loading"
                  id="login-status"
                  class="sr-only"
                  aria-live="polite"
                >
                  {{ $t('auth.accessibility.processingLogin') }}
                </div>
              </form>
            </TabsContent>

            <!-- Magic Link Tab Content -->
            <TabsContent value="magiclink">
              <form
                class="space-y-5"
                @submit.prevent="handleMagicLink"
              >
                <!-- Email field only -->
                <div class="space-y-2">
                  <Label
                    for="email-magic"
                    class="text-sm font-medium text-[var(--md-gray-700)] dark:text-[var(--md-gray-300)]"
                    :class="{ 'text-red-600 dark:text-red-400': emailError }"
                  >
                    {{ $t('auth.email') }}
                  </Label>
                  <Input
                    id="email-magic"
                    v-model="form.email"
                    name="email"
                    type="email"
                    autocomplete="email"
                    autocapitalize="none"
                    autocorrect="off"
                    spellcheck="false"
                    inputmode="email"
                    required
                    data-testid="email-magic-input"
                    :aria-invalid="emailError ? 'true' : 'false'"
                    :aria-describedby="emailError ? 'email-magic-error' : undefined"
                    :placeholder="$t('auth.emailPlaceholder')"
                    class="h-11 border-2 border-[var(--md-gray-200)] bg-white text-[var(--md-charcoal)] placeholder:text-[var(--md-gray-500)] focus:border-[var(--md-gold)] focus:ring-[var(--md-gold)]/20 dark:border-[var(--md-gray-600)] dark:bg-[var(--md-charcoal)] dark:text-[var(--md-cream)] dark:placeholder:text-[var(--md-gray-400)]"
                    :class="{ 'border-red-500 dark:border-red-400': emailError }"
                    @blur="validateEmailField"
                  />
                  <p
                    v-if="emailError"
                    id="email-magic-error"
                    class="text-sm text-red-600 dark:text-red-400"
                    role="alert"
                  >
                    {{ emailError }}
                  </p>
                </div>

                <!-- Info message -->
                <div class="rounded-lg bg-[var(--md-gold-muted)] dark:bg-[var(--md-gold)]/10 border border-[var(--md-gold)]/30 dark:border-[var(--md-gold)]/20 p-4">
                  <div class="flex items-start">
                    <svg
                      class="w-5 h-5 text-[var(--md-gold-dark)] dark:text-[var(--md-gold)] mt-0.5 mr-3 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div class="text-sm text-[var(--md-charcoal)] dark:text-[var(--md-cream)]">
                      <p class="font-medium">
                        {{ $t('auth.magicLinkInfo') }}
                      </p>
                      <p class="mt-1 text-xs text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)]">
                        {{ $t('auth.magicLinkDescription') }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Send Magic Link button -->
                <Button
                  type="submit"
                  :disabled="isMagicLinkDisabled"
                  :aria-disabled="isMagicLinkDisabled"
                  data-testid="magic-link-button"
                  class="relative w-full flex justify-center items-center py-4 px-4 min-h-[48px] text-base font-semibold rounded-xl shadow-[var(--md-wine-shadow)] transition-all bg-[var(--md-wine-btn)] text-white hover:bg-[var(--md-wine-btn-hover)] focus-visible:ring-2 focus-visible:ring-[var(--md-gold)] focus-visible:ring-offset-2"
                  :class="{ 'opacity-60 cursor-not-allowed pointer-events-none': isMagicLinkDisabled }"
                  :aria-label="loadingMagic ? $t('auth.accessibility.sendingMagicLink') : $t('auth.accessibility.magicLinkButton')"
                  :aria-describedby="loadingMagic ? 'magic-link-status' : 'magic-link-desc'"
                >
                  <svg
                    v-if="loadingMagic"
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
                  <svg
                    v-else-if="magicLinkCooldown > 0"
                    class="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <svg
                    v-else
                    class="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <template v-if="magicLinkCooldown > 0">
                    {{ $t('auth.resendIn') }} {{ magicLinkCooldown }}s
                  </template>
                  <template v-else>
                    {{ loadingMagic ? $t('common.loading') : $t('auth.sendMagicLink') }}
                  </template>
                </Button>
                <div
                  id="magic-link-desc"
                  class="sr-only"
                >
                  {{ $t('auth.accessibility.magicLinkDescription') }}
                </div>
                <div
                  v-if="loadingMagic"
                  id="magic-link-status"
                  class="sr-only"
                  aria-live="polite"
                >
                  {{ $t('auth.accessibility.sendingMagicLink') }}
                </div>
              </form>
            </TabsContent>
          </Tabs>

          <!-- Social Login Divider -->
          <div class="relative mt-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-[var(--md-gray-200)] dark:border-[var(--md-gray-700)]"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="bg-[var(--md-cream-light)] dark:bg-[var(--md-charcoal-light)] px-4 text-[var(--md-gray-500)] dark:text-[var(--md-gray-400)]">
                {{ $t('auth.orContinueWith') }}
              </span>
            </div>
          </div>

          <!-- Social Login Buttons -->
          <div class="mt-6 grid grid-cols-2 gap-3">
            <!-- Google Sign In -->
            <Button
              type="button"
              variant="outline"
              :disabled="loadingSocial === 'google'"
              class="h-11 border-2 border-[var(--md-gray-200)] bg-white text-[var(--md-gray-700)] hover:bg-[var(--md-cream)] hover:border-[var(--md-gold)]/50 dark:border-[var(--md-gray-600)] dark:bg-[var(--md-charcoal)] dark:text-[var(--md-gray-200)] dark:hover:bg-[var(--md-charcoal-light)] dark:hover:border-[var(--md-gold)]/50 transition-colors"
              @click="handleSocialLogin('google')"
            >
              <svg
                v-if="loadingSocial === 'google'"
                class="animate-spin h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <svg
                v-else
                class="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {{ $t('auth.continueWithGoogle') }}
            </Button>

            <!-- Apple Sign In -->
            <Button
              type="button"
              variant="outline"
              :disabled="loadingSocial === 'apple'"
              class="h-11 border-2 border-[var(--md-gray-200)] bg-white text-[var(--md-gray-700)] hover:bg-[var(--md-cream)] hover:border-[var(--md-gold)]/50 dark:border-[var(--md-gray-600)] dark:bg-[var(--md-charcoal)] dark:text-[var(--md-gray-200)] dark:hover:bg-[var(--md-charcoal-light)] dark:hover:border-[var(--md-gold)]/50 transition-colors"
              @click="handleSocialLogin('apple')"
            >
              <svg
                v-if="loadingSocial === 'apple'"
                class="animate-spin h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <svg
                v-else
                class="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              {{ $t('auth.continueWithApple') }}
            </Button>
          </div>

          <!-- Social Login Note -->
          <p class="mt-4 text-xs text-center text-[var(--md-gray-500)] dark:text-[var(--md-gray-400)]">
            {{ $t('auth.socialLoginNote') }}
          </p>
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, CheckCircle2 } from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'
import { useAuthMessages } from '~/composables/useAuthMessages'
import { cn } from '~/lib/utils'
import { setRememberMePreference, adjustSessionCookieDuration } from '~/utils/authStorage'

// Apply guest middleware - redirect authenticated users
definePageMeta({
  middleware: 'guest',
})

const supabase = useSupabaseClient()
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const {
  error: authError,
  isAccountLocked,
  getUnlockTime,
  clearError,
  ensureInitialized,
  triggerLockout,
} = useAuth()

const { getAccountLockoutMessage, translateAuthError } = useAuthMessages()

const form = ref({
  email: '',
  password: '',
})

// Handle redirect after successful login
async function handleRedirectAfterLogin(): Promise<void> {
  const { handleAuthRedirect } = await import('~/utils/authRedirect')
  const redirect = route.query.redirect as string
  const user = useSupabaseUser()

  await handleAuthRedirect(redirect, user.value, supabase, localePath, navigateTo)
}

const success = ref('')
const loadingMagic = ref(false)
const showPassword = ref(false)
const rememberMe = ref(false)
const localError = ref('')
const loading = ref(false)
const activeTab = ref('password')
const loadingSocial = ref<'google' | 'apple' | null>(null)

// Field-level validation errors
const emailError = ref('')
const passwordError = ref('')

// Magic link rate limiting
const magicLinkCooldown = ref(0)
const magicLinkCooldownInterval = ref<NodeJS.Timeout | null>(null)

// Validation composable
const { validateEmail, validatePassword } = useAuthValidation()

// Form validation
const isFormValid = computed(() => {
  return form.value.email
    && form.value.password
    && !emailError.value
    && !passwordError.value
})

const isLoginDisabled = computed(() => {
  return loading.value || !isFormValid.value || isAccountLocked.value
})

const isMagicLinkDisabled = computed(() => {
  return loadingMagic.value || !form.value.email || isAccountLocked.value || magicLinkCooldown.value > 0
})

// Field validation methods
function validateEmailField(): void {
  if (!form.value.email) {
    emailError.value = ''
    return
  }

  const result = validateEmail(form.value.email)
  emailError.value = result.isValid ? '' : result.errors[0]?.message || ''
}

function validatePasswordField(): void {
  if (!form.value.password) {
    passwordError.value = ''
    return
  }

  const result = validatePassword(form.value.password)
  passwordError.value = result.isValid ? '' : result.errors[0]?.message || ''
}

// Password visibility toggle with accessibility
function togglePasswordVisibility(): void {
  showPassword.value = !showPassword.value

  // Announce to screen readers
  const message = showPassword.value
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

async function handleLogin(): Promise<void> {
  if (loading.value || isAccountLocked.value) {
    return
  }

  localError.value = ''
  success.value = ''
  clearError()
  loading.value = true

  try {
    const { data, error: authErr } = await supabase.auth.signInWithPassword({
      email: form.value.email,
      password: form.value.password,
    })

    if (authErr) {
      if (authErr.message?.includes('Too many requests')) {
        triggerLockout(15)
        localError.value = translateAuthError('Too many requests', 'login')
      }
      else {
        localError.value = translateAuthError(authErr.message, 'login')
      }
      throw authErr
    }

    if (data?.user && data?.session) {
      // Handle "Remember Me" functionality using cookies (SSR-friendly)
      // Store preference in a cookie that controls session persistence
      setRememberMePreference(rememberMe.value)

      // Adjust session cookie duration based on preference
      // - When checked: Persistent cookie (30 days)
      // - When unchecked: Session cookie (cleared when browser closes)
      adjustSessionCookieDuration(rememberMe.value)

      success.value = t('auth.loginSuccess')
      await handleRedirectAfterLogin()
    }
  }
  catch (err: any) {
    if (!localError.value) {
      localError.value = err?.message || t('auth.loginError')
    }
  }
  finally {
    loading.value = false
  }
}

/**
 * Start magic link cooldown timer (60 seconds as per Supabase rate limit)
 */
function startMagicLinkCooldown(): void {
  const COOLDOWN_SECONDS = 60
  const expiryTime = Date.now() + (COOLDOWN_SECONDS * 1000)

  // Store in localStorage to persist across page refreshes
  if (typeof window !== 'undefined') {
    localStorage.setItem('magicLinkCooldown', expiryTime.toString())
  }

  magicLinkCooldown.value = COOLDOWN_SECONDS

  // Clear existing interval if any
  if (magicLinkCooldownInterval.value) {
    clearInterval(magicLinkCooldownInterval.value)
  }

  // Update countdown every second
  magicLinkCooldownInterval.value = setInterval(() => {
    const remaining = Math.ceil((expiryTime - Date.now()) / 1000)

    if (remaining <= 0) {
      magicLinkCooldown.value = 0
      if (magicLinkCooldownInterval.value) {
        clearInterval(magicLinkCooldownInterval.value)
        magicLinkCooldownInterval.value = null
      }
      if (typeof window !== 'undefined') {
        localStorage.removeItem('magicLinkCooldown')
      }
    }
    else {
      magicLinkCooldown.value = remaining
    }
  }, 1000)
}

/**
 * Check for existing cooldown on mount
 */
function checkExistingCooldown(): void {
  if (typeof window === 'undefined') return

  const storedExpiry = localStorage.getItem('magicLinkCooldown')
  if (storedExpiry) {
    const expiryTime = parseInt(storedExpiry, 10)
    const remaining = Math.ceil((expiryTime - Date.now()) / 1000)

    if (remaining > 0) {
      magicLinkCooldown.value = remaining

      // Restart the interval
      magicLinkCooldownInterval.value = setInterval(() => {
        const currentRemaining = Math.ceil((expiryTime - Date.now()) / 1000)

        if (currentRemaining <= 0) {
          magicLinkCooldown.value = 0
          if (magicLinkCooldownInterval.value) {
            clearInterval(magicLinkCooldownInterval.value)
            magicLinkCooldownInterval.value = null
          }
          localStorage.removeItem('magicLinkCooldown')
        }
        else {
          magicLinkCooldown.value = currentRemaining
        }
      }, 1000)
    }
    else {
      // Expired, remove from storage
      localStorage.removeItem('magicLinkCooldown')
    }
  }
}

async function handleMagicLink(): Promise<void> {
  if (!form.value.email) {
    localError.value = t('auth.emailRequired')
    return
  }

  if (magicLinkCooldown.value > 0) {
    localError.value = t('auth.errors.rateLimitExceeded', { minutes: Math.ceil(magicLinkCooldown.value / 60) })
    return
  }

  localError.value = ''
  success.value = ''
  loadingMagic.value = true

  try {
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: form.value.email,
      options: {
        emailRedirectTo: `${window.location.origin}${localePath('/auth/confirm')}`,
      },
    })

    if (authError) {
      throw authError
    }

    success.value = t('auth.magicLinkSent')

    // Start cooldown timer
    startMagicLinkCooldown()
  }
  catch (err: any) {
    localError.value = err.message || t('auth.magicLinkError')
  }
  finally {
    loadingMagic.value = false
  }
}

/**
 * Handle OAuth social login with Google or Apple
 * Uses Supabase's signInWithOAuth which handles the OAuth flow
 *
 * Note: On success, the page redirects so loadingSocial state persists.
 * On error or redirect failure, loadingSocial is cleared to allow retry.
 * A 5-second timeout detects stuck redirects.
 */
async function handleSocialLogin(provider: 'google' | 'apple'): Promise<void> {
  if (loadingSocial.value) return

  localError.value = ''
  success.value = ''
  loadingSocial.value = provider

  try {
    // Preserve original redirect parameter from URL
    const originalRedirect = route.query.redirect as string
    const confirmUrl = new URL(`${window.location.origin}${localePath('/auth/confirm')}`)
    if (originalRedirect) {
      confirmUrl.searchParams.set('redirect', originalRedirect)
    }

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: confirmUrl.toString(),
        queryParams: provider === 'google'
          ? {
              access_type: 'offline',
              prompt: 'consent',
            }
          : undefined,
      },
    })

    if (authError) {
      throw authError
    }

    // Set a timeout to detect if redirect didn't happen
    // (e.g., blocked by browser extension, CSP, popup blocker)
    setTimeout(() => {
      if (loadingSocial.value === provider) {
        console.error(`${provider} OAuth redirect did not occur within expected timeframe`)
        localError.value = t('auth.socialLoginRedirectFailed')
        loadingSocial.value = null
      }
    }, 5000)
  }
  catch (err: any) {
    console.error(`${provider} login error:`, err)
    localError.value = err.message || t('auth.socialLoginError', { provider: provider.charAt(0).toUpperCase() + provider.slice(1) })
    loadingSocial.value = null
  }
}

const lockoutMessage = computed(() => {
  if (!isAccountLocked.value) {
    return ''
  }

  const unlockTime = getUnlockTime()
  if (!unlockTime) {
    return ''
  }

  return getAccountLockoutMessage(unlockTime).message
})

watch(isAccountLocked, (locked) => {
  if (!locked) {
    localError.value = ''
  }
})

const displayError = computed(() => {
  return lockoutMessage.value || localError.value || authError.value || ''
})

onMounted(async () => {
  await ensureInitialized()
  checkExistingCooldown()
})

onBeforeUnmount(() => {
  // Clean up cooldown interval
  if (magicLinkCooldownInterval.value) {
    clearInterval(magicLinkCooldownInterval.value)
    magicLinkCooldownInterval.value = null
  }
})

useHead({
  title: t('auth.signIn'),
})
</script>
