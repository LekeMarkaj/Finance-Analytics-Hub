import { Paddle, Environment } from "@paddle/paddle-node-sdk";

export function getPaddleClient(): Paddle {
  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "PADDLE_API_KEY is not set. Add it in the Secrets tab.",
    );
  }
  const env =
    process.env.PADDLE_ENVIRONMENT === "production"
      ? Environment.Production
      : Environment.Sandbox;
  return new Paddle(apiKey, { environment: env });
}
