import { logger } from "@/utils/logger.js";

import {
  getRuntimeContext,
  runtimeCorrelationFields,
  type RuntimeCorrelationFields,
} from "./context.js";

interface RuntimeEventBase {
  timestamp: string;
  runtime: RuntimeCorrelationFields;
}

export interface WorkflowStartedEvent extends RuntimeEventBase {
  type: "workflow.started";
  workflowName: string;
  inputKeys?: string[];
}

export interface WorkflowCompletedEvent extends RuntimeEventBase {
  type: "workflow.completed";
  workflowName: string;
  status: "completed" | "failed" | "waiting_approval";
  durationMs?: number;
}

export interface NodeStartedEvent extends RuntimeEventBase {
  type: "node.started";
  nodeName: string;
  workflowName?: string;
  message?: string;
}

export interface NodeCompletedEvent extends RuntimeEventBase {
  type: "node.completed";
  nodeName: string;
  workflowName?: string;
  durationMs: number;
}

export interface NodeFailedEvent extends RuntimeEventBase {
  type: "node.failed";
  nodeName: string;
  workflowName?: string;
  errorMessage: string;
  retryable: boolean;
  attempt: number;
}

export interface ToolExecutedEvent extends RuntimeEventBase {
  type: "tool.executed";
  toolName: string;
  durationMs?: number;
  requiresApproval?: boolean;
  sideEffectLevel?: string;
}

export interface RetrievalCompletedEvent extends RuntimeEventBase {
  type: "retrieval.completed";
  queryLength: number;
  k: number;
  resultCount: number;
  durationMs?: number;
}

export interface RetryAttemptEvent extends RuntimeEventBase {
  type: "retry.attempt";
  attempt: number;
  maxAttempts: number;
  delayMs: number;
  errorMessage: string;
}

export interface ModelFallbackEvent extends RuntimeEventBase {
  type: "model.fallback";
  modelName?: string;
  errorMessage: string;
}

export interface DocumentIngestedEvent extends RuntimeEventBase {
  type: "document.ingested";
  source: string;
  chunkCount: number;
}

export type RuntimeEvent =
  | WorkflowStartedEvent
  | WorkflowCompletedEvent
  | NodeStartedEvent
  | NodeCompletedEvent
  | NodeFailedEvent
  | ToolExecutedEvent
  | RetrievalCompletedEvent
  | RetryAttemptEvent
  | ModelFallbackEvent
  | DocumentIngestedEvent;

type RuntimeEventInput<TEvent extends RuntimeEvent = RuntimeEvent> =
  TEvent extends RuntimeEvent
    ? Omit<TEvent, "timestamp" | "runtime"> & { timestamp?: string }
    : never;

export function emitRuntimeEvent(
  event: RuntimeEventInput
): RuntimeEvent {
  const runtime = runtimeCorrelationFields(getRuntimeContext());
  const emittedEvent = {
    ...event,
    timestamp: event.timestamp ?? new Date().toISOString(),
    runtime,
  } as RuntimeEvent;

  logger.info({ event: emittedEvent }, emittedEvent.type);

  return emittedEvent;
}
