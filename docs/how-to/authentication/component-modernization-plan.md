# Component Modernization Plan

## Overview

[Add high-level overview here]


> **IMPORTANT UPDATE (January 2026 - PR #346)**: The project direction changed from a CLI-managed shadcn-vue setup to a **localized custom component system**. This approach reduces dependency complexity and maintenance overhead by owning the component source code, while still leveraging **Reka UI** as a headless foundation for accessibility. The migration work described below is now ARCHIVED. See `docs/archive/migrations/` for historical shadcn-vue migration docs.

## Executive Summary

~~This document outlines a comprehensive plan to modernize component usage across the MoldovaDirect application by better utilizing shadcn-vue components.~~

**Current Status**: The project now uses a **localized component system** in `components/ui/`. While based on the shadcn-vue pattern, these components are manually maintained within the project to preserve critical customizations and bug fixes, using **Reka UI** for complex UI primitives.


## Historical Context (ARCHIVED)

### Previously Imported shadcn-vue Libraries (October 2025 - Removed January 2026)

The following libraries were scaffolded but later removed in favor of custom components:

- Button, Card, Dialog, Input, Sonner, Select, Label, Alert, Badge, Checkbox
- Tooltip, Tabs, Switch, Textarea, RadioGroup, Table, Skeleton, Pagination, Avatar

**Total**: 19 shadcn-vue component libraries (77 individual files) - **REMOVED in PR #346**

### Why the Change?
1. **Critical Customization** - Local components allow for bug fixes (like v-model reactivity issues) that cannot be updated via CLI.
2. **Local Ownership** - Decoupling from the shadcn-vue CLI to treat components as first-class project code.
3. **Maintenance** - Easier to maintain and customize specialized components without fear of overriding them.
4. **Accessibility** - Preserves **Reka UI** for complex accessibility (Select, Dialog) while using simpler HTML/Tailwind for basic ones (Card).


### Current Component Status (January 2026)

All components now use a custom implementation. The migration tracking tables above are ARCHIVED.

**Custom Components in Use:**
- Buttons with variants (primary, secondary, outline, ghost, destructive)
- Form inputs with validation states
- Cards and dialogs
- Toasts and notifications
- Tables with sorting and pagination
- Responsive navigation components

---

## ARCHIVED CONTENT BELOW

> The following sections document the original shadcn-vue migration plan. This work was superseded by PR #346 which moved to custom components. Kept for historical reference.

---

### Component Usage Statistics (Historical - October 2025)
- **78 files** contain custom `<button>` elements
- **41 files** contain custom `<input>` elements
- **20 files** contain custom `<select>` or `<textarea>` elements
- **Multiple custom modal/alert implementations** throughout the application

### Issues Identified (Historical)
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
| **Total** | **6 weeks** | **~2 hours scaffolding only** | **🔄 Migration ongoing** | Track active work in `.kiro/PROJECT_STATUS.md` |

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
3. **Documentation Sync** - Keep this plan and `.kiro/PROJECT_STATUS.md` aligned after each migration milestone.
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
  
Note: Tailwind CSS v4 is used via `@tailwindcss/vite` and `assets/css/tailwind.css`. No forms plugin is configured; form styles come from shadcn components and project CSS.

## Conclusion

This modernization plan will significantly improve the MoldovaDirect application by providing a consistent, accessible, and maintainable component system. The phased approach ensures minimal disruption while delivering immediate benefits to both users and developers.

The investment in shadcn-vue components will pay dividends through improved development velocity, reduced technical debt, and enhanced user experience across all application sections.
