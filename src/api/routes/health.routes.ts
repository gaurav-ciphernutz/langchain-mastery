import type { FastifyPluginAsync } from "fastify";

import { successEnvelope } from "@/api/responses/index.js";
import { defaultJsonResponses } from "@/api/schemas/index.js";

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    "/health/live",
    {
      schema: {
        response: defaultJsonResponses,
      },
    },
    async (request) =>
      successEnvelope(request.runtimeContext, {
        status: "ok",
      })
  );

  fastify.get(
    "/health/ready",
    {
      schema: {
        response: defaultJsonResponses,
      },
    },
    async (request) =>
      successEnvelope(request.runtimeContext, {
        status: "ready",
      })
  );
};
