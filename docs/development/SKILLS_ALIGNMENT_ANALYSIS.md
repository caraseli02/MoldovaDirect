# Skills & Documentation Alignment Analysis

**Question:** How does `CODE_DESIGN_PRINCIPLES.md` align with existing skills and documentation?

---

## Alignment Matrix

| Resource | Focus | Alignment | Gaps |
|----------|-------|-----------|------|
| **CODE_DESIGN_PRINCIPLES.md** | Frontend architecture, testability, size limits | — | NEW |
| **vue skill** | Vue 3 patterns, composables API | ✅ Strong | No size limits |
| **architecture-patterns skill** | Backend architecture (Clean, Hexagonal) | ⚠️ Partial | Backend-only focus |
| **frontend-testing-vue skill** | Testing patterns | ✅ Strong | No design-for-testability |
| **design-guide skill** | UI/UX design principles | ✅ Strong | Different domain |
| **tdd-loop skill** | Test-driven workflow | ✅ Strong | Process-focused |
| **nuxt skill** | Nuxt 4 specific patterns | ✅ Strong | Framework-specific |
| **playwright skill** | E2E testing | ✅ Strong | Test execution only |

---

## Detailed Analysis

### 1. Vue Skill ✅ Strong Alignment

**What it covers:**
- Composition API patterns
- Composables structure
- Component best practices
- Props/emits patterns

**What CODE_DESIGN_PRINCIPLES adds:**
```yaml
New Concepts:
  • Component size limits (300 lines)
  • Cyclomatic complexity limits (10)
  • Decision tree for when to extract composables
  • Three-layer separation (Types → Composables → Components)
  • Anti-patterns to avoid

Overlaps:
  • Composables naming (use* prefix) ✓
  • Return object pattern ✓
  • readonly() for exports ✓
```

**Alignment Score:** 9/10

**Gap:** The vue skill doesn't mention size limits or complexity metrics. Could add:
```markdown
## Size Guidelines
- Keep components under 300 lines
- Keep composables under 150 lines
- Extract when file grows beyond limits
```

---

### 2. Architecture-Patterns Skill ⚠️ Partial Alignment

**What it covers:**
- Clean Architecture (backend)
- Hexagonal Architecture (backend)
- Domain-Driven Design (backend)

**What CODE_DESIGN_PRINCIPLES adds:**
```yaml
Frontend-Specific:
  • Component-based architecture
  • Layered architecture for frontend
  • Microkernel-like pattern (plugin sections)
  • Observer pattern (reactive state)

Conceptual Overlap:
  • Both emphasize separation of concerns ✓
  • Both emphasize dependency direction ✓
  • Both emphasize testability ✓
```

**The Pattern Translation:**

| Backend Pattern | Frontend Equivalent | CODE_DESIGN_PRINCIPLES |
|-----------------|---------------------|------------------------|
| Entities | Types (`types/*.ts`) | ✅ Covered |
| Use Cases | Composables (`composables/*.ts`) | ✅ Covered |
| Interface Adapters | Components (`components/**/*.vue`) | ✅ Covered |
| Dependency Inversion | Props/Emits contracts | ✅ Covered |
| Ports/Adapters | Plugin architecture | ✅ Covered |

**Alignment Score:** 7/10 (conceptually aligned, but domain differs)

**Gap:** Architecture patterns skill is backend-focused. Could add a "Frontend Architecture" section.

---

### 3. Frontend-Testing-Vue Skill ✅ Strong Alignment

**What it covers:**
- Vitest patterns
- Vue Test Utils
- Test structure templates
- Coverage commands

**What CODE_DESIGN_PRINCIPLES adds:**
```yaml
Design Philosophy:
  • "Design for testability from the beginning"
  • Test logic without DOM (extract to composables)
  • Test component in isolation (minimize dependencies)

Connection:
  The testing skill assumes code is already testable.
  CODE_DESIGN_PRINCIPLES explains HOW to make it testable.
```

**The Testing Connection:**

```
┌─────────────────────────────────────────────────────────────┐
│  CODE_DESIGN_PRINCIPLES                                    │
│  "If you can't test it easily, your architecture is wrong" │
│                                                             │
│  Steps to make code testable:                              │
│  1. Extract business logic → composables                   │
│  2. Define contracts → types/*.ts                         │
│  3. Component just orchestrates                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND-TESTING-VUE SKILL                                │
│  "Write tests using Vitest + Vue Test Utils"               │
│                                                             │
│  Now that code is testable:                                │
│  1. Test composables without DOM                           │
│  2. Test components in isolation                          │
│  3. Mock external dependencies                            │
└─────────────────────────────────────────────────────────────┘
```

**Alignment Score:** 9/10

**Gap:** Testing skill could reference design principles for "how to design testable code."

---

### 4. TDD-Loop Skill ✅ Strong Alignment

**What it covers:**
- Test-driven development workflow
- Ralph Wiggum pattern
- Red-green-refactor cycle

**What CODE_DESIGN_PRINCIPLES adds:**
```yaml
Before TDD:
  tdd-loop: "Write test first"
  + design principles: "Design for testability first"

Connection:
  You can't do TDD effectively if the architecture
  doesn't support testability. Design principles
  ensure the code CAN be tested before TDD begins.
```

**Alignment Score:** 10/10

---

## Gaps & Opportunities

### Gap 1: No Size Metrics in Skills

**Current:** Skills don't mention component/composable size limits

**Fix:** Add to vue skill:
```markdown
## Size Guidelines

| Type | Max Lines | Preferred | Action |
|------|-----------|-----------|--------|
| Component | 300 | 100-200 | Extract when exceeded |
| Composable | 150 | 50-100 | Split when exceeded |
| Utils | 100 | <50 | Group related functions |
```

### Gap 2: No Anti-Patterns Section

**Current:** Skills show what TO do, not what NOT to do

**Fix:** Add anti-patterns to relevant skills:
```markdown
## Anti-Patterns to Avoid

❌ God Object: Component doing everything
❌ Smarty Component: Business logic in template
❌ Chatty Component: Direct parent manipulation
```

### Gap 3: Architecture Patterns is Backend-Only

**Current:** "architecture-patterns" focuses on backend

**Fix:** Add frontend architecture section:
```markdown
## Frontend Architecture

The same principles apply to frontend:

- **Types** = Entities (data contracts)
- **Composables** = Use Cases (business logic)
- **Components** = Interface Adapters (presentation)
```

---

## Cross-Reference Matrix

Should be added to CODE_DESIGN_PRINCIPLES.md:

```markdown
## Related Skills & Documentation

| For... | See |
|--------|-----|
| Vue 3 Composition API | `.claude/skills/vue/` |
| Nuxt 4 patterns | `.claude/skills/nuxt/` |
| Testing patterns | `.claude/skills/frontend-testing-vue/` |
| TDD workflow | `.claude/skills/tdd-loop/` |
| Backend architecture | `.claude/skills/architecture-patterns/` |
| UI/UX design | `.claude/skills/design-guide/` |
| E2E testing | `.claude/skills/playwright-skill/` |
```

---

## Recommended Updates

### Update 1: Vue Skill

Add to `.claude/skills/vue/SKILL.md`:
```markdown
## Design Principles

Before writing components, review `docs/development/CODE_DESIGN_PRINCIPLES.md` for:
- Component size limits (max 300 lines)
- Testability guidelines
- When to extract composables
```

### Update 2: Frontend-Testing-Vue Skill

Add to `.claude/skills/frontend-testing-vue/SKILL.md`:
```markdown
## Design for Testability

Tests assume code is designed for testability. If testing is difficult:
1. Review `docs/development/CODE_DESIGN_PRINCIPLES.md`
2. Extract business logic to composables
3. Use typed props/emits for clear contracts
4. Minimize component dependencies
```

### Update 3: CODE_DESIGN_PRINCIPLES.md

Add cross-reference section:
```markdown
## Related Documentation

- **Vue Patterns**: `.claude/skills/vue/` - Composition API, components
- **Testing**: `.claude/skills/frontend-testing-vue/` - Vitest patterns
- **TDD**: `.claude/skills/tdd-loop/` - Test-driven workflow
- **Architecture**: `.claude/skills/architecture-patterns/` - Backend patterns
- **E2E**: `.claude/skills/playwright-skill/` - Browser testing
```

---

## Summary: Alignment Strength

```
┌─────────────────────────────────────────────────────────────┐
│                     ALIGNMENT SCORE                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  vue skill                  ████████████████████  95%       │
│  frontend-testing-vue       ████████████████████  90%       │
│  tdd-loop                   █████████████████████  100%      │
│  architecture-patterns      ████████████████       70%       │
│  design-guide               ████████████████████   85%       │
│  playwright                 ██████████████████     80%       │
│                                                             │
│  OVERALL ALIGNMENT          ████████████████████   87%       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Verdict:** Strong alignment with minor gaps. The new `CODE_DESIGN_PRINCIPLES.md` fills an important gap that skills didn't cover: **architectural decision-making before coding**.

---

**Last Updated:** 2026-01-19
