---
name: Stripe connector settings field names
description: What field names the Replit-managed Stripe connection actually exposes, vs what generic Stripe skill templates assume.
---

The Replit-managed Stripe integration's connection `settings` object (as returned by the connector/`listConnections`-style API) only contains: `account_id`, `secret`, `publishable`, `mcp`, `claim_url`, `claimed_at`. There is no `secret_key` or `webhook_secret` field.

**Why:** Generic Stripe skill code templates (e.g. `stripe/references/code-templates.md`) assume `settings.secret_key` and `settings.webhook_secret`, which causes a silent/confusing credential error when building the Stripe client from a Replit-managed connection — the fields simply don't exist under those names.

**How to apply:** When wiring up `getUncachableStripeClient()` (or equivalent) against a Replit-managed Stripe connection, read the secret key from `settings.secret`. There is no separate webhook secret in the connection settings — webhook verification/setup for Replit-managed Stripe is instead handled via the managed webhook flow (e.g. `stripe-replit-sync`'s `findOrCreateManagedWebhook`), not a static webhook signing secret pulled from connection settings. If you hit "invalid API key" or similar errors right after wiring up the client, check the actual raw shape of the connection settings before assuming the template's field names are correct.
