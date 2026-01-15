# Documentation Maintenance Guide

## Overview

This guide defines procedures, schedules, and responsibilities for maintaining the dual-layer documentation system. Following these guidelines ensures documentation remains accurate, useful, and up-to-date.

## Update Procedures

### When to Update Documentation

Documentation should be updated in the following scenarios:

1. **Code Changes**: When code changes affect documented patterns, APIs, or behaviors
2. **New Features**: When new features are added to the project
3. **Bug Fixes**: When bug fixes change documented behavior
4. **Architecture Changes**: When system architecture or design patterns change
5. **Security Updates**: When security rules or best practices change
6. **Dependency Updates**: When major dependencies are updated or replaced

### How to Update Documentation

#### Step 1: Identify Affected Documentation

Before making changes, identify which documentation files are affected:

```bash
# Search for references to the changed component/feature
grep -r "ComponentName" docs/
grep -r "feature-name" docs/
```

#### Step 2: Update Content

1. **Human Layer** (docs/tutorials/, docs/how-to/, docs/reference/, docs/explanation/):
   - Update step-by-step instructions
   - Update code examples
   - Update screenshots or diagrams if applicable
   - Update links to related documentation

2. **AI Layer** (llms.txt, AGENTS.md, .cursorrules, docs/ai-context/):
   - Update code patterns in AGENTS.md
   - Update architecture summaries
   - Update conventions and patterns
   - Regenerate AI context files if needed

#### Step 3: Update Metadata

Update the file metadata at the top of each changed file:

```markdown
---
title: Document Title
description: Brief description
last-updated: 2026-01-15
author: Your Name
tags: [tag1, tag2, tag3]
---
```

#### Step 4: Validate Changes

Run validation checks before committing:

```bash
# Validate links
npm run docs:validate-links

# Validate code examples
npm run docs:validate-code

# Run full quality check
npm run docs:quality-check
```

#### Step 5: Commit with Descriptive Message

Use clear commit messages that reference the related code changes:

```bash
git add docs/
git commit -m "docs: update authentication guide for OAuth2 changes

- Updated code examples in how-to/authentication/oauth2.md
- Updated security rules in AGENTS.md
- Fixed broken links to API reference

Related to: #123"
```

### Bulk Updates

For large-scale updates (e.g., framework version upgrades):

1. Create a documentation update branch
2. Use the migration tool to assist with bulk changes
3. Review all changes carefully
4. Test with AI tools to ensure context quality
5. Merge after team review

## Review Schedule

### Weekly Reviews (Critical Documentation)

**Frequency**: Every Monday at 10:00 AM

**Scope**: Critical documentation that changes frequently
- Getting Started guides
- API reference for active development areas
- Security documentation
- Known issues and workarounds

**Responsibilities**: Assigned rotating team member

**Process**:
1. Review recent code changes
2. Check for outdated information
3. Verify all links work
4. Update last-reviewed date
5. Report issues in team standup

### Monthly Reviews (General Documentation)

**Frequency**: First Friday of each month

**Scope**: General documentation
- How-to guides
- Tutorials
- Architecture explanations
- Code patterns

**Responsibilities**: Documentation owner for each area

**Process**:
1. Review assigned documentation section
2. Check for accuracy against current codebase
3. Update examples if needed
4. Verify code examples still work
5. Submit PR with updates

### Quarterly Reviews (Full Documentation Audit)

**Frequency**: First week of each quarter (January, April, July, October)

**Scope**: Complete documentation system
- All human layer documentation
- All AI layer documentation
- Navigation and index pages
- Archive organization

**Responsibilities**: Entire team (coordinated by tech lead)

**Process**:
1. Run automated quality checks
2. Review audit report
3. Identify gaps and outdated content
4. Prioritize updates
5. Assign update tasks
6. Track completion in project board
7. Regenerate AI context files
8. Test with AI tools

## Quality Checklist

Use this checklist when creating or updating documentation:

### Content Quality

- [ ] **Accuracy**: Information is correct and up-to-date
- [ ] **Completeness**: All necessary information is included
- [ ] **Clarity**: Content is easy to understand
- [ ] **Conciseness**: No unnecessary information
- [ ] **Examples**: Code examples are complete and tested
- [ ] **Context**: Sufficient context for understanding

### Structure Quality

- [ ] **Category**: File is in correct Diátaxis category
- [ ] **Metadata**: Title, description, last-updated, tags present
- [ ] **Headings**: Proper heading hierarchy (H1 → H2 → H3)
- [ ] **Breadcrumbs**: Breadcrumb navigation is present
- [ ] **See Also**: Related documentation is linked
- [ ] **Prerequisites**: Prerequisites listed (for how-tos and tutorials)

### Technical Quality

- [ ] **Links**: All internal links work
- [ ] **Code**: Code examples are syntactically valid
- [ ] **Code**: Code examples follow project conventions
- [ ] **Code**: Code examples include necessary imports
- [ ] **Security**: Security considerations are documented
- [ ] **Testing**: Testing approach is documented (where applicable)

### AI Context Quality

- [ ] **Patterns**: Code patterns are documented in AGENTS.md
- [ ] **Security**: Security rules are in AI context files
- [ ] **Examples**: Complete working examples provided
- [ ] **Context**: Sufficient context for AI understanding
- [ ] **Links**: Links to detailed documentation included

### Formatting Quality

- [ ] **Markdown**: Valid markdown syntax
- [ ] **Code Blocks**: Code blocks have language specified
- [ ] **Lists**: Lists are properly formatted
- [ ] **Tables**: Tables are properly formatted (if used)
- [ ] **Visual Hierarchy**: Emojis and formatting improve scannability

## Team Responsibilities

### Documentation Owners

Each major documentation area has an assigned owner responsible for maintaining quality and accuracy:

| Area | Owner | Backup |
|------|-------|--------|
| Getting Started / Tutorials | [Team Member 1] | [Team Member 2] |
| Authentication / Security | [Team Member 3] | [Team Member 4] |
| Checkout / Payments | [Team Member 5] | [Team Member 6] |
| API Reference | [Team Member 7] | [Team Member 8] |
| Architecture / Explanations | [Tech Lead] | [Senior Dev] |
| Testing Documentation | [QA Lead] | [Team Member 9] |
| Deployment / DevOps | [DevOps Lead] | [Team Member 10] |
| AI Context Files | [Tech Lead] | [Team Member 11] |

### Responsibilities by Role

#### Documentation Owner
- Maintain assigned documentation area
- Review and approve changes to owned area
- Conduct monthly reviews
- Update content when code changes
- Respond to documentation issues

#### All Developers
- Update documentation when making code changes
- Follow quality checklist for all updates
- Review documentation PRs
- Report documentation issues
- Participate in quarterly audits

#### Tech Lead
- Coordinate quarterly audits
- Maintain AI context files
- Review architecture documentation
- Approve major documentation changes
- Ensure documentation standards are followed

#### QA Team
- Validate code examples work
- Test documentation against actual system
- Report inaccuracies
- Maintain testing documentation

### Documentation Review Process

1. **Create PR**: Submit documentation changes as PR
2. **Self-Review**: Use quality checklist
3. **Automated Checks**: CI runs validation
4. **Peer Review**: Documentation owner reviews
5. **Approval**: Owner approves or requests changes
6. **Merge**: Merge after approval
7. **Deploy**: Documentation auto-deploys (if applicable)

## Maintenance Tools

### Available Commands

```bash
# Run documentation audit
npm run docs:audit

# Validate all links
npm run docs:validate-links

# Validate code examples
npm run docs:validate-code

# Generate quality report
npm run docs:quality-report

# Regenerate AI context files
npm run docs:generate-ai-context

# Run full migration (dry-run)
npm run docs:migrate -- --dry-run

# Run full migration (production)
npm run docs:migrate
```

### Automated Checks

The following checks run automatically on documentation PRs:

- **Link Validation**: Checks for broken internal links
- **Code Validation**: Validates code block syntax
- **Metadata Validation**: Ensures required metadata present
- **Structure Validation**: Checks for required sections
- **Formatting Validation**: Validates markdown syntax

### Manual Checks

Perform these checks manually during reviews:

- **Accuracy**: Verify information against codebase
- **Completeness**: Ensure all necessary info included
- **Clarity**: Read as if you're new to the project
- **Examples**: Test code examples actually work
- **AI Context**: Test with AI tools (Cursor, Claude)

## Common Maintenance Tasks

### Adding New Documentation

1. Determine correct category (tutorial, how-to, reference, explanation)
2. Create file in appropriate directory
3. Add metadata header
4. Write content following quality checklist
5. Add to relevant index pages
6. Update navigation if needed
7. Update AI context if pattern/security related
8. Submit PR with checklist completed

### Deprecating Documentation

1. Move file to `docs/archive/YYYY-MM-DD/`
2. Add deprecation notice to old location (if keeping stub)
3. Update all links pointing to deprecated doc
4. Add redirect mapping
5. Update index pages
6. Document reason for deprecation
7. Submit PR

### Reorganizing Documentation

1. Create reorganization plan
2. Use migration tool for bulk moves
3. Update all internal links
4. Generate redirect mappings
5. Update navigation and index pages
6. Run validation checks
7. Test with team before finalizing
8. Submit PR with detailed description

### Updating AI Context

1. Identify what changed (pattern, security rule, convention)
2. Update AGENTS.md with new information
3. Update relevant ai-context/ files
4. Update llms.txt if needed
5. Test with AI tools (Cursor, Claude, Copilot)
6. Verify AI generates correct code
7. Submit PR

## Troubleshooting

### Documentation Not Found

**Problem**: Users can't find documentation they need

**Solutions**:
- Check if documentation exists but is poorly categorized
- Add to index pages if missing
- Improve navigation links
- Add "See Also" sections
- Consider if gap analysis needed

### Outdated Information

**Problem**: Documentation doesn't match current code

**Solutions**:
- Update immediately if critical
- Add "outdated" warning if update delayed
- Schedule update in next review cycle
- Assign to documentation owner
- Track in issues

### Broken Links

**Problem**: Internal links don't work

**Solutions**:
- Run link validation tool
- Update links to new locations
- Add redirects for moved content
- Check if target was deleted (restore or update link)

### AI Generates Incorrect Code

**Problem**: AI tools generate code that doesn't follow patterns

**Solutions**:
- Review AGENTS.md for completeness
- Add missing patterns with examples
- Ensure security rules are clear
- Test AI context with multiple tools
- Add more specific examples

### Poor Documentation Quality

**Problem**: Documentation is unclear or incomplete

**Solutions**:
- Apply quality checklist
- Get peer review
- Test with new team member
- Add more examples
- Improve structure and formatting

## Metrics and Tracking

### Key Metrics

Track these metrics to measure documentation health:

- **Time to Find Information**: Target < 3 minutes
- **Documentation Coverage**: % of features documented
- **Link Health**: % of links working
- **Update Frequency**: Updates per month
- **Review Completion**: % of scheduled reviews completed
- **AI Code Quality**: % of AI-generated code following patterns
- **Team Satisfaction**: Survey scores

### Tracking Tools

- **GitHub Issues**: Track documentation bugs and improvements
- **Project Board**: Track documentation tasks
- **Analytics**: Track documentation page views (if applicable)
- **Surveys**: Quarterly team satisfaction surveys

## Getting Help

### Questions or Issues

- **Slack**: #documentation channel
- **GitHub**: Create issue with `documentation` label
- **Email**: docs@moldovadirect.com
- **Weekly Meeting**: Documentation office hours (Fridays 2-3 PM)

### Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines on contributing to documentation.

---

**Last Updated**: 2026-01-15
**Owner**: Tech Lead
**Review Schedule**: Quarterly
