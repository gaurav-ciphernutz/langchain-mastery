import { createReactAgent } from "@langchain/langgraph/prebuilt";

import { geminiFlash } from "@/llm/gemini.js";

import { SYSTEM_PROMPT } from "./prompt.js";
import {
  generateFollowupMessageTool,
  getLeadByEmailTool,
  leadScoreTool,
  scheduleTestDriveTool,
} from "./tools.js";

export const leadQualifierAgent = createReactAgent({
  llm: geminiFlash,

  tools: [
    getLeadByEmailTool,
    leadScoreTool,
    generateFollowupMessageTool,
    scheduleTestDriveTool,
  ],

  prompt: SYSTEM_PROMPT,
});
