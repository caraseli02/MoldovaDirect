# How-To Guides

> **Problem-oriented documentation** - Task-focused guides for solving specific problems

---

## 🎯 What Are How-To Guides?

How-to guides are **recipes** that take you through steps to solve specific problems or accomplish particular tasks. They assume you already understand the basics and need to get something done.

**Use how-to guides when you:**
- Know what you want to achieve
- Need step-by-step instructions
- Want to solve a specific problem
- Are looking for best practices

---

## 📂 Guide Categories

### 🔐 [Authentication](./authentication/)
User authentication, authorization, and security

- Session management
- Multi-factor authentication (MFA)
- Password reset flows
- OAuth integration
- Role-based access control (RBAC)

### 🛒 [Checkout](./checkout/)
Shopping cart and payment processing

- Cart management
- Payment integration
- Order processing
- Inventory management
- Checkout flow optimization

### 🚀 [Deployment](./deployment/)
Deployment, CI/CD, and production operations

- [Prevention Strategy](./deployment/prevention-strategy.md) - Prevent deployment failures
- [GitHub Project Automation](./deployment/github-project-automation.md) - Automate project workflows
- [Landing Page CMS](./deployment/landing-page-cms.md) - Content management setup
- [Landing Page Videos Quick Start](./deployment/landing-page-videos-quick-start.md) - Add hero videos
- [Hero Section Quick Reference](./deployment/hero-section-quick-reference.md) - Hero section implementation
- [Modern UI Improvements](./deployment/modern-ui-improvements.md) - UI enhancement guide
- [UI Improvements](./deployment/ui-improvements.md) - Additional UI updates
- [Tailwind v4 Implementation](./deployment/tailwind-v4-implementation-checklist.md) - Tailwind v4 migration

### 🔒 [Security](./security/)
Security best practices and implementations

- [Accessibility Refactoring Plan](./security/accessibility-refactoring-plan.md) - Improve accessibility
- CSRF protection
- Input validation
- Rate limiting
- Security headers

### 🧪 [Testing](./testing/)
Testing strategies and implementation

- [Nuxt3 Pinia SSR Best Practices](./testing/nuxt3-pinia-ssr-best-practices.md) - SSR testing patterns
- [Date-fns Optimization](./testing/date-fns-optimization-quick-reference.md) - Optimize date handling
- [TanStack Table Lazy Loading](./testing/tanstack-table-lazy-loading.md) - Implement lazy loading
- [Local Testing Guide](./testing/local-testing-guide.md) - Run tests locally
- Unit testing
- Integration testing
- E2E testing with Playwright
- Visual regression testing

---

## 🔍 Finding the Right Guide

### By Task Type

**Setting Up Features:**
- Authentication → [authentication/](./authentication/)
- Checkout → [checkout/](./checkout/)
- Testing → [testing/](./testing/)

**Deployment & Operations:**
- Deploying to production → [deployment/](./deployment/)
- CI/CD setup → [deployment/](./deployment/)
- Monitoring → [deployment/](./deployment/)

**Security & Quality:**
- Security hardening → [security/](./security/)
- Accessibility → [security/](./security/)
- Performance → [testing/](./testing/)

### By Problem

**"How do I..."**
- "...add authentication?" → [authentication/](./authentication/)
- "...process payments?" → [checkout/](./checkout/)
- "...deploy to Vercel?" → [deployment/](./deployment/)
- "...write tests?" → [testing/](./testing/)
- "...improve security?" → [security/](./security/)

---

## 📖 How to Use These Guides

### 1. Find Your Guide
Browse by category or search for your specific problem

### 2. Check Prerequisites
Each guide lists what you need before starting

### 3. Follow Steps
Guides provide step-by-step instructions with code examples

### 4. Verify Results
Test that your implementation works as expected

### 5. Troubleshoot
Check common issues section if something goes wrong

---

## ✍️ Writing How-To Guides

When adding new how-to guides, follow these principles:

### Structure
```markdown
# How to [Accomplish Task]

## Prerequisites
- List required knowledge
- List required tools/setup

## Steps

### Step 1: [Action]
Clear instructions with code examples

### Step 2: [Action]
More instructions

## Verification
How to verify it worked

## Troubleshooting
Common issues and solutions

## Next Steps
Related guides or further reading
```

### Best Practices
- **Focus on one task** - Don't try to cover everything
- **Be specific** - "How to add MFA" not "How to do authentication"
- **Assume knowledge** - Link to tutorials for basics
- **Show, don't explain** - Code examples over theory
- **Test your steps** - Verify instructions actually work
- **Include troubleshooting** - Address common issues

### What NOT to Include
- ❌ Conceptual explanations (use [explanation/](../explanation/))
- ❌ API reference details (use [reference/](../reference/))
- ❌ Learning tutorials (use [tutorials/](../tutorials/))
- ❌ Multiple unrelated tasks

---

## 🔗 Related Documentation

### Need Something Else?

- **Learning basics?** → [tutorials/](../tutorials/) - Step-by-step learning
- **Looking up details?** → [reference/](../reference/) - API and specs
- **Understanding concepts?** → [explanation/](../explanation/) - Why things work
- **Project info?** → [project/](../project/) - Status and roadmap

---

## 📊 Quick Reference

### Common Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm preview          # Preview production build

# Testing
pnpm test             # Run unit tests
pnpm test:e2e         # Run E2E tests
pnpm test:coverage    # Generate coverage report

# Deployment
pnpm deploy:check     # Verify before deploy
git push              # Deploy to Vercel (auto)
```

### File Locations

```
docs/how-to/
├── authentication/   # Auth guides
├── checkout/        # Cart & payment guides
├── deployment/      # Deploy & ops guides
├── security/        # Security guides
└── testing/         # Testing guides
```

---

**Last Updated:** January 16, 2026  
**Total Guides:** 13 organized guides + category folders
