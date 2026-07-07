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
for `/billing/plans` to pick them up. The seed script is at `artifacts/api-server/seed-paddle.mjs` (one-time use, deleted after run).

## Webhook URL
Development webhook URL: `https://<REPLIT_DOMAINS>/api/paddle/webhook`
Header to verify: `Paddle-Signature` (not `stripe-signature`)
SDK method: `paddle.webhooks.unmarshal(rawBodyString, webhookSecret, signatureHeader)` — takes a string, not Buffer.

## Environment
`PADDLE_ENVIRONMENT=sandbox` (env var) — set to `"production"` when going live.
`PADDLE_API_KEY` and `PADDLE_WEBHOOK_SECRET` are secrets.
