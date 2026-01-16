# Moldova Direct Documentation

> **Stack:** Nuxt 4 + Vue 3 + Supabase + TailwindCSS + Vercel

---

## 🎯 Find What You Need

Our documentation is organized by **what you want to do**:

### 📖 [Tutorials](./tutorials/) - Learning
**You want to:** Learn something new  
**Start here if:** You're new to the project or learning a concept

- [Quick Start Guide](tutorials/quick-start-guide.md) - Get running in 5 minutes
- [Database Setup](tutorials/database-setup.md) - Set up Supabase
- [Local Testing Guide](how-to/testing/local-testing-guide.md) - Run tests locally

### 🔧 [How-To Guides](./how-to/) - Problem Solving
**You want to:** Solve a specific problem  
**Start here if:** You know what you need to do

- [Authentication](./how-to/authentication/) - Auth setup, MFA, security
- [Checkout](./how-to/checkout/) - Payment flows, cart management
- [Deployment](./how-to/deployment/) - Deploy to production
- [Testing](./how-to/testing/) - Write and run tests

### 📋 [Reference](./reference/) - Information Lookup
**You want to:** Look up technical details  
**Start here if:** You need API docs or specifications

- [API Documentation](./reference/api/)
- [Architecture Specs](./reference/architecture/)
- [Component Library](./reference/components/)
- [Configuration](./reference/configuration/)

### 💡 [Explanation](./explanation/) - Understanding
**You want to:** Understand why things work the way they do  
**Start here if:** You want to understand concepts and decisions

- [Architecture](./explanation/architecture/) - System design
- [Decisions](./explanation/decisions/) - Why we made certain choices
- [Concepts](./explanation/concepts/) - Core concepts explained

### 📁 [Project](./project/) - Project Management
**You want to:** Project status and management info  
**Start here if:** You need roadmap, status, or guides

- [Migration Announcement](project/migration-announcement.md) - 📢 New structure!
- [Migration Summary](project/production-migration-summary.md)
- [Maintenance Guide](project/maintenance-guide.md)
- [Project Status](project/project-status.md) - Current development phase
- [Roadmap](project/roadmap-1.md) - Development timeline
- [Project Automation](project/project-automation-explained.md) - Automation setup
- [Changelog](CHANGELOG.md)

---

## 🚀 Quick Start

### New to the Project?

1. **[Quick Start Guide](tutorials/quick-start-guide.md)** - Get running (5 min)
2. **[Tech Stack](explanation/tech-stack.md)** - Understand our stack
3. **[Code Conventions](reference/code-conventions.md)** - How we code

### Need to Solve a Problem?

1. Browse [How-To Guides](./how-to/) by feature area
2. Check [Reference](./reference/) for API details
3. Read [Explanation](./explanation/) to understand why

### Working with AI Tools?

AI assistants automatically read:
- `llms.txt` (project root) - Quick overview
- `AGENTS.md` (project root) - Comprehensive context
- `.cursorrules` (project root) - Cursor AI rules
- `docs/ai-context/` - Detailed AI context

No configuration needed! AI tools will generate better code that follows our patterns.

---

## 📚 Documentation Structure

```
docs/
├── tutorials/          # 📖 Learning-oriented (step-by-step)
├── how-to/            # 🔧 Problem-oriented (task-focused)
│   ├── authentication/
│   ├── checkout/
│   ├── deployment/
│   └── testing/
├── reference/         # 📋 Information-oriented (lookup)
│   ├── api/
│   ├── architecture/
│   ├── components/
│   └── configuration/
├── explanation/       # 💡 Understanding-oriented (concepts)
│   ├── architecture/
│   ├── decisions/
│   └── concepts/
├── project/          # 📁 Project management
│   ├── status/
│   ├── roadmap/
│   └── guides/
└── archive/          # 🗄️ Historical documentation
```

---

## 🔍 Common Tasks

### Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test
pnpm test:e2e
```

### Finding Documentation

**Old way (deprecated):**
- Browse through 24 folders
- Average time: 30+ minutes

**New way:**
1. Ask: "What do I need?"
   - Learning? → `tutorials/`
   - Problem? → `how-to/`
   - Lookup? → `reference/`
   - Understanding? → `explanation/`
2. Navigate to section
3. Target time: Under 3 minutes

### Updating Documentation

See [Maintenance Guide](project/maintenance-guide.md) for:
- How to add new documentation
- Where to place different types of docs
- Documentation quality standards
- Review process

---

## 🎨 Key Concepts

### Diátaxis Framework

Our documentation follows the [Diátaxis framework](https://diataxis.fr/):

| Type | Purpose | Example |
|------|---------|---------|
| **Tutorial** | Learning | "How to build your first feature" |
| **How-To** | Problem-solving | "How to add authentication" |
| **Reference** | Information | "API endpoint documentation" |
| **Explanation** | Understanding | "Why we use Supabase" |

### Code Conventions

- **TypeScript strict mode** for all code
- **Components:** PascalCase (e.g., `ProductCard.vue`)
- **Files:** kebab-case (e.g., `product-card.vue`)
- **Composables:** camelCase with "use" prefix (e.g., `useAuth.ts`)
- **Never trust client-sent prices** - always verify server-side
- **Add data-testid** to all interactive elements

### Security Rules

⚠️ **Critical:**
- Never trust client-sent prices
- Always verify prices server-side
- Use CSRF validation for state changes
- Use atomic RPC functions for inventory
- Never expose service keys in code

See [AGENTS.md](../AGENTS.md) for complete security rules with code examples.

---

## 📊 Project Status

### Current State
- **Quality Score:** 52/100 (improvements ongoing)
- **Documentation Files:** 609
- **Migration Status:** ✅ Complete
- **Backup Available:** ✅ Yes

### Known Issues
- 680 broken links (being fixed incrementally)
- 609 files need metadata (being added)
- 39 file conflicts (being resolved)

See [Migration Summary](project/production-migration-summary.md) for details.

---

## 🆘 Need Help?

### Documentation Issues
1. Check [Migration Announcement](project/migration-announcement.md)
2. Review [Migration Guide](project/migration-guide.md)
3. See [Quality Report](../scripts/documentation/quality-report.md)

### Old Documentation Locations
Old locations still work with deprecation notices. You have **30 days** to update bookmarks.

Example:
```markdown
> ⚠️ **DEPRECATED**: This documentation has been moved.
> **New location:** [docs/how-to/README.md](how-to/testing/README.md)
```

### Questions?
- Search docs: `grep -r "search term" docs/`
- Check [AGENTS.md](../AGENTS.md) for AI context
- Review [CLAUDE.md](../CLAUDE.md) for project rules

---

## 🔄 Recent Changes

### January 15, 2026 - Documentation Migration
- ✅ Migrated to Diátaxis structure
- ✅ Generated AI context files
- ✅ Added deprecation notices
- ✅ Created redirects
- 📊 Quality score: 52/100 (improving)

See [CHANGELOG.md](CHANGELOG.md) for full history.

---

## 📖 Additional Resources

### For Developers
- [Quick Start Guide](tutorials/quick-start-guide.md)
- [Code Conventions](reference/code-conventions.md)
- [Testing Guide](how-to/testing/quick-reference.md)

### For AI Tools
- [llms.txt](../llms.txt) - Quick overview
- [AGENTS.md](../AGENTS.md) - Comprehensive context
- [.cursorrules](../.cursorrules) - Cursor rules
- [ai-context/](./ai-context/) - Detailed context

### For Project Management
- [Migration Summary](project/production-migration-summary.md)
- [Maintenance Guide](project/maintenance-guide.md)
- [Roadmap](project/roadmap.md)

---

**Last Updated:** January 15, 2026  
**Migration Status:** ✅ Complete  
**Documentation Version:** 2.0 (Diátaxis)

---

## 💬 Feedback

We want to hear from you:
- Is the new structure easier to navigate?
- Are you finding information faster?
- What could be improved?

Share feedback in team chat or create an issue.
