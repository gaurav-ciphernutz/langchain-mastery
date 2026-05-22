import type { ClientTool, ServerTool } from "@langchain/core/tools";

import {
  generateFollowupMessageTool,
  getLeadByEmailTool,
  leadScoreTool,
  scheduleTestDriveTool,
} from "@/agents/lead-qualifier/tools.js";

import { TOOL_CATEGORIES } from "./categories.js";
import { getLeadTool } from "./crm/get-lead.js";
import { sendWhatsAppTool } from "./whatsapp/send-message.js";

export type RegisteredTool = ClientTool | ServerTool;

export const TOOL_REGISTRY = {
  [TOOL_CATEGORIES.CRM]: [getLeadTool, getLeadByEmailTool],

  [TOOL_CATEGORIES.MESSAGING]: [
    sendWhatsAppTool,
    generateFollowupMessageTool,
  ],

  [TOOL_CATEGORIES.QUALIFICATION]: [leadScoreTool],

  [TOOL_CATEGORIES.SCHEDULING]: [scheduleTestDriveTool],
} satisfies Record<string, RegisteredTool[]>;

export const ALL_REGISTERED_TOOLS = Object.values(TOOL_REGISTRY).flat();
