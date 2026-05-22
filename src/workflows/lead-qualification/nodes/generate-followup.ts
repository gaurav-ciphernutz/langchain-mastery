import { AIMessage } from "@langchain/core/messages";

import { geminiFlash } from "@/llm/gemini.js";
import { MODELS } from "@/llm/models.js";
import {
  emitWorkflowEvent,
  recordNodeCompletion,
} from "@/utils/workflow-events.js";

import type { LeadQualificationState } from "../state.js";

function contentToText(content: unknown) {
  if (typeof content === "string") {
    return content;
  }

  return JSON.stringify(content) ?? "";
}

export async function generateFollowupNode(
  state: LeadQualificationState
): Promise<Partial<LeadQualificationState>> {
  const startedAt = Date.now();

  emitWorkflowEvent("generateFollowup", "Generating follow-up message");

  const stream = await geminiFlash.stream(`
    Write a short WhatsApp follow-up message.

    Lead Details:

    ${JSON.stringify(state.leadData)}

    Analysis:

    ${JSON.stringify(state.analysis)}
  `);

  let followupMessage = "";
  let followupTokens = 0;

  for await (const chunk of stream) {
    followupMessage += contentToText(chunk.content);
    followupTokens = chunk.usage_metadata?.total_tokens ?? followupTokens;
  }

  return {
    messages: [new AIMessage(`Follow-up Generated: ${followupMessage}`)],
    followupMessage,
    ...recordNodeCompletion("generateFollowup", startedAt, {
      completedAt: new Date().toISOString(),
      modelUsed: MODELS.GEMINI_3_5_FLASH,
      ...(followupTokens > 0
        ? { totalTokens: (state.executionMetrics.totalTokens ?? 0) + followupTokens }
        : {}),
    }),
  };
}
