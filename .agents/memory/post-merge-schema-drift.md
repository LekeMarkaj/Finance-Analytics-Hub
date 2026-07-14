---
name: Post-merge dev DB schema drift
description: Why merged task agents' schema changes can silently not apply to the main dev database, and how to fix it.
---

## The rule
After a task merge, if the app starts throwing 500s with "column does not exist" style query failures, check the post-merge setup output: `drizzle-kit push` dies on ANY interactive prompt in non-TTY mode (even with --force for data-loss prompts), leaving the dev DB behind the merged code's schema.

**Why:** Task agents apply raw-SQL migrations in their own isolated environments; only the post-merge `drizzle-kit push` applies them to the main dev DB. One un-answerable prompt (e.g. "add unique constraint … truncate table?") aborts the entire push, so all subsequent merges' schema changes silently pile up unapplied.

**How to apply:**
1. Diff `information_schema.columns` / `pg_constraint` against `lib/db/src/schema/*` and apply the missing DDL via `executeSql` in one transaction.
2. When adding NOT NULL columns to tables with data, backfill sensibly (e.g. assign orphaned rows to the sole real user in a single-user dev DB).
3. Unique-constraint prompts often recur because a unique INDEX exists where drizzle expects a CONSTRAINT of the same name. Convert in place: `ALTER TABLE t ADD CONSTRAINT name UNIQUE USING INDEX name;`
4. Verify with `drizzle-kit push` → "No changes detected", then restart the API workflow.
