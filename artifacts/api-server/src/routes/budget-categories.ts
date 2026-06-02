import { Router } from "express";
import { db } from "@workspace/db";
import { budgetCategoriesTable, insertBudgetCategorySchema } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/budget-categories", async (req, res): Promise<void> => {
  const year = req.query.year ? Number(req.query.year) : undefined;
  const rows = await db
    .select()
    .from(budgetCategoriesTable)
    .where(year !== undefined ? eq(budgetCategoriesTable.year, year) : undefined);
  res.json(rows.map(toApi));
});

router.post("/budget-categories", async (req, res): Promise<void> => {
  const parsed = insertBudgetCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(budgetCategoriesTable).values(parsed.data).returning();
  res.status(201).json(toApi(row));
});

router.get("/budget-categories/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const [row] = await db.select().from(budgetCategoriesTable).where(eq(budgetCategoriesTable.id, id));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toApi(row));
});

router.put("/budget-categories/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const parsed = insertBudgetCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.update(budgetCategoriesTable).set(parsed.data).where(eq(budgetCategoriesTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toApi(row));
});

router.delete("/budget-categories/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const [row] = await db.delete(budgetCategoriesTable).where(eq(budgetCategoriesTable.id, id)).returning();
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
