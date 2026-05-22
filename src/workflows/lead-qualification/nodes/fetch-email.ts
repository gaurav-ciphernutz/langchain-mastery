import {
  emitWorkflowEvent,
  recordNodeCompletion,
} from "@/utils/workflow-events.js";

import type { LeadQualificationState } from "../state.js";

export async function fetchEmailNode(
  state: LeadQualificationState
): Promise<Partial<LeadQualificationState>> {
  void state;

  const startedAt = Date.now();

  emitWorkflowEvent("fetchEmail", "Fetching email history");

  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    emailHistory: ["Asked about financing", "Interested in SUV"],
    ...recordNodeCompletion("fetchEmail", startedAt),
  };
}
