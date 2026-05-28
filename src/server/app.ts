import { randomUUID } from "node:crypto";
import type { IncomingMessage } from "node:http";

import Fastify from "fastify";

import {
  errorHandlerPlugin,
  observabilityPlugin,
  routesPlugin,
  runtimeContextPlugin,
  websocketPlugin,
} from "./plugins/index.js";

function requestIdFromHeader(request: IncomingMessage) {
  const requestId = request.headers["x-request-id"];

  if (Array.isArray(requestId)) {
    return requestId[0] ?? randomUUID();
  }

  return requestId ?? randomUUID();
}

export async function buildServer() {
  const fastify = Fastify({
    logger: false,
    genReqId: requestIdFromHeader,
  });

  await errorHandlerPlugin(fastify, {});
  await observabilityPlugin(fastify, {});
  await runtimeContextPlugin(fastify, {});
  await websocketPlugin(fastify, {});
  await routesPlugin(fastify, {});

  return fastify;
}
