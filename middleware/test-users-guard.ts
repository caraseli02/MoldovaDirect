/**
 * Middleware to protect test-users page from production access
 * Ensures the test user simulator is only accessible when explicitly enabled
 */
export default defineNuxtRouteMiddleware((to) => {
  const config = useRuntimeConfig()

  if (!config.public.enableTestUsers) {
    return navigateTo('/')
  }
})
