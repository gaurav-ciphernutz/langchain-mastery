import { geminiFlash } from "@/llm/gemini.js";
import { retrieveContext } from "@/rag/retrieval/retrievers/basic-retriever.js";

export async function askKnowledgeBase(query: string) {
  const docs = await retrieveContext(query);
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
