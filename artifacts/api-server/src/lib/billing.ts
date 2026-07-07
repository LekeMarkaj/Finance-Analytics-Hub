import { sql, eq } from "drizzle-orm";
import {
  db,
  billingCustomersTable,
  paddleSubscriptionsTable,
  PLAN_LIMITS,
  type PlanTier,
} from "@workspace/db";
import { getPaddleClient } from "../paddleClient";

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

export async function getPaddleCustomerId(userId: string): Promise<string | null> {
  const [row] = await db
    .select()
    .from(billingCustomersTable)
    .where(eq(billingCustomersTable.userId, userId));
  return row?.paddleCustomerId ?? null;
}

export async function getOrCreatePaddleCustomer(
  userId: string,
  email: string | null,
): Promise<string> {
  const existing = await getPaddleCustomerId(userId);
  if (existing) return existing;

  const paddle = getPaddleClient();
  if (!email) throw new Error("Email is required to create a Paddle customer");
  const customer = await paddle.customers.create({ email });

  await db
    .insert(billingCustomersTable)
    .values({ userId, paddleCustomerId: customer.id })
    .onConflictDoNothing();

  return (await getPaddleCustomerId(userId)) ?? customer.id;
}

export async function getUserPlan(userId: string): Promise<UserPlan> {
  const [sub] = await db
    .select()
    .from(paddleSubscriptionsTable)
    .where(eq(paddleSubscriptionsTable.userId, userId));

  if (!sub || !["active", "trialing"].includes(sub.status)) {
    return {
      tier: "free",
      interval: null,
      limits: PLAN_LIMITS.free,
      subscriptionId: null,
      currentPeriodEnd: null,
    };
  }

  return buildPlan(sub);
}

function buildPlan(sub: typeof paddleSubscriptionsTable.$inferSelect): UserPlan {
  const tier = sub.tier as PlanTier;
  const limits = PLAN_LIMITS[tier] ?? PLAN_LIMITS.free;
  const currentPeriodEnd = sub.nextBilledAt
    ? Math.floor(sub.nextBilledAt.getTime() / 1000)
    : null;
  return {
    tier,
    interval: sub.interval as "month" | "year",
    limits,
    subscriptionId: sub.paddleSubscriptionId,
    currentPeriodEnd,
  };
}

export async function getMonthlyUsage(
  userId: string,
): Promise<{ creates: number; uploads: number }> {
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

export async function decrementUsage(
  userId: string,
  kind: "creates" | "uploads",
): Promise<void> {
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
