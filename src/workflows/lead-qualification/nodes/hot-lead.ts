import type { LeadQualificationState } from "../state.js";

export async function hotLeadNode(
  state: LeadQualificationState
): Promise<LeadQualificationState> {
  console.log("HOT LEAD -> Escalating to sales");

  return {
    ...state,
  };
}
