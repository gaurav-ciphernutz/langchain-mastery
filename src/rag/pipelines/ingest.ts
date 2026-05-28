import { Document } from "@langchain/core/documents";

import { emitRuntimeEvent } from "@/runtime/events.js";

import { chunkText } from "../ingestion/chunking/chunker.js";
import { loadPDF } from "../ingestion/loaders/pdf-loader.js";
import { vectorStore } from "../vectorstores/chroma.js";

export async function ingestDocument(path: string) {
  const text = await loadPDF(path);
  const chunks = await chunkText(text);
  const documents = chunks.map(
    (chunk, index) =>
      new Document({
        pageContent: chunk.pageContent,
        metadata: {
          ...chunk.metadata,
          source: path,
          chunkIndex: index,
        },
      })
  );

  await vectorStore.addDocuments(documents);

  emitRuntimeEvent({
    type: "document.ingested",
    source: path,
    chunkCount: documents.length,
  });
}
