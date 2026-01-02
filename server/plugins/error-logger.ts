export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('error', (error: unknown, context: any) => {
    try {
      const event = context?.event
      const req = event?.node?.req
      const method = req?.method
      const url = req?.url
      // Include request headers for debugging SSR issues
      const userAgent = req?.headers?.['user-agent']
      const referer = req?.headers?.referer
      // Log context to help reproduce server-only crashes (e.g., "reading 'ce'")
      console.error('[server-error]', {
        method,
        url,
        userAgent,
        referer,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })
    }
    catch (loggingError) {
      // Preserve original error context even when logging fails
      console.error('Failed to log server error', {
        loggingError,
        originalError: error instanceof Error ? error.message : String(error),
      })
    }
  })
})
