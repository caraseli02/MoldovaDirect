# Documentation Structure

This folder contains essential documentation for the Moldova Direct project, covering admin panel fixes, SSR safety, and best practices.

---

## 📁 Folder Structure

```
.docs/
├── README.md                           # This file - Documentation index
├── admin-fixes/                        # Admin panel issues and solutions
│   ├── ISSUES-AND-SOLUTIONS.md         # Complete fix documentation
│   └── CLEAN-CODE-REVIEW.md            # Code quality analysis
├── checkout-confirmation-fix/          # Checkout confirmation fixes
├── issues-archive/                     # Historical troubleshooting docs
├── LOCALSTORAGE-PAGES-VERIFICATION.md  # LocalStorage verification
├── LOCALSTORAGE-PROBLEM-DEEP-DIVE.md   # LocalStorage deep dive
├── LOCALSTORAGE-SECURITY-AUDIT.md      # LocalStorage security
├── SSR-SAFETY-VERIFICATION.md          # SSR safety verification
└── PR-REVIEW-TRACKING.md               # PR review tracking
```

---

## 📄 Document Index

### Core Documentation

#### [`CLAUDE.md`](../CLAUDE.md) (Root Level)
**Purpose:** Quick reference guide for AI assistants and developers

**Contains:**
- Critical component import rules
- Plugin scoping best practices
- Cache management procedures
- Testing requirements
- Clean code standards
- Common issues and solutions

**When to read:**
- Before making any admin panel changes
- When encountering import errors
- When adding new plugins
- Before deployment

---

## 🔧 Admin Panel Documentation

### [`admin-fixes/ISSUES-AND-SOLUTIONS.md`](./admin-fixes/ISSUES-AND-SOLUTIONS.md)
**Purpose:** Comprehensive record of all admin panel issues and fixes

**Contains:**
- Executive summary of problems
- Root cause analysis for each issue
- Step-by-step solutions implemented
- Files modified with line numbers
- Before/after code comparisons
- Testing verification results
- Lessons learned

**Key Issues Documented:**
1. Vite Dynamic Import Resolution Failure (CRITICAL)
2. Cart Plugin Interference (HIGH)
3. Stale Vite Build Cache (MEDIUM)
4. Missing useToastStore Import (LOW)

### [`admin-fixes/CLEAN-CODE-REVIEW.md`](./admin-fixes/CLEAN-CODE-REVIEW.md)
**Purpose:** Code quality analysis and recommendations

**Contains:**
- Overall code quality rating (A-, 90/100)
- Component-by-component review
- SOLID principles review
- Performance and security analysis
- Recommendations

---

## 🛠️ Technical Deep Dives

### LocalStorage Issues
- [`LOCALSTORAGE-PROBLEM-DEEP-DIVE.md`](./LOCALSTORAGE-PROBLEM-DEEP-DIVE.md) - Deep dive analysis
- [`LOCALSTORAGE-PAGES-VERIFICATION.md`](./LOCALSTORAGE-PAGES-VERIFICATION.md) - Verification results
- [`LOCALSTORAGE-SECURITY-AUDIT.md`](./LOCALSTORAGE-SECURITY-AUDIT.md) - Security audit

### SSR & Safety
- [`SSR-SAFETY-VERIFICATION.md`](./SSR-SAFETY-VERIFICATION.md) - SSR safety verification

**When to read:**
- Debugging LocalStorage issues
- Ensuring SSR safety
- Understanding client-side state management

---

## 🧪 Testing & Quality Assurance

### Code Review
- [`PR-REVIEW-TRACKING.md`](./PR-REVIEW-TRACKING.md) - PR review tracking

**When to read:**
- Before merging critical fixes
- Reviewing code quality

---

## 🎯 Quick Navigation

### I want to...

**Fix a broken admin page**
→ Read [`CLAUDE.md`](../CLAUDE.md) → Component Import Rules section

**Understand LocalStorage issues**
→ Read [`LOCALSTORAGE-PROBLEM-DEEP-DIVE.md`](./LOCALSTORAGE-PROBLEM-DEEP-DIVE.md)

**Review code quality**
→ Read [`admin-fixes/CLEAN-CODE-REVIEW.md`](./admin-fixes/CLEAN-CODE-REVIEW.md)

**Ensure SSR safety**
→ Read [`SSR-SAFETY-VERIFICATION.md`](./SSR-SAFETY-VERIFICATION.md)

---

## 📊 Documentation Statistics

### Issues Documented
- **Admin Issues:** 4 major issues (all resolved ✅)

### Files Modified
- **Admin Pages:** 5 files
- **Plugins:** 2 files
- **Locales:** 4 files

---

## 🔄 Maintenance

### Updating Documentation

When making changes:

1. **Update CLAUDE.md** if:
   - You discover a new pattern to avoid
   - You find a better way to do something
   - You encounter a new type of error
   - You establish a new coding standard

2. **Update security docs** if:
   - You find security vulnerabilities
   - You implement security fixes

### Documentation Review Schedule

- **Weekly:** Review CLAUDE.md for relevance
- **Monthly:** Update code quality metrics and test results
- **Quarterly:** Archive outdated troubleshooting docs
- **Before Major Releases:** Full documentation audit

---

## 📚 Related Resources

### External Documentation
- [Nuxt 4 Documentation](https://nuxt.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Supabase Documentation](https://supabase.com/docs)

### Internal Documentation
- Main README: [`../README.md`](../README.md)
- Package JSON: [`../package.json`](../package.json)
- TypeScript Config: [`../tsconfig.json`](../tsconfig.json)

---

## 🤝 Contributing to Documentation

### Documentation Standards

**Markdown Formatting:**
- Use clear headings (H1-H4)
- Include code blocks with language tags
- Add checkboxes for checklists
- Use tables for comparisons
- Include emojis for visual navigation

**Code Examples:**
- Show both ❌ BAD and ✅ GOOD examples
- Include comments explaining why
- Use realistic examples from the codebase
- Keep examples concise (under 20 lines)

**Structure:**
- Start with Executive Summary
- Include Table of Contents for long docs
- End with Conclusion/Recommendations
- Add metadata (date, status, branch)

---

## 📞 Support

### Getting Help

**For developers:**
1. Read CLAUDE.md first
2. Check relevant section (admin, security, SSR)
3. Review archived docs if needed

**For AI assistants:**
1. ALWAYS read CLAUDE.md before making changes
2. Reference documented patterns
3. Follow established coding standards
4. Update docs after significant changes
5. Maintain documentation organization

---

**Last Updated:** 2025-11-29
**Maintained By:** Development Team
**Status:** Active and maintained ✅
