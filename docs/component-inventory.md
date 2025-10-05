# Component Inventory and Migration Tracking

This document provides a comprehensive inventory of current component usage and tracks migration progress for the shadcn-vue modernization initiative.

## Current Component Inventory

### Available shadcn-vue Components

| Component | Status | Files | Usage Count | Last Updated |
|-----------|--------|-------|-------------|--------------|
| **Button** | ✅ Implemented | `components/ui/button/` | ~50 | Current |
| **Card** | ✅ Implemented | `components/ui/card/` | ~25 | Current |
| **Dialog** | ✅ Implemented | `components/ui/dialog/` | ~15 | Current |
| **Input** | ✅ Implemented | `components/ui/input/` | ~30 | Current |
| **Sonner** | ✅ Implemented | `components/ui/sonner/` | ~5 | Current |

### Required New Components

| Component | Priority | Phase | Files to Create | Target Replacements |
|-----------|----------|-------|-----------------|-------------------|
| **Select** | 🔴 High | 1 | `components/ui/select/` | 20+ custom dropdowns |
| **Label** | 🔴 High | 1 | `components/ui/label/` | All form inputs |
| **Alert** | 🔴 High | 1 | `components/ui/alert/` | Custom error/success messages |
| **Badge** | 🔴 High | 1 | `components/ui/badge/` | Status indicators |
| **Checkbox** | 🔴 High | 1 | `components/ui/checkbox/` | Form selections |
| **Tooltip** | 🟡 Medium | 2 | `components/ui/tooltip/` | Help text, descriptions |
| **Tabs** | 🟡 Medium | 2 | `components/ui/tabs/` | Content organization |
| **Switch** | 🟡 Medium | 2 | `components/ui/switch/` | Toggle controls |
| **Textarea** | 🟡 Medium | 2 | `components/ui/textarea/` | Multi-line inputs |
| **RadioGroup** | 🟡 Medium | 2 | `components/ui/radio-group/` | Single selections |
| **Table** | 🟢 Low | 3 | `components/ui/table/` | Admin tables |
| **Skeleton** | 🟢 Low | 3 | `components/ui/skeleton/` | Loading states |
| **Pagination** | 🟢 Low | 3 | `components/ui/pagination/` | Custom pagination |
| **Avatar** | 🟢 Low | 3 | `components/ui/avatar/` | User representations |

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
| AuthErrorMessage | `components/auth/AuthErrorMessage.vue` | Alert component | 🔴 High |
| AuthSuccessMessage | `components/auth/AuthSuccessMessage.vue` | Alert component | 🔴 High |
| ConfirmDialog | `components/common/ConfirmDialog.vue` | Dialog component | 🔴 High |
| ErrorBoundary | `components/common/ErrorBoundary.vue` | Alert component | 🔴 High |
| Toast | Custom implementations | Sonner/Toast | 🟡 Medium |

## Migration Progress Tracking

### Phase 1: Foundation Components

#### ✅ Select Component
- **Status**: Not Started
- **Files to Create**: 10
- **Target Replacements**: 20+
- **Estimated Effort**: 8 hours
- **Dependencies**: None

#### ✅ Label Component
- **Status**: Not Started
- **Files to Create**: 2
- **Target Replacements**: 40+
- **Estimated Effort**: 4 hours
- **Dependencies**: None

#### ✅ Alert Component
- **Status**: Not Started
- **Files to Create**: 3
- **Target Replacements**: 15+
- **Estimated Effort**: 6 hours
- **Dependencies**: None

#### ✅ Badge Component
- **Status**: Not Started
- **Files to Create**: 2
- **Target Replacements**: 25+
- **Estimated Effort**: 4 hours
- **Dependencies**: None

#### ✅ Checkbox Component
- **Status**: Not Started
- **Files to Create**: 2
- **Target Replacements**: 10+
- **Estimated Effort**: 6 hours
- **Dependencies**: None

### Phase 2: Enhanced UX Components

#### ⏳ Tooltip Component
- **Status**: Not Started
- **Files to Create**: 5
- **Target Replacements**: 30+
- **Estimated Effort**: 8 hours
- **Dependencies**: Phase 1 complete

#### ⏳ Tabs Component
- **Status**: Not Started
- **Files to Create**: 5
- **Target Replacements**: 10+
- **Estimated Effort**: 10 hours
- **Dependencies**: Phase 1 complete

#### ⏳ Switch Component
- **Status**: Not Started
- **Files to Create**: 2
- **Target Replacements**: 5+
- **Estimated Effort**: 4 hours
- **Dependencies**: Phase 1 complete

#### ⏳ Textarea Component
- **Status**: Not Started
- **Files to Create**: 2
- **Target Replacements**: 8+
- **Estimated Effort**: 4 hours
- **Dependencies**: Phase 1 complete

#### ⏳ RadioGroup Component
- **Status**: Not Started
- **Files to Create**: 3
- **Target Replacements**: 5+
- **Estimated Effort**: 6 hours
- **Dependencies**: Phase 1 complete

### Phase 3: Advanced Components

#### ⏳ Table Component
- **Status**: Not Started
- **Files to Create**: 9
- **Target Replacements**: 15+
- **Estimated Effort**: 16 hours
- **Dependencies**: Phase 1 & 2 complete

#### ⏳ Skeleton Component
- **Status**: Not Started
- **Files to Create**: 2
- **Target Replacements**: 20+
- **Estimated Effort**: 4 hours
- **Dependencies**: Phase 1 & 2 complete

#### ⏳ Pagination Component
- **Status**: Not Started
- **Files to Create**: 3
- **Target Replacements**: 5+
- **Estimated Effort**: 6 hours
- **Dependencies**: Phase 1 & 2 complete

#### ⏳ Avatar Component
- **Status**: Not Started
- **Files to Create**: 3
- **Target Replacements**: 8+
- **Estimated Effort**: 4 hours
- **Dependencies**: Phase 1 & 2 complete

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
| Component | Risk Level | Mitigation Strategy |
|-----------|------------|-------------------|
| Cart Item | 🔴 High | Test thoroughly, maintain backward compatibility |
| Authentication Forms | 🔴 High | A/B testing, gradual rollout |
| Checkout Forms | 🔴 High | Extensive E2E testing, monitoring |
| Admin Tables | 🟡 Medium | Test with admin users, provide training |

### Low Risk Components
| Component | Risk Level | Mitigation Strategy |
|-----------|------------|-------------------|
| Badges | 🟢 Low | Simple replacement, minimal user impact |
| Tooltips | 🟢 Low | Progressive enhancement |
| Skeletons | 🟢 Low | Visual enhancement only |

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