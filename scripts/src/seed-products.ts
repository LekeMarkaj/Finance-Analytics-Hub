import { Paddle, Environment } from "@paddle/paddle-node-sdk";

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
    monthlyAmount: 999,
    yearlyAmount: 9999,
    createLimit: 15,
    uploadLimit: 15,
  },
  {
    tier: "pro",
    name: "Pro",
    description: "For power users who need the highest monthly limits",
    monthlyAmount: 1999,
    yearlyAmount: 19999,
    createLimit: 50,
    uploadLimit: 50,
  },
];

async function seedProducts() {
  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) throw new Error("PADDLE_API_KEY is not set");

  const env =
    process.env.PADDLE_ENVIRONMENT === "production"
      ? Environment.production
      : Environment.sandbox;
  const paddle = new Paddle(apiKey, { environment: env });

  for (const config of TIERS) {
    const existingProducts: any[] = [];
    for await (const p of paddle.products.list({ status: ["active"] })) {
      existingProducts.push(p);
    }
    const existing = existingProducts.find(
      (p: any) => p.customData?.tier === config.tier,
    );

    let productId: string;
    if (existing) {
      productId = existing.id;
      console.log(`${config.name} product already exists (${productId}). Reusing.`);
    } else {
      const product = await paddle.products.create({
        name: `${config.name} Plan`,
        description: config.description,
        taxCategory: "saas",
        customData: {
          tier: config.tier,
          createLimit: String(config.createLimit),
          uploadLimit: String(config.uploadLimit),
        },
      });
      productId = product.id;
      console.log(`Created product: ${product.name} (${productId})`);
    }

    const existingPrices: any[] = [];
    for await (const p of paddle.prices.list({ productId: [productId], status: ["active"] })) {
      existingPrices.push(p);
    }

    const hasMonthly = existingPrices.some(
      (p: any) => p.billingCycle?.interval === "month",
    );
    const hasYearly = existingPrices.some(
      (p: any) => p.billingCycle?.interval === "year",
    );

    if (!hasMonthly) {
      const price = await paddle.prices.create({
        productId,
        description: `${config.name} Monthly`,
        unitPrice: { amount: String(config.monthlyAmount), currencyCode: "USD" },
        billingCycle: { interval: "month", frequency: 1 },
        trialPeriod: null,
        taxMode: "account_setting",
        customData: { tier: config.tier },
      });
      console.log(`Created monthly price: $${config.monthlyAmount / 100}/mo (${price.id})`);
    } else {
      console.log(`Monthly price for ${config.name} already exists. Skipping.`);
    }

    if (!hasYearly) {
      const price = await paddle.prices.create({
        productId,
        description: `${config.name} Yearly`,
        unitPrice: { amount: String(config.yearlyAmount), currencyCode: "USD" },
        billingCycle: { interval: "year", frequency: 1 },
        trialPeriod: null,
        taxMode: "account_setting",
        customData: { tier: config.tier },
      });
      console.log(`Created yearly price: $${config.yearlyAmount / 100}/yr (${price.id})`);
    } else {
      console.log(`Yearly price for ${config.name} already exists. Skipping.`);
    }
  }

  console.log("✓ Paddle products and prices ready!");
}

seedProducts().catch((err) => {
  console.error("Error seeding products:", err.message);
  process.exit(1);
});
