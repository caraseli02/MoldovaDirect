export default defineNuxtPlugin((nuxtApp) => {
  const { locale } = nuxtApp.$i18n

  // Set the lang attribute on the HTML element
  if (process.client) {
    watch(
      () => locale.value,
      (newLocale) => {
        document.documentElement.setAttribute('lang', newLocale)
      },
      { immediate: true }
    )
  }
})