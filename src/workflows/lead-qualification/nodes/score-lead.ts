import {
  emitWorkflowEvent,
  recordNodeCompletion,
} from "@/utils/workflow-events.js";

import type { LeadQualificationState } from "../state.js";

export async function scoreLeadNode(
  state: LeadQualificationState
): Promise<Partial<LeadQualificationState>> {
  const startedAt = Date.now();

  emitWorkflowEvent("scoreLead", "Scoring lead");

  const lead = state.leadData;

  if (!lead) {
    return {
      score: 0,
      ...recordNodeCompletion("scoreLead", startedAt),
    };
  }

  let score = 0;

  if (lead.budget > 50000) {
    score += 50;
  }

  if (lead.timeline === "immediate") {
    score += 50;
  }

  return {
    score,
    ...recordNodeCompletion("scoreLead", startedAt),
  };
}
