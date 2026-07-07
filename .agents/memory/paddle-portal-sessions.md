---
name: Paddle customer portal sessions — raw REST required
description: The Paddle Node SDK (v1.10.0) has no portal sessions resource; must use raw fetch.
---
The `Paddle` class exposes: products, prices, transactions, customers, addresses, subscriptions, etc. There is NO `customerPortalSessions` or `portal` property.

**Why:** Paddle added Customer Portal as a REST-only feature not yet wrapped in the SDK.

**How to apply:** POST to `{getPaddleApiBase()}/customers/{customerId}/portal-sessions` with `Authorization: Bearer {PADDLE_API_KEY}` and body `{ subscription_ids: [...] }`. Response: `data.urls.general.overview` is the portal URL.
