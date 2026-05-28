import type { FastifyPluginAsync, FastifyRequest } from "fastify";

import {
  createRuntimeContext,
  runtimeCorrelationFields,
  type RuntimeContext,
} from "@/runtime/context.js";
import { logger } from "@/utils/logger.js";

declare module "fastify" {
  interface FastifyRequest {
    requestStartedAt?: number;
  }
}

function runtimeForRequest(request: FastifyRequest): RuntimeContext {
  const runtimeContext = (request as { runtimeContext?: RuntimeContext | null })
    .runtimeContext;

  return (
    runtimeContext ??
    createRuntimeContext({
      requestId: request.id,
      traceId: request.id,
      threadId: request.id,
    })
  );
}

export const observabilityPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("onRequest", async (request) => {
    request.requestStartedAt = Date.now();
  });

  fastify.addHook("onResponse", async (request, reply) => {
    const runtimeContext = runtimeForRequest(request);

    logger.info(
      {
        runtime: runtimeCorrelationFields(runtimeContext),
        http: {
          method: request.method,
          url: request.url,
          statusCode: reply.statusCode,
          durationMs: Date.now() - (request.requestStartedAt ?? Date.now()),
        },
      },
      "HTTP request completed"
    );
  });

  fastify.addHook("onError", async (request, _reply, error) => {
    const runtimeContext = runtimeForRequest(request);

    logger.error(
      {
        runtime: runtimeCorrelationFields(runtimeContext),
        error,
        http: {
          method: request.method,
          url: request.url,
        },
      },
      "HTTP request failed"
    );
  });
};
