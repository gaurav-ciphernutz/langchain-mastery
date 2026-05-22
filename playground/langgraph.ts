import { leadQualificationWorkflow } from "@/workflows/lead-qualification/graph.js";

async function run() {
  const result = await leadQualificationWorkflow.invoke({
    email: "john@example.com",
  });

  console.log(JSON.stringify(result, null, 2));
}

run();
