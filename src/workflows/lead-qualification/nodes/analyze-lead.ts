import { AIMessage } from "@langchain/core/messages";

import { invokeWithFallback } from "@/llm/fallback.js";
import { MODELS } from "@/llm/models.js";
import { withRetry } from "@/utils/retry.js";
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

  const response = await withRetry(async () => {
    if (process.env.SIMULATE_ANALYZE_FAILURE === "true") {
      throw new Error("Simulated LLM failure");
    }

    return invokeWithFallback(`
    Analyze this enriched lead context:

    ${JSON.stringify(state.enrichedContext, null, 2)}

    Give:
    - short summary
    - lead category
    - recommended action
  `);
  });

  const analysis = contentToText(response.content);
  const totalTokens = response.usage_metadata?.total_tokens ?? 0;

  return {
    analysis,
    messages: [new AIMessage(`Lead Analysis: ${analysis}`)],
    ...recordNodeCompletion("analyzeLead", startedAt, {
      modelUsed: MODELS.GEMINI_3_5_FLASH,
      ...(totalTokens > 0 ? { totalTokens } : {}),
    }),
  };
}
