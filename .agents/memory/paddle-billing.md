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

## Live notification destination
NEVER recreate the live notification destination `ntfset_01kwy6fqxjbcj8ea13k7tm7pc8` — recreating rotates the webhook secret. To point it at a new domain (e.g. after publishing), PATCH its URL in place.
Paddle webhook IPs differ per environment: fetch from `{apiBase}/ips` (`data.ipv4_cidrs`), never hard-code.
User keeps USD pricing on the live catalog (their explicit choice).
