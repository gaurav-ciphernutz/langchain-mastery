import type { RuntimeAwareBody } from "./runtime.js";
import { runtimeContextSchema } from "./runtime.js";

export interface RagAskBody extends RuntimeAwareBody {
  query: string;
  retrieval?: {
    k?: number;
    filters?: Record<string, unknown>;
  };
}

export const ragAskBodySchema = {
  type: "object",
  required: ["query"],
  additionalProperties: false,
  properties: {
    query: { type: "string", minLength: 1 },
    retrieval: {
      type: "object",
      additionalProperties: false,
      properties: {
        k: { type: "integer", minimum: 1 },
        filters: {
          type: "object",
          additionalProperties: true,
        },
      },
    },
    threadId: { type: "string", minLength: 1 },
    runtime: runtimeContextSchema,
  },
} as const;
