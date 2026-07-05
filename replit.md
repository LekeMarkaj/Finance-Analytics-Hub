# SHSKUK Finance Dashboard

A financial analytics dashboard where hospital departments/finance teams upload PDF reports (AI-extracted into charts) or create reports manually, with a free/paid subscription model gating usage.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/dashboard run dev` — run the web dashboard
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run seed-products` — idempotently create/update Basic & Pro Stripe products+prices
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Auth: Clerk (`@clerk/react`, `@clerk/express`)
- Billing: Stripe (Checkout + Billing Portal + managed webhook), synced into Postgres via `stripe-replit-sync`

## Where things live

- `artifacts/api-server` — Express API (routes, billing lib, Stripe client, webhook handler)
- `artifacts/dashboard` — React/Vite frontend (landing page, reports, profile/billing UI)
- `lib/db/src/schema/billing.ts` — `billing_customers`, `usage_counters` tables, `PLAN_TIERS`/`PLAN_LIMITS`
- `artifacts/api-server/src/lib/billing.ts` — plan lookup, Stripe customer creation, atomic quota check/increment
- `artifacts/api-server/src/routes/billing.ts` — `/api/billing/plans|me|checkout|portal`
- `scripts/src/seed-products.ts` — creates Basic/Pro Stripe products+prices with `tier`/`createLimit`/`uploadLimit` metadata

## Architecture decisions

- Plan tiers (Free/Basic/Pro) and their create+upload limits are stored as Stripe product `metadata` (`tier`, `createLimit`, `uploadLimit`), not hardcoded server-side, except for the Free tier default limits (1 create + 1 upload/mo) which live in `PLAN_LIMITS`.
- Usage is tracked per user per calendar month in `usage_counters`, incremented atomically via `INSERT ... ON CONFLICT ... WHERE count < limit` so concurrent requests can't exceed quota.
- A user's plan tier is derived live from Stripe subscription data (synced into the `stripe` schema) rather than cached — `getUserPlan()` joins `stripe.subscriptions` → `subscription_items` → `prices` → `products` on each request.

## Product

- 3-tier subscriptions: Free (1 create + 1 upload/mo), Basic (€15/mo or €150/yr, 15+15/mo), Pro (€50/mo or €500/yr, 50+50/mo).
- Public landing page shows pricing cards with a monthly/yearly toggle; selecting a paid plan while signed out routes to sign-up, while signed in it starts Stripe Checkout.
- Report creation (`/pdf-uploads/manual`) and PDF upload (`/pdf-upload`) both enforce the caller's monthly quota, returning 403 `QUOTA_EXCEEDED` with an in-app upgrade prompt.
- Profile page has a "Plan & Usage" card showing current tier, usage bars, and a Stripe Billing Portal link (paid tiers) or inline upgrade plan comparison (free tier).

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The Replit-managed Stripe connection's raw settings only expose `secret`/`publishable` (no `secret_key`/`webhook_secret` fields) — use `settings.secret` when building a Stripe client from the connector, not the field names implied by generic Stripe skill templates.
- `stripe-replit-sync`'s `runMigrations()` ignores any `schema` option (schema is hardcoded to `"stripe"` internally) — only pass `{ databaseUrl, ssl?, logger? }`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
