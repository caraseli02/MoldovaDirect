# Supabase Setup Guide for Moldova Direct

This guide walks through configuring a fresh Supabase project so it matches the current Moldova Direct backend (profiles, checkout, analytics, and order management).

---

## 1. Create a Supabase Project
1. Sign in at [supabase.com](https://supabase.com) and click **New project**.
2. Choose the team/organization, name the project (e.g. `moldova-direct`), set a strong database password, and pick a region close to your shoppers.
3. Wait for provisioning to finish (usually 2–3 minutes).

## 2. Configure Environment Variables
Grab your project credentials from **Settings → API** and update `.env` (copy from `.env.example` if needed):

```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=public-anon-key
SUPABASE_SERVICE_KEY=service-role-key   # required for server APIs

APP_URL=http://localhost:3000
NODE_ENV=development
RESEND_API_KEY= # only if you plan to test transactional emails locally
```

Restart `npm run dev` after editing `.env` so Nuxt picks up the changes.

## 3. Apply the Database Schema

All SQL scripts live at the repository root. Run them in order via the Supabase SQL Editor or the Supabase CLI (`supabase db push` supports `--file`).

1. **Core schema** – `supabase-schema.sql`
   - Profiles, addresses, categories, products, inventory logs, carts, orders, order items.
   - Enables row-level security (RLS) on all user data tables.
2. **Checkout and payments** – `supabase-checkout-schema.sql` and `supabase-checkout-indexes.sql`
   - Adds checkout-specific tables, indexes, and helper functions.
3. **Order tracking and returns** – `supabase-order-tracking-schema.sql`, `supabase-order-returns-schema.sql`, `supabase-order-indexes.sql`, `supabase-order-policies.sql`
   - Extends orders with tracking, return workflows, and tighter policies.
4. **Analytics and support add-ons** – run any of the optional scripts your feature work requires:
   - `supabase-analytics-schema.sql`
   - `supabase-cart-analytics-simple.sql`
   - `supabase-support-tickets-schema.sql`
   - `supabase-user-addresses-schema.sql`
   - `supabase-add-reorder-point.sql`
   - `supabase-mock-orders.sql` (seed data for demos; remove before production)

> Tip: keep a log of which scripts you apply so production, staging, and local environments stay in sync.

## 4. Configure Authentication
1. Navigate to **Authentication → Settings**.
2. Set **Site URL** to `http://localhost:3000` and add `http://localhost:3000/auth/confirm` to **Redirect URLs**.
3. Email provider is enabled by default; add OAuth providers if required.
4. Optional: customise Supabase email templates (we send transactional emails with Resend for production-like flows).

## 5. Verify Row-Level Security
The provided SQL scripts enable RLS on `profiles`, `addresses`, `carts`, `orders`, `order_items`, and related tables with policies tied to `auth.uid()`. Double-check **Policies** in the Supabase dashboard if you add new tables—mirror the existing patterns to keep data scoped per user.

## 6. Seed or Reset Data (Optional)
- Use `supabase-mock-orders.sql` to create sample orders for the admin dashboard.
- When building new features, create dedicated seed scripts and store them alongside the other `supabase-*.sql` files so the team can reproduce your data set.

## 7. Smoke Test the Integration
1. Install dependencies (`npm install`) if you haven’t already.
2. Start Nuxt: `npm run dev`.
3. Sign up with Supabase Auth, create a few orders from the checkout flow (cash payments function offline), and confirm the data lands in Supabase tables.

---

## Troubleshooting
- **Authentication loops**: confirm `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and redirect URLs all match; restart the dev server after changes.
- **Permission errors**: ensure the relevant SQL script ran and RLS policies exist—missing policies default to *deny*.
- **Service key missing**: any server route that writes orders or payment intents needs `SUPABASE_SERVICE_KEY`; set it locally and in deployment environments.

For deeper guidance see:
- Supabase docs – <https://supabase.com/docs>
- Nuxt Supabase module – <https://supabase.nuxtjs.org/>
- Internal SQL helpers – `supabase-*.sql` files in the repo root
