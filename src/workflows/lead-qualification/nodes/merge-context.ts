import {
  emitWorkflowEvent,
  recordNodeCompletion,
} from "@/utils/workflow-events.js";

import type { LeadQualificationState } from "../state.js";

export async function mergeContextNode(
  state: LeadQualificationState
): Promise<Partial<LeadQualificationState>> {
  const startedAt = Date.now();

  emitWorkflowEvent("mergeContext", "Merging enriched lead context");

  return {
    enrichedContext: {
      crm: state.crmData,
      emails: state.emailHistory,
      whatsapp: state.whatsappHistory,
    },
    ...recordNodeCompletion("mergeContext", startedAt),
  };
}
