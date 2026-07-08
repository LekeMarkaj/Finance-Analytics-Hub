import { Paddle, Environment } from "@paddle/paddle-node-sdk";

const apiKey = process.env.PADDLE_API_KEY;
if (!apiKey) {
  console.error("PADDLE_API_KEY is not set");
  process.exit(1);
}

const env =
  process.env.PADDLE_ENVIRONMENT === "production" ? Environment.production : Environment.sandbox;

const paddle = new Paddle(apiKey, { environment: env });

const PLANS = [
  {
    tier: "basic",
    name: "Basic Plan",
    createLimit: 15,
    uploadLimit: 15,
    priceEuros: 10,
  },
  {
    tier: "pro",
    name: "Pro Plan",
    createLimit: 50,
    uploadLimit: 50,
    priceEuros: 20,
  },
];

async function findExistingProductByTier(tier) {
  for await (const product of paddle.products.list({ status: ["active"] })) {
    const customData = product.customData;
    if (customData?.tier === tier) return product;
  }
  return null;
}

async function main() {
  for (const plan of PLANS) {
    let product = await findExistingProductByTier(plan.tier);

    if (product) {
      console.log(`Product for tier "${plan.tier}" already exists: ${product.id}`);
    } else {
      product = await paddle.products.create({
        name: plan.name,
        taxCategory: "standard",
        customData: {
          tier: plan.tier,
          createLimit: String(plan.createLimit),
          uploadLimit: String(plan.uploadLimit),
        },
      });
      console.log(`Created product for tier "${plan.tier}": ${product.id}`);
    }

    const existingPrices = [];
    for await (const price of paddle.prices.list({ productId: [product.id], status: ["active"] })) {
      existingPrices.push(price);
    }

    if (existingPrices.length > 0) {
      console.log(
        `  Product ${product.id} already has ${existingPrices.length} active price(s), skipping price creation`,
      );
      continue;
    }

    const price = await paddle.prices.create({
      productId: product.id,
      description: `${plan.name} - Monthly`,
      unitPrice: {
        amount: String(plan.priceEuros * 100),
        currencyCode: "EUR",
      },
      billingCycle: { interval: "month", frequency: 1 },
    });
    console.log(`  Created price ${price.id} for product ${product.id} (EUR ${plan.priceEuros}/mo)`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error("Failed to seed Paddle plans:", err);
  process.exit(1);
});
