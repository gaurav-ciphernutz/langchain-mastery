import { HumanMessage } from "@langchain/core/messages";

import { createRuntimeContextConfig } from "@/runtime/context.js";
import { leadQualificationWorkflow } from "@/workflows/lead-qualification/graph.js";

async function run() {
  const result = await leadQualificationWorkflow.invoke(
    {
      email: "john@example.com",
      messages: [new HumanMessage("Analyze this lead")],
    },
    {
      context: createRuntimeContextConfig({
        requestId: "lead-001-request",
        threadId: "lead-001",
        tenantId: "demo-tenant",
        userId: "demo-user",
        traceId: "lead-001-trace",
      }),
      configurable: {
        thread_id: "lead-001",
      },
    }
  );

  console.log(JSON.stringify(result, null, 2));
}

run();
