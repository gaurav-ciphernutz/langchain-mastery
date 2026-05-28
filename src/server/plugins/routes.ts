import type { FastifyPluginAsync } from "fastify";

import { healthRoutes, ragRoutes, workflowRoutes } from "@/api/routes/index.js";

export const routesPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(healthRoutes);
  await fastify.register(workflowRoutes);
  await fastify.register(ragRoutes);
};
