import { checkpointer } from "@/memory/sqlite/checkpointer.js";

async function run() {
  const checkpoint = await checkpointer.get({
    configurable: {
      thread_id: "lead-001",
    },
  });

  console.log(JSON.stringify(checkpoint, null, 2));
}

run();
