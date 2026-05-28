import { Command } from "@langchain/langgraph";

import { createRuntimeContextConfig } from "@/runtime/context.js";
import { leadQualificationWorkflow } from "@/workflows/lead-qualification/graph.js";

async function run() {
  const result = await leadQualificationWorkflow.invoke(
    new Command({
      resume: "approved",
    }),
    {
      context: createRuntimeContextConfig({
        requestId: "lead-001-resume-request",
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
