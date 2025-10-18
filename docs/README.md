# Moldova Direct Documentation

## 📁 Documentation Structure

```
MoldovaDirect/
├── README.md                      # Main project README
├── docs/                          # Technical documentation
│   ├── README.md                  # This file - docs index
│   ├── CHANGELOG.md              # Recent changes and updates
│   ├── AUTHENTICATION_ARCHITECTURE.md # Auth system architecture
│   ├── CART_SYSTEM_ARCHITECTURE.md # Cart system technical details
│   ├── CART_ANALYTICS.md         # Cart analytics documentation
│   ├── CHECKOUT_FLOW.md          # Checkout and order flow
│   ├── SHADCN_MIGRATION.md       # UI component migration guide
│   ├── SUPABASE_SETUP.md         # Database setup guide
│   ├── I18N_CONFIGURATION.md     # Internationalization setup
│   ├── REMAINING_WORK_SUMMARY.md # Development roadmap
│   └── authentication-translations.md # Auth translations
│
├── .kiro/                         # Kiro spec-driven documentation
│   ├── README.md                  # Kiro documentation index
│   ├── PROJECT_STATUS.md         # Current project status
│   ├── ROADMAP.md                # Development timeline
│   ├── PROGRESS.md               # Completed milestones
│   │
│   ├── steering/                 # Project standards
│   │   ├── product.md           # Product vision
│   │   ├── tech.md              # Technology decisions
│   │   ├── structure.md         # Code organization
│   │   ├── code-conventions.md  # Coding standards
│   │   └── code-cleanup.md      # Code cleanup guidelines
│   │
│   ├── specs/                   # Feature specifications
│   │   ├── user-authentication/
│   │   ├── product-catalog/
│   │   ├── shopping-cart/
│   │   ├── checkout/
│   │   ├── admin-dashboard/
│   │   └── order-confirmation-emails/
│   │
│   ├── docs/                    # Operational guides
│   │   ├── DEPLOYMENT_GUIDE.md
│   │   ├── DATABASE_SETUP.md
│   │   ├── CLOUDFLARE_SETUP.md
│   │   └── TESTING.md
│   │
│   └── archive/                 # Historical documentation
│       ├── docs/                # Archived documentation
│       ├── MOBILE_ACCESSIBILITY_IMPLEMENTATION.md
│       ├── MOBILE_CART_IMPLEMENTATION.md
│       └── PROFILE_MANAGEMENT_IMPLEMENTATION.md
│
├── scripts/                      # Utility scripts
│   ├── test-email-integration.js # Email testing script
│   ├── test-order-creation.sh   # Order creation test
│   └── check-translations.js    # Translation validation
│
├── middleware/
│   └── README.md                # Middleware documentation
│
└── tests/
    └── AUTH_TESTING_GUIDE.md   # Testing guidelines
```

## 🚀 Quick Links

### For Developers
- [Project Status](./../.kiro/PROJECT_STATUS.md) - Current development state
- [Tech Stack & Migration](./SHADCN_MIGRATION.md) - Recent UI migration details
- [Remaining Work](./REMAINING_WORK_SUMMARY.md) - What needs to be done
- [Code Conventions](./../.kiro/steering/code-conventions.md) - Coding standards

### For Setup
- [Supabase Setup](./SUPABASE_SETUP.md) - Database configuration
- [i18n Configuration](./I18N_CONFIGURATION.md) - Internationalization setup
- [Authentication Architecture](./AUTHENTICATION_ARCHITECTURE.md) - Auth system technical details
- [Deployment Guide](./../.kiro/docs/DEPLOYMENT_GUIDE.md) - Deploy to production
- [Testing Guide](./../tests/AUTH_TESTING_GUIDE.md) - Run tests

### Project History
- [Changelog](./CHANGELOG.md) - Recent changes and updates
- [Cleanup Report](../CODE_CLEANUP_REPORT.md) - Code cleanup tracking
- [Cleanup Completed](../CLEANUP_COMPLETED_2025-10-12.md) - Latest cleanup details

### For Features
- [User Authentication](./../.kiro/specs/user-authentication/) - Auth system specs
- [Product Catalog](./../.kiro/specs/product-catalog/) - Product management
- [Shopping Cart](./../.kiro/specs/shopping-cart/) - Cart functionality
- [Admin Dashboard](./../.kiro/specs/admin-dashboard/) - Admin features
- [Cart System Architecture](./CART_SYSTEM_ARCHITECTURE.md) - Cart system technical architecture
- [Cart Analytics](./CART_ANALYTICS.md) - Cart analytics system documentation
- [Checkout & Orders](./CHECKOUT_FLOW.md) - Multi-step checkout UI and API overview

### Key Specs Index
Jump into the specs library when you need deeper requirements:
- [Checkout & Payments Spec](./../.kiro/specs/checkout/) – order flow, cash-on-delivery, future Stripe/PayPal work
- [Admin Order Management Spec](./../.kiro/specs/admin-order-management/) – dashboards, status updates, notifications
- [Order Status Updates Spec](./../.kiro/specs/order-status-updates/) – lifecycle, tracking, customer history
- [Order Confirmation Emails Spec](./../.kiro/specs/order-confirmation-emails/) – transactional templates and delivery (pending)

## 📚 Documentation Guidelines

### Where to Put Documentation

1. **Technical Guides** → `/docs/`
   - Setup instructions
   - Migration guides
   - API documentation
   - Development guides
   - Architecture documentation
   - Analytics system documentation

2. **Project Specifications** → `/.kiro/specs/`
   - Feature requirements
   - Technical designs
   - Implementation tasks

3. **Project Management** → `/.kiro/`
   - Status reports
   - Roadmaps
   - Progress tracking

4. **Component Documentation** → In component files
   - Use JSDoc/TSDoc comments
   - Include usage examples
   - Document props and events

### Documentation Standards

1. **Use Markdown** for all documentation
2. **Include table of contents** for long documents
3. **Add code examples** where applicable
4. **Keep it updated** - documentation should match code
5. **Use clear headings** and logical structure
6. **Include dates** for time-sensitive information

### Updating Documentation

When making changes:
1. Update relevant documentation immediately
2. Check for outdated references
3. Update the last modified date
4. Ensure examples still work
5. Update the project status if needed

## 🔄 Recent Updates

- **Oct 12, 2025**: Major code cleanup - removed PayPal integration, unused composables, and dependencies
- **Oct 12, 2025**: Organized test scripts into `scripts/` directory
- **Oct 12, 2025**: Updated documentation to reflect Stripe-only payment processing
- **Sep 8, 2025**: Enhanced cart system with Pinia availability detection and comprehensive architecture documentation
- **Sep 8, 2025**: Fixed TypeScript issues in cart analytics plugin and improved code formatting
- **Sep 8, 2025**: Added cart analytics system documentation and memory management improvements
- **Sep 8, 2025**: Added comprehensive authentication architecture documentation
- **Sep 8, 2025**: Enhanced i18n configuration with lazy loading optimization
- **Aug 31, 2025**: Major documentation cleanup and reorganization
- **Aug 31, 2025**: Migrated to shadcn-vue UI components
- **Aug 30, 2025**: Completed user profile management
- **Aug 29, 2025**: Enhanced mobile accessibility

## 📞 Getting Help

- Check [Project README](./../README.md) for quick start
- Review [Kiro Documentation](./../.kiro/README.md) for project context
- See [Tech Stack](./../.kiro/steering/tech.md) for technology decisions
- Read [Code Conventions](./../.kiro/steering/code-conventions.md) for standards

## 🤝 Contributing to Documentation

1. Follow the structure outlined above
2. Write clear, concise documentation
3. Include practical examples
4. Update the index when adding new docs
5. Review for accuracy before committing
