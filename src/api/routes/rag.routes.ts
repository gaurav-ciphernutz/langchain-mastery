import type { FastifyPluginAsync } from "fastify";

import { askRagKnowledgeBase } from "@/api/controllers/index.js";
import { successEnvelope } from "@/api/responses/index.js";
import {
  defaultJsonResponses,
  ragAskBodySchema,
  type RagAskBody,
} from "@/api/schemas/index.js";

export const ragRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: RagAskBody }>(
    "/v1/rag/ask",
    {
      schema: {
        body: ragAskBodySchema,
        response: defaultJsonResponses,
      },
    },
    async (request) => {
      const answer = await askRagKnowledgeBase(
        request.body,
        request.runtimeContext
      );

      return successEnvelope(request.runtimeContext, {
        answer,
      });
    }
  );
};
