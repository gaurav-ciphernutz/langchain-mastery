import { geminiFlash } from "@/llm/gemini.js";

import { leadAnalysisSchema } from "@/schemas/lead.js";

export async function analyzeLead(input: string) {
  const structuredLLM = geminiFlash.withStructuredOutput(leadAnalysisSchema);

  return structuredLLM.invoke(`
    Analyze this lead:

    ${input}
  `);
}
