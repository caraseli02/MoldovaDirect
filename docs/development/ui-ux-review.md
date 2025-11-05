# Moldova Direct UI/UX Review

## Methodology
- **Scope**: Evaluated primary customer journeys (homepage, catalog browsing, cart, and checkout) across desktop and mobile breakpoints using implemented Vue components.
- **Inputs**: Reviewed Nuxt page/layout templates, shared UI components, and stateful composables to understand available states, transitions, and responsiveness.
- **Heuristics**: Jakob Nielsen's usability heuristics, WCAG 2.2 AA accessibility guidance, and e-commerce conversion best practices (trust, clarity, and momentum toward checkout).

## Experience Highlights
- **Clear storytelling on the homepage** – The hero section pairs a bold headline, supporting copy, and immediate "Shop" call-to-action, establishing brand promise quickly. Feature cards reinforce differentiators like quality and delivery assurance to build trust early.
- **Robust product discovery surface** – Catalog view combines category navigation, search, filters, sorting, and responsive layouts. Mobile-only perks (pull-to-refresh, virtualized grids, sticky filter launcher) acknowledge touch-first ergonomics and performance.
- **Cart momentum** – The cart balances rich controls (bulk actions, save for later, recommendations) with reassurance via persistent order summary on desktop and sticky action tray on mobile.
- **Checkout flexibility** – Shipping step supports guest flows, saved addresses, and step validation, making it easier for first-time buyers to complete purchases without forced account creation.

## Key Issues & Recommendations
### Navigation & Global Elements
- **Search affordance without behavior**: The header and mobile menu surface a search icon/button that does not launch any interaction. Connect it to the catalog search flow (modal or redirect) and provide an accessible label for screen readers.
- **Mobile menu accessibility**: The mobile navigation lacks focus trapping and ESC-key handling, so keyboard users may get trapped behind the backdrop. Add focus management utilities and dismiss on Escape to meet accessibility expectations.
- **Trust signals**: Footer social icons point to `#` placeholders and there are no payment/security badges. Replace with real destinations or remove until ready, and add trust badges or testimonials near checkout to reduce friction.

### Product Discovery
- **Filter clarity on desktop**: The filter sidebar is hidden via `lg:block`, so medium-width tablets see an empty column. Introduce a breakpoint-friendly toggle or adaptive layout (e.g., reveal filters for `md` screens) to avoid wasted space.
- **Search labeling**: Catalog search relies on placeholder text only. Supplement with a visible `<label>` (visually hidden is fine) to improve accessibility and comprehension.
- **Price range defaults**: Available price range is hard-coded (0–200). Pull actual min/max from product data to keep sliders accurate and avoid confusing constraints.

### Cart & Checkout
- **Shipping cost placeholder**: Cart summary shows the "Checkout" label in place of shipping totals, which conflicts with user expectations. Swap in calculated shipping estimates or "Calculated at next step" copy.
- **Feedback on newsletter and guest forms**: Newsletter subscription and guest checkout inputs clear values without confirming success or error. Add inline validation and toast feedback to reinforce action results.
- **Loading strategy for shipping methods**: Shipping methods are deferred with a 1.5s timeout even when address data is ready, slowing progression. Replace the artificial delay with an immediate fetch plus skeleton loaders to keep momentum.

### Accessibility & Inclusivity
- Provide `aria-label`s for icon-only buttons (search, close, cart) and ensure minimum touch target size (44px) across interactive elements.
- Ensure forms expose validation errors via semantic markup (`aria-invalid`, `aria-describedby`) so assistive tech and cognitive users can recover quickly.
- Review color contrast of light text on gradient backgrounds (e.g., hero, mobile nav header) to guarantee WCAG AA compliance.

### Content & Localization
- Double-check translation keys for all new flows (e.g., filters, checkout) to prevent fallback English in other locales.
- Consider microcopy that clarifies stock badges ("Low stock – order soon") and shipping steps ("Step 1 of 3"), helping guide international audiences unfamiliar with the brand.

### Performance & Feedback
- Maintain the skeleton/empty states already present, but ensure API errors bubble up with actionable guidance (retry CTA, support link).
- Audit image sizes and lazy-loading strategy for the hero and product grids to keep LCP fast, especially on mobile networks.

## Quick Wins (1–2 Sprints)
1. Wire the global search control to the catalog search route with focus on the input and keyboard shortcuts.
2. Implement accessible focus trapping for the mobile menu and filter sheet.
3. Replace placeholder footer links and add payment/security reassurance near checkout.
4. Deliver contextual feedback for newsletter subscriptions and guest checkout validation.
5. Compute dynamic price ranges and shipping cost copy from real data.

## Strategic Opportunities
- **Personalization**: Combine cart analytics with recently viewed products for tailored recommendations and higher conversion.
- **Progressive disclosure in checkout**: Introduce a multi-step progress indicator and save-and-resume messaging to reduce abandonment.
- **Content storytelling**: Add editorial modules (origin stories, pairing guides) to product detail pages to differentiate from generic marketplaces.
- **Post-purchase journey**: Design order tracking updates and proactive support prompts to reinforce trust and encourage repeat purchases.
