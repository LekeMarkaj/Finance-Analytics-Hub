import { pgTable, serial, text, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const balanceSheetItemsTable = pgTable("balance_sheet_items", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default(""),
  category: text("category", { enum: ["asset", "liability", "capital"] }).notNull(),
  name: text("name").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  year: integer("year").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertBalanceSheetItemSchema = createInsertSchema(balanceSheetItemsTable).omit({ id: true });
export type InsertBalanceSheetItem = z.infer<typeof insertBalanceSheetItemSchema>;
export type BalanceSheetItem = typeof balanceSheetItemsTable.$inferSelect;
