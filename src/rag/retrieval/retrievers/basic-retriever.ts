import { vectorStore } from "@/rag/vectorstores/chroma.js";

export async function retrieveContext(query: string) {
  return vectorStore.similaritySearch(query, 4);
}
