import type {
  LeadQualificationState,
  WorkflowExecutionMetrics,
} from "@/workflows/lead-qualification/state.js";
import type { LeadQualificationNodeName } from "@/workflows/lead-qualification/types.js";

export function emitWorkflowEvent(node: string, message: string) {
  console.log(`[${node}] ${message}`);
}

export function recordNodeCompletion(
  node: LeadQualificationNodeName,
  startedAt: number,
  metrics: Partial<Omit<WorkflowExecutionMetrics, "nodeDurations">> = {}
): Pick<LeadQualificationState, "executionMetrics"> {
  const durationMs = Date.now() - startedAt;

  emitWorkflowEvent(node, `Completed in ${durationMs}ms`);

  return {
    executionMetrics: {
      ...metrics,
      nodeDurations: {
        [node]: durationMs,
      },
    },
  };
}
