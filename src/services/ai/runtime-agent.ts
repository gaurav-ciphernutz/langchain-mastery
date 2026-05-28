import { HumanMessage } from "@langchain/core/messages";

import { createDynamicAgent } from "@/agents/factory/create-agent.js";
import { toolMiddleware } from "@/middleware/tools/tool-middleware.js";
import {
  createRuntimeContext,
  runWithRuntimeContext,
  toSerializableRuntimeContext,
  type RuntimeContextInput,
} from "@/runtime/context.js";

export async function executeAgent(
  input: string,
  runtimeContextInput: RuntimeContextInput = {}
) {
  const runtimeContext = createRuntimeContext(runtimeContextInput);

  return runWithRuntimeContext(runtimeContext, async () => {
    const tools = await toolMiddleware(input);
    const agent = createDynamicAgent({ tools });

    return agent.invoke(
      {
        messages: [new HumanMessage(input)],
      },
      {
        context: toSerializableRuntimeContext(runtimeContext),
        configurable: {
          thread_id: runtimeContext.threadId,
        },
      }
    );
  });
}
