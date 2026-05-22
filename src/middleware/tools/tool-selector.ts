import { TOOL_CATEGORIES, TOOL_REGISTRY } from "@/tools/index.js";

import type { RegisteredTool } from "@/tools/index.js";

function uniqueTools(tools: RegisteredTool[]) {
  const seen = new Set<string>();
  const dedupedTools: RegisteredTool[] = [];

  for (const tool of tools) {
    const name = (tool as { name?: unknown }).name;
    const key = typeof name === "string" ? name : JSON.stringify(tool);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    dedupedTools.push(tool);
  }

  return dedupedTools;
}

function includesAny(input: string, keywords: string[]) {
  return keywords.some((keyword) => input.includes(keyword));
}

export function selectTools(input: string) {
  const normalized = input.toLowerCase();
  const selectedTools: RegisteredTool[] = [];

  if (
    includesAny(normalized, [
      "crm",
      "customer",
      "email",
      "fetch",
      "lead",
      "profile",
    ])
  ) {
    selectedTools.push(...TOOL_REGISTRY[TOOL_CATEGORIES.CRM]);
  }

  if (
    includesAny(normalized, [
      "draft",
      "follow-up",
      "followup",
      "message",
      "send",
      "whatsapp",
    ])
  ) {
    selectedTools.push(...TOOL_REGISTRY[TOOL_CATEGORIES.MESSAGING]);
  }

  if (
    includesAny(normalized, [
      "analyze",
      "category",
      "classify",
      "qualify",
      "qualification",
      "score",
    ])
  ) {
    selectedTools.push(...TOOL_REGISTRY[TOOL_CATEGORIES.QUALIFICATION]);
  }

  if (
    includesAny(normalized, [
      "appointment",
      "book",
      "schedule",
      "showroom",
      "test drive",
    ])
  ) {
    selectedTools.push(...TOOL_REGISTRY[TOOL_CATEGORIES.SCHEDULING]);
  }

  return uniqueTools(selectedTools);
}
