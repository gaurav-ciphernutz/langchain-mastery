import type { RuntimeBudgets, RuntimeContextInput } from "@/runtime/context.js";

export type RuntimeContextPayload = Pick<
  RuntimeContextInput,
  | "threadId"
  | "tenantId"
  | "userId"
  | "traceId"
  | "locale"
  | "permissions"
  | "featureFlags"
  | "metadata"
  | "budgets"
>;

export interface RuntimeAwareBody {
  threadId?: string;
  runtime?: RuntimeContextPayload;
}

export const runtimeBudgetsSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    maxTokens: { type: "number", exclusiveMinimum: 0 },
    maxCostUsd: { type: "number", exclusiveMinimum: 0 },
    maxDurationMs: { type: "number", exclusiveMinimum: 0 },
  },
} as const;

export const runtimeContextSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    threadId: { type: "string", minLength: 1 },
    tenantId: { type: "string", minLength: 1 },
    userId: { type: "string", minLength: 1 },
    traceId: { type: "string", minLength: 1 },
    locale: { type: "string", minLength: 1 },
    permissions: {
      type: "array",
      items: { type: "string", minLength: 1 },
    },
    featureFlags: {
      type: "object",
      additionalProperties: { type: "boolean" },
    },
    metadata: {
      type: "object",
      additionalProperties: true,
    },
    budgets: runtimeBudgetsSchema,
  },
} as const;

export function isRuntimeAwareBody(value: unknown): value is RuntimeAwareBody {
  return typeof value === "object" && value !== null;
}

export function normalizeRuntimeBudgets(
  budgets: RuntimeBudgets | undefined
): RuntimeBudgets | undefined {
  if (!budgets) {
    return undefined;
  }

  return {
    ...(budgets.maxTokens ? { maxTokens: budgets.maxTokens } : {}),
    ...(budgets.maxCostUsd ? { maxCostUsd: budgets.maxCostUsd } : {}),
    ...(budgets.maxDurationMs ? { maxDurationMs: budgets.maxDurationMs } : {}),
  };
}
