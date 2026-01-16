# Date-fns Optimization Quick Reference


## Summary

Optimized date-fns imports by replacing simple `format()` calls with native JavaScript alternatives.

## What Changed

### ✅ Optimized (Removed date-fns format)

| File | Before | After | Savings |
|------|--------|-------|---------|
| `UserTableRow.vue` | `format(date, 'MMM dd, yyyy')` | `Intl.DateTimeFormat` | ~2 KB |
| `analytics.vue` | `format(date, 'yyyy-MM-dd')` | Custom `formatDateISO()` | ~2 KB |