---
name: Public share-link pattern for authenticated apps
description: How to let anonymous users view a single resource (e.g. a report) read-only via a public link, in an app where all other routes require sign-in.
---

Pattern used for adding "make public/private" sharing to a resource in an app gated by `useAuth()`/`isSignedIn` redirect-to-sign-in logic (Clerk or similar):

- **Schema**: add an `isPublic` boolean column, default `false` (private by default).
- **Backend read route**: switch the single-resource GET from a hard `requireAuth` + `where(userId = req.userId)` filter to an `optionalAuth` middleware (sets `req.userId = null` if unauthenticated instead of 401-ing) + fetch by id only, then decide access in code: allow if `isOwner` (userId matches) OR `row.isPublic`; otherwise 404 (not 403, to avoid leaking existence of private resources). Return `isOwner` in the payload so the frontend can branch on it.
- **Backend write routes** (delete, edit, visibility toggle): keep `requireAuth` + owner-scoped `where` clause — public visibility only affects read access, never write access.
- **Frontend routing**: the router's top-level "not signed in → redirect to /sign-in" branch needs a carve-out for the single public-resource path (e.g. regex-match `/reports/:id`) that renders the detail page directly (without the app's sidebar/layout chrome that assumes a logged-in user) instead of redirecting. Everything else stays behind the auth wall.
- **Frontend read-only UI**: gate all edit/delete controls behind `report.isOwner !== false` (i.e. only show when explicitly true), so anonymous viewers and any non-owner get a strict read-only view.

**Why:** this keeps the "single resource can be shared read-only via link" feature isolated — it doesn't require a parallel unauthenticated app shell or duplicating pages, and it fails closed (unknown/private resources 404 for everyone but the owner).
