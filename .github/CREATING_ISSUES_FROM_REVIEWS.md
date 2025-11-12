# Creating Issues from Code Reviews

This guide provides a systematic approach to creating GitHub issues from code review findings to prevent duplication and maintain consistency.

## Pre-Creation Checklist

Before creating any issue from a code review:

### 1. Document the Review

Create a review document first (e.g., `CODE_REVIEW_2025-11-12.md`) that contains:
- All findings
- Priority classifications
- Effort estimates
- Impact analysis

This serves as a single source of truth.

### 2. Search for Existing Issues

**Required searches for each finding:**

```bash
# Search by main keywords
gh issue list --search "authentication admin endpoints"
gh issue list --search "rate limiting auth"
gh issue list --search "N+1 query breadcrumbs"

# Search by category + priority
gh issue list --label "security,P0"
gh issue list --label "performance,P1"

# Search all issues (including closed)
gh issue list --state all --search "admin authentication"
```

**Use the duplicate checker script:**

```bash
# Check if new finding is similar to existing issues
node .github/scripts/check-duplicates.js --all
```

### 3. Check Recent Review Documents

Review these files to avoid duplicating recent work:
- `CODE_REVIEW_SUMMARY.md`
- `PR_REVIEW_*.md`
- `ISSUES_VERIFICATION.md`
- `.github/ISSUES_FROM_REVIEW.md`

### 4. Group Related Findings

Before creating issues, group related findings:

**Example:**
- Finding 1: Missing auth on `/api/admin/products`
- Finding 2: Missing auth on `/api/admin/orders`
- Finding 3: Missing auth on `/api/admin/users`

→ Create **one issue**: "Missing Authentication on 40+ Admin API Endpoints"

## Creating Issues Systematically

### Step 1: Create Verification Document

Track what you're about to create:

```markdown
# Code Review Issues - 2025-11-12

## Findings to Convert
- [ ] Finding 1: Missing admin auth (P0)
- [ ] Finding 2: Account deletion GDPR (P0)
- [ ] Finding 3: PII logging (P0)
...

## Duplicate Check Results
- Finding 1: No duplicates found (#173 is different - API vs middleware)
- Finding 2: No duplicates found
- Finding 3: Similar to #226 but closed, new issue needed
...
```

### Step 2: Use Consistent Naming

**Template:** `[CATEGORY]: Specific description with metrics`

**Good Examples:**
- `🚨 CRITICAL: Missing Authentication on 40+ Admin API Endpoints`
- `[PERFORMANCE]: N+1 Query Pattern in Product Breadcrumbs`
- `[REFACTOR]: Refactor 1,172-Line Auth Store into Modules`
- `[SECURITY]: Excessive PII Logging Violates GDPR (275+ instances)`

**Bad Examples:**
- ❌ `Fix auth` (too vague)
- ❌ `Performance issue` (no specifics)
- ❌ `Refactor code` (no context)

### Step 3: Use Code Review Template

```bash
gh issue create --template code_review_finding.yml
```

**Fill in all required fields:**
- Priority: P0/P1/P2/P3
- Category: Security, Performance, etc.
- Review Source: "Code Review 2025-11-12"
- Finding: Description
- Location: File paths with line numbers
- Impact: What happens if not fixed
- Solution: Step-by-step fix
- Acceptance Criteria: How to verify
- Effort: Time estimate
- Duplicate Check: ✅ Confirmed

### Step 4: Cross-Reference

**In issue body, link to:**
- Review document: "Found in Code Review 2025-11-12"
- Related issues: "Related to #123, Blocks #456"
- PR if applicable: "Found in PR #221"
- Documentation: "See also: `/docs/architecture.md`"

### Step 5: Apply Correct Labels

**Required labels:**
- Priority: `P0`, `P1`, `P2`, or `P3-low`
- Type: `security`, `performance`, `bug`, `enhancement`, `refactoring`

**Optional labels:**
- Scope: `cart`, `checkout`, `admin`, `products`
- Status: `🚨 MVP-Blocker`, `🔜 Post-Launch`, `💡 Future`
- Special: `data-integrity`, `accessibility`, `technical-debt`

### Step 6: Batch Creation Strategy

**For multiple issues from one review:**

1. **Create in priority order** (P0 first, then P1, etc.)
2. **Check for duplicates after each creation**
3. **Update verification document** as you go
4. **Link related issues** to each other

**Example workflow:**

```bash
# Create P0 issues first
gh issue create --template code_review_finding.yml # Issue #224
gh issue create --template code_review_finding.yml # Issue #225
gh issue create --template code_review_finding.yml # Issue #226

# After each, update related issues
gh issue edit 224 --body "$(cat body.md)\n\nRelated: #225, #226"
gh issue edit 225 --body "$(cat body.md)\n\nRelated: #224, #226"

# Create P1 issues
gh issue create --template code_review_finding.yml # Issue #227
# ... continue
```

## Preventing Common Duplication Scenarios

### Scenario 1: Similar Security Issues

**Problem:** Multiple findings about authentication

**Solution:** Consolidate into themed issues:
- Missing auth on **admin endpoints** → One issue
- Missing auth on **user endpoints** → Separate issue
- Missing **rate limiting** → Separate issue
- Missing **MFA enforcement** → Separate issue

### Scenario 2: Performance Optimizations

**Problem:** Multiple N+1 queries found

**Solution:** Create one issue per distinct location/pattern:
- N+1 in **product breadcrumbs** → Issue #227
- N+1 in **order history** → Different issue
- Both are N+1, but different solutions

### Scenario 3: Refactoring Large Files

**Problem:** Multiple large files to refactor

**Solution:** One issue per file/store:
- Auth store (1,172 lines) → Issue #230
- Products page (915 lines) → Issue #236
- Don't combine; different scope and effort

### Scenario 4: Code Simplification

**Problem:** Many unnecessary code sections

**Solution:** Group by type or create comprehensive issue:
- Remove **mock data** (440 lines) → Group together
- Simplify **analytics** (550 lines) → Group together
- Or: **One issue** for all simplification (Issue #231)

### Scenario 5: PR Review Findings

**Problem:** Found issues in recently merged PR

**Solution:** Check if already tracked in:
- Original PR discussion
- Comprehensive code review
- Existing issues

**Only create new issue if:**
- Not discussed in PR
- Not in comprehensive review
- Adds new information

## Post-Creation Verification

### 1. Create Verification Document

After creating issues, document:

```markdown
# Issues Created - Code Review 2025-11-12

## Summary
- Total created: 14 issues
- P0: 3 issues (#224-226)
- P1: 5 issues (#227-231)
- P2: 6 issues (#232-237)

## Duplicate Checks
- #224: Checked against #173, #232 - Different scope ✅
- #225: No similar issues found ✅
- #226: Similar to closed #85, new issue needed ✅
...

## Cross-References
- Security issues: #224, #225, #226, #232, #233, #234
- Performance issues: #227, #228, #229, #237
- Refactoring: #230, #231, #236
...
```

### 2. Run Duplicate Checker

```bash
# Check recent issues for duplicates
node .github/scripts/check-duplicates.js --recent 20
```

### 3. Update Review Document

Add GitHub links to findings:

```markdown
## Finding 1: Missing Admin Auth
**GitHub Issue:** #224
**Status:** Created
**Labels:** security, critical, P0
```

## Handling Duplicates Found After Creation

### If You Created a Duplicate

1. **Immediately comment on duplicate:**
   ```markdown
   This is a duplicate of #123. Closing in favor of the original.

   All information from this issue has been copied to #123.
   ```

2. **Copy unique information to original issue**

3. **Close duplicate with label:**
   ```bash
   gh issue close 456 --comment "Duplicate of #123"
   gh label add duplicate 456
   ```

### If Someone Reports Duplicate

1. **Investigate both issues**
2. **Determine which to keep** (usually first created, or most detailed)
3. **Merge information** to kept issue
4. **Close duplicate** with reference
5. **Update any cross-references**

## Quality Checklist

Before finalizing issue creation:

- [ ] Issue title is specific and searchable
- [ ] Priority label applied (P0/P1/P2/P3)
- [ ] Category labels applied
- [ ] Review source documented
- [ ] Code location specified
- [ ] Impact clearly stated
- [ ] Solution outlined with steps
- [ ] Acceptance criteria defined
- [ ] Effort estimated
- [ ] Related issues linked
- [ ] Duplicate check performed and documented
- [ ] Cross-references added to related issues

## Template for Batch Issue Creation

When creating multiple issues from one review:

```bash
#!/bin/bash

# Create issues with consistent metadata

# P0 Issues
gh issue create \
  --title "🚨 CRITICAL: Missing Authentication on 40+ Admin API Endpoints" \
  --label "security,critical,P0" \
  --body "$(cat finding-1-admin-auth.md)"

gh issue create \
  --title "🚨 CRITICAL: Non-Atomic Account Deletion Violates GDPR" \
  --label "security,critical,P0,data-integrity" \
  --body "$(cat finding-2-account-deletion.md)"

# P1 Issues
gh issue create \
  --title "[PERFORMANCE]: N+1 Query Pattern in Product Breadcrumbs" \
  --label "performance,P1" \
  --body "$(cat finding-3-n1-query.md)"

# After all created, link related issues
gh issue edit 224 --body "$(gh issue view 224 --json body -q .body)\n\nRelated: #225, #226"
```

## Review Schedule

**Before each review:**
- Update this document with lessons learned
- Review recent duplicate issues
- Check if search strategies need updating

**After each review:**
- Document what worked well
- Document what caused duplicates
- Update guidelines based on experience

## Examples

### Good Issue Creation

**Review Finding:**
> 40+ admin API endpoints lack authentication checks

**Search Performed:**
```bash
gh issue list --search "admin authentication"
gh issue list --search "admin API auth"
gh issue list --label "security,admin"
```

**Result:** No duplicates found (#173 is about middleware, this is API-level)

**Issue Created:**
```
Title: 🚨 CRITICAL: Missing Authentication on 40+ Admin API Endpoints
Labels: security, critical, P0, admin
Body: [Complete details with code locations, impact, solution]
Cross-refs: Related to #173 (middleware), Blocks #225 (GDPR)
```

**Verification:**
```markdown
✅ #224 created
✅ No duplicates
✅ Linked to related issues
✅ Comprehensive solution provided
```

### Bad Issue Creation (Avoided)

**Review Finding:**
> Auth store is too large

**What NOT to do:**
❌ Create issue titled "Fix auth store"
❌ Skip duplicate check
❌ Don't provide metrics or solution
❌ Don't link to code review

**What to do instead:**
✅ Title: "[REFACTOR]: Refactor 1,172-Line Auth Store into Modules"
✅ Search for existing refactoring issues
✅ Provide detailed breakdown of proposed modules
✅ Link to code review and similar issues

## Conclusion

**Key principles:**
1. **Search first, create second**
2. **Document everything**
3. **Group related findings**
4. **Use consistent naming**
5. **Cross-reference thoroughly**
6. **Verify after creation**

**Remember:**
- It's better to add a comment to an existing issue than create a duplicate
- Quality > Quantity
- Well-documented issues save time later
- Duplicate prevention is everyone's responsibility

---

**Questions?** See `.github/ISSUE_GUIDELINES.md` or ask in team chat.
