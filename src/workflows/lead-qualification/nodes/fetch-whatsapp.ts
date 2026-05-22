import {
  emitWorkflowEvent,
  recordNodeCompletion,
} from "@/utils/workflow-events.js";

import type { LeadQualificationState } from "../state.js";

export async function fetchWhatsAppNode(
  state: LeadQualificationState
): Promise<Partial<LeadQualificationState>> {
  void state;

  const startedAt = Date.now();

  emitWorkflowEvent("fetchWhatsApp", "Fetching WhatsApp history");

  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    whatsappHistory: ["Requested brochure", "Asked about discounts"],
    ...recordNodeCompletion("fetchWhatsApp", startedAt),
  };
}
