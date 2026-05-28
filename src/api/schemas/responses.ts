export const apiMetaSchema = {
  type: "object",
  required: [
    "requestId",
    "traceId",
    "threadId",
    "runtimeVersion",
    "schemaVersion",
  ],
  additionalProperties: false,
  properties: {
    requestId: { type: "string" },
    traceId: { type: "string" },
    threadId: { type: "string" },
    runtimeVersion: { type: "string" },
    schemaVersion: { type: "string" },
    workflowName: { type: "string" },
  },
} as const;

export const apiSuccessResponseSchema = {
  type: "object",
  required: ["status", "meta", "data"],
  additionalProperties: false,
  properties: {
    status: { type: "string", enum: ["success"] },
    meta: apiMetaSchema,
    data: true,
  },
} as const;

export const apiErrorResponseSchema = {
  type: "object",
  required: ["status", "meta", "error"],
  additionalProperties: false,
  properties: {
    status: { type: "string", enum: ["error"] },
    meta: apiMetaSchema,
    error: {
      type: "object",
      required: ["code", "message"],
      additionalProperties: false,
      properties: {
        code: { type: "string" },
        message: { type: "string" },
        details: true,
      },
    },
  },
} as const;

export const defaultJsonResponses = {
  200: apiSuccessResponseSchema,
  400: apiErrorResponseSchema,
  404: apiErrorResponseSchema,
  500: apiErrorResponseSchema,
} as const;
