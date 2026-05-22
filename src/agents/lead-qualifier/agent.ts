import { createAgent } from "langchain";

import { geminiFlash } from "@/llm/gemini.js";
import { createDynamicToolSelectionMiddleware } from "@/middleware/index.js";
import { ALL_REGISTERED_TOOLS } from "@/tools/index.js";

import { SYSTEM_PROMPT } from "./prompt.js";

export const leadQualifierTools = ALL_REGISTERED_TOOLS;

export const leadQualifierToolSelectionMiddleware =
  createDynamicToolSelectionMiddleware({
    rules: [
      {
        toolNames: ["get_lead_tool", "getLeadByEmail"],
        keywords: ["lead", "crm", "email", "fetch", "customer", "profile"],
      },
      {
        toolNames: ["lead_score_tool"],
        keywords: [
          "analyze",
          "category",
          "classify",
          "qualify",
          "quality",
          "score",
        ],
      },
      {
        toolNames: ["send_whatsapp_message", "generateFollowupMessage"],
        keywords: [
          "draft",
          "follow-up",
          "followup",
          "message",
          "reply",
          "whatsapp",
        ],
      },
      {
        toolNames: ["scheduleTestDrive"],
        keywords: [
          "appointment",
          "book",
          "schedule",
          "showroom",
          "test drive",
        ],
      },
    ],
  });

export const leadQualifierAgent = createAgent({
  model: geminiFlash,

  tools: leadQualifierTools,

  middleware: [leadQualifierToolSelectionMiddleware],

  systemPrompt: SYSTEM_PROMPT,
});
