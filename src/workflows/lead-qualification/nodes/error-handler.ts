import { recordNodeCompletion } from "@/utils/workflow-events.js";

import type { LeadQualificationState } from "../state.js";

export async function errorHandlerNode(
  state: LeadQualificationState
): Promise<Partial<LeadQualificationState>> {
  const startedAt = Date.now();

  return {
    ...(state.failure
      ? {}
      : {
          errors: [
            {
              timestamp: new Date().toISOString(),
              message: "Workflow failure detected",
            },
          ],
        }),
    workflowStatus: "failed",
    ...recordNodeCompletion("errorHandler", startedAt),
  };
}
