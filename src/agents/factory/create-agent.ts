import { createAgent } from "langchain";

import { geminiFlash } from "@/llm/gemini.js";
import type { RegisteredTool } from "@/tools/index.js";

export function createDynamicAgent(tools: RegisteredTool[]) {
  return createAgent({
    model: geminiFlash,
    tools,
  });
}
