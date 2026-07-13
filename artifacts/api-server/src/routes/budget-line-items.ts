import { Router } from "express";
import { db } from "@workspace/db";
import { budgetLineItemsTable, insertBudgetLineItemSchema } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/budget-line-items", requireAuth, async (req: any, res): Promise<void> => {
  const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
  const year = req.query.year ? Number(req.query.year) : undefined;
  const userId: string = req.userId;

  const userFilter = eq(budgetLineItemsTable.userId, userId);

  let rows;
  if (categoryId !== undefined && year !== undefined) {
    rows = await db.select().from(budgetLineItemsTable).where(and(userFilter, eq(budgetLineItemsTable.categoryId, categoryId), eq(budgetLineItemsTable.year, year)));
  } else if (categoryId !== undefined) {
    rows = await db.select().from(budgetLineItemsTable).where(and(userFilter, eq(budgetLineItemsTable.categoryId, categoryId)));
  } else if (year !== undefined) {
    rows = await db.select().from(budgetLineItemsTable).where(and(userFilter, eq(budgetLineItemsTable.year, year)));
  } else {
    rows = await db.select().from(budgetLineItemsTable).where(userFilter);
  }
  res.json(rows.map(toApi));
});

router.post("/budget-line-items", requireAuth, async (req: any, res): Promise<void> => {
  const parsed = insertBudgetLineItemSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(budgetLineItemsTable).values({ ...parsed.data, userId: req.userId }).returning();
  res.status(201).json(toApi(row));
});

router.get("/budget-line-items/:id", requireAuth, async (req: any, res): Promise<void> => {
  const id = Number(req.params.id);
  const userId: string = req.userId;
  const [row] = await db
    .select()
    .from(budgetLineItemsTable)
    .where(and(eq(budgetLineItemsTable.id, id), eq(budgetLineItemsTable.userId, userId)));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toApi(row));
});

router.put("/budget-line-items/:id", requireAuth, async (req: any, res): Promise<void> => {
  const id = Number(req.params.id);
  const userId: string = req.userId;
  const parsed = insertBudgetLineItemSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(budgetLineItemsTable)
    .set(parsed.data)
    .where(and(eq(budgetLineItemsTable.id, id), eq(budgetLineItemsTable.userId, userId)))
    .returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toApi(row));
});

router.delete("/budget-line-items/:id", requireAuth, async (req: any, res): Promise<void> => {
  const id = Number(req.params.id);
  const userId: string = req.userId;
  const [row] = await db
    .delete(budgetLineItemsTable)
    .where(and(eq(budgetLineItemsTable.id, id), eq(budgetLineItemsTable.userId, userId)))
    .returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.status(204).send();
});

function toApi(row: typeof budgetLineItemsTable.$inferSelect) {
  return {
    id: row.id,
    categoryId: row.categoryId,
    name: row.name,
    amount: Number(row.amount),
    percentage: Number(row.percentage),
    year: row.year,
    createdAt: row.createdAt,
  };
}

export default router;
