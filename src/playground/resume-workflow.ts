import { Command } from "@langchain/langgraph";

import { leadQualificationWorkflow } from "@/workflows/lead-qualification/graph.js";

async function run() {
  const result = await leadQualificationWorkflow.invoke(
    new Command({
      resume: "approved",
    }),
    {
      configurable: {
        thread_id: "lead-001",
      },
    }
  );

  console.log(JSON.stringify(result, null, 2));
}

run();
