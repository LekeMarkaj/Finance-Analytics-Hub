---
name: lib/db composite TypeScript project rebuild
description: Why dependent packages (e.g. api-server) can see stale types/exports after editing lib/db schema files
---

`lib/db` is set up as a composite TypeScript project (project references) with a checked-in `dist` build. Editing a schema file under `lib/db/src` does not automatically propagate to consumers like `artifacts/api-server` — they import the compiled `dist` output, not the source.

**Why:** TS composite builds only rebuild when told to; incremental builds can also leave stale `.d.ts` declaration files if the build graph is out of date, causing confusing "missing export" or type-mismatch errors in dependents that look unrelated to your change.

**How to apply:** After changing anything in `lib/db/src`, run `npx tsc -b --force` inside `lib/db` before typechecking or running packages that depend on it. If dependents show pre-existing/unrelated tsc errors after this rebuild, that's often exposing errors that were previously hidden by stale declarations, not something the rebuild broke.
