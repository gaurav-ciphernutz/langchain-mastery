import { isGraphBubbleUp } from "@langchain/langgraph";

import {
  runWithRuntimeContextFromConfig,
  type RuntimeRunnableConfig,
} from "@/runtime/context.js";
import { emitRuntimeEvent } from "@/runtime/events.js";

type NodeHandler<TState, TUpdate extends object> = (
  state: TState,
  config?: RuntimeRunnableConfig
) => Promise<TUpdate> | TUpdate;

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export function createSafeNode<TState, TUpdate extends object>(
  nodeName: string,
  handler: NodeHandler<TState, TUpdate>
) {
  return async (state: TState, config?: RuntimeRunnableConfig) =>
    runWithRuntimeContextFromConfig(config, async () => {
    try {
      return await handler(state, config);
    } catch (error) {
      if (isGraphBubbleUp(error)) {
        throw error;
      }

      const message = getErrorMessage(error);
      const timestamp = new Date().toISOString();
      const attempt = 1;

      emitRuntimeEvent({
        type: "node.failed",
        nodeName,
        errorMessage: message,
        retryable: true,
        attempt,
      });

      return {
        workflowStatus: "failed",
        failure: {
          node: nodeName,
          timestamp,
          message,
          retryable: true,
          attempt,
          deadLetterEligible: true,
        },
        errors: [
          {
            node: nodeName,
            timestamp,
            message,
            retryable: true,
            attempt,
          },
        ],
      } as TUpdate;
    }
  });
}
