import websocket from "@fastify/websocket";
import type { FastifyPluginAsync } from "fastify";

export const websocketPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(websocket);

  fastify.get("/v1/ws", { websocket: true }, (socket, request) => {
    const runtimeContext = request.runtimeContext;

    socket.send(
      JSON.stringify({
        event: "connection.ready",
        meta: {
          requestId: runtimeContext.requestId,
          traceId: runtimeContext.traceId,
          threadId: runtimeContext.threadId,
        },
        data: {
          message: "WebSocket runtime channel ready",
        },
      })
    );

    socket.on("message", (message: { toString(): string }) => {
      socket.send(
        JSON.stringify({
          event: "connection.echo",
          meta: {
            requestId: runtimeContext.requestId,
            traceId: runtimeContext.traceId,
            threadId: runtimeContext.threadId,
          },
          data: {
            message: message.toString(),
          },
        })
      );
    });
  });
};
