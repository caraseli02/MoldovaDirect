# Moldova Direct - Kiro Documentation

This folder contains all project documentation following Kiro's spec-driven development approach.

## 📁 Documentation Structure

```
.kiro/
├── README.md                    # This file - documentation index
├── PROJECT_STATUS.md           # Current project state and health
├── ROADMAP.md                  # Development timeline and priorities  
├── PROGRESS.md                 # Completed milestones tracking
│
├── steering/                   # Project context and standards
│   ├── product.md             # Product vision and business context
│   ├── tech.md                # Technology stack and decisions
│   ├── structure.md           # Code organization and conventions
│   └── code-conventions.md    # Detailed coding standards
│
├── specs/                      # Feature specifications
│   ├── user-authentication/   # Auth system specs
│   │   ├── requirements.md    # User stories with EARS notation
│   │   ├── design.md         # Technical architecture
│   │   └── tasks.md          # Implementation checklist
│   │
│   ├── product-catalog/       # Product system specs
│   │   ├── requirements.md    # Catalog requirements
│   │   ├── design.md         # System design
│   │   └── tasks.md          # Development tasks
│   │
│   └── shopping-cart/         # Cart system specs
│       ├── requirements.md    # Cart requirements
│       ├── design.md         # Cart architecture
│       └── tasks.md          # Implementation plan
│
└── docs/                       # Operational documentation
    ├── DEPLOYMENT_GUIDE.md    # Deployment instructions
    ├── DATABASE_SETUP.md      # Database configuration
    └── TESTING.md            # Testing strategy

```

## 🚀 Quick Start Guide

### For New Developers
1. Read `steering/product.md` to understand the business context
2. Review `steering/tech.md` for technology stack
3. Check `PROJECT_STATUS.md` for current development state
4. Study `steering/structure.md` and `code-conventions.md` for coding standards

### For Feature Development
1. Find or create a spec folder in `specs/`
2. Start with `requirements.md` to understand user needs
3. Review `design.md` for technical approach
4. Follow `tasks.md` for implementation steps

### For Operations
1. See `docs/DEPLOYMENT_GUIDE.md` for deployment
2. Check `docs/DATABASE_SETUP.md` for database setup
3. Review `docs/TESTING.md` for testing procedures

## 📋 Key Documents

### Strategic Documents
- **[PROJECT_STATUS.md](PROJECT_STATUS.md)** - Real-time project health and status
- **[ROADMAP.md](ROADMAP.md)** - Future development plans
- **[PROGRESS.md](PROGRESS.md)** - Completed features and milestones

### Steering Files (Auto-loaded by Kiro)
- **[product.md](steering/product.md)** - Product vision (weight: 10)
- **[tech.md](steering/tech.md)** - Technology decisions (weight: 30)
- **[structure.md](steering/structure.md)** - Project structure (weight: 20)
- **[code-conventions.md](steering/code-conventions.md)** - Coding standards (weight: 40)

### Active Specifications
- **[shopping-cart](specs/shopping-cart/)** - Current phase: Checkout integration pending
- **[user-authentication](specs/user-authentication/)** - ✅ Completed
- **[product-catalog](specs/product-catalog/)** - ✅ Completed

## 🎯 Current Focus

**Phase 5: Checkout & Payment Integration**
- See [ROADMAP.md](ROADMAP.md) for timeline
- Check [PROJECT_STATUS.md](PROJECT_STATUS.md) for blockers
- Review shopping-cart specs for integration points

## 🔄 Documentation Workflow

1. **Requirements First**: Define user needs in EARS notation
2. **Design Review**: Document technical approach and architecture
3. **Task Breakdown**: Create actionable implementation steps
4. **Update Progress**: Mark tasks complete as implemented
5. **Maintain Status**: Keep PROJECT_STATUS.md current

## 📝 EARS Notation Guide

All requirements follow EARS (Easy Approach to Requirements Syntax):

```
WHEN [trigger/condition]
THEN the system SHALL [action]
AND [additional requirements]
```

Example:
```
WHEN a customer clicks "Add to Cart"
THEN the system SHALL add the product to their cart
AND display a success message
AND update the cart count in the header
```

## 🏷️ Specification States

- **📝 Draft** - Initial specification being written
- **👀 Review** - Ready for team review
- **✅ Approved** - Approved for implementation
- **🚧 In Progress** - Currently being implemented
- **✔️ Complete** - Fully implemented and tested
- **🔄 Revision** - Needs updates based on feedback

## 🔧 Maintenance

### Weekly Updates
- Update PROJECT_STATUS.md with current state
- Mark completed tasks in specs/*/tasks.md
- Review and update ROADMAP.md priorities

### Per Feature
- Create new spec folder with requirements/design/tasks
- Update steering files if new patterns emerge
- Document decisions in design.md

### Monthly Review
- Archive completed specs if needed
- Update PROGRESS.md with milestones
- Refine steering files based on learnings

---

**Documentation Standard**: Kiro Spec-Driven Development
**Last Updated**: 2025-01-19
**Maintained By**: Development Team