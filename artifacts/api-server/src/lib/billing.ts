import { sql } from "drizzle-orm";
import { db, billingCustomersTable, PLAN_LIMITS, type PlanTier } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getUncachableStripeClient } from "../stripeClient";

export interface UserPlan {
  tier: PlanTier;
  interval: "month" | "year" | null;
  limits: { creates: number; uploads: number };
  subscriptionId: string | null;
  currentPeriodEnd: number | null;
}

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function getStripeCustomerId(userId: string): Promise<string | null> {
  const [row] = await db
    .select()
    .from(billingCustomersTable)
    .where(eq(billingCustomersTable.userId, userId));
  return row?.stripeCustomerId ?? null;
}

export async function getOrCreateStripeCustomer(userId: string, email: string | null): Promise<string> {
  const existing = await getStripeCustomerId(userId);
  if (existing) return existing;

  const stripe = await getUncachableStripeClient();
  const customer = await stripe.customers.create({
    email: email ?? undefined,
    metadata: { userId },
  });

  await db
    .insert(billingCustomersTable)
    .values({ userId, stripeCustomerId: customer.id })
    .onConflictDoNothing();

  return (await getStripeCustomerId(userId)) ?? customer.id;
}

export async function getUserPlan(userId: string): Promise<UserPlan> {
  const stripeCustomerId = await getStripeCustomerId(userId);

  if (!stripeCustomerId) {
    return { tier: "free", interval: null, limits: PLAN_LIMITS.free, subscriptionId: null, currentPeriodEnd: null };
  }

  const result = await db.execute(sql`
    SELECT
      s.id as subscription_id,
      s.current_period_end,
      pr.recurring,
      p.metadata as product_metadata
    FROM stripe.subscriptions s
    JOIN stripe.subscription_items si ON si.subscription = s.id
    JOIN stripe.prices pr ON pr.id = si.price
    JOIN stripe.products p ON p.id = pr.product
    WHERE s.customer = ${stripeCustomerId} AND s.status IN ('active', 'trialing')
    ORDER BY s.created DESC
    LIMIT 1
  `);

  const row = result.rows[0] as any;
  if (!row) {
    return { tier: "free", interval: null, limits: PLAN_LIMITS.free, subscriptionId: null, currentPeriodEnd: null };
  }

  const metadata = row.product_metadata ?? {};
  const tier: PlanTier = metadata.tier === "basic" || metadata.tier === "pro" ? metadata.tier : "free";
  const limits = {
    creates: Number(metadata.createLimit) || PLAN_LIMITS[tier].creates,
    uploads: Number(metadata.uploadLimit) || PLAN_LIMITS[tier].uploads,
  };
  const interval = row.recurring?.interval === "year" ? "year" : "month";

  return {
    tier,
    interval,
    limits,
    subscriptionId: row.subscription_id,
    currentPeriodEnd: row.current_period_end,
  };
}

export async function getMonthlyUsage(userId: string): Promise<{ creates: number; uploads: number }> {
  const month = currentMonthKey();
  const result = await db.execute(sql`
    SELECT creates, uploads FROM usage_counters WHERE user_id = ${userId} AND month = ${month}
  `);
  const row = result.rows[0] as any;
  return { creates: row?.creates ?? 0, uploads: row?.uploads ?? 0 };
}

export interface UsageCheckResult {
  allowed: boolean;
  tier: PlanTier;
  used: number;
  limit: number;
}

export async function checkAndIncrementUsage(
  userId: string,
  kind: "creates" | "uploads",
): Promise<UsageCheckResult> {
  const plan = await getUserPlan(userId);
  const limit = plan.limits[kind];
  const month = currentMonthKey();

  const result =
    kind === "creates"
      ? await db.execute(sql`
          INSERT INTO usage_counters (user_id, month, creates, uploads)
          VALUES (${userId}, ${month}, 1, 0)
          ON CONFLICT (user_id, month) DO UPDATE
          SET creates = usage_counters.creates + 1, updated_at = now()
          WHERE usage_counters.creates < ${limit}
          RETURNING creates, uploads
        `)
      : await db.execute(sql`
          INSERT INTO usage_counters (user_id, month, creates, uploads)
          VALUES (${userId}, ${month}, 0, 1)
          ON CONFLICT (user_id, month) DO UPDATE
          SET uploads = usage_counters.uploads + 1, updated_at = now()
          WHERE usage_counters.uploads < ${limit}
          RETURNING creates, uploads
        `);

  const row = result.rows[0] as any;
  if (!row) {
    const usage = await getMonthlyUsage(userId);
    return { allowed: false, tier: plan.tier, used: usage[kind], limit };
  }

  return { allowed: true, tier: plan.tier, used: row[kind], limit };
}

/**
 * Reverses a previous `checkAndIncrementUsage` increment. Used when work reserved
 * against a user's monthly quota fails after the fact (e.g. async PDF processing
 * errors out), so a failed attempt doesn't permanently consume their allowance.
 */
export async function decrementUsage(userId: string, kind: "creates" | "uploads"): Promise<void> {
  const month = currentMonthKey();

  if (kind === "creates") {
    await db.execute(sql`
      UPDATE usage_counters
      SET creates = GREATEST(creates - 1, 0), updated_at = now()
      WHERE user_id = ${userId} AND month = ${month}
    `);
  } else {
    await db.execute(sql`
      UPDATE usage_counters
      SET uploads = GREATEST(uploads - 1, 0), updated_at = now()
      WHERE user_id = ${userId} AND month = ${month}
    `);
  }
}
