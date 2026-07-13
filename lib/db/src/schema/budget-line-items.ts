import { pgTable, serial, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { budgetCategoriesTable } from "./budget-categories";

export const budgetLineItemsTable = pgTable("budget_line_items", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default(""),
  categoryId: integer("category_id").notNull().references(() => budgetCategoriesTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  percentage: numeric("percentage", { precision: 5, scale: 2 }).notNull(),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBudgetLineItemSchema = createInsertSchema(budgetLineItemsTable).omit({ id: true, userId: true, createdAt: true });
export type InsertBudgetLineItem = z.infer<typeof insertBudgetLineItemSchema>;
export type BudgetLineItem = typeof budgetLineItemsTable.$inferSelect;
