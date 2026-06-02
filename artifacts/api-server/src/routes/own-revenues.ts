import { Router } from "express";
import { db } from "@workspace/db";
import { ownRevenuesTable, insertOwnRevenueSchema } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/own-revenues", async (req, res): Promise<void> => {
  const year = req.query.year ? Number(req.query.year) : undefined;
  const rows = await db.select().from(ownRevenuesTable).where(year !== undefined ? eq(ownRevenuesTable.year, year) : undefined);
  res.json(rows.map(toApi));
});

router.post("/own-revenues", async (req, res): Promise<void> => {
  const parsed = insertOwnRevenueSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(ownRevenuesTable).values(parsed.data).returning();
  res.status(201).json(toApi(row));
});

router.put("/own-revenues/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const parsed = insertOwnRevenueSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.update(ownRevenuesTable).set(parsed.data).where(eq(ownRevenuesTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toApi(row));
});

router.delete("/own-revenues/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const [row] = await db.delete(ownRevenuesTable).where(eq(ownRevenuesTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.status(204).send();
});

function toApi(row: typeof ownRevenuesTable.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    amount: Number(row.amount),
    percentage: Number(row.percentage),
    year: row.year,
    createdAt: row.createdAt,
  };
}

export default router;
