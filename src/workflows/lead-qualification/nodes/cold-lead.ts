import {
  emitWorkflowEvent,
  recordNodeCompletion,
} from "@/utils/workflow-events.js";

import type { LeadQualificationState } from "../state.js";

export async function coldLeadNode(): Promise<Partial<LeadQualificationState>> {
  const startedAt = Date.now();

  emitWorkflowEvent("coldLead", "Sending lead to nurture campaign");

  return {
    ...recordNodeCompletion("coldLead", startedAt),
  };
}
