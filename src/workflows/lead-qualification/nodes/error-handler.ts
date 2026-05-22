import type { LeadQualificationState } from "../state.js";

export async function errorHandlerNode(
  _state: LeadQualificationState
): Promise<Partial<LeadQualificationState>> {
  console.log("Handling workflow error");

  return {
    errors: [
      {
        timestamp: new Date().toISOString(),
        message: "Workflow failure detected",
      },
    ],
    workflowStatus: "failed",
  };
}
