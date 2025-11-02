---
status: pending
priority: p2
issue_id: "008"
tags: [documentation, deployment, devops, security]
dependencies: ["001", "002"]
---

# Update Deployment Documentation with Security Hardening

## Problem Statement

The deployment guide (`.kiro/docs/DEPLOYMENT_GUIDE.md`) is outdated and doesn't include critical security hardening steps discovered in recent code reviews. The DOCUMENTATION_INDEX.md lists it as "Needs Update".

**Location:**
- Outdated file: `.kiro/docs/DEPLOYMENT_GUIDE.md`
- Mentioned in: `DOCUMENTATION_INDEX.md:232`
- Referenced in: `DOCUMENTATION_INDEX.md:72`

## Findings

- **Current State:** Deployment guide hasn't been updated since initial project setup
- **Security Gaps:** No mention of:
  - Credential rotation procedures (critical after issue #85/#001)
  - Rate limiting configuration
  - Admin middleware verification
  - Security header configuration
  - CORS policy setup
- **Risk:** Team could deploy with known security vulnerabilities
- **Recent Changes:** Multiple security issues discovered (P0: #85, #86, #87, #90)

**Missing Content:**
1. Pre-deployment security checklist
2. Environment variable management (especially after key rotation)
3. Rate limiting setup (Redis/Upstash)
4. Security headers configuration
5. Monitoring and logging setup
6. Rollback procedures
7. Post-deployment verification steps

## Proposed Solutions

### Option 1: Comprehensive Update (Primary Solution)

Update deployment guide with complete security hardening section:

**New Structure:**
```markdown
# Moldova Direct Deployment Guide

## Table of Contents
1. [Pre-Deployment Security Checklist](#pre-deployment-security)
2. [Environment Setup](#environment-setup)
3. [Deployment Steps](#deployment-steps)
4. [Post-Deployment Verification](#verification)
5. [Rollback Procedures](#rollback)
6. [Monitoring](#monitoring)

## Pre-Deployment Security Checklist

### Critical Security Items
- [ ] Verify no exposed credentials in .env.example (#85)
- [ ] Rotate Supabase service key if previously exposed (#001)
- [ ] Verify admin middleware is enabled (not bypassed)
- [ ] Configure rate limiting for auth endpoints
- [ ] Set up CORS policies for production domain
- [ ] Enable security headers (CSP, HSTS, etc.)
- [ ] Verify RLS policies are enabled on all tables
- [ ] Remove any hardcoded test credentials (#002)

### Code Quality Checks
- [ ] All tests passing (unit + e2e + visual)
- [ ] No console.errors in production build
- [ ] TypeScript compilation successful
- [ ] Lighthouse score > 90 for key pages

## Environment Variables

### Required Variables (All Environments)
```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here  # NEVER commit real key

# App
NUXT_PUBLIC_SITE_URL=https://moldovadirect.com
NUXT_PUBLIC_APP_ENV=production

# Rate Limiting (Required for production)
RATE_LIMIT_REDIS_URL=redis://...
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000

# Analytics (Optional)
NUXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Environment-Specific Configuration

**Development:**
- Relaxed rate limits for testing
- Verbose error messages
- Source maps enabled

**Staging:**
- Production-like configuration
- Separate Supabase project
- Test payment keys

**Production:**
- Strict rate limiting
- Minimal error exposure
- Real payment credentials
- CDN enabled

## Deployment Steps

### 1. Pre-Deployment Validation
```bash
# Run full test suite
pnpm test
pnpm test:e2e
pnpm test:visual

# Build verification
pnpm build

# Security audit
pnpm audit --production
```

### 2. Deploy to Staging
```bash
# Push to staging branch
git push origin main:staging

# Verify deployment in Vercel
# Run smoke tests
pnpm test:e2e:staging
```

### 3. Deploy to Production
```bash
# Create release tag
git tag -a v1.x.x -m "Release v1.x.x"
git push origin v1.x.x

# Deploy via Vercel
# Monitor deployment logs
```

### 4. Post-Deployment Verification
- [ ] Health check endpoints respond
- [ ] Authentication flow works
- [ ] Checkout completes successfully
- [ ] Admin panel accessible (with proper auth)
- [ ] Email sending functional
- [ ] Rate limiting active
- [ ] Error tracking receiving events

## Security Hardening

### Rate Limiting Setup

**Using Upstash Redis:**
```typescript
// server/middleware/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event)
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests'
    })
  }
})
```

### Security Headers

Add to `nuxt.config.ts`:
```typescript
export default defineNuxtConfig({
  routeRules: {
    '/**': {
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      }
    }
  }
})
```

## Rollback Procedures

If deployment issues occur:

1. **Immediate Rollback:**
   ```bash
   # In Vercel dashboard: Deployments → Previous → Promote to Production
   ```

2. **Database Rollback:**
   ```bash
   # If migrations ran, revert via Supabase dashboard or:
   supabase db reset --db-url $DATABASE_URL
   ```

3. **Communication:**
   - Notify team in Slack
   - Update status page if customer-facing
   - Document incident for post-mortem

## Monitoring

### Essential Monitoring
- [ ] Vercel Analytics enabled
- [ ] Sentry error tracking configured
- [ ] Supabase database metrics monitored
- [ ] Uptime monitoring (UptimeRobot/Pingdom)
- [ ] Log aggregation (Datadog/LogRocket)

### Key Metrics to Watch
- Response times (p95, p99)
- Error rates by endpoint
- Authentication success rate
- Checkout completion rate
- Database connection pool usage
- Rate limit hits

## Troubleshooting

### Common Issues

**Issue:** 500 errors after deployment
- Check environment variables are set
- Verify Supabase connection
- Check error logs in Vercel

**Issue:** Authentication failing
- Verify SUPABASE_URL and keys
- Check CORS configuration
- Verify JWT secret matches

**Issue:** Slow performance
- Check database indexes
- Verify CDN caching
- Review Lighthouse reports

## Post-Deployment Checklist

- [ ] All critical flows tested in production
- [ ] Error tracking receiving events
- [ ] Analytics tracking properly
- [ ] Admin panel accessible with proper auth
- [ ] Rate limiting working (test with curl)
- [ ] Email notifications sending
- [ ] Database backups configured
- [ ] SSL certificate valid
- [ ] DNS propagated
- [ ] Monitoring alerts configured
```

**Pros:**
- Comprehensive security coverage
- Prevents deployment of known vulnerabilities
- Clear step-by-step process
- Includes troubleshooting

**Cons:**
- Requires 2-3 hours to write
- Needs maintenance as infrastructure evolves

**Effort:** Small (2-3 hours)
**Risk:** Low

### Option 2: Incremental Updates

Update guide incrementally as issues are fixed:
1. Add security checklist now (30 min)
2. Add rate limiting section after implementing (#TBD)
3. Add monitoring section later

**Pros:**
- Smaller chunks of work
- Documentation stays in sync with implementation

**Cons:**
- Guide remains incomplete for longer
- Risk of forgetting to update

**Effort:** Small (30 min per update)
**Risk:** Medium (incomplete docs)

## Recommended Action

**THIS WEEK (After P0 fixes - 2-3 hours):**
1. Update `.kiro/docs/DEPLOYMENT_GUIDE.md` with comprehensive structure above
2. Include all security hardening steps from recent reviews
3. Add environment variable documentation
4. Document rollback procedures
5. Add post-deployment verification checklist

**Dependencies:**
- Should be done AFTER fixing #001 (key rotation) and #002 (test credentials)
- Include references to those fixes in checklist

## Technical Details

- **Affected Files:**
  - `.kiro/docs/DEPLOYMENT_GUIDE.md` (primary update)
  - `DOCUMENTATION_INDEX.md` (update status)
  - `README.md` (link to updated guide)

- **Related Components:**
  - Deployment infrastructure (Vercel)
  - Environment variables
  - Security configurations
  - Monitoring systems

- **Database Changes:** None (documentation only)

## Resources

- Vercel Deployment Docs: https://vercel.com/docs
- Supabase Production Checklist: https://supabase.com/docs/guides/platform/going-into-prod
- Upstash Rate Limiting: https://upstash.com/docs/redis/features/ratelimiting
- OWASP Deployment Checklist: https://owasp.org/www-project-web-security-testing-guide/
- Existing issues: #85, #86, #87, #90, #001, #002

## Acceptance Criteria

- [ ] Updated `.kiro/docs/DEPLOYMENT_GUIDE.md`
- [ ] Pre-deployment security checklist included
- [ ] Environment variable documentation complete
- [ ] Security hardening steps documented (rate limiting, headers, CORS)
- [ ] Deployment steps for staging and production
- [ ] Post-deployment verification checklist
- [ ] Rollback procedures documented
- [ ] Monitoring setup instructions included
- [ ] Troubleshooting section added
- [ ] References to related security issues (#001, #002, #85, #86, #87)
- [ ] Updated status in DOCUMENTATION_INDEX.md to "Complete"
- [ ] Linked from README.md

## Work Log

### 2025-11-02 - Initial Discovery
**By:** Claude Triage System
**Actions:**
- Issue discovered during documentation review and triage
- Identified gap: deployment docs haven't been updated for security findings
- Categorized as P2 (important, but after P0 security fixes)
- Estimated effort: Small (2-3 hours)
- Added dependencies on #001 and #002

**Learnings:**
- Deployment documentation is critical after security reviews
- Should include checklist of all security fixes
- Outdated deployment docs can lead to vulnerable deployments
- Should be updated whenever major security issues are discovered

## Notes

**Priority Rationale:**
- P2 (not P1) because:
  - Depends on P0 security fixes being completed first
  - Current team knows deployment process
  - More critical for new team members or emergency deployments
- Should be completed same week as P0/P1 fixes

**Update Frequency:**
- Review and update quarterly
- Update immediately after major security findings
- Update when infrastructure changes (new services, tools)

**Target Audience:**
- DevOps engineers
- Senior developers handling deployments
- New team members learning deployment process

Source: Documentation triage session on 2025-11-02
Related Issues: #85, #86, #87, #90 (GitHub), #001, #002 (todos)
