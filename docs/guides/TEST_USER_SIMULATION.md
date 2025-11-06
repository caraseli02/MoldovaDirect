# Test User Simulation Dashboard

The **Test Users & Persona Simulator** provides a comprehensive testing environment to validate customer journeys without touching real Supabase data. This enhanced version includes interactive test scripts, progress tracking, session management, and developer tools for efficient QA workflows.

Visit [`/test-users`](../pages/test-users.vue) in development or preview deployments to activate guided personas.

## Table of Contents

- [Enable the simulator](#enable-the-simulator)
- [Persona catalogue](#persona-catalogue)
- [Interactive test scripts](#interactive-test-scripts)
- [Simulator controls](#simulator-controls)
- [Developer tools](#developer-tools)
- [Keyboard shortcuts](#keyboard-shortcuts)
- [Session export/import](#session-exportimport)
- [Simulation modes](#simulation-modes)
- [Auth store integration](#auth-store-integration)
- [E2E testing integration](#e2e-testing-integration)
- [When to use it](#when-to-use-it)

## Enable the simulator

The simulator is available automatically in development. To enable it elsewhere set an environment variable before running Nuxt:

```bash
export ENABLE_TEST_USERS=true
npm run dev
```

The flag backs the `public.enableTestUsers` runtime config entry defined in [`nuxt.config.ts`](../nuxt.config.ts).

**Production Safety**: The middleware includes enhanced production detection that blocks access in true production environments while allowing preview deployments (Vercel, Netlify).

## Persona catalogue

Personas are defined centrally in [`lib/testing/testUserPersonas.ts`](../lib/testing/testUserPersonas.ts). Each persona captures:

- Comprehensive test scripts with checkboxes and note-taking capabilities
- Recommended quick links that jump straight to high-value screens
- Rich mock data (orders, cart items, addresses, payment methods)
- User preferences and settings
- Optional lockout timers for recovery testing
- Simulation modes for network condition testing

### Available Personas

| Key | Scenario | Focus Areas | Data Included |
| --- | -------- | ----------- | ------------- |
| `first-order-explorer` | New shopper finishing their first purchase | Profile Basics, Cart Creation, Checkout Validation | Empty state testing |
| `loyal-subscriber` | Repeat customer with multiple orders | Order History, Reorder CTA, Saved Addresses | Multiple completed orders, addresses |
| `recovery-seeker` | Customer blocked by auth issues | Auth Messaging, Password Recovery, Lockout Timer | Email verification pending, 12min lockout |
| `cart-abandoner` | User with abandoned cart items | Cart Persistence, Recovery Flows, Checkout Friction | 3 items in cart, saved address |
| `vip-customer` | High-value customer with extensive history | Loyalty Program, VIP Benefits, Order Volume | 3 large orders, multiple addresses, loyalty status |
| `international-shopper` | Customer from outside Moldova | Currency Conversion, International Shipping, Localization | USD currency, US address, different timezone |
| `mobile-only-user` | Exclusive mobile device shopper | Mobile UX, Touch Interactions, Mobile Payments | Mobile-optimized preferences |
| `bulk-buyer` | Business customer with large orders | Bulk Pricing, Business Invoicing, Large Orders | 120+ item orders, business account data |

Add new personas to [`lib/testing/testUserPersonas.ts`](../lib/testing/testUserPersonas.ts) as regression scenarios emerge.

## Interactive test scripts

Each persona includes an interactive test script with:

### Progress Tracking
- **Checkboxes**: Mark steps as complete as you test
- **Completion percentage**: Real-time progress indicator
- **Persistent state**: Progress saved to localStorage
- **Last tested timestamp**: Track when testing occurred

### Note-Taking
- **Per-step notes**: Document issues, observations, or bugs found
- **Inline editing**: Add notes directly in the UI
- **Markdown support**: Use rich formatting in notes

### Example Workflow
```typescript
// 1. Activate a persona
$testUsers.activate('vip-customer')

// 2. Work through test script
// ☐ Step 1: Verify VIP badge appears
// ☐ Step 2: Check loyalty points balance
// ☐ Step 3: Test redeeming loyalty points

// 3. Check progress
$testUsers.script() // View script with progress
```

## Simulator controls

### Search and Filter
- **Search**: Filter personas by title, summary, email, or focus areas
- **Focus area filter**: Show only personas testing specific features
- **Real-time results**: Instant filtering as you type

### Active Persona Panel
When a persona is active, you'll see:
- **Session details**: User name, email, language, lockout status
- **Test script progress**: Interactive checklist with completion tracking
- **Quick links**: Navigation shortcuts to key pages
- **Export/Import**: Save and restore test sessions
- **Control buttons**: Clear lockout, end simulation

### Persona Catalogue
Browse available personas with:
- **Search and filters**: Find relevant test scenarios quickly
- **Focus area tags**: See what each persona tests
- **Quick activation**: One-click persona switching
- **Status indicators**: See which persona is currently active

## Developer tools

Access powerful console commands via `window.$testUsers`:

```javascript
// List all personas
$testUsers.list()

// Activate a persona
$testUsers.activate('vip-customer')

// View current persona and progress
$testUsers.current()

// Show test script with progress
$testUsers.script()

// Mark step as complete
$testUsers.complete(0)

// Add note to step
$testUsers.note(0, 'Found translation issue')

// Set simulation mode
$testUsers.mode('slow-network')

// Export current session
$testUsers.export()

// End simulation
$testUsers.end()

// Show all commands
$testUsers.help()
```

The dev tools are automatically loaded when `ENABLE_TEST_USERS=true`.

## Keyboard shortcuts

Speed up testing with keyboard shortcuts:

| Shortcut | Action |
| -------- | ------ |
| `Ctrl/Cmd + Shift + E` | End current simulation |
| `Ctrl/Cmd + Shift + T` | Navigate to homepage |
| `1-8` | Quick activate persona by number (when not in input) |

Shortcuts work across the entire application while a persona is active.

## Session export/import

### Export Session
Save your current test progress:
1. Click **Export** button in active persona panel
2. Session JSON is copied to clipboard
3. File is automatically downloaded

### Import Session
Restore a previous test session:
1. Click **Import** button
2. Paste session JSON
3. Click **Import Session**

Session data includes:
- Active persona key
- Simulation mode
- Completed test steps
- Step notes
- Timestamp and version

**Use case**: Share test sessions with team members or document bugs with exact reproduction steps.

## Simulation modes

Test different network conditions:

```javascript
// Normal operation (default)
$testUsers.mode('normal')

// Slow network (2-3s delays)
$testUsers.mode('slow-network')

// Intermittent errors (30% failure rate)
$testUsers.mode('intermittent-errors')

// Complete offline mode
$testUsers.mode('offline')
```

Or set via auth store:
```typescript
authStore.setSimulationMode('slow-network')
```

Simulation modes affect mock API responses in [`lib/testing/simulationHelpers.ts`](../lib/testing/simulationHelpers.ts).

## Auth store integration

### Core Methods
- `simulateLogin(personaKey)` – Activate persona with full data
- `simulateLogout()` – Clear persona state
- `toggleTestScriptStep(personaKey, stepIndex, totalSteps)` – Mark step complete/incomplete
- `updateTestScriptNote(personaKey, stepIndex, note)` – Add/update step note
- `clearPersonaProgress(personaKey)` – Reset progress for persona
- `setSimulationMode(mode)` – Change network simulation mode

### Getters
- `isTestSession` – Check if persona is active
- `activeTestPersona` – Get current persona key
- `currentPersonaProgress` – Get progress for active persona
- `getPersonaProgress(key)` – Get progress for any persona

### Behavior Changes
- `updateProfile()` – Uses local mutation when persona active (no API calls)
- Mock API responses – Simulated for orders, cart, addresses, payment methods

## E2E testing integration

Use Playwright fixtures for automated testing:

```typescript
import { test, expect } from '../fixtures/testUserPersonas.fixture'

test('should complete VIP customer flow', async ({ testUserPage }) => {
  await testUserPage.activatePersona('vip-customer')
  await testUserPage.verifyPersonaActive('VIP Customer')

  await testUserPage.completeStep(0)
  await testUserPage.addNoteToStep(0, 'VIP badge displayed correctly')

  const progress = await testUserPage.getCompletionPercentage()
  expect(progress).toBeGreaterThan(0)
})
```

Available fixtures and methods in [`tests/fixtures/testUserPersonas.fixture.ts`](../tests/fixtures/testUserPersonas.fixture.ts).

## URL parameters

Activate personas via URL for deep linking:

```
/test-users?activate=vip-customer&autoStart=true
```

Parameters:
- `activate` – Persona key to activate
- `autoStart` – Auto-activate on page load (default: true if no active persona)

## Validation

All persona data is validated at runtime using Zod schemas:

```typescript
import { validatePersona, validateSessionState } from '~/lib/testing/testUserValidation'

// Validate persona data
const result = validatePersona(personaData)

// Validate session import
const session = validateSessionState(importedJson)
```

Schemas available in [`lib/testing/testUserValidation.ts`](../lib/testing/testUserValidation.ts).

## When to use it

**Use the simulator for:**
- Manual QA of account features with realistic user data
- Bug reproduction when real accounts are unavailable
- Testing edge cases (lockouts, abandoned carts, international users)
- Regression testing without database setup
- Demo preparations with pre-configured scenarios

**Don't use for:**
- End-to-end test automation (use Playwright with fixtures instead)
- Production environments (blocked by middleware)
- Load testing or performance benchmarks

The simulator complements (doesn't replace) automated E2E testing by providing a human-friendly environment for exploratory testing and bug investigation.
