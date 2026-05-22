import type { LeadQualificationState } from "../state.js";

export async function scoreLeadNode(
  state: LeadQualificationState
): Promise<LeadQualificationState> {
  const lead = state.leadData;

  if (!lead) {
    return {
      ...state,
      score: 0,
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
    ...state,

    score,
  };
}
