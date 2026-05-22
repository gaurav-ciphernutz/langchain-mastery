import { HumanMessage } from "@langchain/core/messages";

import { createDynamicAgent } from "@/agents/factory/create-agent.js";
import { toolMiddleware } from "@/middleware/tools/tool-middleware.js";

export async function executeAgent(input: string) {
  const tools = await toolMiddleware(input);
  const agent = createDynamicAgent(tools);

  return agent.invoke({
    messages: [new HumanMessage(input)],
  });
}
