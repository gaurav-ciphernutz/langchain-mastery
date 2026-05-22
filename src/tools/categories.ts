export const TOOL_CATEGORIES = {
  CRM: "crm",
  MESSAGING: "messaging",
  QUALIFICATION: "qualification",
  SCHEDULING: "scheduling",
} as const;

export type ToolCategory =
  (typeof TOOL_CATEGORIES)[keyof typeof TOOL_CATEGORIES];
