import type { LeadQualificationState } from "./state.js";
import type { LeadRoute } from "./types.js";

export function leadRouter(state: LeadQualificationState): LeadRoute {
  if ((state.score ?? 0) >= 80) {
    return "hotLead";
  }

  if ((state.score ?? 0) >= 50) {
    return "warmLead";
  }

  return "coldLead";
}
