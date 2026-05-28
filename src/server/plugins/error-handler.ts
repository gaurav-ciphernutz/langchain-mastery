import type { FastifyError, FastifyPluginAsync, FastifyRequest } from "fastify";

import { errorEnvelope } from "@/api/responses/index.js";
import {
  createRuntimeContext,
  type RuntimeContext,
} from "@/runtime/context.js";

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

function statusCodeForError(error: FastifyError) {
  return error.statusCode ?? (error.validation ? 400 : 500);
}

function errorCode(error: FastifyError, statusCode: number) {
  if (error.validation) {
    return "validation_error";
  }

  if (statusCode === 404) {
    return "not_found";
  }

  if (statusCode >= 500) {
    return "internal_error";
  }

  return "request_error";
}

function errorMessage(error: FastifyError, statusCode: number) {
  if (statusCode >= 500) {
    return "Internal server error";
  }

  return error.message;
}

export const errorHandlerPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.setNotFoundHandler((request, reply) => {
    reply.status(404).send(
      errorEnvelope(runtimeForRequest(request), {
        code: "not_found",
        message: "Route not found",
      })
    );
  });

  fastify.setErrorHandler((error, request, reply) => {
    const fastifyError = error as FastifyError;
    const statusCode = statusCodeForError(fastifyError);

    reply.status(statusCode).send(
      errorEnvelope(runtimeForRequest(request), {
        code: errorCode(fastifyError, statusCode),
        message: errorMessage(fastifyError, statusCode),
        ...(fastifyError.validation
          ? { details: fastifyError.validation }
          : {}),
      })
    );
  });
};
