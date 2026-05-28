import { createAgent } from "langchain";

import { geminiFlash } from "@/llm/gemini.js";
import type { RegisteredTool } from "@/tools/index.js";

type CreateAgentConfig = Parameters<typeof createAgent>[0];

export interface CreateDynamicAgentOptions {
  tools: RegisteredTool[];
  model?: CreateAgentConfig["model"];
  middleware?: CreateAgentConfig["middleware"];
  systemPrompt?: CreateAgentConfig["systemPrompt"];
}

export function createDynamicAgent(
  optionsOrTools: CreateDynamicAgentOptions | RegisteredTool[]
) {
  const options = Array.isArray(optionsOrTools)
    ? { tools: optionsOrTools }
    : optionsOrTools;

  return createAgent({
    model: options.model ?? geminiFlash,
    tools: options.tools,
    ...(options.middleware ? { middleware: options.middleware } : {}),
    ...(options.systemPrompt ? { systemPrompt: options.systemPrompt } : {}),
  });
}
