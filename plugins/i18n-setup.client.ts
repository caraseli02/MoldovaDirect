export default defineNuxtPlugin((nuxtApp) => {
  const { locale } = nuxtApp.$i18n as { locale: { value: string } }

  // Set the lang attribute on the HTML element
  if (import.meta.client) {
    watch(
      () => locale.value,
      (newLocale) => {
        document.documentElement.setAttribute('lang', newLocale)
      },
      { immediate: true },
    )
  }
})
