# Repository Guidelines
Moldova Direct is a Nuxt 3 commerce platform backed by Supabase. Use this guide to align contributions.

## Project Structure & Module Organization
- `pages/` hosts route-driven views; mirror URLs with nested folders.
- `components/` holds shared UI; `lib/` handles domain helpers, `utils/` stays framework-agnostic.
- `composables/` centralizes Composition API logic; `stores/` defines Pinia state; `layouts/` wraps global shells.
- `server/` exposes Nitro API routes and middleware; `plugins/` wires integrations; `scripts/` bundles ops CLIs.
- Static assets live in `assets/` and `public/`; locales stay in `i18n/`.
- Tests live in `tests/` (`unit/`, `integration/`, `e2e/`, `visual/`); Supabase schemas stay at the repo root as `supabase-*.sql`.

## Build, Test & Development Commands
- `npm run dev` starts Nuxt at `http://localhost:3000`.
- `npm run build` compiles production assets; `npm run preview` serves the build for smoke checks.
- `npm run test` runs Playwright suites; narrow scope with `npm run test:smoke` or `npm run test:chromium`.
- `npm run test:unit`, `npm run test:integration`, and `npm run test:visual` cover Vitest and UI diffs; `npm run test:report` opens the HTML report.
- `npm run deploy` promotes to Vercel production; `npm run deploy:preview` triggers preview deploys.

## Coding Style & Naming Conventions
- Use TypeScript and resolve Nuxt type checks before review.
- Vue files use `<script setup lang="ts">`; components stay in `PascalCase.vue`, composables in `useX.ts`.
- Keep two-space indentation and Tailwind utilities ordered layout → spacing → typography → color → state.
- Colocate feature types in `types/` and share constants from `lib/` or `utils/`.

## Testing Guidelines
- Vitest config lives in `vitest.config.ts`; name new specs `*.test.ts` alongside the source.
- E2E suites rely on Playwright projects (Chromium, Firefox, WebKit); apply tags (`@smoke`, `@regression`) when useful.
- Record Playwright artifacts for UI work and run `npm run test:visual:update` when intentionally changing visuals.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (`type(scope): summary`) as seen in `feat(order-history): …` and `refactor(ui): …`.
- Keep commits focused, run tests before pushing, and reference related Supabase SQL when schema changes ship.
- Pull requests need a concise summary, linked roadmap issue, test evidence (logs or screenshots), and any environment updates.

## Security & Configuration Tips
- Do not commit secrets; populate `.env` from `.env.example`.
- When extending Supabase features, update the matching `supabase-*.sql` scripts and note migration steps in the PR.
- Review `docs/` resources (e.g., `docs/SUPABASE_SETUP.md`) before altering authentication or localization settings.
