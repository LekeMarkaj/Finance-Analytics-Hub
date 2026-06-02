import { Router } from "express";
import { db } from "@workspace/db";
import { balanceSheetItemsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router = Router();

router.get("/balance-sheet", async (req, res): Promise<void> => {
  const year = req.query.year ? Number(req.query.year) : undefined;
  const rows = await db
    .select()
    .from(balanceSheetItemsTable)
    .where(year !== undefined ? eq(balanceSheetItemsTable.year, year) : undefined)
    .orderBy(asc(balanceSheetItemsTable.sortOrder));
  res.json(rows.map(toApi));
});

function toApi(row: typeof balanceSheetItemsTable.$inferSelect) {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    amount: Number(row.amount),
    year: row.year,
    sortOrder: row.sortOrder,
  };
}

export default router;
