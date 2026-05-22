import {
  emitWorkflowEvent,
  recordNodeCompletion,
} from "@/utils/workflow-events.js";

import type { LeadQualificationState } from "../state.js";

export async function routeLeadNode(
  state: LeadQualificationState
): Promise<Partial<LeadQualificationState>> {
  const startedAt = Date.now();

  emitWorkflowEvent("routeLead", `Routing lead with score ${state.score ?? 0}`);

  return {
    ...recordNodeCompletion("routeLead", startedAt),
  };
}
