---
name: Removing an OpenAPI-backed feature cleanly
description: Steps to fully remove a feature whose types/hooks are generated from lib/api-spec/openapi.yaml via orval
---

Deleting a feature's frontend pages, backend routes, and DB schema is not enough if the feature also has paths/schemas defined in `lib/api-spec/openapi.yaml` — those generate code into `lib/api-zod` and `lib/api-client-react` via orval (`pnpm run codegen` in `lib/api-spec`).

**Why:** Even when no app code imports the generated types/hooks for the removed feature, leaving them in the OpenAPI spec means future codegen runs keep regenerating dead types, and `tsc -b` does not delete stale `dist/*.d.ts` files for sources that were removed — old dist output for deleted types can linger indefinitely.

**How to apply:**
1. Remove the feature's tags, paths, and component schemas from `lib/api-spec/openapi.yaml`.
2. Run `pnpm run codegen` in `lib/api-spec` (regenerates `lib/api-zod` and `lib/api-client-react` sources and typechecks libs).
3. Force-clean stale dist output in any touched `lib/*` package: `rm -rf dist && npx tsc -b --force`. This applies to `lib/db` too when schema files are deleted (see lib-db-composite-build.md).
4. If DB tables backed the feature, drop them via `drizzle-kit push --force` (interactive `push` fails in this non-TTY environment) — check row counts first and flag data loss to the user before forcing.
