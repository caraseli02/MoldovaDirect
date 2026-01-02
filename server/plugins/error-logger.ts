export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('error', (error: unknown, context: any) => {
    try {
      const event = context?.event
      const method = event?.node?.req?.method
      const url = event?.node?.req?.url
      // Log minimal context to help reproduce server-only crashes (e.g., "reading 'ce'")
      console.error('[server-error]', {
        method,
        url,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })
    }
    catch (loggingError) {
      console.error('Failed to log server error', loggingError)
    }
  })
})
