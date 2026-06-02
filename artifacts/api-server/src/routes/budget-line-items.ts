import { Router } from "express";
import { db } from "@workspace/db";
import { budgetLineItemsTable, insertBudgetLineItemSchema } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/budget-line-items", async (req, res): Promise<void> => {
  const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
  const year = req.query.year ? Number(req.query.year) : undefined;

  let rows;
  if (categoryId !== undefined && year !== undefined) {
    rows = await db.select().from(budgetLineItemsTable).where(and(eq(budgetLineItemsTable.categoryId, categoryId), eq(budgetLineItemsTable.year, year)));
  } else if (categoryId !== undefined) {
    rows = await db.select().from(budgetLineItemsTable).where(eq(budgetLineItemsTable.categoryId, categoryId));
  } else if (year !== undefined) {
    rows = await db.select().from(budgetLineItemsTable).where(eq(budgetLineItemsTable.year, year));
  } else {
    rows = await db.select().from(budgetLineItemsTable);
  }
  res.json(rows.map(toApi));
});

router.post("/budget-line-items", async (req, res): Promise<void> => {
  const parsed = insertBudgetLineItemSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(budgetLineItemsTable).values(parsed.data).returning();
  res.status(201).json(toApi(row));
});

router.get("/budget-line-items/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const [row] = await db.select().from(budgetLineItemsTable).where(eq(budgetLineItemsTable.id, id));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toApi(row));
});

router.put("/budget-line-items/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const parsed = insertBudgetLineItemSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.update(budgetLineItemsTable).set(parsed.data).where(eq(budgetLineItemsTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toApi(row));
});

router.delete("/budget-line-items/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const [row] = await db.delete(budgetLineItemsTable).where(eq(budgetLineItemsTable.id, id)).returning();
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
