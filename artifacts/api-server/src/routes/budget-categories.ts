import { Router } from "express";
import { db } from "@workspace/db";
import { budgetCategoriesTable, insertBudgetCategorySchema } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/budget-categories", requireAuth, async (req: any, res): Promise<void> => {
  const year = req.query.year ? Number(req.query.year) : undefined;
  const userId: string = req.userId;
  const rows = await db
    .select()
    .from(budgetCategoriesTable)
    .where(
      year !== undefined
        ? and(eq(budgetCategoriesTable.userId, userId), eq(budgetCategoriesTable.year, year))
        : eq(budgetCategoriesTable.userId, userId)
    );
  res.json(rows.map(toApi));
});

router.post("/budget-categories", requireAuth, async (req: any, res): Promise<void> => {
  const parsed = insertBudgetCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(budgetCategoriesTable).values({ ...parsed.data, userId: req.userId }).returning();
  res.status(201).json(toApi(row));
});

router.get("/budget-categories/:id", requireAuth, async (req: any, res): Promise<void> => {
  const id = Number(req.params.id);
  const userId: string = req.userId;
  const [row] = await db
    .select()
    .from(budgetCategoriesTable)
    .where(and(eq(budgetCategoriesTable.id, id), eq(budgetCategoriesTable.userId, userId)));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toApi(row));
});

router.put("/budget-categories/:id", requireAuth, async (req: any, res): Promise<void> => {
  const id = Number(req.params.id);
  const userId: string = req.userId;
  const parsed = insertBudgetCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(budgetCategoriesTable)
    .set(parsed.data)
    .where(and(eq(budgetCategoriesTable.id, id), eq(budgetCategoriesTable.userId, userId)))
    .returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toApi(row));
});

router.delete("/budget-categories/:id", requireAuth, async (req: any, res): Promise<void> => {
  const id = Number(req.params.id);
  const userId: string = req.userId;
  const [row] = await db
    .delete(budgetCategoriesTable)
    .where(and(eq(budgetCategoriesTable.id, id), eq(budgetCategoriesTable.userId, userId)))
    .returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.status(204).send();
});

function toApi(row: typeof budgetCategoriesTable.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    year: row.year,
    initialBudget: Number(row.initialBudget),
    finalBudget: Number(row.finalBudget),
    spent: Number(row.spent),
    remaining: Number(row.remaining),
    utilizationPct: Number(row.utilizationPct),
    createdAt: row.createdAt,
  };
}

export default router;
