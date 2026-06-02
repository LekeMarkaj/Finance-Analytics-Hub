import { Router } from "express";
import { db } from "@workspace/db";
import { budgetCategoriesTable, yearlyComparisonsTable } from "@workspace/db";
import { eq, asc, sum } from "drizzle-orm";

const router = Router();

router.get("/summary/utilization", async (req, res): Promise<void> => {
  const year = req.query.year ? Number(req.query.year) : 2025;
  const categories = await db.select().from(budgetCategoriesTable).where(eq(budgetCategoriesTable.year, year));

  const totalInitialBudget = categories.reduce((acc, c) => acc + Number(c.initialBudget), 0);
  const totalFinalBudget = categories.reduce((acc, c) => acc + Number(c.finalBudget), 0);
  const totalSpent = categories.reduce((acc, c) => acc + Number(c.spent), 0);
  const totalRemaining = categories.reduce((acc, c) => acc + Number(c.remaining), 0);
  const overallUtilizationPct = totalFinalBudget > 0 ? (totalSpent / totalFinalBudget) * 100 : 0;

  res.json({
    year,
    totalInitialBudget,
    totalFinalBudget,
    totalSpent,
    totalRemaining,
    overallUtilizationPct: Math.round(overallUtilizationPct * 10) / 10,
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      year: c.year,
      initialBudget: Number(c.initialBudget),
      finalBudget: Number(c.finalBudget),
      spent: Number(c.spent),
      remaining: Number(c.remaining),
      utilizationPct: Number(c.utilizationPct),
      createdAt: c.createdAt,
    })),
  });
});

router.get("/summary/trend", async (_req, res): Promise<void> => {
  const rows = await db.select().from(yearlyComparisonsTable).orderBy(asc(yearlyComparisonsTable.year));
  res.json(
    rows.map((r) => ({
      id: r.id,
      year: r.year,
      totalBudget: Number(r.totalBudget),
      totalSpent: Number(r.totalSpent),
      utilizationPct: Number(r.utilizationPct),
    }))
  );
});

export default router;
