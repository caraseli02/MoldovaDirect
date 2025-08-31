# Moldova Direct Documentation

## 📁 Documentation Structure

```
MoldovaDirect/
├── README.md                      # Main project README
├── docs/                          # Technical documentation
│   ├── README.md                  # This file - docs index
│   ├── SHADCN_MIGRATION.md       # UI component migration guide
│   ├── SUPABASE_SETUP.md         # Database setup guide
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
│   │   └── code-conventions.md  # Coding standards
│   │
│   ├── specs/                   # Feature specifications
│   │   ├── user-authentication/
│   │   ├── product-catalog/
│   │   ├── shopping-cart/
│   │   └── admin-dashboard/
│   │
│   ├── docs/                    # Operational guides
│   │   ├── DEPLOYMENT_GUIDE.md
│   │   ├── DATABASE_SETUP.md
│   │   ├── CLOUDFLARE_SETUP.md
│   │   └── TESTING.md
│   │
│   └── archive/                 # Historical documentation
│       ├── MOBILE_ACCESSIBILITY_IMPLEMENTATION.md
│       ├── MOBILE_CART_IMPLEMENTATION.md
│       └── PROFILE_MANAGEMENT_IMPLEMENTATION.md
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
- [Deployment Guide](./../.kiro/docs/DEPLOYMENT_GUIDE.md) - Deploy to production
- [Testing Guide](./../tests/AUTH_TESTING_GUIDE.md) - Run tests

### For Features
- [User Authentication](./../.kiro/specs/user-authentication/) - Auth system specs
- [Product Catalog](./../.kiro/specs/product-catalog/) - Product management
- [Shopping Cart](./../.kiro/specs/shopping-cart/) - Cart functionality
- [Admin Dashboard](./../.kiro/specs/admin-dashboard/) - Admin features

## 📚 Documentation Guidelines

### Where to Put Documentation

1. **Technical Guides** → `/docs/`
   - Setup instructions
   - Migration guides
   - API documentation
   - Development guides

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