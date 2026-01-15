# Architecture Summary

## Overview

[Add high-level overview here]


High-level overview of the Moldova Direct e-commerce platform architecture.

## System Overview

Moldova Direct is a full-stack e-commerce platform built with:

- **Frontend**: Nuxt 4 (Vue 3) with TypeScript
- **Backend**: Nuxt server routes with Supabase
- **Database**: PostgreSQL via Supabase
- **Payments**: Stripe integration
- **Hosting**: Vercel

## Architecture Layers

### Presentation Layer

- Vue 3 components using Composition API
- Reka UI component library
- Tailwind CSS for styling
- Client-side routing with Vue Router
- State management with Pinia

### Application Layer

- Composables for business logic
- Stores for global state
- Middleware for route protection
- Plugins for initialization

### API Layer

- Nuxt server routes in `server/api/`
- CSRF protection for all mutations
- Authentication via Supabase
- Server-side price verification
- Stripe payment processing

### Data Layer

- Supabase PostgreSQL database
- Row-level security (RLS) policies
- Atomic RPC functions for inventory
- Real-time subscriptions for admin features

## Key Design Patterns

### Composition API Pattern

All Vue components use `<script setup>` with TypeScript for better type safety and code organization.

### Composable Pattern

Business logic is extracted into reusable composables (e.g., `useCart`, `useAuth`, `useProductFilters`).

### Server-Side Validation Pattern

All critical operations (pricing, inventory, payments) are validated server-side to prevent client manipulation.

### Atomic Operations Pattern

Inventory updates use PostgreSQL RPC functions to prevent race conditions.

## Security Architecture

### Defense in Depth

1. **Client-side**: Input validation and UI feedback
2. **API Layer**: CSRF tokens, authentication, authorization
3. **Database Layer**: Row-level security policies
4. **Payment Layer**: Server-side Stripe integration

### Critical Security Rules

- Never trust client-sent prices
- Always validate CSRF tokens for mutations
- Always verify prices server-side
- Use atomic RPC functions for inventory
- Never expose service keys in code

## Data Flow

### Typical Request Flow

```
User Action → Component → Composable → API Route → Database
                                          ↓
                                    CSRF Check
                                    Auth Check
                                    Validation
                                    Price Verify
```

## Testing Strategy

### Test Pyramid

- **E2E Tests**: Playwright for critical user flows
- **Integration Tests**: Vitest for API routes and composables
- **Unit Tests**: Vitest for utilities and helpers
- **Property Tests**: fast-check for universal properties (min 100 iterations)

### Test Coverage Goals

- Security-critical code: 100%
- Business logic: 80%+
- UI components: 60%+
