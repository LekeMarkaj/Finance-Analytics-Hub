---
name: Paddle billing integration
description: Key gotchas when using @paddle/paddle-node-sdk for billing in this project.
---

## Paddle amount format
Paddle stores prices as **integer strings in the smallest currency unit** (cents), not decimals.
- `"999"` = $9.99, `"1999"` = $19.99
- When creating prices: pass `"999"`, not `"9.99"` (API returns 400 "not a valid integer")
- When reading prices in `/billing/plans`: use `parseInt(price.unitPrice.amount)` — do NOT multiply by 100
- The frontend `formatPrice(cents, currency)` divides by 100, so `unitAmount: 999` → displays "$9.99" correctly

**Why:** Paddle Billing v2 REST API requires integer cents; passing decimals causes a 400 error.

## drizzle-kit push TTY workaround
`drizzle-kit push --force` still prompts interactively for column rename conflicts even with `--force`.
When running in non-TTY (CI, agent shell), it throws `Interactive prompts require a TTY terminal`.

**Fix:** Run raw SQL migration directly using the pg Pool:
```js
import pg from "/path/to/pnpm/.pnpm/pg@.../lib/index.js";
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
await pool.query("ALTER TABLE ...");
```

## Product/price seeding
Paddle products must be created manually or via API — they don't carry over from Stripe.
Products must have `customData: { tier: "basic"|"pro", createLimit: "15", uploadLimit: "15" }`
for `/billing/plans` to pick them up. Nothing is matched by hard-coded price/product IDs — swapping catalogs (sandbox↔live) needs no code changes.

## Webhook URL
Development webhook URL: `https://<REPLIT_DOMAINS>/api/paddle/webhook`
Header to verify: `Paddle-Signature` (not `stripe-signature`)
SDK method: `paddle.webhooks.unmarshal(rawBodyString, webhookSecret, signatureHeader)` — takes a string, not Buffer.

## Environment (dual sandbox/live setup)
`PADDLE_ENVIRONMENT` is env-scoped: development=`sandbox`, production=`production` — dev keeps testing on sandbox while the published app runs live.
Secrets are global, so sandbox and live keys use separate names selected by `PADDLE_ENVIRONMENT`: `PADDLE_API_KEY`/`PADDLE_WEBHOOK_SECRET` (sandbox) vs `PADDLE_API_KEY_LIVE`/`PADDLE_WEBHOOK_SECRET_LIVE`.
**Why:** Replit secrets can't differ per environment, so a single key name can't hold both sandbox and live values.

## Live account state (as of July 2026 migration)
Live catalog already existed with correct customData and USD pricing (incl. yearly) — user chose to keep USD. Live notification destination `ntfset_01kwy6fqxjbcj8ea13k7tm7pc8` exists; NEVER recreate it (rotates secret) — after publishing, PATCH its URL in place to the production domain.
Paddle webhook IPs differ per environment: fetch from `{apiBase}/ips` (`data.ipv4_cidrs`), never hard-code.
