import { db } from "@workspace/db";
import {
  budgetCategoriesTable,
  budgetLineItemsTable,
  yearlyComparisonsTable,
  ownRevenuesTable,
  balanceSheetItemsTable,
} from "@workspace/db";

async function seed() {
  console.log("Seeding database...");

  const existingCategories = await db.select().from(budgetCategoriesTable).limit(1);
  if (existingCategories.length > 0) {
    console.log("Database already seeded, skipping.");
    process.exit(0);
  }

  const categories = await db
    .insert(budgetCategoriesTable)
    .values([
      { name: "Salaries", year: 2025, initialBudget: "94561890.00", finalBudget: "98980865.05", spent: "98975903.15", remaining: "4961.90", utilizationPct: "100.00" },
      { name: "Goods & Services", year: 2025, initialBudget: "69506346.00", finalBudget: "79381291.73", spent: "76487720.97", remaining: "2893570.76", utilizationPct: "96.00" },
      { name: "Utilities", year: 2025, initialBudget: "4139016.00", finalBudget: "4139016.00", spent: "4095879.58", remaining: "43136.42", utilizationPct: "99.00" },
      { name: "Capital Investment", year: 2025, initialBudget: "22449500.00", finalBudget: "21186232.81", spent: "17602229.85", remaining: "3584002.96", utilizationPct: "83.00" },
    ])
    .returning();

  console.log(`Inserted ${categories.length} budget categories`);

  const [salariesCat, goodsServicesCat, utilitiesCat, capitalCat] = categories;

  await db.insert(budgetLineItemsTable).values([
    { categoryId: salariesCat.id, name: "Net salaries (payroll)", amount: "61832000.00", percentage: "62.47", year: 2025 },
    { categoryId: salariesCat.id, name: "Trade union payments", amount: "86000.00", percentage: "0.09", year: 2025 },
    { categoryId: salariesCat.id, name: "Professional chambers", amount: "323000.00", percentage: "0.33", year: 2025 },
    { categoryId: salariesCat.id, name: "Personal income tax", amount: "6404000.00", percentage: "6.47", year: 2025 },
    { categoryId: salariesCat.id, name: "Pension contribution (employee)", amount: "4706000.00", percentage: "4.75", year: 2025 },
    { categoryId: salariesCat.id, name: "Pension contribution (employer)", amount: "4706000.00", percentage: "4.75", year: 2025 },
    { categoryId: salariesCat.id, name: "Work experience bonus", amount: "4207000.00", percentage: "4.25", year: 2025 },
    { categoryId: salariesCat.id, name: "Labor market supplement", amount: "401000.00", percentage: "0.41", year: 2025 },
    { categoryId: salariesCat.id, name: "Volume supplement", amount: "43000.00", percentage: "0.04", year: 2025 },
    { categoryId: salariesCat.id, name: "Health worker supplement", amount: "518000.00", percentage: "0.52", year: 2025 },
    { categoryId: salariesCat.id, name: "On-call / night / overtime", amount: "15731000.00", percentage: "15.89", year: 2025 },
    { categoryId: salariesCat.id, name: "Transitional supplement", amount: "17000.00", percentage: "0.02", year: 2025 },
  ]);

  await db.insert(budgetLineItemsTable).values([
    { categoryId: goodsServicesCat.id, name: "Other purchases – Goods & Services", amount: "60597597.57", percentage: "79.23", year: 2025 },
    { categoryId: goodsServicesCat.id, name: "Maintenance", amount: "8893206.14", percentage: "11.63", year: 2025 },
    { categoryId: goodsServicesCat.id, name: "Service expenses", amount: "3870942.42", percentage: "5.06", year: 2025 },
    { categoryId: goodsServicesCat.id, name: "Fuel & combustibles", amount: "1276927.54", percentage: "1.67", year: 2025 },
    { categoryId: goodsServicesCat.id, name: "Furniture & equipment (<€1,000)", amount: "890229.55", percentage: "1.16", year: 2025 },
    { categoryId: goodsServicesCat.id, name: "Court judgment expenses", amount: "746018.97", percentage: "0.98", year: 2025 },
    { categoryId: goodsServicesCat.id, name: "Telecommunications", amount: "93921.34", percentage: "0.12", year: 2025 },
    { categoryId: goodsServicesCat.id, name: "Registration & insurance", amount: "65044.76", percentage: "0.09", year: 2025 },
    { categoryId: goodsServicesCat.id, name: "Travel expenses", amount: "35331.63", percentage: "0.05", year: 2025 },
    { categoryId: goodsServicesCat.id, name: "Representation expenses", amount: "10057.94", percentage: "0.01", year: 2025 },
    { categoryId: goodsServicesCat.id, name: "Rent", amount: "7403.11", percentage: "0.01", year: 2025 },
    { categoryId: goodsServicesCat.id, name: "Advance accounts", amount: "1000.00", percentage: "0.00", year: 2025 },
    { categoryId: goodsServicesCat.id, name: "Marketing expenses", amount: "40.00", percentage: "0.00", year: 2025 },
  ]);

  await db.insert(budgetLineItemsTable).values([
    { categoryId: utilitiesCat.id, name: "Electricity", amount: "1886112.30", percentage: "46.05", year: 2025 },
    { categoryId: utilitiesCat.id, name: "Central heating", amount: "933134.09", percentage: "22.79", year: 2025 },
    { categoryId: utilitiesCat.id, name: "Water & sewage", amount: "689297.05", percentage: "16.83", year: 2025 },
    { categoryId: utilitiesCat.id, name: "Waste management", amount: "546256.49", percentage: "13.34", year: 2025 },
    { categoryId: utilitiesCat.id, name: "Fixed telephone", amount: "35212.33", percentage: "0.86", year: 2025 },
    { categoryId: utilitiesCat.id, name: "Court judgment payments", amount: "5867.32", percentage: "0.14", year: 2025 },
  ]);

  await db.insert(budgetLineItemsTable).values([
    { categoryId: capitalCat.id, name: "Buildings", amount: "6768445.78", percentage: "38.45", year: 2025 },
    { categoryId: capitalCat.id, name: "Medical equipment", amount: "10330094.10", percentage: "58.69", year: 2025 },
    { categoryId: capitalCat.id, name: "Transport vehicles & machinery", amount: "173451.97", percentage: "0.99", year: 2025 },
    { categoryId: capitalCat.id, name: "Land, parks & public spaces", amount: "330238.00", percentage: "1.88", year: 2025 },
  ]);

  console.log("Inserted budget line items");

  await db.insert(yearlyComparisonsTable).values([
    { year: 2020, totalBudget: "98400000.00", totalSpent: "94200000.00", utilizationPct: "95.73" },
    { year: 2021, totalBudget: "112800000.00", totalSpent: "108100000.00", utilizationPct: "95.83" },
    { year: 2022, totalBudget: "133600000.00", totalSpent: "128000000.00", utilizationPct: "95.80" },
    { year: 2023, totalBudget: "155200000.00", totalSpent: "149800000.00", utilizationPct: "96.50" },
    { year: 2024, totalBudget: "179400000.00", totalSpent: "178900000.00", utilizationPct: "99.70" },
    { year: 2025, totalBudget: "203687405.59", totalSpent: "197161733.55", utilizationPct: "96.80" },
  ]);

  console.log("Inserted yearly comparisons");

  await db.insert(ownRevenuesTable).values([
    { name: "Participations (co-payments)", amount: "1889023.60", percentage: "60.46", year: 2025 },
    { name: "Medical certificate fees", amount: "561211.00", percentage: "17.96", year: 2025 },
    { name: "Public parking & recreation tax", amount: "337219.50", percentage: "10.79", year: 2025 },
    { name: "Public property rent", amount: "215009.03", percentage: "6.88", year: 2025 },
    { name: "Sale of services", amount: "98518.41", percentage: "3.15", year: 2025 },
    { name: "Waste sales", amount: "21950.40", percentage: "0.70", year: 2025 },
    { name: "Insurance compensations", amount: "1000.00", percentage: "0.03", year: 2025 },
    { name: "Prior year revenues", amount: "17.70", percentage: "0.00", year: 2025 },
  ]);

  console.log("Inserted own revenues");

  await db.insert(balanceSheetItemsTable).values([
    { category: "asset", name: "Fixed assets (total)", amount: "256791309.51", year: 2025, sortOrder: 1 },
    { category: "asset", name: "Land", amount: "116532363.56", year: 2025, sortOrder: 2 },
    { category: "asset", name: "Buildings & infrastructure", amount: "62201928.12", year: 2025, sortOrder: 3 },
    { category: "asset", name: "Other structures", amount: "40517235.03", year: 2025, sortOrder: 4 },
    { category: "asset", name: "Medical equipment", amount: "25480689.11", year: 2025, sortOrder: 5 },
    { category: "asset", name: "Current assets", amount: "4358347.00", year: 2025, sortOrder: 6 },
    { category: "liability", name: "Goods liabilities", amount: "6815362.09", year: 2025, sortOrder: 1 },
    { category: "liability", name: "Contingent liabilities", amount: "6958203.98", year: 2025, sortOrder: 2 },
    { category: "liability", name: "Other liabilities (utilities & capital)", amount: "197442.94", year: 2025, sortOrder: 3 },
    { category: "capital", name: "Net capital", amount: "247178648.50", year: 2025, sortOrder: 1 },
  ]);

  console.log("Inserted balance sheet items");
  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
