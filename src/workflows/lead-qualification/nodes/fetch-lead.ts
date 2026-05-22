import {
  emitWorkflowEvent,
  recordNodeCompletion,
} from "@/utils/workflow-events.js";

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
): Promise<Partial<LeadQualificationState>> {
  const startedAt = Date.now();

  emitWorkflowEvent("fetchLead", "Fetching lead data");

  const lead = fakeLeadDB.find((leadData) => leadData.email === state.email);

  return {
    leadData: lead,
    ...recordNodeCompletion("fetchLead", startedAt, {
      startedAt: new Date(startedAt).toISOString(),
    }),
  };
}
