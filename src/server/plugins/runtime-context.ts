import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";

import {
  createRuntimeContext,
  runWithRuntimeContext,
  type RuntimeContext,
  type RuntimeContextInput,
} from "@/runtime/context.js";
import {
  isRuntimeAwareBody,
  normalizeRuntimeBudgets,
} from "@/api/schemas/runtime.js";

declare module "fastify" {
  interface FastifyRequest {
    runtimeContext: RuntimeContext;
  }
}

function firstHeader(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function headerString(request: FastifyRequest, name: string) {
  const value = firstHeader(request.headers[name]);

  return value && value.length > 0 ? value : undefined;
}

function permissionsFromHeader(request: FastifyRequest) {
  return headerString(request, "x-permissions")
    ?.split(",")
    .map((permission) => permission.trim())
    .filter(Boolean);
}

function requestMetadata(request: FastifyRequest) {
  return {
    http: {
      method: request.method,
      url: request.url,
      ip: request.ip,
      userAgent: headerString(request, "user-agent"),
    },
  };
}

function requestAbortSignal(request: FastifyRequest, reply: FastifyReply) {
  const controller = new AbortController();

  request.raw.once("close", () => {
    if (!request.raw.complete) {
      controller.abort();
    }
  });

  reply.raw.once("close", () => {
    if (!reply.raw.writableEnded) {
      controller.abort();
    }
  });

  return controller.signal;
}

function runtimeInputFromRequest(
  request: FastifyRequest,
  reply: FastifyReply
): RuntimeContextInput {
  const body = isRuntimeAwareBody(request.body) ? request.body : undefined;
  const bodyRuntime = body?.runtime ?? {};
  const requestId = headerString(request, "x-request-id") ?? request.id;
  const threadId =
    bodyRuntime.threadId ??
    body?.threadId ??
    headerString(request, "x-thread-id") ??
    requestId;
  const metadata = {
    ...bodyRuntime.metadata,
    ...requestMetadata(request),
  };

  return {
    requestId,
    threadId,
    tenantId: bodyRuntime.tenantId ?? headerString(request, "x-tenant-id"),
    userId: bodyRuntime.userId ?? headerString(request, "x-user-id"),
    traceId:
      bodyRuntime.traceId ?? headerString(request, "x-trace-id") ?? requestId,
    locale: bodyRuntime.locale ?? headerString(request, "x-locale"),
    permissions: bodyRuntime.permissions ?? permissionsFromHeader(request),
    featureFlags: bodyRuntime.featureFlags,
    metadata,
    budgets: normalizeRuntimeBudgets(bodyRuntime.budgets),
    abortSignal: requestAbortSignal(request, reply),
  };
}

export const runtimeContextPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorateRequest("runtimeContext", null as unknown as RuntimeContext);

  fastify.addHook("preHandler", (request, reply, done) => {
    const runtimeContext = createRuntimeContext(
      runtimeInputFromRequest(request, reply)
    );

    request.runtimeContext = runtimeContext;

    runWithRuntimeContext(runtimeContext, done);
  });
};
