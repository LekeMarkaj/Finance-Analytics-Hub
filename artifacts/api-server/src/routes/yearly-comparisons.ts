import { Router } from "express";
import { db } from "@workspace/db";
import { yearlyComparisonsTable, insertYearlyComparisonSchema } from "@workspace/db";
import { eq, and, asc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/yearly-comparisons", requireAuth, async (req: any, res): Promise<void> => {
  const userId: string = req.userId;
  const rows = await db
    .select()
    .from(yearlyComparisonsTable)
    .where(eq(yearlyComparisonsTable.userId, userId))
    .orderBy(asc(yearlyComparisonsTable.year));
  res.json(rows.map(toApi));
});

router.post("/yearly-comparisons", requireAuth, async (req: any, res): Promise<void> => {
  const parsed = insertYearlyComparisonSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(yearlyComparisonsTable).values({ ...parsed.data, userId: req.userId }).returning();
  res.status(201).json(toApi(row));
});

router.put("/yearly-comparisons/:id", requireAuth, async (req: any, res): Promise<void> => {
  const id = Number(req.params.id);
  const userId: string = req.userId;
  const parsed = insertYearlyComparisonSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(yearlyComparisonsTable)
    .set(parsed.data)
    .where(and(eq(yearlyComparisonsTable.id, id), eq(yearlyComparisonsTable.userId, userId)))
    .returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toApi(row));
});

router.delete("/yearly-comparisons/:id", requireAuth, async (req: any, res): Promise<void> => {
  const id = Number(req.params.id);
  const userId: string = req.userId;
  const [row] = await db
    .delete(yearlyComparisonsTable)
    .where(and(eq(yearlyComparisonsTable.id, id), eq(yearlyComparisonsTable.userId, userId)))
    .returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.status(204).send();
});

function toApi(row: typeof yearlyComparisonsTable.$inferSelect) {
  return {
    id: row.id,
    year: row.year,
    totalBudget: Number(row.totalBudget),
    totalSpent: Number(row.totalSpent),
    utilizationPct: Number(row.utilizationPct),
  };
}

export default router;
