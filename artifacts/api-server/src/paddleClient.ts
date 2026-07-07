import { Paddle, Environment } from "@paddle/paddle-node-sdk";

let _client: Paddle | null = null;

export function getPaddleClient(): Paddle {
  if (_client) return _client;
  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) {
    throw new Error("PADDLE_API_KEY is not set. Add it in the Secrets tab.");
  }
  const env =
    process.env.PADDLE_ENVIRONMENT === "production"
      ? Environment.production
      : Environment.sandbox;
  _client = new Paddle(apiKey, { environment: env });
  return _client;
}

export function getPaddleApiBase(): string {
  return process.env.PADDLE_ENVIRONMENT === "production"
    ? "https://api.paddle.com"
    : "https://sandbox-api.paddle.com";
}
