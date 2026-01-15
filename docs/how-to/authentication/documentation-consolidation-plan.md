# Documentation Consolidation Plan

## Prerequisites

- [Add prerequisites here]

## Steps


**Created:** November 27, 2025
**Status:** ✅ Completed (January 2026)
**Purpose:** Consolidate `.kiro/` into `docs/` for simpler documentation structure

> **Note:** This consolidation has been completed. The `.kiro/` and `.docs/` directories no longer exist. All documentation is now in `/docs/`.

---

## Executive Summary

Currently the project has **three separate documentation structures**:
1. `/docs/` - Main technical documentation
2. `/.kiro/` - Kiro spec-driven documentation (hidden directory)
3. `/.docs/` - Admin fixes documentation (hidden directory)

**Recommendation:** Consolidate all documentation into a single `/docs/` directory.

---

## Current Problems

### 1. Discoverability Issues
- Hidden directories (`.kiro/`, `.docs/`) are not visible by default in file explorers
- New developers may miss important documentation
- IDE file trees often hide dotfiles

### 2. Navigation Confusion
- Three different README files to potentially read
- Multiple "indexes" for documentation
- Unclear which location is authoritative

### 3. Maintenance Burden
- Documentation updates require checking multiple locations
- Cross-references between structures use complex relative paths
- Easy to have outdated information in one location

### 4. Industry Standard
- Most open-source projects use a single `/docs/` folder
- GitHub, GitLab, and documentation generators expect `/docs/`
- Tools like GitHub Pages serve from `/docs/` by default

---

## Proposed Structure

```
docs/
├── README.md                    # Main documentation index
├── CHANGELOG.md                 # Project changelog
│
├── getting-started/             # Onboarding documentation
│   ├── QUICK_START_GUIDE.md
│   ├── MVP_QUICK_START.md
│   ├── LOCAL_TESTING_GUIDE.md
│   └── SUPABASE_SETUP.md
│
├── architecture/                # System design docs
│   ├── AUTHENTICATION_ARCHITECTURE.md
│   ├── CART_SYSTEM_ARCHITECTURE.md
│   ├── CHECKOUT_FLOW.md
│   └── ... (existing files)
│
├── specs/                       # Feature specifications (from .kiro/specs/)
│   ├── README.md               # Specs overview
│   ├── user-authentication/
│   │   ├── requirements.md
│   │   ├── design.md
│   │   └── tasks.md
│   ├── shopping-cart/
│   ├── checkout/
│   ├── admin-dashboard/
│   └── ... (other specs)
│
├── guides/                      # How-to guides
│   ├── TESTING_STRATEGY.md
│   ├── ADMIN_TESTING.md
│   └── ... (existing files)
│
├── development/                 # Developer documentation
│   ├── code-conventions.md     # From .kiro/steering/
│   ├── structure.md            # From .kiro/steering/
│   ├── tech.md                 # From .kiro/steering/
│   ├── component-inventory.md
│   └── ... (existing files)
│
├── api/                         # API documentation
│   └── README.md
│
├── features/                    # Feature-specific docs
│   ├── authentication/
│   ├── cart/
│   └── I18N_CONFIGURATION.md
│
├── security/                    # Security documentation
│   ├── README.md
│   ├── GDPR_COMPLIANCE.md
│   └── SECURE_LOGGER.md
│
├── testing/                     # Testing documentation
│   ├── TEST_COVERAGE_ANALYSIS.md
│   └── TEST_COVERAGE_IMPLEMENTATION.md
│
├── analysis/                    # Code reviews and reports
│   ├── CODE_REVIEW_2025.md
│   └── DOCUMENTATION_REVIEW_2025-11-27.md
│
├── meta/                        # Documentation about documentation
│   ├── DOCUMENTATION_INDEX.md
│   ├── DOCUMENTATION_CONVENTIONS.md
│   └── ARCHIVAL_POLICY.md
│
├── status/                      # Project status (from .kiro/)
│   ├── PROJECT_STATUS.md       # From .kiro/PROJECT_STATUS.md
│   ├── ROADMAP.md              # From .kiro/ROADMAP.md
│   ├── PROGRESS.md             # From .kiro/PROGRESS.md
│   └── REMAINING_WORK_SUMMARY.md
│
├── fixes/                       # Issue fixes (from .docs/)
│   ├── admin-fixes/            # From .docs/admin-fixes/
│   └── checkout-confirmation-fix/
│
└── archive/                     # Archived documentation
    ├── README.md
    └── 2025/
```

---

## Migration Plan

### Phase 1: Preparation
1. Create backup of current structure
2. Identify all files to migrate
3. Create new directory structure in `docs/`

### Phase 2: Content Migration

#### From `.kiro/`:
| Source | Destination |
|--------|-------------|
| `.kiro/PROJECT_STATUS.md` | `docs/status/PROJECT_STATUS.md` |
| `.kiro/ROADMAP.md` | `docs/status/ROADMAP.md` |
| `.kiro/PROGRESS.md` | `docs/status/PROGRESS.md` |
| `.kiro/specs/*` | `docs/specs/*` |
| `.kiro/steering/code-conventions.md` | `docs/development/code-conventions.md` |
| `.kiro/steering/tech.md` | `docs/development/tech.md` |
| `.kiro/steering/structure.md` | `docs/development/structure.md` |
| `.kiro/steering/product.md` | `docs/development/product.md` |
| `.kiro/docs/*` | `docs/guides/*` or appropriate location |

#### From `.docs/`:
| Source | Destination |
|--------|-------------|
| `.docs/admin-fixes/*` | `docs/fixes/admin-fixes/*` |
| `.docs/checkout-confirmation-fix/*` | `docs/fixes/checkout-confirmation-fix/*` |
| `.docs/issues-archive/*` | `docs/archive/issues/` or delete if obsolete |

### Phase 3: Update References
1. Update all cross-references in markdown files
2. Update `README.md` to point to new locations
3. Update `CLAUDE.md` with new paths

### Phase 4: Cleanup
1. Remove empty `.kiro/` directory
2. Remove empty `.docs/` directory
3. Update `.gitignore` if needed

### Phase 5: Verification
1. Run link checker: `npm run docs:check-links`
2. Verify all docs are accessible
3. Test documentation navigation

---

## What to Keep from Kiro

### Valuable Concepts to Preserve:
1. **Feature Specifications Structure** - The `requirements.md`, `design.md`, `tasks.md` pattern is excellent
2. **Steering Files** - Code conventions and tech decisions are valuable
3. **Status Tracking** - PROJECT_STATUS.md and ROADMAP.md are useful

### What Can Be Simplified:
1. **EARS Notation** - Keep if useful, but not strictly required
2. **Kiro-specific workflows** - Can be adapted to simpler approaches
3. **Archived Specs** - Move to archive or delete if obsolete

---

## Benefits of Consolidation

### For Developers
- Single location to find all documentation
- Simpler navigation and discovery
- Better IDE support (visible directories)

### For Maintenance
- One place to update documentation
- Simpler cross-references
- Easier to keep documentation in sync

### For Tools
- GitHub Pages can serve from `/docs/`
- Documentation generators work better
- CI/CD integration is simpler

---

## Risks and Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing links | Run link checker, fix all references |
| Losing git history | Use `git mv` to preserve history |
| Confusion during transition | Complete in one PR, communicate changes |
| Missing important docs | Create checklist, verify all files migrated |

---

## Recommendation

**Proceed with consolidation** - The benefits outweigh the migration effort.

**Timeline:**
- Can be completed in 1-2 hours
- Should be done in a single PR for clean transition
- Coordinate with team to avoid conflicts

**Alternative:** If full migration is too disruptive, consider:
1. Keep `.kiro/` but redirect all new docs to `docs/`
2. Add symlinks from `.kiro/` to `docs/` locations
3. Gradually migrate over time

---

## Next Steps

1. **Decision:** Team agrees on approach
2. **Backup:** Create branch with current state
3. **Migrate:** Execute migration plan
4. **Verify:** Run all documentation checks
5. **Communicate:** Update team on new structure

---

**Author:** Claude Code
**Reviewed by:** (pending)
