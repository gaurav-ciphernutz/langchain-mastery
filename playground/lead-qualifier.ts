import { HumanMessage } from "@langchain/core/messages";

import { leadQualifierAgent } from "../src/agents/lead-qualifier/agent.js";

async function run() {
  const response = await leadQualifierAgent.invoke({
    messages: [
      new HumanMessage(`
        Lead email: aarav.mehta@example.com

        Please qualify this lead, draft a WhatsApp follow-up message,
        and schedule a test drive for 2026-05-25 at 11:00 AM
        at the Bengaluru showroom.
      `),
    ],
  });

  console.log(JSON.stringify(response, null, 2));
}

run();
