# shadcn-vue Component Modernization Plan

## Executive Summary

This document outlines a comprehensive plan to modernize component usage across the MoldovaDirect application by better utilizing shadcn-vue components. The migration will improve consistency, accessibility, mobile experience, and development velocity. All shadcn-vue libraries were scaffolded with the CLI on 2025-10-05; the actual migration of product surfaces to those components is still in progress.

## Current State Analysis

### Imported Component Libraries (October 5, 2025)
- **Button** - Fully implemented with variants (default, destructive, outline, secondary, ghost, link)
- **Card** - Complete card system (Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription, CardAction)
- **Dialog** - Full dialog system with accessibility features
- **Input** - Text input component with validation states
- **Sonner** - Toast notification system
- **Select** - Complete dropdown system with search, multi-select support (12 files)
- **Label** - Form accessibility component (2 files)
- **Alert** - Success/error messaging with variants (4 files)
- **Badge** - Status indicators with variants (2 files)
- **Checkbox** - Form selection with accessibility (2 files)
- **Tooltip** - Contextual help system (5 files)
- **Tabs** - Content organization with keyboard navigation (5 files)
- **Switch** - Modern toggle controls (2 files)
- **Textarea** - Multi-line input with auto-resize (2 files)
- **RadioGroup** - Single choice selections (3 files)
- **Table** - Complete table system with sorting/filtering (11 files)
- **Skeleton** - Loading placeholders (2 files)
- **Pagination** - Navigation controls (9 files)
- **Avatar** - User representations with fallbacks (4 files)

**Total**: 19 complete shadcn-vue component libraries (77 individual files)

> **Status (February 2026)**  
> All shadcn-vue component libraries listed above are installed, and buttons have been migrated to the new API. Remaining UI still uses bespoke components—this document now tracks the ongoing replacement work. Up-to-date blockers live in `TODO.md`; update both locations when work completes.

### Current Migration Status (February 2026)

| Surface / Flow | Status | Outstanding Work | Owner | Source of Truth |
| --- | --- | --- | --- | --- |
| Authentication (login/register, error banners) | ✅ Completed | Migrated to shadcn inputs/labels/alerts; retired legacy auth message components | Unassigned | `TODO.md` |
| Checkout (shipping, payment, confirmation) | 🔄 In progress | Swap selects, inputs, alerts; adopt Dialog for modals | Unassigned | `TODO.md` |
| Cart (drawer, line items, bulk actions) | ⏳ Not started | Replace quantity buttons, checkboxes, toasts with shadcn-vue | Unassigned | `TODO.md` |
| Admin tables & filters | ⏳ Not started | Adopt `components/ui/table`, pagination, badge variants | Unassigned | `TODO.md` |
| Mobile navigation & sheets | ⏳ Not started | Migrate menus to Dialog/Sheet patterns, fix touch targets | Unassigned | `TODO.md` |
| Toast/Notification system | ⏳ Not started | Remove legacy `components/common/Toast*.vue`, consolidate on Sonner | Unassigned | `TODO.md` |

### Adoption Progress
- ✅ Buttons and primary dialogs migrated to shadcn-vue
- 🔄 Forms: replace custom `<input>`, `<select>`, `<textarea>` usage across checkout, auth, and admin screens
- 🔄 Tables: migrate admin tables to shadcn table components with consistent pagination + sorting UI
- 🔄 Alerts/Toasts: phase out legacy `components/common/Toast*.vue`
- 🔄 Mobile patterns: adopt shadcn dialogs/sheets for mobile menu, cart, and profile flows
- 📌 Capture migration status in `TODO.md` when blocking issues emerge

### Component Usage Statistics
- **78 files** contain custom `<button>` elements
- **41 files** contain custom `<input>` elements
- **20 files** contain custom `<select>` or `<textarea>` elements
- **Multiple custom modal/alert implementations** throughout the application

### Critical Issues Identified
1. **Inconsistent Design Language** - Mixed custom and shadcn-vue styling
2. **Accessibility Gaps** - Custom components lack proper ARIA support
3. **Mobile UX Issues** - Touch targets below 44px minimum, inconsistent responsive patterns
4. **Development Inefficiency** - Repeated custom styling code across components

## Modernization Phases

### Phase 1: Foundation Components (Week 1-2)
**Priority**: High - Critical for basic functionality and accessibility

#### New Components to Implement
1. **Select Component**
   - Replace 20+ custom dropdown implementations
   - Support for search, multi-select, and async options
   - Accessibility: keyboard navigation, ARIA attributes

2. **Label Component**
   - Essential for form accessibility
   - Proper association with form controls
   - Consistent styling and positioning

3. **Alert Component**
   - Standardize success/error messaging
   - Replace custom error components
   - ARIA live regions for screen readers

4. **Badge Component**
   - Status indicators and counters
   - Replace custom badge implementations
   - Consistent variants (default, secondary, destructive, outline)

5. **Checkbox Component**
   - Form selections with proper accessibility
   - Custom styling options
   - Indeterminate state support

#### Immediate Replacements Required
- **Cart Item Component** - Replace custom buttons, add proper labels
- **Authentication Forms** - Replace custom inputs with Input + Label
- **Admin Tables** - Standardize action buttons
- **Error/Success Messages** - Convert to Alert components

### Phase 2: Enhanced UX Components (Week 3-4)
**Priority**: Medium - Improves user experience and mobile usability

#### New Components to Implement
1. **Tooltip Component**
   - Contextual help and information
   - Hover and focus trigger support
   - Proper positioning and collision detection

2. **Tabs Component**
   - Organize complex admin interfaces
   - Keyboard navigation support
   - Mobile-responsive design

3. **Switch Component**
   - Modern toggle controls
   - Smooth animations
   - Accessibility support

4. **Textarea Component**
   - Multi-line text inputs
   - Auto-resize capability
   - Validation states

5. **RadioGroup Component**
   - Single choice selections
   - Custom styling options
   - Keyboard navigation

#### Mobile Improvements
- Replace custom mobile modals with Dialog component
- Implement proper touch targets (44px minimum)
- Fix keyboard navigation and focus management
- Standardize responsive breakpoints

### Phase 3: Advanced Components (Week 5-6)
**Priority**: Low - Completes the component ecosystem

#### New Components to Implement
1. **Table Component**
   - Structured data display
   - Sorting, filtering, pagination
   - Mobile-responsive design

2. **Skeleton Component**
   - Loading placeholders
   - Improve perceived performance
   - Multiple shape variants

3. **Pagination Component**
   - Replace custom pagination implementations
   - Consistent API across applications
   - Accessibility support

4. **Avatar Component**
   - User representations
   - Fallback options
   - Status indicators

5. **Form Component**
   - Form-level validation integration
   - Consistent validation patterns
   - Error state management

## Expected Benefits

### Development Efficiency
- **40-60% reduction** in custom styling code
- **Consistent component APIs** across the application
- **Faster development** with standardized patterns
- **Easier maintenance** with centralized components

### User Experience Improvements
- **WCAG 2.1 AA compliance** through built-in accessibility
- **Consistent mobile experience** with proper touch targets
- **Unified design language** across all sections
- **Improved task completion rates** with standardized patterns

### Technical Benefits
- **Built-in dark mode support**
- **Semantic token system** for theming
- **Automatic focus management**
- **Screen reader optimization**

## Implementation Strategy

### Migration Approach
1. **Incremental Migration** - Replace components gradually to avoid breaking changes
2. **Backward Compatibility** - Maintain custom components during transition period
3. **Component-Level Testing** - Test each migrated component individually
4. **E2E Testing** - Ensure user flows remain intact after migration

### Risk Mitigation
- **Feature Flags** - Roll out changes gradually
- **User Testing** - Validate UX improvements at each phase
- **Rollback Plan** - Maintain ability to revert changes if needed
- **Documentation** - Create comprehensive component usage guidelines

## Success Metrics

### Technical Metrics
- **Code Reduction**: 40-60% decrease in custom styling code
- **Component Consistency**: 90%+ usage of shadcn-vue components
- **Test Coverage**: 100% coverage for migrated components
- **Performance**: No regression in page load times

### User Experience Metrics
- **Accessibility Score**: WCAG 2.1 AA compliance
- **Mobile Usability**: 44px minimum touch targets
- **Task Completion**: Improved checkout and form completion rates
- **User Satisfaction**: Reduced support tickets related to UI issues

## Library Scaffolding Completed - October 5, 2025

On 2025-10-05 the shadcn-vue CLI was used to generate all component libraries listed above. This step delivered ready-to-use building blocks but did not migrate existing product surfaces. The phase timelines below now track migration work.

### Migration Timeline vs Planned

| Phase | Planned Duration | Actual Duration | Status (February 2026) | Notes |
|-------|------------------|-----------------|------------------------|-------|
| Phase 1 | 2 weeks | Scaffolding completed in 45 minutes | 🔄 In progress | Library files exist; feature teams still replacing inputs/buttons/alerts |
| Phase 2 | 2 weeks | Scaffolding completed in 35 minutes | ⏳ Not started | Awaiting adoption in tooltips, tabs, switches, textarea, radio groups |
| Phase 3 | 2 weeks | Scaffolding completed in 40 minutes | ⏳ Not started | Table/pagination/skeleton/avatar not deployed in product screens |
| **Total** | **6 weeks** | **~2 hours scaffolding only** | **🔄 Migration ongoing** | Track active work in `TODO.md` |

### What Has Been Delivered So Far

```
📦 Library scaffolding completed on 2025-10-05 via shadcn-vue CLI
✅ Buttons migrated to new API in high-traffic flows
📝 Migration checklists drafted per component family
📌 Outstanding: replace legacy markup across product surfaces (see Current Migration Status table)
```

### Key Considerations
1. **shadcn-vue CLI** - Automated component generation accelerated setup; verify imports during migrations.
2. **Parallel Systems** - Legacy components remain active; plan for controlled deprecation after each rollout.
3. **Documentation Sync** - Keep this plan and `TODO.md` aligned after each migration milestone.
4. **Testing Debt** - Add unit/E2E coverage as components are swapped into critical flows.

## Resource Requirements

### Development Resources
- **1 Senior Developer** - Component implementation and migration
- **1 UI/UX Designer** - Design system validation and user testing
- **1 QA Engineer** - Testing and validation

### Tools and Dependencies
- **shadcn-vue** - Component library (already partially implemented)
- **class-variance-authority** - Variant management (already in use)
- **reka-ui** - Headless UI primitives (already in use)
- **@tailwindcss/forms** - Form styling utilities

## Conclusion

This modernization plan will significantly improve the MoldovaDirect application by providing a consistent, accessible, and maintainable component system. The phased approach ensures minimal disruption while delivering immediate benefits to both users and developers.

The investment in shadcn-vue components will pay dividends through improved development velocity, reduced technical debt, and enhanced user experience across all application sections.
