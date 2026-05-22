import { geminiFlash } from "@/llm/gemini.js";

import type { LeadQualificationState } from "../state.js";

export async function generateFollowupNode(
  state: LeadQualificationState
): Promise<LeadQualificationState> {
  const response = await geminiFlash.invoke(`
    Write a short WhatsApp follow-up message.

    Lead Details:

    ${JSON.stringify(state.leadData)}

    Analysis:

    ${JSON.stringify(state.analysis)}
  `);

  return {
    ...state,

    followupMessage: response.content.toString(),
  };
}
