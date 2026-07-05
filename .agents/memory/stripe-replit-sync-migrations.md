---
name: stripe-replit-sync runMigrations schema quirk
description: The schema option passed to stripe-replit-sync's runMigrations() is silently ignored.
---

`stripe-replit-sync`'s exported `runMigrations(config)` function only accepts `{ databaseUrl, ssl?, logger? }`. Internally it hardcodes `const schema = "stripe"` and does not read a `schema` field from the config at all, even though some code templates/examples call it with `runMigrations({ databaseUrl, schema: "stripe" })`.

**Why:** Passing an extra `schema` property doesn't throw (JS ignores unknown object properties), so the call appears to succeed — it logs "Stripe schema ready" — but this can mask a *different* underlying failure. In one debugging session, migrations legitimately ran fine when called directly with just `{ databaseUrl, logger }`; the real fix needed was elsewhere (see the Stripe connector settings memory). Don't assume the `schema` option is doing anything, and don't spend time trying to change its value — it can't be changed via config.

**How to apply:** When initializing Stripe sync (`runMigrations` + `StripeSync`/`findOrCreateManagedWebhook`), call `runMigrations({ databaseUrl, logger })` without a `schema` key. If tables like `stripe.accounts` are missing after startup (e.g. `relation "stripe.accounts" does not exist`), verify by querying `information_schema.tables where table_schema='stripe'` directly, and try re-running `runMigrations` standalone (e.g. via a one-off script) with verbose logging to confirm whether migrations actually execute — don't assume a logged "Finished migrations" message means all migration files ran without checking the resulting tables.
