# Threat Model

## Project Overview

SHSKUK Finance Dashboard is a Clerk-authenticated financial analytics application for hospital departments and finance teams. Users can upload PDF financial reports for AI extraction, create reports manually, review extracted charts, manage subscription billing through Paddle, and administrators can manage user accounts. The production stack is a React/Vite SPA in `artifacts/dashboard`, an Express 5 API in `artifacts/api-server`, PostgreSQL via Drizzle in `lib/db`, Clerk for auth, Paddle for billing, and Groq/unpdf for PDF extraction.

Per deployment assumptions for this scan, only production-reachable surfaces matter. `artifacts/mockup-sandbox` is development-only and out of scope unless production reachability is demonstrated. The repl is not currently deployed, but this threat model assumes future production deployment with `NODE_ENV=production`.

## Assets

- **User accounts and sessions** — Clerk identities, session cookies/tokens, role metadata, and admin privileges. Compromise enables account takeover or administrative control.
- **Uploaded financial reports** — uploaded PDFs, extracted structured financial data, report titles, summaries, and chart data. These documents likely contain commercially sensitive and potentially regulated financial information.
- **Core finance records** — budget categories, line items, yearly comparisons, own revenues, and balance sheet entries stored in PostgreSQL. Exposure or tampering would directly affect customer financial reporting.
- **Billing state** — Paddle customer IDs, subscription tiers, plan limits, and monthly usage counters. Incorrect access can grant paid features or disrupt access control.
- **Application secrets and third-party credentials** — Clerk secret key, Paddle API/webhook secrets, database URL, and Groq API key.

## Trust Boundaries

- **Browser to API** — all dashboard actions cross from an untrusted client into the Express API. Every data-bearing endpoint must enforce authentication, authorization, and input validation server-side.
- **Anonymous to authenticated viewers** — most dashboard functionality is intended for signed-in users, but individual reports may be deliberately shared via public links. Public access must stay narrowly limited to explicitly shared reports and should rely on unguessable share identifiers if the product intent is link-based sharing rather than broad publication.
- **Authenticated user to admin** — admin user-management endpoints are more privileged than normal report/billing flows and must enforce server-side role checks.
- **API to PostgreSQL** — the API has direct read/write access to all finance and billing tables. Missing tenant scoping or unsafe queries can expose or corrupt all customer data.
- **API to external services** — the API trusts Clerk for identity, Paddle for billing/webhooks, and Groq for PDF extraction. Requests crossing this boundary must not leak secrets or accept forged callbacks.

## Scan Anchors

- **Production entry points:** `artifacts/api-server/src/index.ts`, `artifacts/api-server/src/app.ts`, `artifacts/dashboard/src/App.tsx`
- **Highest-risk code areas:** `artifacts/api-server/src/routes/*.ts`, `artifacts/api-server/src/lib/billing.ts`, `artifacts/api-server/src/webhookHandlers.ts`, `artifacts/api-server/src/middlewares/*`
- **Public surfaces:** `/api/healthz`, `/api/paddle/webhook`, explicitly shared `/api/pdf-uploads/:id`, unauthenticated landing/auth pages in the SPA, and the currently exposed finance routes under `/api/budget-categories`, `/api/budget-line-items`, `/api/yearly-comparisons`, `/api/own-revenues`, `/api/balance-sheet`, and `/api/summary/*` until remediated
- **Authenticated surfaces:** billing endpoints, upload/report mutation endpoints, most dashboard routes, and any future finance-data CRUD APIs after server-side auth and tenant isolation are added
- **Admin surfaces:** `/api/admin/users*`
- **Usually dev-only / out of scope:** `artifacts/mockup-sandbox/**`, local scripts, generated dist artifacts unless they reveal production behavior not visible in source

## Threat Categories

### Spoofing

The application relies on Clerk to authenticate dashboard users and on Paddle webhook verification for billing state changes. Protected API endpoints must only trust user identity that was validated by Clerk middleware, and webhook handlers must reject forged Paddle requests through signature verification (with IP filtering as a secondary control).

### Tampering

Users can upload PDFs, edit extracted report JSON, and initiate billing actions. The server must validate all user-controlled payloads, ensure finance records cannot be modified by unauthorized parties, and avoid accepting privileged state from the client. Billing quotas and subscription-derived permissions must be enforced server-side. The current finance schemas deserve repeat scrutiny in future scans because they presently lack per-user or per-tenant ownership fields, making shared-dataset tampering a central risk until fixed.

### Information Disclosure

The most sensitive risk in this project is unauthorized disclosure of financial data. Uploaded reports, extracted finance charts, budget records, revenues, balance sheet entries, billing details, and admin user information must only be returned to the correct audience. Public sharing must be explicit and limited to a single intended report. Logs and error responses must not expose cookies, tokens, or third-party secrets.

### Denial of Service

PDF upload and AI extraction are resource-intensive and externally dependent. Production endpoints that trigger uploads, extraction, billing lookups, or webhook processing must avoid unbounded request sizes, excessive repeat requests, or expensive unauthenticated operations that can consume compute or third-party quotas.

### Elevation of Privilege

The application has a meaningful privilege boundary between anonymous users, authenticated users, and admins. All finance and billing endpoints must enforce authentication and, where relevant, per-user ownership. Admin functionality must check server-side role metadata on every request. Missing auth on a finance CRUD route, broad tenant-wide queries, or incorrect role enforcement would allow attackers to read or alter data beyond their authority.
