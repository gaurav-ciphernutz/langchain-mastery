import { ingestDocument } from "@/rag/pipelines/ingest.js";

async function run() {
  await ingestDocument("./src/rag/documents/sample.pdf");
}

run();
