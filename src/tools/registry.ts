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

export type ToolSideEffectLevel = "none" | "read" | "write" | "external";

export interface ToolPolicy {
  permissions: string[];
  timeoutMs: number;
  retryCount: number;
  requiresApproval: boolean;
  sideEffectLevel: ToolSideEffectLevel;
}

export interface ToolDescriptor {
  name: string;
  category: string;
  tool: RegisteredTool;
  policy: ToolPolicy;
}

function toolName(tool: RegisteredTool) {
  const name = (tool as { name?: unknown }).name;

  if (typeof name !== "string" || name.length === 0) {
    throw new Error("Registered tools must have a stable name");
  }

  return name;
}

function descriptor(
  category: string,
  tool: RegisteredTool,
  policy: ToolPolicy
): ToolDescriptor {
  return {
    name: toolName(tool),
    category,
    tool,
    policy,
  };
}

export const TOOL_DESCRIPTORS = [
  descriptor(TOOL_CATEGORIES.CRM, getLeadTool, {
    permissions: ["crm:read"],
    timeoutMs: 5_000,
    retryCount: 1,
    requiresApproval: false,
    sideEffectLevel: "read",
  }),
  descriptor(TOOL_CATEGORIES.CRM, getLeadByEmailTool, {
    permissions: ["crm:read"],
    timeoutMs: 5_000,
    retryCount: 1,
    requiresApproval: false,
    sideEffectLevel: "read",
  }),
  descriptor(TOOL_CATEGORIES.MESSAGING, sendWhatsAppTool, {
    permissions: ["messaging:send"],
    timeoutMs: 10_000,
    retryCount: 0,
    requiresApproval: true,
    sideEffectLevel: "external",
  }),
  descriptor(TOOL_CATEGORIES.MESSAGING, generateFollowupMessageTool, {
    permissions: ["messaging:draft"],
    timeoutMs: 10_000,
    retryCount: 1,
    requiresApproval: false,
    sideEffectLevel: "none",
  }),
  descriptor(TOOL_CATEGORIES.QUALIFICATION, leadScoreTool, {
    permissions: ["lead:score"],
    timeoutMs: 5_000,
    retryCount: 1,
    requiresApproval: false,
    sideEffectLevel: "none",
  }),
  descriptor(TOOL_CATEGORIES.SCHEDULING, scheduleTestDriveTool, {
    permissions: ["scheduling:write"],
    timeoutMs: 10_000,
    retryCount: 0,
    requiresApproval: true,
    sideEffectLevel: "write",
  }),
] satisfies ToolDescriptor[];

export const TOOL_REGISTRY = {
  [TOOL_CATEGORIES.CRM]: TOOL_DESCRIPTORS.filter(
    (descriptor) => descriptor.category === TOOL_CATEGORIES.CRM
  ).map((descriptor) => descriptor.tool),

  [TOOL_CATEGORIES.MESSAGING]: TOOL_DESCRIPTORS.filter(
    (descriptor) => descriptor.category === TOOL_CATEGORIES.MESSAGING
  ).map((descriptor) => descriptor.tool),

  [TOOL_CATEGORIES.QUALIFICATION]: TOOL_DESCRIPTORS.filter(
    (descriptor) => descriptor.category === TOOL_CATEGORIES.QUALIFICATION
  ).map((descriptor) => descriptor.tool),

  [TOOL_CATEGORIES.SCHEDULING]: TOOL_DESCRIPTORS.filter(
    (descriptor) => descriptor.category === TOOL_CATEGORIES.SCHEDULING
  ).map((descriptor) => descriptor.tool),
} satisfies Record<string, RegisteredTool[]>;

export const ALL_REGISTERED_TOOLS = Object.values(TOOL_REGISTRY).flat();

export const TOOL_DESCRIPTOR_BY_NAME = new Map(
  TOOL_DESCRIPTORS.map((descriptor) => [descriptor.name, descriptor])
);

export function getToolDescriptor(toolOrName: RegisteredTool | string) {
  const name =
    typeof toolOrName === "string" ? toolOrName : toolName(toolOrName);

  return TOOL_DESCRIPTOR_BY_NAME.get(name);
}

export function hasRequiredToolPermissions(
  permissions: string[],
  policy: ToolPolicy
) {
  if (permissions.includes("*")) {
    return true;
  }

  return policy.permissions.every((permission) =>
    permissions.includes(permission)
  );
}

export function filterToolsByPermissions(
  tools: RegisteredTool[],
  permissions: string[],
  options: { failOpen?: boolean } = {}
) {
  if (options.failOpen !== false && permissions.length === 0) {
    return tools;
  }

  return tools.filter((tool) => {
    const descriptor = getToolDescriptor(tool);

    if (!descriptor) {
      return options.failOpen !== false;
    }

    return hasRequiredToolPermissions(permissions, descriptor.policy);
  });
}
