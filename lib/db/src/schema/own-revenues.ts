import { pgTable, serial, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ownRevenuesTable = pgTable("own_revenues", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default(""),
  name: text("name").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  percentage: numeric("percentage", { precision: 5, scale: 2 }).notNull(),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOwnRevenueSchema = createInsertSchema(ownRevenuesTable).omit({ id: true, userId: true, createdAt: true });
export type InsertOwnRevenue = z.infer<typeof insertOwnRevenueSchema>;
export type OwnRevenue = typeof ownRevenuesTable.$inferSelect;
