import { Router } from "express";
import { db } from "@workspace/db";
import { balanceSheetItemsTable } from "@workspace/db";
import { eq, and, asc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/balance-sheet", requireAuth, async (req: any, res): Promise<void> => {
  const year = req.query.year ? Number(req.query.year) : undefined;
  const userId: string = req.userId;
  const rows = await db
    .select()
    .from(balanceSheetItemsTable)
    .where(
      year !== undefined
        ? and(eq(balanceSheetItemsTable.userId, userId), eq(balanceSheetItemsTable.year, year))
        : eq(balanceSheetItemsTable.userId, userId)
    )
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
