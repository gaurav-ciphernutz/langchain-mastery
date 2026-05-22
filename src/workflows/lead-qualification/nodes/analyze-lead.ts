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

export async function analyzeLeadNode(
  state: LeadQualificationState
): Promise<Partial<LeadQualificationState>> {
  const startedAt = Date.now();

  emitWorkflowEvent("analyzeLead", "Analyzing lead data");

  const stream = await geminiFlash.stream(`
    Analyze this enriched lead context:

    ${JSON.stringify(state.enrichedContext, null, 2)}

    Give:
    - short summary
    - lead category
    - recommended action
  `);

  let analysis = "";
  let totalTokens = 0;

  for await (const chunk of stream) {
    analysis += contentToText(chunk.content);
    totalTokens = chunk.usage_metadata?.total_tokens ?? totalTokens;
  }

  return {
    analysis,
    messages: [new AIMessage(`Lead Analysis: ${analysis}`)],
    ...recordNodeCompletion("analyzeLead", startedAt, {
      modelUsed: MODELS.GEMINI_3_5_FLASH,
      ...(totalTokens > 0 ? { totalTokens } : {}),
    }),
  };
}
