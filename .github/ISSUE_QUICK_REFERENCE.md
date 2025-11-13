# GitHub Issues Quick Reference

**Quick guide for creating and managing issues effectively**

## Before Creating an Issue

### 1. Search for Duplicates (Required)

```bash
# Quick search
gh issue list --search "your keywords here"

# By label
gh issue list --label "security,P0"

# All issues (including closed)
gh issue list --state all --search "your keywords"

# Use duplicate checker
node .github/scripts/check-duplicates.js --recent 20
```

### 2. Use the Right Template

- **Bug Report** → For defects and broken functionality
- **Feature Request** → For new features and enhancements
- **Code Review Finding** → For issues found in code reviews

```bash
gh issue create --template bug_report.yml
gh issue create --template feature_request.yml
gh issue create --template code_review_finding.yml
```

## Issue Naming

**Format:** `[TYPE]: Specific description with metrics`

**Good:**
- ✅ `[SECURITY]: Missing rate limiting on auth endpoints`
- ✅ `[PERFORMANCE]: N+1 query in product breadcrumbs`
- ✅ `[REFACTOR]: Split 1,172-line auth store`
- ✅ `🚨 CRITICAL: Missing auth on 40+ admin endpoints`

**Bad:**
- ❌ `Fix auth` (too vague)
- ❌ `Performance issue` (no specifics)
- ❌ `Bug in cart` (no details)

## Required Labels

### Priority (Pick One)
- `P0` - Critical (MVP blocker, security, data loss)
- `P1` - High (important for launch)
- `P2` - Medium (nice to have)
- `P3-low` - Low (future consideration)

### Category (Pick At Least One)
- `security` - Security vulnerabilities
- `performance` - Performance issues
- `bug` - Defects
- `enhancement` - New features
- `refactoring` - Code quality
- `technical-debt` - Tech debt
- `documentation` - Docs

### Scope (Optional)
- `cart`, `checkout`, `products`, `admin`, `backend`, `ui`

## Issue Template Checklist

When creating any issue:

- [ ] Searched for duplicates
- [ ] Used appropriate template
- [ ] Added priority label (P0/P1/P2/P3)
- [ ] Added category label
- [ ] Linked related issues
- [ ] Specified code location (if applicable)
- [ ] Defined acceptance criteria
- [ ] Estimated effort (if known)

## Handling Duplicates

**If you find a duplicate:**

1. Comment: `Duplicate of #123`
2. Apply `duplicate` label
3. Copy unique info to original
4. Close the duplicate

**If you created a duplicate:**

1. Comment: `Duplicate of #123. Closing.`
2. Close immediately
3. Add any unique info to original

## Common Search Patterns

```bash
# Security issues
gh issue list --label "security" --state open

# P0 critical issues
gh issue list --label "P0" --state open

# Recent issues
gh issue list --search "created:>2025-11-01"

# Your issues
gh issue list --author @me

# Cart-related
gh issue list --search "cart" --state all
```

## Quick Commands

```bash
# Create issue
gh issue create --template code_review_finding.yml

# View issue
gh issue view 123

# Edit issue
gh issue edit 123 --add-label "security,P0"

# Close issue
gh issue close 123 --comment "Fixed in PR #456"

# Check duplicates
node .github/scripts/check-duplicates.js 123

# Check all for duplicates
node .github/scripts/check-duplicates.js --all
```

## Code Review Issues

**Special process for code review findings:**

1. Create review document first
2. Search for duplicates (each finding)
3. Group related findings
4. Use `code_review_finding.yml` template
5. Create in priority order (P0 → P1 → P2)
6. Cross-reference related issues
7. Run duplicate checker
8. Create verification document

**See:** `.github/CREATING_ISSUES_FROM_REVIEWS.md`

## Need Help?

- **Full guidelines:** `.github/ISSUE_GUIDELINES.md`
- **Code review process:** `.github/CREATING_ISSUES_FROM_REVIEWS.md`
- **Structure improvements:** `.github/ISSUE_STRUCTURE_IMPROVEMENTS.md`

---

**Remember:** Search first, create second!
