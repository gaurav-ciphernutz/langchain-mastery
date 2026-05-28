import type {
  LeadQualificationState,
  WorkflowExecutionMetrics,
} from "@/workflows/lead-qualification/state.js";
import type { LeadQualificationNodeName } from "@/workflows/lead-qualification/types.js";
import { emitRuntimeEvent } from "@/runtime/events.js";

export function emitWorkflowEvent(node: string, message: string) {
  emitRuntimeEvent({
    type: "node.started",
    nodeName: node,
    message,
  });
}

export function recordNodeCompletion(
  node: LeadQualificationNodeName,
  startedAt: number,
  metrics: Partial<Omit<WorkflowExecutionMetrics, "nodeDurations">> = {}
): Pick<LeadQualificationState, "executionMetrics"> {
  const durationMs = Date.now() - startedAt;

  emitRuntimeEvent({
    type: "node.completed",
    nodeName: node,
    durationMs,
  });

  return {
    executionMetrics: {
      ...metrics,
      nodeDurations: {
        [node]: durationMs,
      },
    },
  };
}
