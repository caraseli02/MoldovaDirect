# Dual-Layer Documentation Implementation Prompt

## Prerequisites

- [Add prerequisites here]

## Steps


**Purpose**: Use this prompt to start a new chat session focused on implementing dual-layer documentation (human-friendly + AI-friendly) for Moldova Direct.

---

## Copy This Prompt to New Chat

```
I need help implementing a dual-layer documentation system for my Nuxt 4 e-commerce project (Moldova Direct). The goal is to create documentation that serves both human developers AND AI assistants effectively.

## Project Context

**Project**: Moldova Direct - E-commerce platform for Moldovan food and wine products
**Stack**: Nuxt 4.2.2, Vue 3.5, TypeScript, Supabase, Stripe
**Current State**: 
- Documentation exists but is hard to navigate (24 folders)
- Optimized for humans reading linearly
- Not structured for AI assistants
- Missing context for AI code generation

**Key Files**:
- `/llms.txt` - Already created (AI project overview)
- `docs/meta/AI_ERA_DOCUMENTATION_PROPOSAL.md` - Full proposal
- `docs/meta/DOCUMENTATION_IMPROVEMENT_PROPOSAL.md` - Human-friendly structure
- `docs/architecture/` - Existing architecture docs
- `docs/guides/` - Existing how-to guides

## What I Want to Achieve

### Layer 1: Human-Friendly Documentation (Diátaxis Framework)
Reorganize existing docs into 4 clear categories:
1. **Tutorials** - Learning-oriented (step-by-step guides)
2. **How-To Guides** - Problem-oriented (task-focused solutions)
3. **Reference** - Information-oriented (technical specs)
4. **Explanation** - Understanding-oriented (concepts & decisions)

### Layer 2: AI-Friendly Documentation (Context Files)
Create structured context for AI assistants:
1. **llms.txt** - ✅ Already created (project overview)
2. **AGENTS.md** - Detailed context for AI agents (patterns, security rules)
3. **ai-context/** folder - Architecture summaries, patterns, conventions

## Specific Tasks

### Phase 1: Audit & Planning (Priority: HIGH)
1. **Audit existing documentation**:
   - List all files in `docs/` directory
   - Categorize each by type (tutorial/how-to/reference/explanation)
   - Identify gaps and duplicates
   - Create mapping document

2. **Create implementation plan**:
   - Prioritize which docs to migrate first
   - Define new folder structure
   - Plan backward compatibility (redirects)
   - Estimate effort per section

### Phase 2: Human-Friendly Layer (Priority: HIGH)
1. **Create new structure**:
   ```
   docs/
   ├── README.md              # Navigation hub
   ├── tutorials/             # Learning-oriented
   ├── how-to/               # Problem-oriented
   ├── reference/            # Information-oriented
   ├── explanation/          # Understanding-oriented
   ├── project/              # Status & roadmap
   └── archive/              # Historical
   ```

2. **Migrate existing content**:
   - Move files to appropriate categories
   - Update internal links
   - Add breadcrumb navigation
   - Create index pages for each section

3. **Improve readability**:
   - Add visual hierarchy (emojis, formatting)
   - Create "See Also" sections
   - Add quick reference cards
   - Include diagrams where helpful

### Phase 3: AI-Friendly Layer (Priority: HIGH)
1. **Create AGENTS.md**:
   - Architecture patterns (with code examples)
   - Security rules (NEVER/ALWAYS patterns)
   - Code conventions (naming, structure)
   - Common tasks guide
   - Known issues & workarounds

2. **Create .cursorrules**:
   - Project context summary
   - Critical security rules
   - File patterns
   - Component creation guidelines
   - API route guidelines

3. **Create ai-context/ folder**:
   ```
   docs/ai-context/
   ├── ARCHITECTURE_SUMMARY.md   # High-level system design
   ├── PATTERNS.md               # Code patterns & conventions
   ├── DEPENDENCIES.md           # Dependency graph
   └── CONVENTIONS.md            # Naming, structure, style
   ```

4. **Enhance llms.txt**:
   - Review and update existing content
   - Add links to new AI context docs
   - Include recent changes
   - Add troubleshooting section

## Critical Requirements

### Security Rules (MUST be in AI docs)
```typescript
// NEVER do this:
❌ Trust client-sent prices
❌ Skip CSRF validation
❌ Direct database updates for inventory
❌ Expose service keys

// ALWAYS do this:
✅ Verify prices server-side
✅ Validate request origin
✅ Use atomic RPC functions
✅ Add data-testid attributes
```

### Code Patterns (MUST be documented)
```typescript
// Vue 3 Component Pattern
<script setup lang="ts">
interface Props {
  product: Product
  quantity?: number
}
const props = withDefaults(defineProps<Props>(), {
  quantity: 1
})
</script>

// API Route Pattern
export default defineEventHandler(async (event) => {
  // 1. Validate origin (CSRF)
  const originResult = validateOrigin(event)
  if (!originResult.valid) {
    throw createError({ statusCode: 403 })
  }
  
  // 2. Verify prices server-side
  // 3. Use atomic operations
  // 4. Return typed response
})
```

### File Organization (MUST be consistent)
```
components/
├── ui/              # Reusable UI components
├── checkout/        # Feature-specific
└── admin/           # Admin-only

composables/
├── useCart.ts       # Business logic
├── useAuth.ts       # Authentication
└── useToast.ts      # UI utilities

server/
├── api/             # API endpoints
├── utils/           # Server utilities
└── middleware/      # Server middleware
```

## Deliverables

### Phase 1 (Week 1)
- [ ] Documentation audit report
- [ ] Content categorization mapping
- [ ] New structure proposal
- [ ] Migration plan with timeline

### Phase 2 (Week 2)
- [ ] New folder structure created
- [ ] README.md navigation hub
- [ ] Top 10 docs migrated and improved
- [ ] Index pages for each section
- [ ] Breadcrumb navigation added

### Phase 3 (Week 3)
- [ ] AGENTS.md created with patterns
- [ ] .cursorrules created
- [ ] ai-context/ folder with 4 docs
- [ ] llms.txt enhanced
- [ ] Testing guide for AI tools

### Final Deliverables
- [ ] Complete dual-layer documentation
- [ ] Migration guide for team
- [ ] Maintenance guide
- [ ] Success metrics dashboard

## Success Criteria

### For Humans
- ⏱️ Find information in <3 minutes (currently 30+ min)
- 😊 Developer satisfaction: "Much easier to navigate"
- 📚 Clear learning path for new developers
- 🎯 Task-focused guides for common operations

### For AI Assistants
- 🤖 AI generates code following project patterns
- 🔒 AI respects security rules automatically
- ⚡ AI understands context in <10 seconds
- ✅ AI-generated code requires minimal fixes

### Measurable Metrics
- Time to find documentation: 30 min → 3 min
- AI code quality: Track security issues, pattern compliance
- Onboarding time: Track new developer ramp-up
- Documentation contributions: Track team engagement

## Constraints & Considerations

### Must Preserve
- All existing documentation content
- Git history
- External links (add redirects)
- SEO value

### Must Avoid
- Breaking existing workflows
- Overwhelming team with changes
- Losing valuable historical context
- Creating maintenance burden

### Nice to Have
- Diagrams for complex flows
- Video walkthroughs
- Interactive examples
- Search functionality

## Questions to Address

1. **Structure**: Should we use Option A (Diátaxis) or Option B (Audience-based)?
2. **Migration**: Big bang or incremental migration?
3. **Tooling**: Stay with Markdown or use documentation site (VitePress/Docusaurus)?
4. **Maintenance**: Who owns documentation updates?
5. **Testing**: How do we validate AI context effectiveness?

## Reference Materials

**Existing Documentation**:
- `docs/meta/AI_ERA_DOCUMENTATION_PROPOSAL.md` - Full AI-era proposal
- `docs/meta/DOCUMENTATION_IMPROVEMENT_PROPOSAL.md` - Human-friendly structure
- `docs/meta/DOCUMENTATION_QUICK_WINS.md` - Immediate improvements
- `/llms.txt` - Current AI context file

**External Resources**:
- [Diátaxis Framework](https://diataxis.fr/) - Documentation structure methodology
- [llms.txt Standard](https://llmstxt.org/) - AI-friendly documentation standard
- [Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/) - UX principle

## Output Format

Please provide:

1. **Audit Report** (Phase 1):
   - List of all documentation files
   - Categorization by type
   - Gap analysis
   - Priority recommendations

2. **Implementation Plan** (Phase 1):
   - Detailed timeline
   - Task breakdown
   - Resource requirements
   - Risk assessment

3. **New Structure** (Phase 2):
   - Complete folder hierarchy
   - File naming conventions
   - Navigation system
   - Migration checklist

4. **AI Context Files** (Phase 3):
   - AGENTS.md with patterns
   - .cursorrules with rules
   - ai-context/ documentation
   - Testing guide

5. **Maintenance Guide**:
   - Update procedures
   - Review schedule
   - Quality checklist
   - Team responsibilities

## Additional Context

**Current Pain Points**:
- Developers spend 30+ minutes finding information
- AI generates code that doesn't follow our patterns
- New developers struggle to understand the system
- Documentation scattered across 24 folders
- Hard to keep docs up-to-date

**Recent Changes** (January 2026):
- Security hardening (PR #337): CSP, CSRF, rate limiting
- Custom component system (PR #346): Replaced shadcn-vue
- Auth store modularization: Split into focused modules
- Cart initialization simplified: Use `import.meta.client`

**Team Context**:
- Small team (2-3 developers)
- Using AI tools daily (Cursor, Copilot, Claude)
- Need documentation that scales
- Want to reduce onboarding time

## Start Here

Begin with Phase 1: Audit existing documentation and create a detailed implementation plan. Focus on quick wins that provide immediate value while building toward the complete dual-layer system.

Let me know if you need any clarification or additional context!
```

---

## How to Use This Prompt

### Step 1: Copy the Prompt
Copy everything between the triple backticks above.

### Step 2: Start New Chat
Open a new chat session in your AI tool (Claude, ChatGPT, etc.)

### Step 3: Paste and Send
Paste the entire prompt and send it.

### Step 4: Follow the Phases
The AI will guide you through:
1. **Phase 1**: Audit and planning
2. **Phase 2**: Human-friendly layer
3. **Phase 3**: AI-friendly layer

### Step 5: Iterate
Work with the AI to refine the implementation based on your specific needs.

---

## What This Prompt Includes

✅ **Complete Context**
- Project background
- Current state
- Goals and objectives

✅ **Clear Tasks**
- Phased approach
- Specific deliverables
- Success criteria

✅ **Critical Requirements**
- Security rules
- Code patterns
- File organization

✅ **Reference Materials**
- Links to existing docs
- External resources
- Examples

✅ **Constraints**
- What to preserve
- What to avoid
- Nice-to-haves

✅ **Output Format**
- Specific deliverables
- Expected structure
- Quality criteria

---

## Expected Timeline

### Phase 1: Audit & Planning
**Duration**: 2-3 days  
**Output**: Audit report, implementation plan

### Phase 2: Human-Friendly Layer
**Duration**: 1 week  
**Output**: New structure, migrated docs, navigation

### Phase 3: AI-Friendly Layer
**Duration**: 1 week  
**Output**: AGENTS.md, .cursorrules, ai-context/

### Total: 2-3 weeks for complete implementation

---

## Tips for Success

### 1. Start Small
Don't try to do everything at once. Start with:
- Top 10 most-used docs
- Critical security rules
- Common patterns

### 2. Test Early
After Phase 1, test with:
- Your AI tool (Cursor, Copilot)
- New team member
- Common tasks

### 3. Iterate
Based on feedback:
- Adjust structure
- Add missing patterns
- Clarify unclear sections

### 4. Maintain
Set up regular reviews:
- Weekly: Update for new features
- Monthly: Review AI context effectiveness
- Quarterly: Full documentation audit

---

## Customization Options

### If You Want Faster Results
Focus on Phase 3 (AI-friendly layer) first:
- Create AGENTS.md
- Enhance llms.txt
- Add .cursorrules

### If You Want Better Human Experience
Focus on Phase 2 (human-friendly layer) first:
- Reorganize with Diátaxis
- Add navigation
- Improve readability

### If You Want Both
Follow the phased approach as outlined in the prompt.

---

## Success Indicators

You'll know it's working when:

### Week 1
- ✅ Clear understanding of current state
- ✅ Detailed implementation plan
- ✅ Team buy-in

### Week 2
- ✅ Easier to find documentation
- ✅ New structure makes sense
- ✅ Navigation is intuitive

### Week 3
- ✅ AI generates better code
- ✅ Fewer pattern violations
- ✅ Faster development

### Month 1
- ✅ Reduced onboarding time
- ✅ Higher documentation usage
- ✅ Better code quality

---

## Troubleshooting

### If AI Doesn't Understand
- Provide more context about your project
- Share specific examples
- Reference existing documentation

### If Output Isn't What You Need
- Ask for specific format
- Request examples
- Clarify requirements

### If Timeline Seems Too Long
- Focus on quick wins first
- Parallelize tasks
- Reduce scope

---

## Next Steps After Implementation

1. **Train the Team**
   - How to use new structure
   - How to maintain AI context
   - How to contribute

2. **Monitor Effectiveness**
   - Track time to find info
   - Measure AI code quality
   - Collect feedback

3. **Iterate and Improve**
   - Add missing patterns
   - Update based on usage
   - Expand coverage

4. **Scale**
   - Add more examples
   - Create video guides
   - Build documentation site

---

**Ready to implement dual-layer documentation?** Copy the prompt above and start a new chat!
