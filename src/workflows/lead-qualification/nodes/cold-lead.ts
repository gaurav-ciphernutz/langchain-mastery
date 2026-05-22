import type { LeadQualificationState } from "../state.js";

export async function coldLeadNode(
  state: LeadQualificationState
): Promise<LeadQualificationState> {
  console.log("COLD LEAD -> Nurture campaign");

  return {
    ...state,
  };
}
