# Component Inventory and Migration Tracking

This document provides a comprehensive inventory of current component usage and tracks migration progress for the shadcn-vue modernization initiative. All shadcn-vue component libraries were generated via the CLI on 2025-10-05; the focus now is migrating product surfaces onto those primitives.

## Current Component Inventory

### Available shadcn-vue Components

| Component      | Status         | Files                        | File Count | Last Updated |
| -------------- | -------------- | ---------------------------- | ---------- | ------------ |
| **Button**     | ✅ Implemented | `components/ui/button/`      | 2          | Current      |
| **Card**       | ✅ Implemented | `components/ui/card/`        | 10         | Current      |
| **Dialog**     | ✅ Implemented | `components/ui/dialog/`      | 13         | Current      |
| **Input**      | ✅ Implemented | `components/ui/input/`       | 2          | Current      |
| **Sonner**     | ✅ Implemented | `components/ui/sonner/`      | 2          | Current      |
| **Select**     | ✅ Implemented | `components/ui/select/`      | 12         | 2025-10-05   |
| **Label**      | ✅ Implemented | `components/ui/label/`       | 2          | 2025-10-05   |
| **Alert**      | ✅ Implemented | `components/ui/alert/`       | 4          | 2025-10-05   |
| **Badge**      | ✅ Implemented | `components/ui/badge/`       | 2          | 2025-10-05   |
| **Checkbox**   | ✅ Implemented | `components/ui/checkbox/`    | 2          | 2025-10-05   |
| **Tooltip**    | ✅ Implemented | `components/ui/tooltip/`     | 5          | 2025-10-05   |
| **Tabs**       | ✅ Implemented | `components/ui/tabs/`        | 5          | 2025-10-05   |
| **Switch**     | ✅ Implemented | `components/ui/switch/`      | 2          | 2025-10-05   |
| **Textarea**   | ✅ Implemented | `components/ui/textarea/`    | 2          | 2025-10-05   |
| **RadioGroup** | ✅ Implemented | `components/ui/radio-group/` | 3          | 2025-10-05   |
| **Table**      | ✅ Implemented | `components/ui/table/`       | 11         | 2025-10-05   |
| **Skeleton**   | ✅ Implemented | `components/ui/skeleton/`    | 2          | 2025-10-05   |
| **Pagination** | ✅ Implemented | `components/ui/pagination/`  | 9          | 2025-10-05   |
| **Avatar**     | ✅ Implemented | `components/ui/avatar/`      | 4          | 2025-10-05   |

**Total Components**: 19 shadcn-vue component libraries scaffolded (77 individual files). Adoption status varies by feature area; see the migration snapshot below.

## Migration Snapshot (February 2026)

| Surface / Flow | Status | Notes | Owner | Source of Truth |
| -------------- | ------ | ----- | ----- | ---------------- |
| Auth (login/register, alerts) | ✅ Completed | Adopted shadcn inputs/labels/alerts; legacy auth message components removed | Unassigned | `.kiro/PROJECT_STATUS.md` |
| Checkout (shipping, payment, confirmation) | 🔄 In progress | Select/Input replacements staged; dialogs untouched | Unassigned | `.kiro/PROJECT_STATUS.md` |
| Cart (drawer, quantity controls, bulk actions) | ⏳ Not started | Needs button/checkbox/sonner migrations | Unassigned | `.kiro/PROJECT_STATUS.md` |
| Admin tables & filters | ⏳ Not started | Table/pagination/badge swaps outstanding | Unassigned | `.kiro/PROJECT_STATUS.md` |
| Mobile navigation / sheets | ⏳ Not started | Dialog/sheet adoption pending; touch targets under review | Unassigned | `.kiro/PROJECT_STATUS.md` |
| Toast / notification system | ⏳ Not started | Legacy `components/common/Toast*.vue` still active | Unassigned | `.kiro/PROJECT_STATUS.md` |

## Custom Component Usage Analysis

### Button Elements (78 files with `<button>`)

**High Priority Migration Targets:**
| File Path | Current Implementation | Migration Priority | Notes |
|-----------|----------------------|-------------------|-------|
| `pages/auth/login.vue` | Custom gradient buttons | 🔴 High | Auth flow critical |
| `components/cart/Item.vue` | Quantity controls, remove buttons | 🔴 High | Core cart functionality |
| `components/admin/Users/Table.vue` | Action buttons (edit, delete, etc.) | 🔴 High | Admin interface |
| `components/product/Card.vue` | Add to cart buttons | 🟡 Medium | Product browsing |
| `components/checkout/PaymentForm.vue` | Submit buttons | 🔴 High | Checkout critical |
| `pages/admin/products/index.vue` | Admin action buttons | 🟡 Medium | Product management |

### Input Elements (41 files with `<input>`)

**Critical Migration Targets:**
| File Path | Current Implementation | Migration Priority | Notes |
|-----------|----------------------|-------------------|-------|
| `pages/auth/login.vue` | Custom styled inputs with validation | 🔴 High | Authentication |
| `pages/auth/register.vue` | Registration form inputs | 🔴 High | User creation |
| `components/checkout/PaymentForm.vue` | Payment information inputs | 🔴 High | Checkout process |
| `components/admin/Products/Form.vue` | Product form inputs | 🟡 Medium | Admin forms |
| `components/profile/AddressFormModal.vue` | Address form inputs | 🟡 Medium | User profile |
| `components/admin/Users/DetailView.vue` | User management inputs | 🟡 Medium | User management |

### Select/Dropdown Elements (20+ files)

**Migration Targets:**
| File Path | Current Implementation | Migration Priority | Notes |
|-----------|----------------------|-------------------|-------|
| `components/checkout/ShippingMethodSelector.vue` | Custom dropdown with icons | 🔴 High | Checkout shipping |
| `components/admin/Products/Filters.vue` | Category and status filters | 🟡 Medium | Product filtering |
| `pages/admin/users/index.vue` | User role selector | 🟡 Medium | User management |
| `components/profile/AddressFormModal.vue` | Country/state selectors | 🟡 Medium | User address |
| `components/admin/Utils/UserTableFilters.vue` | Filter dropdowns | 🟡 Medium | Admin filtering |

## Custom Modal/Alert Implementations

**Critical Custom Components to Replace:**
| Component | Current Location | Migration Target | Priority |
|-----------|------------------|------------------|----------|
| AuthErrorMessage | _Removed (2026-02)_ | Replaced by shadcn `Alert` in auth flows | ✅ Completed |
| AuthSuccessMessage | _Removed (2026-02)_ | Replaced by shadcn `Alert` in auth flows | ✅ Completed |
| ConfirmDialog | `components/common/ConfirmDialog.vue` | Dialog component | 🔴 High |
| ErrorBoundary | `components/common/ErrorBoundary.vue` | Alert component | 🔴 High |
| Toast | Custom implementations | Sonner/Toast | 🟡 Medium |

## Migration Progress Tracking

Statuses below reflect the library scaffolding completed on 2025-10-05. Use the Migration Snapshot for real-time adoption progress.

### Phase 1: Foundation Components

#### ✅ Select Component

- **Status**: **COMPLETED** 🎉
- **Files Created**: 12 (Select, SelectContent, SelectGroup, SelectItem, SelectItemText, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue, index)
- **Target Replacements**: 20+
- **Actual Effort**: 30 minutes
- **Dependencies**: None
- **Completion Date**: 2025-10-05

#### ✅ Label Component

- **Status**: **COMPLETED** 🎉
- **Files Created**: 2 (Label, index)
- **Target Replacements**: 40+
- **Actual Effort**: 5 minutes
- **Dependencies**: None
- **Completion Date**: 2025-10-05

#### ✅ Alert Component

- **Status**: **COMPLETED** 🎉
- **Files Created**: 4 (Alert, AlertDescription, AlertTitle, index)
- **Target Replacements**: 15+
- **Actual Effort**: 5 minutes
- **Dependencies**: None
- **Completion Date**: 2025-10-05

#### ✅ Badge Component

- **Status**: **COMPLETED** 🎉
- **Files Created**: 2 (Badge, index)
- **Target Replacements**: 25+
- **Actual Effort**: 5 minutes
- **Dependencies**: None
- **Completion Date**: 2025-10-05

#### ✅ Checkbox Component

- **Status**: **COMPLETED** 🎉
- **Files Created**: 2 (Checkbox, index)
- **Target Replacements**: 10+
- **Actual Effort**: 5 minutes
- **Dependencies**: None
- **Completion Date**: 2025-10-05

### Phase 2: Enhanced UX Components

#### ✅ Tooltip Component

- **Status**: **COMPLETED** 🎉
- **Files Created**: 5 (Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, index)
- **Target Replacements**: 30+
- **Actual Effort**: 5 minutes
- **Dependencies**: None
- **Completion Date**: 2025-10-05

#### ✅ Tabs Component

- **Status**: **COMPLETED** 🎉
- **Files Created**: 5 (Tabs, TabsContent, TabsList, TabsTrigger, index)
- **Target Replacements**: 10+
- **Actual Effort**: 5 minutes
- **Dependencies**: None
- **Completion Date**: 2025-10-05

#### ✅ Switch Component

- **Status**: **COMPLETED** 🎉
- **Files Created**: 2 (Switch, index)
- **Target Replacements**: 5+
- **Actual Effort**: 5 minutes
- **Dependencies**: None
- **Completion Date**: 2025-10-05

#### ✅ Textarea Component

- **Status**: **COMPLETED** 🎉
- **Files Created**: 2 (Textarea, index)
- **Target Replacements**: 8+
- **Actual Effort**: 5 minutes
- **Dependencies**: None
- **Completion Date**: 2025-10-05

#### ✅ RadioGroup Component

- **Status**: **COMPLETED** 🎉
- **Files Created**: 3 (RadioGroup, RadioGroupItem, index)
- **Target Replacements**: 5+
- **Actual Effort**: 5 minutes
- **Dependencies**: None
- **Completion Date**: 2025-10-05

### Phase 3: Advanced Components

#### ✅ Table Component

- **Status**: **COMPLETED** 🎉
- **Files Created**: 11 (Table, TableBody, TableCaption, TableCell, TableEmpty, TableFooter, TableHead, TableHeader, TableRow, utils, index)
- **Target Replacements**: 15+
- **Actual Effort**: 5 minutes
- **Dependencies**: None
- **Completion Date**: 2025-10-05

#### ✅ Skeleton Component

- **Status**: **COMPLETED** 🎉
- **Files Created**: 2 (Skeleton, index)
- **Target Replacements**: 20+
- **Actual Effort**: 5 minutes
- **Dependencies**: None
- **Completion Date**: 2025-10-05

#### ✅ Pagination Component

- **Status**: **COMPLETED** 🎉
- **Files Created**: 9 (Pagination, PaginationContent, PaginationEllipsis, PaginationFirst, PaginationItem, PaginationLast, PaginationNext, PaginationPrevious, index)
- **Target Replacements**: 5+
- **Actual Effort**: 5 minutes
- **Dependencies**: None
- **Completion Date**: 2025-10-05

#### ✅ Avatar Component

- **Status**: **COMPLETED** 🎉
- **Files Created**: 4 (Avatar, AvatarFallback, AvatarImage, index)
- **Target Replacements**: 8+
- **Actual Effort**: 5 minutes
- **Dependencies**: None
- **Completion Date**: 2025-10-05

## Library Scaffolding Summary

- **CLI scaffolding completed**: 2025-10-05 (~2 hours total)
- **Component coverage**: 19 libraries (77 files) now available under `components/ui/**`
- **Next focus**: Replace legacy markup per the migration snapshot and track progress in `.kiro/PROJECT_STATUS.md`

## Component Usage Statistics

### Current Usage by Category

```
Buttons:         78 files with custom implementations
Inputs:          41 files with custom implementations
Select/Dropdown: 20+ files with custom implementations
Modals/Alerts:   15+ custom implementations
Tables:          8+ custom implementations
Forms:           25+ custom implementations
```

### Post-Migration Target

```
shadcn-vue Components:   95%+ adoption
Custom Components:      <5% legacy implementations
Code Reduction:         40-60% less custom styling
Accessibility:          WCAG 2.1 AA compliant
```

## Risk Assessment

### High Risk Components

| Component            | Risk Level | Mitigation Strategy                              |
| -------------------- | ---------- | ------------------------------------------------ |
| Cart Item            | 🔴 High    | Test thoroughly, maintain backward compatibility |
| Authentication Forms | 🔴 High    | A/B testing, gradual rollout                     |
| Checkout Forms       | 🔴 High    | Extensive E2E testing, monitoring                |
| Admin Tables         | 🟡 Medium  | Test with admin users, provide training          |

### Low Risk Components

| Component | Risk Level | Mitigation Strategy                     |
| --------- | ---------- | --------------------------------------- |
| Badges    | 🟢 Low     | Simple replacement, minimal user impact |
| Tooltips  | 🟢 Low     | Progressive enhancement                 |
| Skeletons | 🟢 Low     | Visual enhancement only                 |

## Testing Requirements

### Component Testing

- **Unit Tests**: Required for all new components
- **Integration Tests**: For complex interactions (forms, tables)
- **Accessibility Tests**: WCAG 2.1 AA compliance validation
- **Visual Regression**: Screenshot testing for styling consistency

### E2E Testing

- **Critical User Flows**: Auth → Cart → Checkout → Purchase
- **Admin Workflows**: Product management, user management
- **Mobile Testing**: Touch interactions, responsive design
- **Cross-Browser**: Chrome, Firefox, Safari, Edge

## Success Metrics

### Technical Metrics

- **Code Reduction**: Target 40-60% reduction in custom styling
- **Component Adoption**: 95%+ shadcn-vue component usage
- **Test Coverage**: 100% coverage for migrated components
- **Bundle Size**: No significant increase in bundle size

### User Experience Metrics

- **Task Completion**: Improved checkout completion rate
- **Error Rate**: Reduced form submission errors
- **Mobile Usability**: Improved mobile interaction metrics
- **Accessibility**: WCAG 2.1 AA compliance score

### Development Metrics

- **Development Velocity**: 20-30% faster feature development
- **Bug Rate**: Reduced UI-related bug reports
- **Maintenance Time**: 50% reduction in UI maintenance overhead
- **Developer Satisfaction**: Improved developer experience

## Timeline and Dependencies

### Phase 1 (Weeks 1-2)

- **Select Component**: Week 1, Days 1-2
- **Label Component**: Week 1, Days 2-3
- **Alert Component**: Week 1, Days 3-4
- **Badge Component**: Week 1, Days 4-5
- **Checkbox Component**: Week 2, Days 1-2
- **Testing and Validation**: Week 2, Days 3-5

### Phase 2 (Weeks 3-4)

- **Dependencies**: Phase 1 must be complete
- **Tooltip Component**: Week 3, Days 1-2
- **Tabs Component**: Week 3, Days 2-4
- **Switch Component**: Week 4, Days 1-2
- **Textarea Component**: Week 4, Days 2-3
- **RadioGroup Component**: Week 4, Days 3-4
- **Testing and Validation**: Week 4, Days 4-5

### Phase 3 (Weeks 5-6)

- **Dependencies**: Phase 1 & 2 must be complete
- **Table Component**: Week 5, Days 1-3
- **Skeleton Component**: Week 5, Days 3-4
- **Pagination Component**: Week 6, Days 1-2
- **Avatar Component**: Week 6, Days 2-3
- **Testing and Validation**: Week 6, Days 3-5

## Resource Requirements

### Development Resources

- **1 Senior Developer**: Full-time for 6 weeks
- **1 QA Engineer**: Part-time for testing and validation
- **1 UI/UX Designer**: Part-time for design validation

### Tools and Infrastructure

- **Testing Framework**: Playwright for E2E, Vitest for unit tests
- **Design Tools**: Figma for design validation
- **Monitoring**: Error tracking and performance monitoring
- **Documentation**: Component documentation system

This inventory provides a comprehensive foundation for tracking the component modernization initiative and ensuring successful implementation across the MoldovaDirect application.
