import { HumanMessage } from "@langchain/core/messages";

import { leadQualifierAgent } from "@/agents/lead-qualifier/agent.js";

async function run() {
  const response = await leadQualifierAgent.invoke({
    messages: [
      new HumanMessage(`
        Fetch lead data for john@example.com.

        Analyze lead quality.

        Then generate a WhatsApp follow-up.
      `),
    ],
  });

  console.log(JSON.stringify(response, null, 2));
}

run();
