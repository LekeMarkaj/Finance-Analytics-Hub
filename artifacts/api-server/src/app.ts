import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";
import { WebhookHandlers } from "./webhookHandlers";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

// Register Paddle webhook route BEFORE express.json() -- it needs the raw body.
app.post(
  "/api/paddle/webhook",
  cors({ credentials: true, origin: true }),
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["paddle-signature"];

    if (!signature) {
      res.status(400).json({ error: "Missing paddle-signature header" });
      return;
    }

    try {
      const sig = Array.isArray(signature) ? signature[0] : signature;
      const body = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : String(req.body);
      await WebhookHandlers.processPaddleWebhook(body, sig);
      res.status(200).json({ received: true });
    } catch (err) {
      logger.error({ err }, "Paddle webhook error");
      res.status(400).json({ error: "Webhook processing error" });
    }
  },
);

app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? "",
      process.env.CLERK_PUBLISHABLE_KEY,
    ),
  })),
);

app.use("/api", router);

export default app;
