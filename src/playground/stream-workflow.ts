import { HumanMessage } from "@langchain/core/messages";

import { createRuntimeContextConfig } from "@/runtime/context.js";
import { leadQualificationWorkflow } from "@/workflows/lead-qualification/graph.js";

async function run() {
  const stream = await leadQualificationWorkflow.stream(
    {
      email: "john@example.com",
      messages: [new HumanMessage("Analyze this lead")],
    },
    {
      context: createRuntimeContextConfig({
        requestId: "stream-001-request",
        threadId: "stream-001",
        tenantId: "demo-tenant",
        userId: "demo-user",
        traceId: "stream-001-trace",
      }),
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
