import type { DocumentInterface } from "@langchain/core/documents";

import {
  createRuntimeContext,
  runWithRuntimeContext,
  type RuntimeContextInput,
} from "@/runtime/context.js";
import { emitRuntimeEvent } from "@/runtime/events.js";
import { vectorStore } from "@/rag/vectorstores/chroma.js";

export interface RetrievalOptions {
  k?: number;
  filters?: Record<string, unknown>;
  runtimeContext?: RuntimeContextInput;
}

export async function retrieveContext(
  query: string,
  options: RetrievalOptions = {}
): Promise<DocumentInterface[]> {
  if (options.runtimeContext) {
    const runtimeContext = createRuntimeContext(options.runtimeContext);

    return runWithRuntimeContext(runtimeContext, () =>
      retrieveContext(query, {
        ...options,
        runtimeContext: undefined,
      })
    );
  }

  const startedAt = Date.now();
  const k = options.k ?? 4;
  const docs = await vectorStore.similaritySearch(query, k, {
    filters: options.filters,
  });

  emitRuntimeEvent({
    type: "retrieval.completed",
    queryLength: query.length,
    k,
    resultCount: docs.length,
    durationMs: Date.now() - startedAt,
  });

  return docs;
}
