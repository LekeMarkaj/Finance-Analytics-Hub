import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import {
  getOrCreateStripeCustomer,
  getStripeCustomerId,
  getUserPlan,
  getMonthlyUsage,
} from "../lib/billing";
import { getUncachableStripeClient } from "../stripeClient";

const router: IRouter = Router();

router.get("/billing/plans", async (_req, res) => {
  const result = await db.execute(sql`
    SELECT
      p.id as product_id,
      p.name as product_name,
      p.metadata as product_metadata,
      pr.id as price_id,
      pr.unit_amount,
      pr.currency,
      pr.recurring
    FROM stripe.products p
    JOIN stripe.prices pr ON pr.product = p.id
    WHERE p.active = true AND pr.active = true AND p.metadata->>'tier' IS NOT NULL
    ORDER BY (p.metadata->>'tier'), (pr.recurring->>'interval')
  `);

  const plansByTier = new Map<string, any>();
  for (const row of result.rows as any[]) {
    const tier = row.product_metadata?.tier;
    if (!tier) continue;
    if (!plansByTier.has(tier)) {
      plansByTier.set(tier, {
        tier,
        name: row.product_name,
        createLimit: Number(row.product_metadata?.createLimit) || 0,
        uploadLimit: Number(row.product_metadata?.uploadLimit) || 0,
        prices: [],
      });
    }
    plansByTier.get(tier).prices.push({
      id: row.price_id,
      unitAmount: row.unit_amount,
      currency: row.currency,
      interval: row.recurring?.interval ?? null,
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

  const auth = getAuth(req);
  const email = (auth?.sessionClaims as any)?.email ?? null;
  const customerId = await getOrCreateStripeCustomer(req.userId, email);

  const stripe = await getUncachableStripeClient();
  const origin = `${req.protocol}://${req.get("host")}`;
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/profile?checkout=success`,
    cancel_url: `${origin}/profile?checkout=cancel`,
  });

  res.json({ url: session.url });
});

router.post("/billing/portal", requireAuth, async (req: any, res) => {
  const customerId = await getStripeCustomerId(req.userId);
  if (!customerId) {
    res.status(404).json({ error: "No billing account found" });
    return;
  }

  const stripe = await getUncachableStripeClient();
  const origin = `${req.protocol}://${req.get("host")}`;
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/profile`,
  });

  res.json({ url: session.url });
});

export default router;
