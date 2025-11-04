<template>
  <section class="bg-gray-100 py-16 dark:bg-gray-900 md:py-24">
    <div class="container">
      <div class="grid gap-8 rounded-3xl bg-white p-10 shadow-xl dark:bg-gray-950">
        <div class="max-w-3xl">
          <h2 class="text-3xl font-bold md:text-4xl">{{ t('home.newsletter.title') }}</h2>
          <p class="mt-3 text-lg text-gray-600 dark:text-gray-400">{{ t('home.newsletter.subtitle') }}</p>
        </div>
        <form class="flex flex-col gap-4 md:flex-row" @submit.prevent="submitNewsletter">
          <label for="newsletter-email" class="sr-only">{{ t('home.newsletter.placeholder') }}</label>
          <input
            id="newsletter-email"
            v-model="email"
            type="email"
            required
            class="w-full rounded-full border border-gray-300 bg-white px-6 py-3 text-base text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            :placeholder="t('home.newsletter.placeholder')"
          />
          <button
            type="submit"
            class="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
          >
            <commonIcon name="lucide:send" class="h-5 w-5" />
            {{ t('home.newsletter.cta') }}
          </button>
        </form>
        <p v-if="submitted" class="text-sm font-medium text-emerald-600 dark:text-emerald-400">
          {{ t('home.newsletter.success') }}
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('home.newsletter.disclaimer') }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()

const email = ref('')
const submitted = ref(false)

const submitNewsletter = () => {
  if (!email.value) {
    submitted.value = false
    return
  }

  submitted.value = true
  email.value = ''
}
</script>
