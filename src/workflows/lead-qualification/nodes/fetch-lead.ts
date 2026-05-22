import type { LeadQualificationState } from "../state.js";
import type { LeadData } from "../types.js";

const fakeLeadDB: LeadData[] = [
  {
    email: "john@example.com",
    budget: 90000,
    timeline: "immediate",
    interest: "SUV",
  },
];

export async function fetchLeadNode(
  state: LeadQualificationState
): Promise<LeadQualificationState> {
  const lead = fakeLeadDB.find((leadData) => leadData.email === state.email);

  return {
    ...state,

    leadData: lead,
  };
}
