/**
 * GET /api/security/csrf-token
 *
 * Returns a CSRF token for the current session.
 * This token should be included in state-changing requests
 * via the X-CSRF-Token header or csrf-token cookie.
 */

import { createCSRFTokenEndpoint } from '~/server/utils/csrfProtection'

export default createCSRFTokenEndpoint()
