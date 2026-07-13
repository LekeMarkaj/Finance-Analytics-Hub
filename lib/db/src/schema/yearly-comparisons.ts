import { pgTable, serial, text, integer, numeric, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const yearlyComparisonsTable = pgTable("yearly_comparisons", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default(""),
  year: integer("year").notNull(),
  totalBudget: numeric("total_budget", { precision: 18, scale: 2 }).notNull(),
  totalSpent: numeric("total_spent", { precision: 18, scale: 2 }).notNull(),
  utilizationPct: numeric("utilization_pct", { precision: 5, scale: 2 }).notNull(),
}, (t) => [
  uniqueIndex("yearly_comparisons_user_year_idx").on(t.userId, t.year),
]);

export const insertYearlyComparisonSchema = createInsertSchema(yearlyComparisonsTable).omit({ id: true, userId: true });
export type InsertYearlyComparison = z.infer<typeof insertYearlyComparisonSchema>;
export type YearlyComparison = typeof yearlyComparisonsTable.$inferSelect;
