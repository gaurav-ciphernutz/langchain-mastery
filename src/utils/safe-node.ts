import { isGraphBubbleUp } from "@langchain/langgraph";

type NodeHandler<TState, TUpdate extends object> = (
  state: TState
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
  return async (state: TState) => {
    try {
      return await handler(state);
    } catch (error) {
      if (isGraphBubbleUp(error)) {
        throw error;
      }

      console.error(`[${nodeName}] failed`, error);

      return {
        errors: [
          {
            node: nodeName,
            timestamp: new Date().toISOString(),
            message: getErrorMessage(error),
          },
        ],
      };
    }
  };
}
