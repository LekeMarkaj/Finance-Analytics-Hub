---
name: Clerk test user id for DB-seeded e2e tests
description: How to get test data owned by the correct user when e2e testing Clerk-authed features that need pre-seeded per-user rows
---

When an e2e test needs a DB row scoped to the signed-in Clerk test user (e.g. `user_id` foreign key), there is often no reliable way to discover that user's Clerk `userId` from the browser after sign-in (no `/api/me` endpoint, and Clerk's client-side storage does not expose it in an easily-scraped form).

**Why:** Attempts to read the signed-in userId from `localStorage`/`sessionStorage` after Clerk sign-in only exposed `__clerk_environment`, not the user/session id. Adding a debug-only "whoami" endpoint is possible but adds surface area just for testing.

**How to apply:** Prefer driving the test through the app's real create flow (e.g. an actual file upload, form submission) so the backend stamps the row with the correct `req.userId` itself — then read the resulting id from the UI/URL instead of trying to pre-seed the DB with a guessed userId. Only fall back to DB pre-seeding if the app exposes a legitimate way to obtain the current user's id.
