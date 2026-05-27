import { askKnowledgeBase } from "@/services/ai/rag-service.js";

async function run() {
  const result = await askKnowledgeBase(`
    What financing options exist?
  `);

  console.log(result);
}

run();
