import { pgTable, serial, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const pdfUploadsTable = pgTable("pdf_uploads", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  fileName: text("file_name").notNull(),
  status: text("status", { enum: ["processing", "done", "error"] }).notNull().default("processing"),
  errorMessage: text("error_message"),
  extractedData: jsonb("extracted_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPdfUploadSchema = createInsertSchema(pdfUploadsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPdfUpload = z.infer<typeof insertPdfUploadSchema>;
export type PdfUpload = typeof pdfUploadsTable.$inferSelect;

export interface ExtractedFinancialData {
  title: string;
  summary: string;
  currency: string;
  sections: ExtractedSection[];
}

export interface ExtractedSection {
  name: string;
  chartType: "bar" | "line" | "pie" | "area";
  items: ExtractedItem[];
}

export interface ExtractedItem {
  label: string;
  value: number;
  color?: string;
}
