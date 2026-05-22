import {
  emitWorkflowEvent,
  recordNodeCompletion,
} from "@/utils/workflow-events.js";

import type { LeadQualificationState } from "../state.js";

export async function hotLeadNode(): Promise<Partial<LeadQualificationState>> {
  const startedAt = Date.now();

  emitWorkflowEvent("hotLead", "Escalating to sales");

  return {
    ...recordNodeCompletion("hotLead", startedAt),
  };
}
