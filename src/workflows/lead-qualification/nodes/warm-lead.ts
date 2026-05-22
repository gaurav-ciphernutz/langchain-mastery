import {
  emitWorkflowEvent,
  recordNodeCompletion,
} from "@/utils/workflow-events.js";

import type { LeadQualificationState } from "../state.js";

export async function warmLeadNode(): Promise<Partial<LeadQualificationState>> {
  const startedAt = Date.now();

  emitWorkflowEvent("warmLead", "Starting follow-up sequence");

  return {
    ...recordNodeCompletion("warmLead", startedAt),
  };
}
