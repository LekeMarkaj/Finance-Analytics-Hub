import { pgTable, text, integer, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const billingCustomersTable = pgTable("billing_customers", {
  userId: text("user_id").primaryKey(),
  stripeCustomerId: text("stripe_customer_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBillingCustomerSchema = createInsertSchema(billingCustomersTable).omit({
  createdAt: true,
});

export type InsertBillingCustomer = z.infer<typeof insertBillingCustomerSchema>;
export type BillingCustomer = typeof billingCustomersTable.$inferSelect;

export const usageCountersTable = pgTable(
  "usage_counters",
  {
    userId: text("user_id").notNull(),
    month: text("month").notNull(),
    creates: integer("creates").notNull().default(0),
    uploads: integer("uploads").notNull().default(0),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.month] })],
);

export type UsageCounter = typeof usageCountersTable.$inferSelect;

export const PLAN_TIERS = ["free", "basic", "pro"] as const;
export type PlanTier = (typeof PLAN_TIERS)[number];

export const PLAN_LIMITS: Record<PlanTier, { creates: number; uploads: number }> = {
  free: { creates: 1, uploads: 1 },
  basic: { creates: 15, uploads: 15 },
  pro: { creates: 50, uploads: 50 },
};
