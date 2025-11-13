# GitHub Configuration

This directory contains GitHub-specific configuration and documentation for the Moldova Direct project.

## 📋 Issue Templates

Located in `ISSUE_TEMPLATE/`:

- **Bug Report** (`bug_report.yml`) - For reporting bugs and defects
- **Feature Request** (`feature_request.yml`) - For requesting new features
- **Code Review Finding** (`code_review_finding.yml`) - For issues found in code reviews

All templates enforce:
- Priority selection (P0/P1/P2/P3)
- Category selection (security, performance, etc.)
- Duplicate check confirmation
- Structured information capture

## 📚 Documentation

### Quick Start
- **[Quick Reference](ISSUE_QUICK_REFERENCE.md)** - One-page cheat sheet for issue management

### Comprehensive Guides
- **[Issue Guidelines](ISSUE_GUIDELINES.md)** - Complete guide to creating and managing issues (72KB)
- **[Creating Issues from Reviews](CREATING_ISSUES_FROM_REVIEWS.md)** - Systematic process for code review findings (83KB)
- **[Structure Improvements](ISSUE_STRUCTURE_IMPROVEMENTS.md)** - Implementation details and rationale (30KB)

## 🔧 Tools

### Duplicate Detection Script

Located in `scripts/check-duplicates.js`:

```bash
# Check specific issue for duplicates
node .github/scripts/check-duplicates.js 123

# Check all issues
node .github/scripts/check-duplicates.js --all

# Check recent 10 issues
node .github/scripts/check-duplicates.js --recent 10
```

**Features:**
- Text similarity analysis (Jaccard algorithm)
- Keyword group matching
- Label category overlap detection
- Configurable threshold (70%)
- Clear visual output

## 🏷️ Label System

### Priority (Required)
- `P0` - Critical (MVP blocker, security, data loss)
- `P1` - High (important for launch)
- `P2` - Medium (nice to have)
- `P3-low` - Low (future consideration)

### Category (Required)
- `security` - Security vulnerabilities
- `performance` - Performance issues
- `bug` - Defects
- `enhancement` - New features
- `refactoring` - Code quality
- `technical-debt` - Technical debt
- `documentation` - Documentation

### Scope (Optional)
- `cart`, `checkout`, `products`, `admin`, `backend`, `ui`, `database`

### Status (Optional)
- `🚨 MVP-Blocker` - Cannot launch without
- `🔜 Post-Launch` - After MVP validation
- `💡 Future` - Long-term improvements

## 🎯 Issue Naming Convention

**Format:** `[TYPE]: Specific description with metrics`

**Examples:**
- `🚨 CRITICAL: Missing Authentication on 40+ Admin API Endpoints`
- `[PERFORMANCE]: N+1 Query Pattern in Product Breadcrumbs`
- `[REFACTOR]: Refactor 1,172-Line Auth Store into Modules`
- `[BUG]: Cart items disappear on page refresh`
- `[FEATURE]: Add wishlist functionality`

## 📝 Workflow

### Creating a New Issue

1. **Search for duplicates**
   ```bash
   gh issue list --search "your keywords"
   node .github/scripts/check-duplicates.js --recent 20
   ```

2. **Use appropriate template**
   - Bug Report for defects
   - Feature Request for new features
   - Code Review Finding for review issues

3. **Fill all required fields**
   - Priority (P0/P1/P2/P3)
   - Category (security, performance, etc.)
   - Description with impact
   - Proposed solution
   - Acceptance criteria
   - Confirm duplicate check

4. **Cross-reference related issues**
   - Link to related issues
   - Reference review documents
   - Link to PRs if applicable

5. **Apply labels**
   - Priority label (required)
   - Category label (required)
   - Scope label (optional)

### Creating Issues from Code Reviews

Follow the systematic process in [Creating Issues from Reviews](CREATING_ISSUES_FROM_REVIEWS.md):

1. Document review findings
2. Search for duplicates (each finding)
3. Group related findings
4. Use code review template
5. Create in priority order (P0 → P1 → P2)
6. Cross-reference issues
7. Run duplicate checker
8. Create verification document

## 🔍 Preventing Duplicates

### Before Creating

**Always search first:**
```bash
# By keywords
gh issue list --search "authentication admin"

# By labels
gh issue list --label "security,P0"

# All issues (including closed)
gh issue list --state all --search "your keywords"

# Use automated checker
node .github/scripts/check-duplicates.js --all
```

### After Creating

**Verify no duplicates:**
```bash
# Check recent issues
node .github/scripts/check-duplicates.js --recent 20
```

### If Duplicate Found

1. Comment: `Duplicate of #123`
2. Apply `duplicate` label
3. Copy unique info to original
4. Close the duplicate

## 📊 Success Metrics

### Track Weekly
- % of issues using templates
- Number of duplicates created
- % of issues with proper labels
- Time to detect duplicates

### Goals
- 95%+ template usage
- <2 duplicates per month
- 100% proper labeling
- <24 hours duplicate detection

## 🚀 Quick Commands

```bash
# Create issue with template
gh issue create --template bug_report.yml

# View issue
gh issue view 123

# Edit issue
gh issue edit 123 --add-label "security,P0"

# Close issue
gh issue close 123 --comment "Fixed in PR #456"

# List P0 issues
gh issue list --label "P0" --state open

# Search issues
gh issue list --search "your keywords"
```

## 📖 Additional Resources

- **Full Review:** `/ISSUE_MANAGEMENT_REVIEW.md` - Complete analysis and implementation
- **GitHub Issues:** https://github.com/caraseli02/MoldovaDirect/issues
- **GitHub Discussions:** https://github.com/caraseli02/MoldovaDirect/discussions

## 🤝 Need Help?

- Check **[Quick Reference](ISSUE_QUICK_REFERENCE.md)** for common tasks
- Read **[Issue Guidelines](ISSUE_GUIDELINES.md)** for detailed process
- Review **[Code Review Process](CREATING_ISSUES_FROM_REVIEWS.md)** for review findings
- Ask in team chat or GitHub Discussions

---

**Last Updated:** 2025-11-12
**Maintained By:** Engineering Team
