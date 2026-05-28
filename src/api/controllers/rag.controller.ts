import type { RagAskBody } from "@/api/schemas/index.js";
import {
  runWithRuntimeContext,
  type RuntimeContext,
} from "@/runtime/context.js";
import { askKnowledgeBase } from "@/services/ai/rag-service.js";

export async function askRagKnowledgeBase(
  body: RagAskBody,
  runtimeContext: RuntimeContext
) {
  return runWithRuntimeContext(runtimeContext, () =>
    askKnowledgeBase(body.query, {
      retrieval: body.retrieval,
    })
  );
}
