---
name: Paddle checkout requires email from Clerk backend
description: Paddle customers.create requires a non-null email; Clerk session claims may be empty.
---
In Paddle, `POST /customers` requires `email: string` (not optional). Clerk's `getAuth(req).sessionClaims.email` can be null/undefined.

**Why:** Clerk session claims only include email if the JWT template explicitly adds it. The backend Clerk client (`createClerkClient`) is always reliable.

**How to apply:** In any endpoint that creates a Paddle customer, call `clerkClient.users.getUser(userId)` and use `user.primaryEmailAddress.emailAddress`. Pattern already exists in `admin-users.ts`.
