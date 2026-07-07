---
name: Paddle SDK Environment enum casing
description: The Environment enum in @paddle/paddle-node-sdk uses lowercase values, not PascalCase.
---
Use `Environment.sandbox` and `Environment.production` (lowercase).

**Why:** The actual enum definition is `enum Environment { sandbox = "sandbox", production = "production" }`. Using `Environment.Sandbox` or `Environment.Production` is a TypeScript compile error and a runtime crash.

**How to apply:** Any time you instantiate `new Paddle(apiKey, { environment: ... })`, use the lowercase enum values.
