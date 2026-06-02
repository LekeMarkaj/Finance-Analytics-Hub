import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const customDatasetsTable = pgTable("custom_datasets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  chartType: text("chart_type", { enum: ["bar", "line", "pie", "area"] }).notNull().default("bar"),
  xAxisLabel: text("x_axis_label"),
  yAxisLabel: text("y_axis_label"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCustomDatasetSchema = createInsertSchema(customDatasetsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCustomDataset = z.infer<typeof insertCustomDatasetSchema>;
export type CustomDataset = typeof customDatasetsTable.$inferSelect;
