---
name: Paddle environment vs API key mismatch
description: Using sandbox environment with a production (live_) API key causes 403 on every Paddle SDK call.
---
If PADDLE_ENVIRONMENT=sandbox but PADDLE_API_KEY is a production key (starts with live_ prefix), every SDK request returns 403 "You aren't permitted to perform this request" from sandbox-api.paddle.com.

**Why:** The SDK routes requests to sandbox-api.paddle.com when Environment.sandbox is set, but production API keys are only valid on api.paddle.com.

**How to apply:** Check the client-side token prefix (live_ = production, test_ = sandbox) to infer the correct environment. Set PADDLE_ENVIRONMENT accordingly.
