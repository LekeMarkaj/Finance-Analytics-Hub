import { Router } from "express";
import { db } from "@workspace/db";
import { customDatasetsTable, customDataRowsTable, insertCustomDatasetSchema, insertCustomDataRowSchema } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router = Router();

router.get("/custom-datasets", async (_req, res): Promise<void> => {
  const rows = await db.select().from(customDatasetsTable).orderBy(asc(customDatasetsTable.createdAt));
  res.json(rows.map(datasetToApi));
});

router.post("/custom-datasets", async (req, res): Promise<void> => {
  const parsed = insertCustomDatasetSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(customDatasetsTable).values(parsed.data).returning();
  res.status(201).json(datasetToApi(row));
});

router.get("/custom-datasets/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const [dataset] = await db.select().from(customDatasetsTable).where(eq(customDatasetsTable.id, id));
  if (!dataset) { res.status(404).json({ error: "Not found" }); return; }
  const rows = await db.select().from(customDataRowsTable).where(eq(customDataRowsTable.datasetId, id)).orderBy(asc(customDataRowsTable.sortOrder));
  res.json({
    ...datasetToApi(dataset),
    rows: rows.map(rowToApi),
  });
});

router.put("/custom-datasets/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const parsed = insertCustomDatasetSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(customDatasetsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(customDatasetsTable.id, id))
    .returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(datasetToApi(row));
});

router.delete("/custom-datasets/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const [row] = await db.delete(customDatasetsTable).where(eq(customDatasetsTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.status(204).send();
});

router.get("/custom-datasets/:datasetId/rows", async (req, res): Promise<void> => {
  const datasetId = Number(req.params.datasetId);
  const rows = await db
    .select()
    .from(customDataRowsTable)
    .where(eq(customDataRowsTable.datasetId, datasetId))
    .orderBy(asc(customDataRowsTable.sortOrder));
  res.json(rows.map(rowToApi));
});

router.post("/custom-datasets/:datasetId/rows", async (req, res): Promise<void> => {
  const datasetId = Number(req.params.datasetId);
  const parsed = insertCustomDataRowSchema.safeParse({ ...req.body, datasetId });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(customDataRowsTable).values(parsed.data).returning();
  res.status(201).json(rowToApi(row));
});

router.put("/custom-datasets/:datasetId/rows/:rowId", async (req, res): Promise<void> => {
  const datasetId = Number(req.params.datasetId);
  const rowId = Number(req.params.rowId);
  const parsed = insertCustomDataRowSchema.safeParse({ ...req.body, datasetId });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(customDataRowsTable)
    .set(parsed.data)
    .where(eq(customDataRowsTable.id, rowId))
    .returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(rowToApi(row));
});

router.delete("/custom-datasets/:datasetId/rows/:rowId", async (req, res): Promise<void> => {
  const rowId = Number(req.params.rowId);
  const [row] = await db.delete(customDataRowsTable).where(eq(customDataRowsTable.id, rowId)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.status(204).send();
});

function datasetToApi(row: typeof customDatasetsTable.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    chartType: row.chartType,
    xAxisLabel: row.xAxisLabel,
    yAxisLabel: row.yAxisLabel,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function rowToApi(row: typeof customDataRowsTable.$inferSelect) {
  return {
    id: row.id,
    datasetId: row.datasetId,
    label: row.label,
    value: Number(row.value),
    color: row.color,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
  };
}

export default router;
