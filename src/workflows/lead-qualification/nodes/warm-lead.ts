import type { LeadQualificationState } from "../state.js";

export async function warmLeadNode(
  state: LeadQualificationState
): Promise<LeadQualificationState> {
  console.log("WARM LEAD -> Follow-up sequence");

  return {
    ...state,
  };
}
