# Moldova Direct Documentation

Welcome to the Moldova Direct documentation! This folder contains all technical documentation organized by category for easy navigation.

## 📁 Documentation Structure

```
docs/
├── getting-started/     # Setup and quick start guides
├── architecture/        # System architecture and design
├── features/           # Feature-specific documentation
│   ├── authentication/ # Auth-related features
│   └── cart/          # Shopping cart features
├── guides/            # How-to guides and best practices
├── development/       # Development workflows and patterns
├── meta/             # Documentation about documentation
├── automation/       # CI/CD and automation
├── testing/          # Testing documentation
├── analysis/         # Code quality and review reports
├── issues/           # Known issues and solutions
├── archive/          # Archived/historical documents
└── CHANGELOG.md      # Recent changes and updates
```

## 🚀 Quick Start

**New to the project?** Start here:

1. [Quick Start Guide](./getting-started/QUICK_START_GUIDE.md) - Get up and running quickly
2. [MVP Quick Start](./getting-started/MVP_QUICK_START.md) - Minimal viable setup
3. [Supabase Setup](./getting-started/SUPABASE_SETUP.md) - Database configuration
4. [Local Testing Guide](./getting-started/LOCAL_TESTING_GUIDE.md) - Test locally

## 📖 Documentation by Category

### 🎯 Getting Started
Essential guides for setting up and running the project:
- [Quick Start Guide](./getting-started/QUICK_START_GUIDE.md) - Get started in minutes
- [MVP Quick Start](./getting-started/MVP_QUICK_START.md) - Bare minimum setup
- [Local Testing Guide](./getting-started/LOCAL_TESTING_GUIDE.md) - Run and test locally
- [Supabase Setup](./getting-started/SUPABASE_SETUP.md) - Configure database

### 🏗️ Architecture
System design and architecture documentation:
- [Architecture Review](./architecture/ARCHITECTURE_REVIEW.md) - Overall system architecture
- [Architecture Improvement Roadmap](./architecture/ARCHITECTURE_IMPROVEMENT_ROADMAP.md) - Future improvements
- [Authentication Architecture](./architecture/AUTHENTICATION_ARCHITECTURE.md) - Auth system design
- [Cart System Architecture](./architecture/CART_SYSTEM_ARCHITECTURE.md) - Shopping cart technical details
- [Checkout Flow](./architecture/CHECKOUT_FLOW.md) - Multi-step checkout process

### ✨ Features
Feature-specific documentation and implementation details:

#### Authentication
- [MFA Implementation](./features/authentication/MFA_IMPLEMENTATION.md) - Multi-factor authentication
- [Auth Middleware Test Results](./features/authentication/AUTH_MIDDLEWARE_TEST_RESULTS.md) - Test coverage
- [Authentication Translations](./features/authentication/authentication-translations.md) - i18n support
- [Auth Flow Review](./features/authentication/auth-flow-review.md) - Authentication flow analysis

#### Shopping Cart
- [Cart Analytics](./features/cart/CART_ANALYTICS.md) - Analytics system documentation
- [Cart Locking](./features/cart/CART_LOCKING.md) - Inventory locking mechanism
- [Atomic Inventory Fix](./features/cart/ATOMIC_INVENTORY_FIX.md) - Inventory consistency fixes

#### Other Features
- [Internationalization (i18n) Configuration](./features/I18N_CONFIGURATION.md) - Multi-language setup
- [Landing Page CMS](./features/LANDING-PAGE-CMS.md) - Content management
- [Audit Logging](./features/AUDIT_LOGGING.md) - System audit trails

### 📚 Guides
Practical how-to guides and best practices:
- [Implementation Guide](./guides/implementation-guide.md) - General implementation guidelines
- [Testing Strategy](./guides/TESTING_STRATEGY.md) - Overall testing approach
- [Admin Testing](./guides/ADMIN_TESTING.md) - Admin dashboard testing
- [Test User Simulation](./guides/TEST_USER_SIMULATION.md) - Test personas and simulation
- [Key Rotation Completion Guide](./guides/KEY_ROTATION_COMPLETION_GUIDE.md) - Security key rotation
- [Marketing Copy Improvements](./guides/MARKETING-COPY-IMPROVEMENTS.md) - Content guidelines

### 🛠️ Development
Development workflows, patterns, and standards:
- [Patterns to Preserve](./development/PATTERNS_TO_PRESERVE.md) - Code patterns and conventions
- [shadcn Migration](./development/SHADCN_MIGRATION.md) - UI component migration guide
- [Component Modernization Plan](./development/component-modernization-plan.md) - Component upgrade strategy
- [Component Inventory](./development/component-inventory.md) - All UI components
- [UI/UX Review](./development/ui-ux-review.md) - Design system review
- [Troubleshooting Components](./development/troubleshooting-components.md) - Common component issues

### 🔧 Automation
CI/CD and project automation:
- [GitHub Project Automation](./automation/github-project-automation.md) - Automated workflows
- [Project Automation Explained](./automation/PROJECT_AUTOMATION_EXPLAINED.md) - Automation overview

### 🧪 Testing
Testing documentation and coverage reports:
- [Test Coverage Implementation](./testing/TEST_COVERAGE_IMPLEMENTATION.md) - Visual test coverage
- [Test Coverage Analysis](./testing/TEST_COVERAGE_ANALYSIS.md) - Coverage reports
- [Search Performance Verification](./testing/SEARCH_PERFORMANCE_VERIFICATION.md) - Performance testing

### 📊 Analysis
Code quality and review reports:
- [Code Quality Analysis (2025-11-01)](./analysis/CODE_QUALITY_ANALYSIS_2025-11-01.md)
- [Code Review 2025](./analysis/CODE_REVIEW_2025.md)
- [GitHub Issues Deduplication Audit](./analysis/GITHUB_ISSUES_DEDUPLICATION_AUDIT_FINAL.md)
- [GitHub Issues Deduplication (Corrected)](./analysis/GITHUB_ISSUES_DEDUPLICATION_FINAL_CORRECTED.md)
- [Deduplication Complete](./analysis/DEDUPLICATION_COMPLETE.md)

### 📋 Meta
Documentation about documentation:
- [Documentation Conventions](./meta/DOCUMENTATION_CONVENTIONS.md) - How to write docs
- [Documentation Index](./meta/DOCUMENTATION_INDEX.md) - Full documentation index
- [Documentation Summary](./meta/DOCUMENTATION_SUMMARY.md) - Overview of all docs
- [Documentation Update (2025-11-01)](./meta/DOCUMENTATION_UPDATE_2025-11-01.md) - Recent changes
- [Archival Policy](./meta/ARCHIVAL_POLICY.md) - How we archive docs
- [MVP Priority Order](./meta/MVP_PRIORITY_ORDER.md) - Development priorities
- [Remaining Work Summary](./meta/REMAINING_WORK_SUMMARY.md) - What's left to do

### 🐛 Issues
Known issues and their solutions:
- [Transactional Email Hardening](./issues/transactional-email-hardening.md)
- [Full App Unit Test Coverage](./issues/full-app-unit-test-coverage.md)

### 📦 Archive
Historical and archived documentation - see [archive/README.md](./archive/README.md)

## 🔄 Recent Updates

See [CHANGELOG.md](./CHANGELOG.md) for detailed recent changes.

## 📞 Getting Help

**Can't find what you're looking for?**

1. Use your editor's search (Ctrl/Cmd + P) to find files by name
2. Use grep to search file contents: `grep -r "search term" docs/`
3. Check the [Documentation Index](./meta/DOCUMENTATION_INDEX.md) for a complete list
4. See [Documentation Conventions](./meta/DOCUMENTATION_CONVENTIONS.md) for documentation standards

**For other project resources:**
- [Main Project README](../README.md) - Project overview
- [Kiro Documentation](../docs/README.md) - Project specs and status
- [Tech Stack](../docs/development/tech.md) - Technology decisions
- [Code Conventions](../docs/development/code-conventions.md) - Coding standards

## 🤝 Contributing to Documentation

1. **Choose the right folder** for your documentation
2. **Use clear, descriptive filenames** (kebab-case or UPPER_CASE)
3. **Include a table of contents** for documents longer than 100 lines
4. **Add examples** where applicable
5. **Update this README** when adding new categories or important docs
6. **Follow** the [Documentation Conventions](./meta/DOCUMENTATION_CONVENTIONS.md)

## 📝 Documentation Standards

- **Format**: All documentation in Markdown
- **Structure**: Clear headings and logical organization
- **Examples**: Include code examples where applicable
- **Dates**: Include dates for time-sensitive information
- **Maintenance**: Keep docs in sync with code changes

---

**Last Updated**: November 5, 2025
**Reorganization**: Docs restructured for improved discoverability
