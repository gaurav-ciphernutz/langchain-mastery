import { executeAgent } from "@/services/ai/runtime-agent.js";

async function run() {
  const result = await executeAgent(`
    Fetch CRM lead information for john@example.com,
    score the lead, and generate a WhatsApp follow-up.
  `);

  console.log(JSON.stringify(result, null, 2));
}

run();
