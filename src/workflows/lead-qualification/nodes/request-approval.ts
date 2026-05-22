import { interrupt } from "@langchain/langgraph";

import {
  emitWorkflowEvent,
  recordNodeCompletion,
} from "@/utils/workflow-events.js";

import type { LeadQualificationState } from "../state.js";

type ApprovalStatus = Exclude<LeadQualificationState["approvalStatus"], "pending" | undefined>;

export async function requestApprovalNode(
  state: LeadQualificationState
): Promise<Partial<LeadQualificationState>> {
  const startedAt = Date.now();

  emitWorkflowEvent("requestApproval", "Requesting human approval");

  const approvalStatus = interrupt<
    {
      message: string;
      score: number | undefined;
      analysis: string | undefined;
      approvalStatus: "pending";
    },
    ApprovalStatus
  >({
    message: "Human approval required",
    score: state.score,
    analysis: state.analysis,
    approvalStatus: "pending",
  });

  return {
    approvalStatus,
    ...recordNodeCompletion("requestApproval", startedAt),
  };
}
