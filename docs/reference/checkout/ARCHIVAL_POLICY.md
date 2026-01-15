# Documentation Archival Policy


**Last Updated:** 2025-11-02

This document defines when and how to archive documentation in the Moldova Direct project.

## Overview

Documentation archival ensures that:
- Active documentation remains focused and current
- Historical context is preserved for reference
- Documentation clutter is minimized
- Team members can easily find relevant information

## Archive Structure

> **Note (January 2026):** The archive uses a categorical structure rather than year-based directories. This provides easier navigation by topic.

```
docs/archive/
├── completed-specs/       # Finished feature specifications
│   ├── customer-order-history/
│   ├── order-status-updates/
│   └── shipping-step-refactor/
├── research/              # Research and analysis documents
│   └── hero-section/      # Hero section research
├── specs-legacy/          # Original/deprecated specifications
├── cart-fixes/            # Cart-related fixes
├── checkout-fixes/        # Checkout-related fixes
├── checkout-reviews/      # Checkout code reviews
├── phase-docs/            # Phase-based documentation
├── test-reports/          # Historical test reports
├── vercel-debug/          # Vercel debugging logs
└── meta-old/              # Old meta documentation
```

## Archival Decision Matrix

| Criteria | Keep Active | Archive | Delete |
|----------|-------------|---------|--------|
| **Frequency of Access** | Weekly/Monthly | < 1x/year | Never accessed |
| **Temporal Relevance** | Current version | Previous versions | Obsolete |
| **Content Type** | Living docs, guides | Reports, summaries | Working notes |
| **Historical Value** | N/A | High | None |
| **References in Code** | Yes | No (update refs) | No |
| **Legal/Compliance** | N/A | Required retention | Past retention |

## When to Archive

### Time-Bound Reports (Annual/Quarterly)
Archive when superseded by newer version:
- **Annual code reviews** (CODE_REVIEW_YYYY.md) - Archive when next year's review is completed
- **Quarterly analysis reports** - Archive after 2 newer reports exist
- **Update summaries** - Archive after next documentation update cycle

**Timeline:** Within 30 days of new version being published

### Completed Feature Documentation
Archive when feature is:
- Fully implemented and documented in main docs
- Deprecated and no longer supported
- Superseded by newer implementation

**Timeline:** Immediately upon completion/deprecation

### Test Reports and Coverage Analyses
Keep most recent, archive older:
- Keep current test coverage report
- Archive previous reports for historical comparison
- Delete reports older than 2 years (unless needed for compliance)

**Timeline:** Archive when new report is generated

### Migration Guides
Archive when:
- Migration is complete (100% of users migrated)
- Old system is fully deprecated
- 6+ months have passed since last reference

**Timeline:** 6 months after migration completion

## When NOT to Archive

**Never archive:**
- Living documentation (README.md, DOCUMENTATION_INDEX.md, QUICK_START_GUIDE.md)
- Current architecture documentation
- Active API documentation
- Setup and installation guides for current version
- Testing strategies and guides
- CHANGELOG.md (append-only, never archive)
- Security policies and procedures

## Archival Process

### 1. Prepare Document for Archival

Add frontmatter to document:
```markdown
---
archived: true
archived_date: YYYY-MM-DD
archived_by: Your Name
reason: Brief reason for archival
superseded_by: Link to current version (if applicable)
---

> ⚠️ **ARCHIVED DOCUMENTATION**
> This document was archived on [date].
> Reason: [Brief explanation]
> For current information, see: [link to current version]
```

### 2. Move to Archive Directory

```bash
# Example: Archive 2025 code review
git mv CODE_REVIEW_2025.md docs/archive/2025/code-reviews/

# Example: Archive completed feature spec
git mv .kiro/specs/feature-name/ .kiro/archive/2025/completed-features/
```

### 3. Update References

Search and update all references to the archived document:
```bash
# Find references
grep -r "CODE_REVIEW_2025.md" docs/ .kiro/ README.md

# Update links to point to archive location
# Or remove if no longer relevant
```

### 4. Update Documentation Index

Add entry to archive section in DOCUMENTATION_INDEX.md:
```markdown
## 📦 Archived Documentation

See [docs/archive/README.md](./docs/archive/README.md) for full archive index.

Recent Archives:
- [CODE_REVIEW_2025.md](./docs/archive/2025/code-reviews/CODE_REVIEW_2025.md) - Archived 2025-11-02
```

### 5. Update Changelog

Add entry to docs/CHANGELOG.md:
```markdown
## [YYYY-MM-DD]

### Archived
- CODE_REVIEW_2025.md - Superseded by CODE_REVIEW_2026.md
```

### 6. Commit Changes

```bash
git add .
git commit -m "docs: archive 2025 code review report

Archived CODE_REVIEW_2025.md as superseded by 2026 review.
Updated all references and added archive notice.

Related: #138"
```

## Archive Maintenance

### Monthly (1st of each month)
- Review files with "Last Updated" > 6 months ago
- Identify candidates for archival
- Verify no broken links to archived docs

### Quarterly (End of Q1, Q2, Q3, Q4)
- Archive time-bound reports from previous quarter
- Review archive for documents that can be deleted
- Update archive README with new additions

### Annually (January)
- Create new year directory structure (YYYY/)
- Archive previous year's annual reports
- Review 2+ year old archives for deletion

## Deletion Policy

### When to Delete (Not Archive)

Delete immediately:
- Personal/working notes with no team value
- Duplicate content (keep canonical version)
- Temporary debugging files
- Empty files with no content

Delete after retention period:
- Archived documents older than 3 years (unless legal/compliance requirement)
- Test reports older than 2 years
- Working documents with no historical value

### Deletion Process

**IMPORTANT:** Always discuss with team before deleting archived documentation.

1. Identify deletion candidate
2. Verify no legal/compliance retention requirement
3. Verify no references in code or active docs
4. Create issue for team review (wait 7 days for feedback)
5. If approved, delete file and update changelog
6. Commit: `git commit -m "docs: remove archived file [name] (archived YYYY-MM-DD, retention period expired)"`

## Archive Access

Archived documentation is:
- ✅ Searchable in repository
- ✅ Accessible via git history
- ✅ Referenced in DOCUMENTATION_INDEX.md
- ✅ Indexed in archive README files
- ✅ Fully version controlled

## Examples

### Example 1: Archiving Annual Code Review

```bash
# 1. Add archive notice to file
# (Edit CODE_REVIEW_2025.md to add frontmatter)

# 2. Move to archive
git mv CODE_REVIEW_2025.md docs/archive/2025/code-reviews/

# 3. Update references
# Edit DOCUMENTATION_INDEX.md to update link

# 4. Commit
git commit -m "docs: archive 2025 code review report"
```

### Example 2: Archiving Completed Feature Spec

```bash
# 1. Add archive notice to requirements.md
# (Edit .kiro/specs/feature-name/requirements.md)

# 2. Move entire directory
git mv .kiro/specs/feature-name/ .kiro/archive/2025/completed-features/

# 3. Update .kiro/PROJECT_STATUS.md to remove from active features
# 4. Add to completed features list
# 5. Commit
git commit -m "docs: archive completed feature spec [feature-name]"
```

### Example 3: Removing Empty or Redundant File

```bash
# 1. Verify file is truly empty or redundant
cat docs/CART_SECURITY.md  # Empty

# 2. Check for references
grep -r "CART_SECURITY.md" .

# 3. Delete (no archival needed for empty files)
git rm docs/CART_SECURITY.md

# 4. Commit
git commit -m "docs: remove empty CART_SECURITY.md file"
```

## Questions?

If unsure whether to archive, delete, or keep active:
1. Check this policy
2. Ask in team discussion
3. When in doubt, archive (don't delete)

## Related Documentation

- [DOCUMENTATION_INDEX.md](../DOCUMENTATION_INDEX.md) - Master documentation index
- [docs/archive/README.md](./archive/README.md) - Archive index
- [CHANGELOG.md](./CHANGELOG.md) - Documentation change log
- [GitHub Issue #138](https://github.com/caraseli02/MoldovaDirect/issues/138) - Documentation cleanup strategy
