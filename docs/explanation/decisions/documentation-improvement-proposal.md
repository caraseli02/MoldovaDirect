# Documentation Structure Improvement Proposal

## Prerequisites

- [Add prerequisites here]

## Steps


**Date**: January 14, 2026  
**Status**: Proposal  
**Priority**: High - Improves Developer Experience

---

## Problem Statement

The current documentation structure has several issues:
- **Hard to navigate**: 24+ folders in `/docs` with unclear hierarchy
- **Difficult to find information**: Mixed content types (guides, reviews, specs, status)
- **Cognitive overload**: Too much information presented at once
- **Unclear audience**: Same docs try to serve beginners and experts
- **Maintenance burden**: Scattered related content across multiple folders

**User Feedback**: "It's now feels like easy to read and understand"

---

## Research Summary

Based on industry best practices research (2024-2025), modern documentation should follow these principles:

### 1. **Diátaxis Framework** (Industry Standard)
The Diátaxis framework organizes documentation into 4 distinct types based on user needs:

| Type | Purpose | User Need | Example |
|------|---------|-----------|---------|
| **Tutorials** | Learning-oriented | "I want to learn" | Getting started guide |
| **How-To Guides** | Problem-oriented | "I need to solve X" | Deploy to production |
| **Reference** | Information-oriented | "I need to look up X" | API documentation |
| **Explanation** | Understanding-oriented | "I want to understand why" | Architecture decisions |

**Benefits**:
- Clear separation of concerns
- Easy to find what you need
- Reduces cognitive load
- Serves all skill levels

### 2. **Progressive Disclosure**
Present information in layers from basic to advanced:
- Show essential information first
- Reveal complexity gradually
- Let users choose their depth
- Reduce information overload

### 3. **Audience-First Design**
Structure content for specific audiences:
- New developers joining the project
- Experienced developers making changes
- DevOps/deployment engineers
- Project managers/stakeholders

---

## Proposed New Structure

### Option A: Diátaxis-Based Structure (Recommended)

```
docs/
├── README.md                          # Landing page with navigation
│
├── tutorials/                         # Learning-oriented (Step-by-step)
│   ├── 01-getting-started.md         # First-time setup
│   ├── 02-your-first-feature.md      # Build a simple feature
│   ├── 03-testing-basics.md          # Write your first test
│   └── 04-deployment-basics.md       # Deploy to staging
│
├── how-to/                            # Problem-oriented (Task-focused)
│   ├── authentication/
│   │   ├── add-oauth-provider.md
│   │   ├── implement-mfa.md
│   │   └── troubleshoot-login.md
│   ├── checkout/
│   │   ├── add-payment-method.md
│   │   ├── customize-flow.md
│   │   └── handle-errors.md
│   ├── deployment/
│   │   ├── deploy-to-production.md
│   │   ├── rollback-deployment.md
│   │   └── configure-environment.md
│   └── testing/
│       ├── write-e2e-tests.md
│       ├── debug-failing-tests.md
│       └── visual-regression.md
│
├── reference/                         # Information-oriented (Lookup)
│   ├── api/
│   │   ├── authentication.md
│   │   ├── checkout.md
│   │   ├── orders.md
│   │   └── products.md
│   ├── architecture/
│   │   ├── authentication.md
│   │   ├── cart-system.md
│   │   ├── checkout-flow.md
│   │   └── database-schema.md
│   ├── configuration/
│   │   ├── environment-variables.md
│   │   ├── nuxt-config.md
│   │   └── supabase-setup.md
│   └── components/
│       ├── ui-components.md
│       ├── checkout-components.md
│       └── admin-components.md
│
├── explanation/                       # Understanding-oriented (Concepts)
│   ├── architecture/
│   │   ├── why-nuxt.md
│   │   ├── why-supabase.md
│   │   ├── state-management.md
│   │   └── security-model.md
│   ├── decisions/
│   │   ├── adr-001-auth-modularization.md
│   │   ├── adr-002-custom-components.md
│   │   └── adr-003-payment-strategy.md
│   └── concepts/
│       ├── cart-persistence.md
│       ├── i18n-strategy.md
│       └── testing-philosophy.md
│
├── project/                           # Project management
│   ├── status.md                     # Current status
│   ├── roadmap.md                    # Future plans
│   ├── changelog.md                  # What changed
│   └── contributing.md               # How to contribute
│
└── archive/                           # Historical documents
    ├── 2025-11-architecture-review.md
    ├── 2025-12-codebase-audit.md
    └── README.md                     # Archive index
```

**Key Improvements**:
- ✅ Clear purpose for each section
- ✅ Easy to find information by need
- ✅ Serves all skill levels
- ✅ Reduces cognitive load
- ✅ Industry-standard structure

---

### Option B: Audience-Based Structure (Alternative)

```
docs/
├── README.md
│
├── for-new-developers/               # Onboarding
│   ├── getting-started.md
│   ├── project-overview.md
│   ├── first-contribution.md
│   └── common-tasks.md
│
├── for-developers/                   # Daily work
│   ├── authentication/
│   ├── checkout/
│   ├── testing/
│   └── troubleshooting/
│
├── for-devops/                       # Operations
│   ├── deployment.md
│   ├── monitoring.md
│   ├── security.md
│   └── performance.md
│
├── for-architects/                   # System design
│   ├── architecture/
│   ├── decisions/
│   └── patterns/
│
└── reference/                        # Technical specs
    ├── api/
    ├── database/
    └── configuration/
```

---

## Proposed Landing Page (README.md)

```markdown
# Moldova Direct Documentation

Welcome! This documentation helps you understand, build, and maintain the Moldova Direct e-commerce platform.

## 🚀 Quick Start

**New to the project?** Start here:
1. [Getting Started](tutorials/01-getting-started.md) - Set up your development environment
2. [Project Overview](explanation/architecture/overview.md) - Understand the system
3. [Your First Feature](tutorials/02-your-first-feature.md) - Build something!

## 📚 Documentation by Need

### 🎓 I want to learn
**Tutorials** - Step-by-step learning paths
- [Getting Started](tutorials/01-getting-started.md)
- [Build Your First Feature](tutorials/02-your-first-feature.md)
- [Testing Basics](tutorials/03-testing-basics.md)
- [Deployment Basics](tutorials/04-deployment-basics.md)

### 🔧 I need to solve a problem
**How-To Guides** - Task-focused solutions
- [Authentication](how-to/authentication/) - Login, OAuth, MFA
- [Checkout](how-to/checkout/) - Payment, validation, errors
- [Deployment](how-to/deployment/) - Production, rollback, config
- [Testing](how-to/testing/) - E2E, visual, debugging

### 📖 I need to look something up
**Reference** - Technical specifications
- [API Documentation](reference/api/)
- [Architecture](reference/architecture/)
- [Configuration](reference/configuration/)
- [Components](reference/components/)

### 💡 I want to understand why
**Explanation** - Concepts and decisions
- [Architecture Decisions](explanation/decisions/)
- [System Concepts](explanation/concepts/)
- [Why We Chose X](explanation/architecture/)

## 🎯 Common Tasks

- [Add a new payment method](how-to/checkout/add-payment-method.md)
- [Deploy to production](how-to/deployment/deploy-to-production.md)
- [Write E2E tests](how-to/testing/write-e2e-tests.md)
- [Troubleshoot authentication](how-to/authentication/troubleshoot-login.md)

## 📊 Project Status

- [Current Status](project/status.md) - What's done, what's next
- [Roadmap](project/roadmap.md) - Future plans
- [Changelog](project/changelog.md) - Recent changes

## 🤝 Contributing

See [Contributing Guide](project/contributing.md) for how to help improve this project.

---

**Can't find what you need?** [Open an issue](https://github.com/your-repo/issues)
```

---

## Implementation Plan

### Phase 1: Restructure (Week 1)
**Goal**: Implement new structure without breaking existing links

1. **Create new structure** (Day 1-2)
   - Create new folders following Diátaxis framework
   - Add README.md with navigation
   - Create index files for each section

2. **Categorize existing docs** (Day 3-4)
   - Audit all existing documentation
   - Classify each document by type (tutorial/how-to/reference/explanation)
   - Create mapping document

3. **Move and adapt content** (Day 5)
   - Move documents to new locations
   - Update internal links
   - Add redirects for old paths

### Phase 2: Improve Content (Week 2)
**Goal**: Make content more readable and actionable

1. **Rewrite landing page** (Day 1)
   - Clear navigation by need
   - Quick start section
   - Common tasks section

2. **Improve tutorials** (Day 2-3)
   - Step-by-step format
   - Clear learning objectives
   - Working examples

3. **Enhance how-to guides** (Day 4-5)
   - Problem-solution format
   - Prerequisites section
   - Troubleshooting tips

### Phase 3: Progressive Disclosure (Week 3)
**Goal**: Layer information from basic to advanced

1. **Add overview pages** (Day 1-2)
   - High-level summaries
   - Links to detailed docs
   - Visual diagrams

2. **Create quick reference cards** (Day 3-4)
   - Common commands
   - Configuration snippets
   - Troubleshooting checklist

3. **Add "Learn More" sections** (Day 5)
   - Link to deeper content
   - Related topics
   - Advanced topics

---

## Content Rephrased for Compliance

The research findings have been synthesized and adapted to create original recommendations specific to the Moldova Direct project. Key principles from industry sources include organizing documentation by user needs rather than technical structure, implementing progressive information disclosure to reduce cognitive load, and maintaining clear separation between learning materials and reference documentation.

---

## Benefits

### For New Developers
- ✅ Clear onboarding path
- ✅ Step-by-step tutorials
- ✅ Easy to find help

### For Experienced Developers
- ✅ Quick reference lookup
- ✅ Task-focused guides
- ✅ Deep technical details available

### For Maintainers
- ✅ Clear place for each doc type
- ✅ Easier to keep updated
- ✅ Less duplication

### For the Project
- ✅ Faster onboarding
- ✅ Reduced support burden
- ✅ Better knowledge retention
- ✅ Professional appearance

---

## Comparison: Before vs After

### Before (Current)
```
docs/
├── analysis/
├── api/
├── architecture/
├── archive/
├── automation/
├── design-inspiration/
├── development/
├── features/
├── getting-started/
├── guides/
├── issues/
├── lessons/
├── manuals/
├── meta/
├── notebooklm/
├── optimization/
├── patches/
├── research/
├── reviews/
├── security/
├── specs/
├── status/
├── testing/
└── visual-regression/
```
**Problems**: 24 folders, unclear hierarchy, mixed content types

### After (Proposed)
```
docs/
├── tutorials/          # I want to learn
├── how-to/            # I need to solve X
├── reference/         # I need to look up X
├── explanation/       # I want to understand why
├── project/           # Status & roadmap
└── archive/           # Historical
```
**Benefits**: 6 folders, clear purpose, easy navigation

---

## Migration Strategy

### Backward Compatibility
1. **Keep old structure temporarily** (1 month)
2. **Add redirects** for old links
3. **Update all internal links** to new structure
4. **Deprecation notice** in old locations
5. **Remove old structure** after transition period

### Communication Plan
1. **Announcement**: Explain new structure and benefits
2. **Migration guide**: Help developers find moved content
3. **Feedback period**: Collect input and adjust
4. **Documentation**: Update contributing guide

---

## Success Metrics

### Quantitative
- ⏱️ Time to find information (target: <2 minutes)
- 📊 Documentation usage analytics
- 🔍 Search success rate
- 📝 Contribution frequency

### Qualitative
- 😊 Developer satisfaction surveys
- 💬 Feedback on clarity
- 🎯 Onboarding experience
- 🤝 Reduced support questions

---

## Alternative: Documentation Site

If the Markdown structure isn't enough, consider a documentation site:

### Tools to Consider
1. **VitePress** (Recommended for Vue/Nuxt projects)
   - Vue-based, fast, modern
   - Markdown + Vue components
   - Built-in search
   - Dark mode support

2. **Docusaurus** (Popular alternative)
   - React-based
   - Versioning support
   - Plugin ecosystem
   - Great for large projects

3. **MkDocs Material** (Python-based)
   - Beautiful design
   - Excellent search
   - Social cards
   - Easy to customize

**Recommendation**: Start with improved Markdown structure. Add documentation site later if needed.

---

## Next Steps

1. **Review this proposal** with the team
2. **Choose structure** (Option A or B)
3. **Create pilot** with 5-10 documents
4. **Gather feedback** from developers
5. **Iterate and improve**
6. **Full migration** if successful

---

## Resources

- [Diátaxis Framework](https://diataxis.fr/) - Documentation structure methodology
- [Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/) - UX principle for information architecture
- [VitePress](https://vitepress.dev/) - Vue-powered documentation site generator
- [Technical Writing Best Practices](https://developers.google.com/tech-writing) - Google's guide

---

## Questions & Feedback

**Have suggestions?** Open an issue or PR with your ideas.

**Need clarification?** Ask in the team chat or create a discussion.

---

**Prepared by**: Kiro AI Assistant  
**Based on**: Industry research (2024-2025 best practices)  
**Status**: Awaiting team review and decision
