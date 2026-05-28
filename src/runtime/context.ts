import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

import { z } from "zod";

export const DEFAULT_RUNTIME_VERSION = "1.0.0";
export const DEFAULT_RUNTIME_SCHEMA_VERSION = "1.0.0";

export interface RuntimeBudgets {
  maxTokens?: number;
  maxCostUsd?: number;
  maxDurationMs?: number;
}

export interface SerializableRuntimeContext {
  [key: string]: unknown;
  requestId: string;
  threadId: string;
  tenantId: string;
  userId: string;
  traceId: string;
  locale: string;
  permissions: string[];
  featureFlags: Record<string, boolean>;
  metadata: Record<string, unknown>;
  budgets: RuntimeBudgets;
  runtimeVersion: string;
  schemaVersion: string;
}

export interface RuntimeContext extends SerializableRuntimeContext {
  abortSignal?: AbortSignal;
}

export type RuntimeContextInput = Partial<RuntimeContext>;

export interface RuntimeRunnableConfig {
  context?: Partial<SerializableRuntimeContext>;
  configurable?: Record<string, unknown>;
  signal?: AbortSignal;
  abortSignal?: AbortSignal;
}

export interface RuntimeCorrelationFields {
  requestId: string;
  threadId: string;
  tenantId: string;
  userId: string;
  traceId: string;
  locale: string;
  runtimeVersion: string;
  schemaVersion: string;
}

const RuntimeBudgetsSchema = z.object({
  maxTokens: z.number().positive().optional(),
  maxCostUsd: z.number().positive().optional(),
  maxDurationMs: z.number().positive().optional(),
});

export const RuntimeContextSchema = z.object({
  requestId: z.string().optional(),
  threadId: z.string().optional(),
  tenantId: z.string().optional(),
  userId: z.string().optional(),
  traceId: z.string().optional(),
  locale: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  featureFlags: z.record(z.string(), z.boolean()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  budgets: RuntimeBudgetsSchema.optional(),
  runtimeVersion: z.string().optional(),
  schemaVersion: z.string().optional(),
});

const runtimeStorage = new AsyncLocalStorage<RuntimeContext>();

const fallbackRuntimeContext = createRuntimeContext({
  requestId: "local-request",
  threadId: "local-thread",
  tenantId: "local-tenant",
  userId: "local-user",
  traceId: "local-trace",
});

function stringFromConfig(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function threadIdFromConfig(config?: RuntimeRunnableConfig) {
  return stringFromConfig(config?.configurable?.thread_id);
}

export function createRuntimeContext(
  input: RuntimeContextInput = {}
): RuntimeContext {
  const requestId = input.requestId ?? randomUUID();
  const threadId = input.threadId ?? requestId;
  const traceId = input.traceId ?? requestId;

  return {
    requestId,
    threadId,
    tenantId: input.tenantId ?? "default",
    userId: input.userId ?? "anonymous",
    traceId,
    locale: input.locale ?? "en",
    permissions: input.permissions ?? ["*"],
    featureFlags: input.featureFlags ?? {},
    metadata: input.metadata ?? {},
    budgets: input.budgets ?? {},
    runtimeVersion: input.runtimeVersion ?? DEFAULT_RUNTIME_VERSION,
    schemaVersion: input.schemaVersion ?? DEFAULT_RUNTIME_SCHEMA_VERSION,
    ...(input.abortSignal ? { abortSignal: input.abortSignal } : {}),
  };
}

export function resolveRuntimeContext(
  config?: RuntimeRunnableConfig
): RuntimeContext {
  const context = RuntimeContextSchema.parse(config?.context ?? {});

  return createRuntimeContext({
    ...context,
    threadId: context.threadId ?? threadIdFromConfig(config),
    abortSignal: config?.abortSignal ?? config?.signal,
  });
}

export function toSerializableRuntimeContext(
  context: RuntimeContext
): SerializableRuntimeContext {
  return {
    requestId: context.requestId,
    threadId: context.threadId,
    tenantId: context.tenantId,
    userId: context.userId,
    traceId: context.traceId,
    locale: context.locale,
    permissions: context.permissions,
    featureFlags: context.featureFlags,
    metadata: context.metadata,
    budgets: context.budgets,
    runtimeVersion: context.runtimeVersion,
    schemaVersion: context.schemaVersion,
  };
}

export function createRuntimeContextConfig(
  input: RuntimeContextInput = {}
): SerializableRuntimeContext {
  return toSerializableRuntimeContext(createRuntimeContext(input));
}

export function getCurrentRuntimeContext() {
  return runtimeStorage.getStore();
}

export function getRuntimeContext() {
  return getCurrentRuntimeContext() ?? fallbackRuntimeContext;
}

export function runWithRuntimeContext<T>(
  context: RuntimeContext,
  callback: () => T
) {
  return runtimeStorage.run(context, callback);
}

export function runWithRuntimeContextFromConfig<T>(
  config: RuntimeRunnableConfig | undefined,
  callback: (context: RuntimeContext) => T
) {
  const context = resolveRuntimeContext(config);

  return runWithRuntimeContext(context, () => callback(context));
}

export function runtimeCorrelationFields(
  context: RuntimeContext = getRuntimeContext()
): RuntimeCorrelationFields {
  return {
    requestId: context.requestId,
    threadId: context.threadId,
    tenantId: context.tenantId,
    userId: context.userId,
    traceId: context.traceId,
    locale: context.locale,
    runtimeVersion: context.runtimeVersion,
    schemaVersion: context.schemaVersion,
  };
}
