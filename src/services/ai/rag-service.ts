import { geminiFlash } from "@/llm/gemini.js";
import { retrieveContext } from "@/rag/retrieval/retrievers/basic-retriever.js";
import type { RetrievalOptions } from "@/rag/retrieval/retrievers/basic-retriever.js";
import {
  createRuntimeContext,
  runWithRuntimeContext,
  type RuntimeContextInput,
} from "@/runtime/context.js";

type KnowledgeBaseAnswer = Awaited<ReturnType<typeof geminiFlash.invoke>>["content"];

export interface AskKnowledgeBaseOptions {
  retrieval?: RetrievalOptions;
  runtimeContext?: RuntimeContextInput;
}

export async function askKnowledgeBase(
  query: string,
  options: AskKnowledgeBaseOptions = {}
): Promise<KnowledgeBaseAnswer> {
  if (options.runtimeContext) {
    const runtimeContext = createRuntimeContext(options.runtimeContext);

    return runWithRuntimeContext(runtimeContext, () =>
      askKnowledgeBase(query, {
        ...options,
        runtimeContext: undefined,
      })
    );
  }

  const docs = await retrieveContext(query, options.retrieval);
  const context = docs.map((document) => document.pageContent).join("\n\n");

  const response = await geminiFlash.invoke(`
Answer using ONLY this context. If the answer is not in the context, say you do not know.

Context:
${context}

Question:
${query}
`);

  return response.content;
}
