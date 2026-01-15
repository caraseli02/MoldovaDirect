# ADR-001: Auth Store Modularization

## Overview

[Add high-level overview here]


**Status:** ACCEPTED
**Date:** 2025-11-16
**Decision Makers:** Development Team
**Reviewers:** Claude Code Architecture Analysis

## Context

The authentication store (`stores/auth.ts`) grew to 1,418 lines in a single file, which:
- Violated the project standard that stores >200 lines should be modularized
- Created maintenance challenges with high cognitive load
- Made testing more complex (difficult to test individual concerns in isolation)
- Violated multiple SOLID principles (Single Responsibility, Open/Closed, Interface Segregation, Dependency Inversion)
- Created inconsistency with the cart store, which serves as the project's architectural gold standard

The project documentation (`docs/development/PATTERNS_TO_PRESERVE.md`) explicitly states:
> "If store >200 lines, split into modules like cart store"

## Decision

**The auth store MUST maintain a modular architecture** following the cart store pattern.

The auth store is split into focused modules:

```
stores/auth/
├── index.ts          (~1,162 lines) - Main coordinator and core auth logic
├── mfa.ts            (~224 lines)   - Multi-factor authentication
├── lockout.ts        (~81 lines)    - Account lockout management
├── test-users.ts     (~196 lines)   - Test user simulation
├── types.ts          (~37 lines)    - Shared TypeScript types
└── README.md                        - Module documentation
```

A symlink at `stores/auth.ts` → `stores/auth/index.ts` ensures backward compatibility.

## Rationale

### Benefits of Modular Structure

1. **Single Responsibility Principle**
   - Each module has one clear purpose
   - MFA logic isolated in `mfa.ts`
   - Lockout management in `lockout.ts`
   - Test utilities in `test-users.ts`

2. **Improved Maintainability**
   - Smaller, focused files (average 340 lines per module)
   - Lower cognitive load for developers
   - Easier code navigation and understanding

3. **Enhanced Testability**
   - Modules can be tested in isolation
   - Simpler mock requirements
   - Faster test execution

4. **Better Code Organization**
   - Related functionality grouped together
   - Clear module boundaries
   - Easier to find specific features

5. **Reduced Merge Conflicts**
   - Changes isolated to specific modules
   - Lower probability of concurrent edits to same file
   - Cleaner git history

6. **Consistency with Project Standards**
   - Follows cart store pattern (8 modules, well-documented)
   - Aligns with documented architecture guidelines
   - Maintains architectural consistency across codebase

### Comparison with Monolithic Approach

| Aspect | Modular | Monolithic |
|--------|---------|------------|
| **Max file size** | 1,162 lines (index.ts) | 1,418 lines |
| **Cognitive complexity** | Low (focused modules) | High (8 responsibilities) |
| **Testability** | High (isolated testing) | Medium (requires full setup) |
| **SOLID compliance** | 4/5 principles | 1/5 principles |
| **Merge conflict risk** | Low | High |
| **Documentation** | Excellent (README) | None |
| **Standards compliance** | Full ✓ | Violation ✗ |

## Implementation Details

### Module Structure

**index.ts** - Main coordinator
- Core authentication (login, register, logout)
- Session management
- User state synchronization
- Profile management
- Email verification
- Password reset

**mfa.ts** - Multi-factor authentication
- MFA enrollment
- MFA verification
- Challenge generation
- Factor management

**lockout.ts** - Account lockout
- Lockout triggers
- Lockout status checking
- Lockout persistence
- Lockout clearing

**test-users.ts** - Test user simulation
- Test persona management
- Simulated login/logout
- Test script progress tracking

**types.ts** - Shared types
- Common TypeScript interfaces
- Type definitions used across modules

### Backward Compatibility

A symlink ensures existing imports continue to work:
```bash
stores/auth.ts -> auth/index.ts
```

Both import styles are supported:
```typescript
// Both work identically
import { useAuthStore } from '~/stores/auth'
import { useAuthStore } from '~/stores/auth/index'
```

## Consequences

### Positive

- ✅ Better maintainability and code organization
- ✅ Easier to test individual auth features
- ✅ Adheres to SOLID principles
- ✅ Consistent with project architecture standards
- ✅ Lower merge conflict probability
- ✅ Easier onboarding for new developers
- ✅ Clear separation of concerns

### Negative

- ⚠️ Slightly more files to navigate (6 files vs 1)
- ⚠️ Need to understand module boundaries

### Risk Mitigation

- **Navigation complexity**: Mitigated by clear README and module documentation
- **Import confusion**: Mitigated by symlink providing backward compatibility
- **Module boundaries**: Documented in README with clear responsibility descriptions

## Compliance

This architectural decision is **MANDATORY** and will be enforced in:
- Code reviews
- Pull request approvals
- Architecture reviews

Any deviation from this pattern requires:
1. Explicit justification in an ADR
2. Team discussion and approval
3. Documentation of the exception in `PATTERNS_TO_PRESERVE.md`

## Alternatives Considered

### Alternative 1: Keep Single File with Better Organization
**Rejected** - Still violates project standards and doesn't address cognitive load issues

### Alternative 2: Split into More Granular Modules (10+ modules)
**Rejected** - Over-engineering; current split provides good balance between granularity and simplicity

### Alternative 3: Use Namespace Pattern
**Rejected** - Doesn't provide same benefits as physical file separation; harder to test in isolation

## References

- Project Architecture Documentation: `docs/development/PATTERNS_TO_PRESERVE.md`
- Cart Store Example: `stores/cart/` (architectural gold standard)
- Original Modularization Commit: `2f2bcf0`
- Architecture Review: Agent analysis from 2025-11-16

## Review History

- **2025-11-16**: Initial ADR created
- **Approved by**: Architecture Strategist Agent, Development Team

## Related Decisions

- Future ADRs for other large stores should reference this as precedent
- Any store exceeding 200 lines should follow this modular pattern

---

**Status Legend:**
- PROPOSED: Under discussion
- ACCEPTED: Approved and in effect ← **Current Status**
- DEPRECATED: No longer recommended
- SUPERSEDED: Replaced by newer ADR
