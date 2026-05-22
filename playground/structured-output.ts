import { analyzeLead } from "@/services/ai/lead-analysis.js";

async function run() {
  const result = await analyzeLead(`
    Customer budget is 120000 USD.

    Wants immediate purchase.

    Looking for premium SUV.
  `);

  console.log(result);
}

run();
