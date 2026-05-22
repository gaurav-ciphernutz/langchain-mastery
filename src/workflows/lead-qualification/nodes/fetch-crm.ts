import {
  emitWorkflowEvent,
  recordNodeCompletion,
} from "@/utils/workflow-events.js";

import type { LeadQualificationState } from "../state.js";

export async function fetchCRMNode(
  state: LeadQualificationState
): Promise<Partial<LeadQualificationState>> {
  void state;

  const startedAt = Date.now();

  emitWorkflowEvent("fetchCRM", "Fetching CRM data");

  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    crmData: {
      previousPurchases: 2,
      preferredBrand: "Toyota",
    },
    ...recordNodeCompletion("fetchCRM", startedAt),
  };
}
