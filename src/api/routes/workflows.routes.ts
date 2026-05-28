import type { FastifyPluginAsync } from "fastify";

import {
  invokeLeadQualificationWorkflow,
  resumeLeadQualificationWorkflow,
  streamLeadQualificationWorkflow,
} from "@/api/controllers/index.js";
import {
  formatServerSentEvent,
  successEnvelope,
} from "@/api/responses/index.js";
import {
  LEAD_QUALIFICATION_WORKFLOW_NAME,
  defaultJsonResponses,
  leadQualificationInvokeBodySchema,
  leadQualificationResumeBodySchema,
  type LeadQualificationInvokeBody,
  type LeadQualificationResumeBody,
  type LeadQualificationStreamBody,
} from "@/api/schemas/index.js";

export const workflowRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: LeadQualificationInvokeBody }>(
    "/v1/workflows/lead-qualification/invoke",
    {
      schema: {
        body: leadQualificationInvokeBodySchema,
        response: defaultJsonResponses,
      },
    },
    async (request) => {
      const data = await invokeLeadQualificationWorkflow(
        request.body,
        request.runtimeContext
      );

      return successEnvelope(request.runtimeContext, data, {
        workflowName: LEAD_QUALIFICATION_WORKFLOW_NAME,
      });
    }
  );

  fastify.post<{ Body: LeadQualificationResumeBody }>(
    "/v1/workflows/lead-qualification/resume",
    {
      schema: {
        body: leadQualificationResumeBodySchema,
        response: defaultJsonResponses,
      },
    },
    async (request) => {
      const data = await resumeLeadQualificationWorkflow(
        request.body,
        request.runtimeContext
      );

      return successEnvelope(request.runtimeContext, data, {
        workflowName: LEAD_QUALIFICATION_WORKFLOW_NAME,
      });
    }
  );

  fastify.post<{ Body: LeadQualificationStreamBody }>(
    "/v1/workflows/lead-qualification/stream",
    {
      schema: {
        body: leadQualificationInvokeBodySchema,
      },
    },
    async (request, reply) => {
      reply
        .header("content-type", "text/event-stream; charset=utf-8")
        .header("cache-control", "no-cache, no-transform")
        .header("connection", "keep-alive");

      reply.raw.flushHeaders?.();

      for await (const event of streamLeadQualificationWorkflow(
        request.body,
        request.runtimeContext
      )) {
        if (request.runtimeContext.abortSignal?.aborted) {
          break;
        }

        reply.raw.write(formatServerSentEvent(event));
      }

      reply.raw.end();

      return reply;
    }
  );
};
