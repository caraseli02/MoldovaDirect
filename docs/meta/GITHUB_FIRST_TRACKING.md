# GitHub-First Issue Tracking

**Philosophy:** GitHub Issues is the single source of truth. Documentation references issues, not duplicates their status.

---

## ✅ The Right Way

### When You Fix an Issue

1. **Fix the code**
   ```bash
   # Make your changes
   git add .
   git commit -m "fix: resolve issue #73 - implement admin RBAC

   Added requireAdminRole() authorization to 31 admin endpoints.

   Fixes #73"
   ```

2. **GitHub automatically closes the issue** (when commit reaches main)
   - The "Fixes #73" in commit message auto-closes it
   - Commit hash is linked to the issue
   - Timestamp is recorded

3. **Documentation just references GitHub**
   ```markdown
   ## Remaining Work
   - [ ] #160 - Email template auth verification
   - [ ] #162 - Rotate exposed keys
   - [ ] #81 - Audit Supabase client usage

   See [GitHub Issues](https://github.com/user/repo/issues) for current status.
   ```

**That's it.** No manual tracking needed.

---

## 📊 Checking Status

### Quick Status Check
```bash
# See all open MVP issues
gh issue list --milestone "MVP Launch Blockers" --state open

# See closed MVP issues
gh issue list --milestone "MVP Launch Blockers" --state closed

# Check specific issue
gh issue view 73
```

### Generate Status Report
```bash
# Run the sync script
./scripts/sync-from-github.sh

# This queries GitHub and updates docs/meta/MVP_STATUS.md
```

---

## 🔄 Auto-Sync Script

The script `scripts/sync-from-github.sh` will:
1. Query GitHub Issues API
2. Get all MVP milestone issues
3. Check which are closed (with dates)
4. Generate a status markdown file
5. Optionally update planning documents

**Run it:**
```bash
./scripts/sync-from-github.sh
```

---

## 📝 Documentation Structure

### MVP_QUICK_START.md
```markdown
## 🎯 Remaining Work

Check GitHub for current status:
- #160 - Email template auth
- #162 - Rotate exposed keys
- #81 - Audit Supabase client

[View all MVP issues](https://github.com/user/repo/milestone/1)
```

### When Issues Are Fixed
Just reference them as closed:
```markdown
## ✅ Recently Fixed
- ✅ #73 - Admin RBAC (closed Nov 3, commit ba57e07)
- ✅ #76 - Hardcoded credentials (closed Nov 4, commit 95694d2)

Status pulled from GitHub Issues on [date].
```

---

## 🤖 Automation

### GitHub Actions Workflow
```yaml
# .github/workflows/sync-issues.yml
name: Sync Issue Status
on:
  issues:
    types: [closed, reopened]

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Sync from GitHub Issues
        run: ./scripts/sync-from-github.sh
      - name: Commit if changed
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add docs/meta/MVP_STATUS.md
          git commit -m "docs: sync issue status from GitHub" || exit 0
          git push
```

**Result:** Documentation auto-updates when issues close!

---

## ✨ Benefits

### GitHub as Source of Truth
- ✅ One place to update (GitHub Issues)
- ✅ Built-in history and timestamps
- ✅ Commit hashes automatically linked
- ✅ No manual sync needed
- ✅ Team collaboration built-in
- ✅ Notifications when issues close

### Simple Documentation
- ✅ Just reference issue numbers
- ✅ Link to GitHub for details
- ✅ Script generates reports
- ✅ No duplicate tracking

---

## 🔧 Migration Plan

### Step 1: Close Fixed Issues on GitHub
```bash
# Close issues that are already fixed
gh issue close 73 --comment "Fixed in commit ba57e07 on Nov 3, 2025"
gh issue close 76 --comment "Fixed in commit 95694d2 on Nov 4, 2025"
gh issue close 159 --comment "Fixed in commit 2bb7e2b on Nov 3, 2025"
gh issue close 89 --comment "Fixed in commits 951a558, 50dea93 on Nov 3, 2025"
gh issue close 86 --comment "Fixed in commit 1c778b1 on Nov 2, 2025"
gh issue close 59 --comment "Fixed in commit ae7a026 on Nov 2, 2025"
```

### Step 2: Simplify Documentation
- Remove ISSUE_STATUS_TRACKER.md (redundant)
- Update MVP_QUICK_START.md to reference GitHub
- Update MVP_PRIORITY_ORDER.md to reference GitHub

### Step 3: Use Sync Script
```bash
./scripts/sync-from-github.sh
```

---

## 📌 Key Principle

**If it's not in GitHub Issues, it doesn't exist.**

- Want to track an issue? Create a GitHub Issue.
- Fixed an issue? Close it on GitHub.
- Need status? Query GitHub.
- Documentation? Link to GitHub.

Simple. No duplication. GitHub is the truth.

---

**Last Updated:** 2025-11-06
**Approach:** GitHub-first, script-assisted documentation
