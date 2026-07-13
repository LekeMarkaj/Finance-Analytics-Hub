import { eq } from "drizzle-orm";
import { db, billingCustomersTable, paddleSubscriptionsTable } from "@workspace/db";
import type { PlanTier } from "@workspace/db";
import { getPaddleClient, getPaddleWebhookSecret } from "./paddleClient";

const SUBSCRIPTION_EVENTS = new Set([
  "subscription.created",
  "subscription.updated",
  "subscription.canceled",
]);

export class WebhookHandlers {
  static async processPaddleWebhook(rawBody: string, signature: string): Promise<void> {
    const webhookSecret = getPaddleWebhookSecret();

    const paddle = getPaddleClient();
    const event = paddle.webhooks.unmarshal(rawBody, webhookSecret, signature);

    if (!event || !SUBSCRIPTION_EVENTS.has(event.eventType)) return;

    const sub = event.data as any;
    const item = sub.items?.[0];
    const price = item?.price;
    const product = item?.product;

    const priceId: string = price?.id ?? "";
    const productId: string = price?.productId ?? product?.id ?? "";

    let tier: PlanTier = "free";
    let rawTier: string | undefined = (product?.customData as any)?.tier;

    if (!rawTier && productId) {
      try {
        const fetchedProduct = await paddle.products.get(productId);
        rawTier = (fetchedProduct as any).customData?.tier;
      } catch {
      }
    }

    if (rawTier === "basic" || rawTier === "pro") {
      tier = rawTier;
    }

    const rawInterval = price?.billingCycle?.interval;
    const interval: "month" | "year" = rawInterval === "year" ? "year" : "month";

    const status: string = sub.status ?? "canceled";
    const customerId: string = sub.customerId;

    const [customer] = await db
      .select()
      .from(billingCustomersTable)
      .where(eq(billingCustomersTable.paddleCustomerId, customerId));

    if (!customer) return;

    const nextBilledAt = sub.nextBilledAt ? new Date(sub.nextBilledAt) : null;

    await db
      .insert(paddleSubscriptionsTable)
      .values({
        userId: customer.userId,
        paddleSubscriptionId: sub.id,
        paddleCustomerId: customerId,
        status,
        priceId,
        tier,
        interval,
        nextBilledAt,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: paddleSubscriptionsTable.userId,
        set: {
          paddleSubscriptionId: sub.id,
          paddleCustomerId: customerId,
          status,
          priceId,
          tier,
          interval,
          nextBilledAt,
          updatedAt: new Date(),
        },
      });
  }
}
