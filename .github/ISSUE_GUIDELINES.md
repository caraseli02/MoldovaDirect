# Issue Management Guidelines

This document outlines best practices for creating and managing GitHub issues to prevent duplication and maintain organization.

## Before Creating a New Issue

### 1. Search for Duplicates

**Always search existing issues first:**

```bash
# Search by keyword
gh issue list --search "authentication"

# Search by label
gh issue list --label "security"

# Search all issues (including closed)
gh issue list --state all --search "cart validation"
```

**GitHub Web Search:**
- Use the search bar with filters: `is:issue authentication`
- Add state filter: `is:issue is:open authentication`
- Search in specific labels: `is:issue label:security`

### 2. Check Related Documentation

Before creating an issue, check:
- `/CODE_REVIEW_SUMMARY.md` - May already be tracked
- `/PR_REVIEW_*.md` - Recent PR findings
- `/ISSUES_VERIFICATION.md` - Recent issue creation logs
- `.github/ISSUES_FROM_REVIEW.md` - Historical review findings

### 3. Review Similar Issues

If you find similar issues:
- Comment on existing issue instead of creating new one
- If different but related, link issues: "Related to #123"
- If truly duplicate, comment and close with "Duplicate of #123"

## Creating Issues

### Use Issue Templates

We have three templates:

1. **Bug Report** - For bugs and defects
2. **Feature Request** - For new features
3. **Code Review Finding** - For issues found in code reviews

**Always fill out the required fields:**
- ✅ Priority (P0/P1/P2/P3)
- ✅ Category (Security, Performance, etc.)
- ✅ Duplicate check confirmation

### Naming Conventions

**Format:** `[TYPE]: Brief description`

**Examples:**
- ✅ `[BUG]: Cart items disappear on page refresh`
- ✅ `[FEATURE]: Add wishlist functionality`
- ✅ `[SECURITY]: Missing rate limiting on auth endpoints`
- ✅ `[PERFORMANCE]: N+1 query in product breadcrumbs`
- ✅ `[REFACTOR]: Split auth store into modules`

**Prefixes for Critical Issues:**
- `🚨 CRITICAL:` - P0 issues blocking MVP/production
- `🔴 SECURITY:` - Security vulnerabilities
- `🔥 HIGH:` - High-impact P1 issues

### Label Guidelines

**Always use these labels:**

**Priority (required):**
- `P0` - Critical (MVP blocker, security, data loss)
- `P1` - High (important for launch)
- `P2` - Medium (nice to have)
- `P3-low` - Low (future consideration)

**Category (at least one):**
- `security` - Security vulnerabilities
- `performance` - Performance issues
- `bug` - Defects/broken functionality
- `enhancement` - New features
- `refactoring` - Code quality improvements
- `technical-debt` - Technical debt
- `documentation` - Documentation updates
- `accessibility` - A11y issues

**Scope (optional):**
- `cart` - Cart functionality
- `checkout` - Checkout flow
- `products` - Product catalog
- `admin` - Admin panel
- `backend` - Server-side code
- `ui` - User interface

**Status (optional):**
- `🚨 MVP-Blocker` - Cannot launch without this
- `🔜 Post-Launch` - Add after MVP validation
- `💡 Future` - Long-term improvements

### Cross-Referencing

**Always link related issues:**

In issue description:
```markdown
Related to #123
Blocks #456
Depends on #789
See also #234, #345
```

In comments:
```markdown
This is similar to #123 but focuses on a different aspect
```

**Mark duplicates:**
```markdown
Duplicate of #123
```
Then close the duplicate issue.

## Issue Structure

### Required Sections

Every issue should have:

1. **Clear Title** - Descriptive, searchable
2. **Problem Statement** - What's wrong or missing?
3. **Impact** - Why does this matter?
4. **Proposed Solution** - How to fix it?
5. **Acceptance Criteria** - How to verify it's done?

### Optional but Recommended

- **Code Examples** - Show the problem and solution
- **Effort Estimate** - Time to complete
- **Related Files/Components** - Where to look
- **Additional Context** - Screenshots, logs, etc.

## Managing Duplicates

### When You Find a Duplicate

**If you created the duplicate:**
1. Comment: "Duplicate of #123"
2. Close your issue
3. Add any unique info to the original issue

**If someone else created the duplicate:**
1. Comment linking to original: "This appears to be a duplicate of #123"
2. Tag the issue creator
3. Apply `duplicate` label
4. Wait for confirmation before closing

### Merging Information

If duplicate has valuable information:
1. Comment on original issue with link to duplicate
2. Copy unique details to original issue
3. Close duplicate with reference

## Preventing Duplicates

### For Code Reviews

**Before creating issues from code reviews:**

1. Check `ISSUES_VERIFICATION.md` for recent creations
2. Search by keywords from the finding
3. Check if PR review already covered it
4. Look for related security/performance issues

**Use consistent naming:**
- Security: `[SECURITY]: Missing auth on admin endpoints`
- Performance: `[PERFORMANCE]: N+1 query in breadcrumbs`
- Refactor: `[REFACTOR]: Split large auth store`

### For PR Reviews

**Before creating PR-related issues:**

1. Check if PR discussion already covered it
2. Search for issues tagged with PR number
3. Look for existing issues in same area
4. Consider commenting on PR instead

**Link to PR:**
```markdown
Found in PR #221
Related to changes in PR #222
```

## Issue Lifecycle

### States

1. **Open** - Active, needs work
2. **In Progress** - Someone is working on it
3. **Blocked** - Waiting on something
4. **Done** - Fixed, awaiting verification
5. **Closed** - Completed or won't fix

### Closing Issues

**When to close:**
- ✅ Issue is fixed and verified
- ✅ Issue is a duplicate (link to original)
- ✅ Issue is invalid/won't fix (explain why)
- ✅ Issue is obsolete (code removed, different approach)

**Always include:**
- Reason for closing
- Link to PR that fixed it (if applicable)
- Link to duplicate (if applicable)

## Search Strategies

### Effective Search Queries

**By keyword:**
```bash
gh issue list --search "authentication"
gh issue list --search "rate limiting"
gh issue list --search "admin endpoints"
```

**By multiple keywords:**
```bash
gh issue list --search "auth AND middleware"
gh issue list --search "cart AND validation"
```

**By label combinations:**
```bash
gh issue list --label "security,P0"
gh issue list --label "performance,P1"
```

**By state:**
```bash
gh issue list --state all --search "duplicate"
gh issue list --state closed --search "security"
```

**By author:**
```bash
gh issue list --author caraseli02
```

**By date:**
```bash
gh issue list --search "created:>2025-11-01"
```

### Web Search Tips

**In GitHub search bar:**
```
is:issue authentication
is:issue is:open label:security
is:issue author:@me
is:issue created:2025-11-12
is:issue sort:updated-desc
```

**Advanced search:**
```
is:issue "Missing authentication" in:title
is:issue "N+1 query" in:body
is:issue label:security label:P0
```

## Issue Triage Process

### Weekly Review

1. Review new issues
2. Apply correct labels
3. Check for duplicates
4. Assign priority
5. Link related issues
6. Close duplicates

### Monthly Cleanup

1. Review stale issues (>90 days no activity)
2. Close obsolete issues
3. Update priorities based on roadmap
4. Merge duplicates
5. Archive closed issues

## Tools and Automation

### GitHub CLI Commands

**List recent issues:**
```bash
gh issue list --limit 20
```

**Search for duplicates:**
```bash
gh issue list --search "your search term" --state all
```

**View issue details:**
```bash
gh issue view 123
```

**Create issue with template:**
```bash
gh issue create --template bug_report.yml
```

### Saved Searches

Create saved searches in GitHub for:
- Security issues: `is:issue is:open label:security`
- P0 issues: `is:issue is:open label:P0`
- Your issues: `is:issue author:@me`
- Recent issues: `is:issue created:>2025-11-01`

## Examples

### Good Issue Creation

```markdown
Title: [SECURITY]: Missing rate limiting on authentication endpoints

**Priority:** P0 - Critical
**Category:** Security
**Found in:** Code Review 2025-11-12

**Problem:**
Authentication endpoints lack rate limiting, making them vulnerable to brute force attacks.

**Location:**
- File: `pages/auth/login.vue:345-387`
- Endpoints: `/api/auth/login`, `/api/auth/register`

**Impact:**
- Brute force password attacks possible
- Account takeover risk
- DDoS vulnerability

**Proposed Solution:**
Implement rate limiting middleware:
1. Add Upstash Redis for rate limiting
2. Limit to 5 attempts per 15 minutes per IP
3. Return 429 status with Retry-After header

**Acceptance Criteria:**
- [ ] Rate limiting middleware created
- [ ] Applied to auth endpoints
- [ ] Tests verify rate limiting works
- [ ] Monitoring/alerting added

**Effort:** 2 days

**Related Issues:** #173 (existing rate limiting issue)

**Duplicate Check:** ✅ Searched, this is not a duplicate
```

### Handling a Duplicate

**Comment on duplicate:**
```markdown
This is a duplicate of #173 which already tracks rate limiting implementation.

#173 has more details and an accepted solution. Let's continue discussion there.

Closing this as duplicate.
```

## Questions?

If you're unsure:
- Ask in issue comments
- Discuss in team chat
- Review this guide
- Look at recent issues for examples

---

**Last Updated:** 2025-11-12
**Maintained By:** Engineering Team
