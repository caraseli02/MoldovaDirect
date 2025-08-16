import { extractToken, verifyAccessToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const protectedPaths = [
    '/api/account',
    '/api/orders',
    '/api/admin'
  ]
  
  const isProtectedPath = protectedPaths.some(path => event.node.req.url?.startsWith(path))
  
  if (!isProtectedPath) {
    return
  }
  
  const isAdminPath = event.node.req.url?.startsWith('/api/admin')
  
  const token = extractToken(event)
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }
  
  const payload = await verifyAccessToken(token)
  if (!payload) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired token'
    })
  }
  
  event.context.user = payload
  
  if (isAdminPath) {
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',')
    if (!adminEmails.includes(payload.email)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Admin access required'
      })
    }
  }
})