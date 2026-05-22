import { HumanMessage } from "@langchain/core/messages";

import { leadQualificationWorkflow } from "@/workflows/lead-qualification/graph.js";

async function run() {
  const stream = await leadQualificationWorkflow.stream(
    {
      email: "john@example.com",
      messages: [new HumanMessage("Analyze this lead")],
    },
    {
      configurable: {
        thread_id: "stream-001",
      },
      streamMode: "updates",
    }
  );

  for await (const chunk of stream) {
    console.log(JSON.stringify(chunk, null, 2));
  }
}

run();
