import { logger } from "@/utils/logger.js";

import { buildServer } from "./app.js";

function serverPort() {
  const port = Number.parseInt(process.env.PORT ?? "3000", 10);

  return Number.isNaN(port) ? 3000 : port;
}

export async function startServer() {
  const server = await buildServer();
  const host = process.env.HOST ?? "0.0.0.0";
  const port = serverPort();
  let isClosing = false;

  async function close(signal: NodeJS.Signals) {
    if (isClosing) {
      return;
    }

    isClosing = true;

    logger.info({ signal }, "Shutting down Fastify runtime API");

    await server.close();
  }

  process.once("SIGINT", close);
  process.once("SIGTERM", close);

  await server.listen({ host, port });

  logger.info({ host, port }, "Fastify runtime API listening");

  return server;
}
