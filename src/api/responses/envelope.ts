import type { RuntimeContext } from "@/runtime/context.js";

export interface ApiMeta {
  requestId: string;
  traceId: string;
  threadId: string;
  runtimeVersion: string;
  schemaVersion: string;
  workflowName?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiSuccessEnvelope<TData> {
  status: "success";
  meta: ApiMeta;
  data: TData;
}

export interface ApiErrorEnvelope {
  status: "error";
  meta: ApiMeta;
  error: ApiError;
}

export function createApiMeta(
  runtimeContext: RuntimeContext,
  options: { workflowName?: string } = {}
): ApiMeta {
  return {
    requestId: runtimeContext.requestId,
    traceId: runtimeContext.traceId,
    threadId: runtimeContext.threadId,
    runtimeVersion: runtimeContext.runtimeVersion,
    schemaVersion: runtimeContext.schemaVersion,
    ...(options.workflowName ? { workflowName: options.workflowName } : {}),
  };
}

export function successEnvelope<TData>(
  runtimeContext: RuntimeContext,
  data: TData,
  options: { workflowName?: string } = {}
): ApiSuccessEnvelope<TData> {
  return {
    status: "success",
    meta: createApiMeta(runtimeContext, options),
    data,
  };
}

export function errorEnvelope(
  runtimeContext: RuntimeContext,
  error: ApiError,
  options: { workflowName?: string } = {}
): ApiErrorEnvelope {
  return {
    status: "error",
    meta: createApiMeta(runtimeContext, options),
    error,
  };
}
