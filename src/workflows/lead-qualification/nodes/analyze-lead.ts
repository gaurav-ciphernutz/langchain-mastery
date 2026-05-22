import { geminiFlash } from "@/llm/gemini.js";

import type { LeadQualificationState } from "../state.js";

export async function analyzeLeadNode(
  state: LeadQualificationState
): Promise<LeadQualificationState> {
  const response = await geminiFlash.invoke(`
    Analyze this customer lead:

    ${JSON.stringify(state.leadData)}

    Give:
    - short summary
    - lead category
    - recommended action
  `);

  return {
    ...state,

    analysis: {
      summary: response.content.toString(),

      category: "hot",

      recommendedAction: "Immediate sales follow-up",
    },
  };
}
