---
title: Code Cleanup Guidelines
inclusion: always
---

# Code Cleanup Guidelines

## Recent Cleanup (October 12, 2025)

A major code cleanup was completed to remove unused code and improve maintainability. See `.kiro/archive/cleanup/CLEANUP_COMPLETED_2025-10-12.md` for full details.

### What Was Removed

1. **Unused Composables** (3 files, ~400 lines)
   - `composables/usePayPal.ts` - PayPal integration was never implemented in UI
   - `composables/useMobileCodeSplitting.ts` - Feature was planned but not used
   - `composables/usePushNotifications.ts` - Push notifications not yet implemented

2. **Unused API Endpoints** (2 files, ~150 lines)
   - `server/api/checkout/paypal/create-order.post.ts`
   - `server/api/checkout/paypal/capture-order.post.ts`

3. **Configuration Cleanup**
   - Removed PayPal configuration from `nuxt.config.ts`
   - Removed PayPal environment variables from `.env.example`

4. **Unused Dependencies**
   - Removed `tw-animate-css` package (unused, project uses `tailwindcss-animate`)

5. **Backup Files**
   - Deleted `components/admin/Products/Pricing.vue.backup`

6. **Organization**
   - Moved test scripts to `scripts/` directory
   - Archived duplicate documentation

### Payment Processing

**Current Implementation:**
- ✅ **Stripe** - Primary payment processor (fully implemented)
- ❌ **PayPal** - Removed (was never implemented in UI)

If PayPal support is needed in the future, it should be implemented as a new feature with proper planning and testing.

### Pending Cleanup Tasks

#### High Priority: Toast System Migration
The custom toast system should be migrated to `vue-sonner` (already installed):

**Current Custom System:**
- `components/common/Toast.vue`
- `components/common/ToastContainer.vue`
- `composables/useToast.ts`
- `stores/toast.ts`

**Target:** Use `vue-sonner` from shadcn-vue ecosystem

**Benefits:**
- Consistent with shadcn-vue components
- Better maintained package
- More features (stacking, positioning, rich content)
- Smaller bundle size
- Better accessibility

**Migration tracked in:** [.kiro/PROJECT_STATUS.md](../PROJECT_STATUS.md) under "Component Modernization"

## Guidelines for Future Development

### Before Adding New Features

1. **Check for existing implementations** - Search composables and components
2. **Verify dependencies** - Don't add packages that duplicate existing functionality
3. **Document usage** - Add comments explaining why a feature exists
4. **Plan for cleanup** - Consider how to remove the feature if it becomes unused

### When Removing Code

1. **Search for imports** - Use grep/search to find all usages
2. **Check dynamic imports** - Look for string-based imports
3. **Update configuration** - Remove from nuxt.config.ts, package.json, etc.
4. **Update documentation** - Remove references from docs
5. **Update tests** - Remove or update related tests
6. **Document removal** - Add to cleanup report

### Keeping Code Clean

1. **Regular audits** - Review unused code quarterly
2. **Delete backup files** - Use git history instead of .backup files
3. **Organize scripts** - Keep utility scripts in `scripts/` directory
4. **Archive documentation** - Move outdated docs to `.kiro/archive/`
5. **Update dependencies** - Remove unused packages promptly

## Tools for Code Cleanup

### Finding Unused Code

```bash
# Find unused exports
npx ts-prune

# Find unused files
npx unimported

# Check for unused dependencies
npx depcheck

# Search for imports of a file
grep -r "from.*usePayPal" .
```

### Verifying Deletions

```bash
# Search for any references
rg "usePayPal" --type ts --type vue

# Check git history
git log --all --full-history -- "composables/usePayPal.ts"
```

## Maintenance Schedule

- **Monthly:** Review `.kiro/PROJECT_STATUS.md` for completed tasks that need cleanup
- **Quarterly:** Run dependency audit and remove unused packages
- **Before releases:** Review and clean up debug code, console.logs, and comments
- **After major features:** Archive related documentation and remove temporary files

## References

- [.kiro/archive/cleanup/CODE_CLEANUP_REPORT.md](../archive/cleanup/CODE_CLEANUP_REPORT.md) - Archived cleanup tracking
- [.kiro/archive/cleanup/CLEANUP_COMPLETED_2025-10-12.md](../archive/cleanup/CLEANUP_COMPLETED_2025-10-12.md) - Archived cleanup summary
- [.kiro/PROJECT_STATUS.md](../PROJECT_STATUS.md) - Active cleanup tasks
