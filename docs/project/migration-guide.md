# Documentation Migration Tool Guide

## Overview

This guide explains how to use the documentation migration tool to reorganize documentation from the old structure to the new dual-layer Diátaxis-based structure. The tool automates file movement, link updates, and AI context generation while preserving content and Git history.

## Prerequisites

Before running the migration tool, ensure:

- [ ] Node.js 18+ installed
- [ ] Git repository is clean (no uncommitted changes)
- [ ] Full backup of docs/ directory created
- [ ] Team has been notified of migration
- [ ] You have reviewed the audit report

## Installation

The migration tool is located in `scripts/documentation/`:

```bash
# Install dependencies (if not already installed)
npm install

# Verify tool is available
npm run docs:migrate -- --help
```

## Migration Commands

### 1. Audit Command

Run an audit to understand current documentation state:

```bash
# Run full audit
npm run docs:audit

# Output audit report to file
npm run docs:audit > audit-report.md
```

**What it does**:
- Scans all files in docs/ directory
- Categorizes files by Diátaxis type
- Identifies duplicate content
- Identifies documentation gaps
- Creates migration mapping
- Generates recommendations

**Output**:
- Console report with summary statistics
- Detailed audit report file
- Migration mapping JSON file

**Review the audit report before proceeding!**

### 2. Migrate Command

Execute the migration to reorganize documentation:

```bash
# Dry-run (preview changes without making them)
npm run docs:migrate -- --dry-run

# Run migration with progress reporting
npm run docs:migrate

# Run migration for specific category only
npm run docs:migrate -- --category=tutorials

# Run migration with verbose logging
npm run docs:migrate -- --verbose
```

**What it does**:
- Creates new directory structure
- Moves files to appropriate locations
- Updates internal links
- Adds breadcrumb navigation
- Creates index pages
- Preserves Git history
- Generates redirect mappings

**Options**:
- `--dry-run`: Preview changes without executing
- `--category=<name>`: Migrate only specific category
- `--verbose`: Show detailed logging
- `--skip-git`: Skip Git history preservation
- `--force`: Overwrite existing files

**Progress Tracking**:
The tool shows real-time progress:
```
Migrating documentation...
[████████████████████░░░░] 80% (40/50 files)
Current: docs/guides/authentication.md → docs/how-to/authentication/oauth2.md
```

### 3. Validate Command

Validate documentation quality after migration:

```bash
# Run all validation checks
npm run docs:validate

# Validate links only
npm run docs:validate-links

# Validate code examples only
npm run docs:validate-code

# Validate structure only
npm run docs:validate-structure

# Generate quality report
npm run docs:quality-report
```

**What it does**:
- Checks for broken internal links
- Validates code example syntax
- Checks for required sections
- Validates metadata completeness
- Generates quality score

**Output**:
- Validation report with issues found
- Quality score (0-100)
- Recommendations for improvements

### 4. Generate AI Context Command

Generate or update AI-friendly context files:

```bash
# Generate all AI context files
npm run docs:generate-ai-context

# Generate specific file only
npm run docs:generate-ai-context -- --file=AGENTS.md
npm run docs:generate-ai-context -- --file=llms.txt
npm run docs:generate-ai-context -- --file=.cursorrules

# Regenerate ai-context/ directory
npm run docs:generate-ai-context -- --ai-context-dir
```

**What it does**:
- Generates/updates llms.txt
- Generates/updates AGENTS.md
- Generates/updates .cursorrules
- Generates ai-context/ directory files
- Extracts patterns from codebase
- Documents security rules

**Output**:
- Updated AI context files
- Summary of changes made

## Step-by-Step Migration Process

### Phase 1: Preparation (Before Migration)

#### Step 1: Create Backup

```bash
# Create timestamped backup
cp -r docs/ docs-backup-$(date +%Y%m%d-%H%M%S)/

# Or use tar for compressed backup
tar -czf docs-backup-$(date +%Y%m%d-%H%M%S).tar.gz docs/
```

#### Step 2: Run Audit

```bash
# Generate audit report
npm run docs:audit > audit-report-$(date +%Y%m%d).md

# Review the report
cat audit-report-$(date +%Y%m%d).md
```

**Review checklist**:
- [ ] Total file count is correct
- [ ] Categorization makes sense
- [ ] Duplicates identified are actually duplicates
- [ ] Gaps identified are real gaps
- [ ] Migration mappings look correct

#### Step 3: Communicate to Team

Send notification to team:

```
Subject: Documentation Migration - [Date]

Team,

We will be migrating our documentation to a new structure on [date].

What's changing:
- New folder structure based on Diátaxis framework
- Improved navigation and discoverability
- AI-friendly context files for better code generation

What you need to know:
- Old links will redirect for 30 days
- New structure: tutorials/, how-to/, reference/, explanation/
- Migration guide: docs/project/MIGRATION_GUIDE.md

Timeline:
- [Date]: Migration execution
- [Date]: Validation and fixes
- [Date]: Team training session

Questions? Ask in #documentation channel.
```

### Phase 2: Migration Execution

#### Step 4: Dry Run

```bash
# Run dry-run to preview changes
npm run docs:migrate -- --dry-run > migration-preview.txt

# Review preview
less migration-preview.txt
```

**Check for**:
- Files going to correct locations
- No unexpected file conflicts
- Link updates look correct
- No files being skipped unexpectedly

#### Step 5: Execute Migration

```bash
# Run actual migration
npm run docs:migrate 2>&1 | tee migration-log.txt
```

**Monitor for**:
- Any error messages
- Files that fail to migrate
- Link update failures
- Git history preservation issues

**If errors occur**: See Troubleshooting section below

#### Step 6: Validate Results

```bash
# Run validation
npm run docs:validate > validation-report.txt

# Review validation report
cat validation-report.txt
```

**Check for**:
- Broken links (should be 0)
- Invalid code examples
- Missing required sections
- Metadata issues

### Phase 3: AI Context Generation

#### Step 7: Generate AI Context

```bash
# Generate all AI context files
npm run docs:generate-ai-context
```

**Verify**:
- llms.txt created/updated
- AGENTS.md created/updated
- .cursorrules created/updated
- ai-context/ directory populated

#### Step 8: Test AI Context

Test with AI tools to ensure quality:

**Cursor AI**:
1. Open project in Cursor
2. Ask: "Show me how to create a new API route"
3. Verify generated code follows project patterns
4. Verify security rules are respected

**Claude/ChatGPT**:
1. Provide llms.txt and AGENTS.md as context
2. Ask: "Generate a Vue 3 component for user profile"
3. Verify code follows conventions
4. Verify imports are correct

**GitHub Copilot**:
1. Start typing a new component
2. Verify suggestions follow patterns
3. Verify security rules are respected

### Phase 4: Finalization

#### Step 9: Fix Issues

Address any issues found during validation:

```bash
# Fix broken links
npm run docs:fix-links

# Fix code examples (manual)
# Review validation-report.txt and fix each issue

# Re-run validation
npm run docs:validate
```

#### Step 10: Update Navigation

Ensure navigation is complete:

```bash
# Regenerate index pages if needed
npm run docs:generate-indexes

# Verify README.md navigation
cat docs/README.md
```

#### Step 11: Commit Changes

```bash
# Stage all changes
git add docs/ llms.txt AGENTS.md .cursorrules

# Commit with descriptive message
git commit -m "docs: migrate to dual-layer Diátaxis structure

- Reorganized docs into tutorials/, how-to/, reference/, explanation/
- Updated all internal links
- Added breadcrumb navigation
- Created index pages
- Generated AI context files (llms.txt, AGENTS.md, .cursorrules)
- Preserved Git history for all files

Migration report: migration-log.txt
Validation report: validation-report.txt"

# Push to remote
git push origin main
```

#### Step 12: Monitor and Iterate

After migration:
- Monitor team feedback
- Fix any issues reported
- Update documentation as needed
- Schedule follow-up review in 1 week

## Rollback Procedures

If migration fails or causes issues, you can rollback:

### Automatic Rollback

The migration tool supports automatic rollback:

```bash
# Rollback last migration
npm run docs:rollback

# Rollback specific migration by ID
npm run docs:rollback -- --id=<migration-id>
```

**What it does**:
- Reverses all file operations
- Restores files from backup
- Reverts link updates
- Removes generated files

### Manual Rollback

If automatic rollback fails:

#### Step 1: Restore from Backup

```bash
# Remove current docs/
rm -rf docs/

# Restore from backup
cp -r docs-backup-YYYYMMDD-HHMMSS/ docs/

# Or extract from tar
tar -xzf docs-backup-YYYYMMDD-HHMMSS.tar.gz
```

#### Step 2: Revert Git Changes

```bash
# If changes were committed
git revert <commit-hash>

# If changes not yet committed
git checkout -- docs/ llms.txt AGENTS.md .cursorrules

# If changes were pushed
git revert <commit-hash>
git push origin main
```

#### Step 3: Clean Up

```bash
# Remove any generated files
rm -rf docs/tutorials/ docs/how-to/ docs/reference/ docs/explanation/
rm -rf docs/ai-context/

# Verify old structure is intact
ls -la docs/
```

#### Step 4: Notify Team

```
Subject: Documentation Migration Rollback

Team,

The documentation migration has been rolled back due to [reason].

Current status:
- Documentation is back to original structure
- All old links work again
- No data was lost

Next steps:
- [Plan for addressing issues]
- [New migration timeline if applicable]

Questions? Ask in #documentation channel.
```

## Troubleshooting

### Common Issues and Solutions

#### Issue: Migration Fails with "Permission Denied"

**Cause**: Insufficient file system permissions

**Solution**:
```bash
# Check permissions
ls -la docs/

# Fix permissions if needed
chmod -R u+w docs/

# Retry migration
npm run docs:migrate
```

#### Issue: Git History Not Preserved

**Cause**: Git not available or repository not clean

**Solution**:
```bash
# Verify git is available
git --version

# Check repository status
git status

# Commit any pending changes
git add .
git commit -m "Prepare for migration"

# Retry migration
npm run docs:migrate
```

#### Issue: Broken Links After Migration

**Cause**: Link update failed or incorrect mapping

**Solution**:
```bash
# Run link validation to identify broken links
npm run docs:validate-links

# Fix links automatically
npm run docs:fix-links

# Or fix manually based on validation report
# Edit files and update links

# Re-validate
npm run docs:validate-links
```

#### Issue: Files in Wrong Category

**Cause**: Incorrect categorization by auditor

**Solution**:
```bash
# Move file manually
git mv docs/wrong-category/file.md docs/correct-category/file.md

# Update links
npm run docs:fix-links

# Update index pages
npm run docs:generate-indexes
```

#### Issue: Duplicate Files Created

**Cause**: File conflict during migration

**Solution**:
```bash
# Find duplicates
find docs/ -name "*.md" | sort | uniq -d

# Review duplicates and keep correct version
# Delete incorrect version
rm docs/path/to/duplicate.md

# Update links if needed
npm run docs:fix-links
```

#### Issue: AI Context Not Working

**Cause**: Incomplete or incorrect AI context files

**Solution**:
```bash
# Regenerate AI context
npm run docs:generate-ai-context -- --force

# Test with AI tool
# If still not working, manually review and edit:
# - llms.txt
# - AGENTS.md
# - .cursorrules

# Ensure code examples are complete and correct
```

#### Issue: Migration Hangs or Takes Too Long

**Cause**: Large number of files or slow file system

**Solution**:
```bash
# Cancel migration (Ctrl+C)

# Run migration in batches by category
npm run docs:migrate -- --category=tutorials
npm run docs:migrate -- --category=how-to
npm run docs:migrate -- --category=reference
npm run docs:migrate -- --category=explanation

# Or increase timeout
npm run docs:migrate -- --timeout=600000
```

#### Issue: Code Examples Break After Migration

**Cause**: Code examples not updated for new structure

**Solution**:
```bash
# Validate code examples
npm run docs:validate-code

# Review and fix each broken example
# Ensure imports are correct
# Ensure paths are correct
# Test examples actually work

# Re-validate
npm run docs:validate-code
```

## Advanced Usage

### Custom Migration Mapping

Override automatic categorization with custom mapping:

```bash
# Create custom mapping file
cat > custom-mapping.json << EOF
{
  "mappings": [
    {
      "oldPath": "docs/guides/special-guide.md",
      "newPath": "docs/tutorials/special-guide.md",
      "category": "tutorial"
    }
  ]
}
EOF

# Run migration with custom mapping
npm run docs:migrate -- --mapping=custom-mapping.json
```

### Selective Migration

Migrate only specific files or directories:

```bash
# Migrate specific directory
npm run docs:migrate -- --source=docs/guides/

# Migrate specific files
npm run docs:migrate -- --files=docs/guide1.md,docs/guide2.md

# Exclude specific patterns
npm run docs:migrate -- --exclude="**/archive/**,**/old/**"
```

### Migration Hooks

Run custom scripts before/after migration:

```bash
# Create pre-migration hook
cat > .migration-hooks/pre-migrate.sh << EOF
#!/bin/bash
echo "Running pre-migration checks..."
npm run test
npm run lint
EOF

# Create post-migration hook
cat > .migration-hooks/post-migrate.sh << EOF
#!/bin/bash
echo "Running post-migration tasks..."
npm run docs:validate
npm run docs:generate-ai-context
EOF

# Make executable
chmod +x .migration-hooks/*.sh

# Run migration (hooks run automatically)
npm run docs:migrate
```

## Getting Help

### Support Channels

- **Slack**: #documentation channel
- **GitHub Issues**: Tag with `documentation` and `migration`
- **Email**: docs@moldovadirect.com
- **Office Hours**: Fridays 2-3 PM

### Reporting Issues

When reporting migration issues, include:

1. Command that failed
2. Error message (full output)
3. Migration log file
4. Validation report
5. Steps to reproduce

### Additional Resources

- [Maintenance Guide](maintenance-guide.md)
- [AI Context Testing Guide](../how-to/testing/ai-context-testing-guide.md)
- [Diátaxis Framework](https://diataxis.fr/)
- [Migration Tool Source](../../scripts/documentation/)

---

**Last Updated**: 2026-01-15
**Owner**: Tech Lead
**Review Schedule**: After each migration
