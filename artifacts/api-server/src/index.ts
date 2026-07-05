import { runMigrations } from "stripe-replit-sync";
import app from "./app";
import { getStripeSync } from "./stripeClient";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL environment variable is required for the Stripe integration.",
    );
  }

  logger.info("Initializing Stripe schema...");
  await runMigrations({ databaseUrl });
  logger.info("Stripe schema ready");

  const stripeSync = await getStripeSync();

  const domain = process.env.REPLIT_DOMAINS?.split(",")[0];
  if (domain) {
    logger.info("Setting up managed Stripe webhook...");
    const webhookBaseUrl = `https://${domain}`;
    const webhookResult = await stripeSync.findOrCreateManagedWebhook(
      `${webhookBaseUrl}/api/stripe/webhook`,
    );
    logger.info(
      { url: webhookResult?.url },
      "Stripe webhook configured",
    );
  } else {
    logger.warn("REPLIT_DOMAINS not set; skipping Stripe webhook setup");
  }

  logger.info("Syncing Stripe data...");
  stripeSync
    .syncBackfill()
    .then(() => logger.info("Stripe data synced"))
    .catch((err) => logger.error({ err }, "Error syncing Stripe data"));
}

try {
  await initStripe();
} catch (err) {
  logger.error({ err }, "Failed to initialize Stripe integration");
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
