import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { createClerkClient } from "@clerk/express";
import { db, billingCustomersTable, paddleSubscriptionsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import {
  getOrCreatePaddleCustomer,
  getPaddleCustomerId,
  getUserPlan,
  getMonthlyUsage,
} from "../lib/billing";
import { getPaddleClient, getPaddleApiBase } from "../paddleClient";

const router: IRouter = Router();

function getClerk() {
  return createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
}

async function getUserEmail(userId: string): Promise<string | null> {
  try {
    const clerk = getClerk();
    const user = await clerk.users.getUser(userId);
    return user.primaryEmailAddress?.emailAddress ?? null;
  } catch {
    return null;
  }
}

router.get("/billing/plans", async (_req, res) => {
  const paddle = getPaddleClient();

  const productMap = new Map<
    string,
    { tier: string; name: string; createLimit: number; uploadLimit: number }
  >();

  for await (const product of paddle.products.list({ status: ["active"] })) {
    const customData = (product as any).customData as Record<string, string> | null;
    if (!customData?.tier) continue;
    productMap.set(product.id, {
      tier: customData.tier,
      name: product.name,
      createLimit: Number(customData.createLimit) || 0,
      uploadLimit: Number(customData.uploadLimit) || 0,
    });
  }

  const plansByTier = new Map<string, any>();

  for await (const price of paddle.prices.list({ status: ["active"] })) {
    const productInfo = productMap.get((price as any).productId);
    if (!productInfo) continue;

    const { tier } = productInfo;
    if (!plansByTier.has(tier)) {
      plansByTier.set(tier, { ...productInfo, prices: [] });
    }

    const unitAmount = parseInt((price as any).unitPrice?.amount ?? "0", 10);
    plansByTier.get(tier).prices.push({
      id: price.id,
      unitAmount,
      currency: (price as any).unitPrice?.currencyCode ?? "USD",
      interval: (price as any).billingCycle?.interval ?? null,
    });
  }

  res.json({
    free: { tier: "free", name: "Free", createLimit: 1, uploadLimit: 1, prices: [] },
    plans: Array.from(plansByTier.values()),
  });
});

router.get("/billing/me", requireAuth, async (req: any, res) => {
  const plan = await getUserPlan(req.userId);
  const usage = await getMonthlyUsage(req.userId);
  res.json({ plan, usage });
});

router.post("/billing/checkout", requireAuth, async (req: any, res) => {
  const { priceId } = req.body ?? {};
  if (!priceId || typeof priceId !== "string") {
    res.status(400).json({ error: "priceId is required" });
    return;
  }

  const email = await getUserEmail(req.userId);
  if (!email) {
    res.status(400).json({ error: "Could not resolve user email for billing" });
    return;
  }

  const customerId = await getOrCreatePaddleCustomer(req.userId, email);

  const paddle = getPaddleClient();

  const transaction = await paddle.transactions.create({
    items: [{ priceId, quantity: 1 }],
    customerId,
  });

  const checkoutUrl = transaction.checkout?.url;
  if (!checkoutUrl) {
    res.status(500).json({ error: "Failed to generate checkout URL" });
    return;
  }

  res.json({ transactionId: transaction.id, url: checkoutUrl });
});

router.post("/billing/portal", requireAuth, async (req: any, res) => {
  const customerId = await getPaddleCustomerId(req.userId);
  if (!customerId) {
    res.status(404).json({ error: "No billing account found" });
    return;
  }

  const [sub] = await db
    .select()
    .from(paddleSubscriptionsTable)
    .where(eq(paddleSubscriptionsTable.userId, req.userId));

  const apiBase = getPaddleApiBase();
  const apiKey = process.env.PADDLE_API_KEY!;

  const resp = await fetch(
    `${apiBase}/customers/${customerId}/portal-sessions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscription_ids: sub?.paddleSubscriptionId
          ? [sub.paddleSubscriptionId]
          : [],
      }),
    },
  );

  if (!resp.ok) {
    const text = await resp.text();
    res.status(502).json({ error: "Paddle portal error", detail: text });
    return;
  }

  const json = (await resp.json()) as any;
  const portalUrl = json?.data?.urls?.general?.overview;
  if (!portalUrl) {
    res.status(500).json({ error: "Failed to generate portal URL" });
    return;
  }

  res.json({ url: portalUrl });
});

export default router;
