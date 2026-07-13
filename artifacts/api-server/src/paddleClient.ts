import { Paddle, Environment } from "@paddle/paddle-node-sdk";

let _client: Paddle | null = null;

export function isPaddleLive(): boolean {
  return process.env.PADDLE_ENVIRONMENT === "production";
}

/**
 * Selects the Paddle API key for the active environment.
 * - production  -> PADDLE_API_KEY_LIVE (live account)
 * - sandbox     -> PADDLE_API_KEY (sandbox account)
 * Keeping separate secrets lets development keep running against sandbox
 * while the published app runs against live.
 */
export function getPaddleApiKey(): string {
  const key = isPaddleLive()
    ? process.env.PADDLE_API_KEY_LIVE
    : process.env.PADDLE_API_KEY;
  if (!key) {
    throw new Error(
      isPaddleLive()
        ? "PADDLE_API_KEY_LIVE is not set. Add the live API key in the Secrets tab."
        : "PADDLE_API_KEY is not set. Add it in the Secrets tab.",
    );
  }
  return key;
}

/**
 * Selects the webhook signing secret for the active environment.
 * - production  -> PADDLE_WEBHOOK_SECRET_LIVE (live notification destination)
 * - sandbox     -> PADDLE_WEBHOOK_SECRET (sandbox notification destination)
 */
export function getPaddleWebhookSecret(): string {
  const secret = isPaddleLive()
    ? process.env.PADDLE_WEBHOOK_SECRET_LIVE
    : process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      isPaddleLive()
        ? "PADDLE_WEBHOOK_SECRET_LIVE is not set."
        : "PADDLE_WEBHOOK_SECRET is not set.",
    );
  }
  return secret;
}

export function getPaddleClient(): Paddle {
  if (_client) return _client;
  const apiKey = getPaddleApiKey();
  const env = isPaddleLive() ? Environment.production : Environment.sandbox;
  _client = new Paddle(apiKey, { environment: env });
  return _client;
}

export function getPaddleApiBase(): string {
  return isPaddleLive()
    ? "https://api.paddle.com"
    : "https://sandbox-api.paddle.com";
}
