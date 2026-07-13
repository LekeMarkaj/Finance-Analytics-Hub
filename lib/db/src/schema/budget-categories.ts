import { pgTable, serial, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const budgetCategoriesTable = pgTable("budget_categories", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default(""),
  name: text("name").notNull(),
  year: integer("year").notNull(),
  initialBudget: numeric("initial_budget", { precision: 18, scale: 2 }).notNull(),
  finalBudget: numeric("final_budget", { precision: 18, scale: 2 }).notNull(),
  spent: numeric("spent", { precision: 18, scale: 2 }).notNull(),
  remaining: numeric("remaining", { precision: 18, scale: 2 }).notNull(),
  utilizationPct: numeric("utilization_pct", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBudgetCategorySchema = createInsertSchema(budgetCategoriesTable).omit({ id: true, userId: true, createdAt: true });
export type InsertBudgetCategory = z.infer<typeof insertBudgetCategorySchema>;
export type BudgetCategory = typeof budgetCategoriesTable.$inferSelect;
