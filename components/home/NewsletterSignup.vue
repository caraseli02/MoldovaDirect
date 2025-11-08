<template>
  <section class="bg-gray-100 py-20 dark:bg-gray-900/80 md:py-28">
    <div class="container">
      <div class="grid gap-8 rounded-3xl bg-white p-10 shadow-xl dark:bg-gray-950">
        <div class="max-w-3xl">
          <h2 class="text-4xl font-bold md:text-5xl lg:text-6xl tracking-tight">{{ t('home.newsletter.title') }}</h2>
          <p class="mt-4 text-sm md:text-base text-gray-600 dark:text-gray-400">{{ t('home.newsletter.subtitle') }}</p>
        </div>
        <form class="flex flex-col gap-4 md:flex-row" @submit.prevent="submitNewsletter">
          <label for="newsletter-email" class="sr-only">{{ t('home.newsletter.placeholder') }}</label>
          <input
            id="newsletter-email"
            v-model="email"
            type="email"
            required
            :disabled="loading"
            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
            title="Please enter a valid email address"
            class="w-full rounded-full border border-gray-300 bg-white px-6 py-3 text-base text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            :placeholder="t('home.newsletter.placeholder')"
          />
          <UiButton
            type="submit"
            :disabled="loading"
            class="rounded-full"
          >
            <commonIcon v-if="!loading" name="lucide:send" class="mr-2 h-5 w-5" />
            <commonIcon v-else name="lucide:loader-2" class="mr-2 h-5 w-5 animate-spin" />
            {{ loading ? t('common.loading') : t('home.newsletter.cta') }}
          </UiButton>
        </form>
        <p v-if="submitted" class="text-sm font-medium text-emerald-600 dark:text-emerald-400">
          {{ t('home.newsletter.success') }}
        </p>
        <p v-if="error" class="text-sm font-medium text-red-600 dark:text-red-400">
          {{ error }}
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('home.newsletter.disclaimer') }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()

const email = ref('')
const submitted = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

const submitNewsletter = async () => {
  if (!email.value) return

  loading.value = true
  error.value = null

  try {
    const { data, error: apiError } = await useFetch('/api/newsletter/subscribe', {
      method: 'POST',
      body: {
        email: email.value,
        locale: locale.value,
        source: 'landing_page'
      }
    })

    if (apiError.value) {
      console.error('Newsletter subscription error:', apiError.value)
      error.value = t('home.newsletter.error')
      return
    }

    if (data.value?.success) {
      submitted.value = true
      email.value = ''

      // Reset success message after 5 seconds
      setTimeout(() => {
        submitted.value = false
      }, 5000)
    } else {
      error.value = t('home.newsletter.error')
    }
  } catch (e) {
    console.error('Newsletter submission failed:', e)
    error.value = t('home.newsletter.error')
  } finally {
    loading.value = false
  }
}
</script>
