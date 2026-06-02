import { pgTable, serial, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { customDatasetsTable } from "./custom-datasets";

export const customDataRowsTable = pgTable("custom_data_rows", {
  id: serial("id").primaryKey(),
  datasetId: integer("dataset_id").notNull().references(() => customDatasetsTable.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  value: numeric("value", { precision: 18, scale: 4 }).notNull(),
  color: text("color"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCustomDataRowSchema = createInsertSchema(customDataRowsTable).omit({ id: true, createdAt: true });
export type InsertCustomDataRow = z.infer<typeof insertCustomDataRowSchema>;
export type CustomDataRow = typeof customDataRowsTable.$inferSelect;
