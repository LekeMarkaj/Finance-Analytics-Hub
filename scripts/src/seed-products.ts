import { getUncachableStripeClient } from "./stripeClient";

interface TierConfig {
  tier: "basic" | "pro";
  name: string;
  description: string;
  monthlyAmount: number;
  yearlyAmount: number;
  createLimit: number;
  uploadLimit: number;
}

const TIERS: TierConfig[] = [
  {
    tier: "basic",
    name: "Basic",
    description: "For growing teams that need more reports each month",
    monthlyAmount: 1500,
    yearlyAmount: 15000,
    createLimit: 15,
    uploadLimit: 15,
  },
  {
    tier: "pro",
    name: "Pro",
    description: "For power users who need the highest monthly limits",
    monthlyAmount: 5000,
    yearlyAmount: 50000,
    createLimit: 50,
    uploadLimit: 50,
  },
];

async function ensureProduct(stripe: Awaited<ReturnType<typeof getUncachableStripeClient>>, config: TierConfig) {
  const existing = await stripe.products.search({
    query: `name:'${config.name} Plan' AND active:'true'`,
  });

  let product = existing.data[0];
  if (product) {
    console.log(`${config.name} Plan product already exists (${product.id}). Reusing it.`);
  } else {
    product = await stripe.products.create({
      name: `${config.name} Plan`,
      description: config.description,
      metadata: {
        tier: config.tier,
        createLimit: String(config.createLimit),
        uploadLimit: String(config.uploadLimit),
      },
    });
    console.log(`Created product: ${product.name} (${product.id})`);
  }

  const existingPrices = await stripe.prices.list({ product: product.id, active: true, limit: 100 });

  const hasMonthly = existingPrices.data.some(
    (p) => p.recurring?.interval === "month" && p.unit_amount === config.monthlyAmount,
  );
  const hasYearly = existingPrices.data.some(
    (p) => p.recurring?.interval === "year" && p.unit_amount === config.yearlyAmount,
  );

  if (!hasMonthly) {
    const monthly = await stripe.prices.create({
      product: product.id,
      unit_amount: config.monthlyAmount,
      currency: "eur",
      recurring: { interval: "month" },
      metadata: { tier: config.tier },
    });
    console.log(`Created monthly price: €${config.monthlyAmount / 100}/month (${monthly.id})`);
  } else {
    console.log(`Monthly price for ${config.name} already exists. Skipping.`);
  }

  if (!hasYearly) {
    const yearly = await stripe.prices.create({
      product: product.id,
      unit_amount: config.yearlyAmount,
      currency: "eur",
      recurring: { interval: "year" },
      metadata: { tier: config.tier },
    });
    console.log(`Created yearly price: €${config.yearlyAmount / 100}/year (${yearly.id})`);
  } else {
    console.log(`Yearly price for ${config.name} already exists. Skipping.`);
  }
}

async function createProducts() {
  try {
    const stripe = await getUncachableStripeClient();
    console.log("Creating products and prices in Stripe...");

    for (const config of TIERS) {
      await ensureProduct(stripe, config);
    }

    console.log("✓ Products and prices ready!");
    console.log("Webhooks will sync this data to your database automatically.");
  } catch (error: any) {
    console.error("Error creating products:", error.message);
    process.exit(1);
  }
}

createProducts();
