import type { RuntimeAwareBody } from "./runtime.js";
import { runtimeContextSchema } from "./runtime.js";

export const LEAD_QUALIFICATION_WORKFLOW_NAME = "lead-qualification";

export interface LeadQualificationInvokeBody extends RuntimeAwareBody {
  email: string;
  message?: string;
}

export interface LeadQualificationResumeBody extends RuntimeAwareBody {
  resume: "approved" | "rejected";
}

export type LeadQualificationStreamBody = LeadQualificationInvokeBody;

export const leadQualificationInvokeBodySchema = {
  type: "object",
  required: ["email"],
  additionalProperties: false,
  properties: {
    email: { type: "string", minLength: 1 },
    message: { type: "string", minLength: 1 },
    threadId: { type: "string", minLength: 1 },
    runtime: runtimeContextSchema,
  },
} as const;

export const leadQualificationResumeBodySchema = {
  type: "object",
  required: ["resume"],
  additionalProperties: false,
  properties: {
    resume: { type: "string", enum: ["approved", "rejected"] },
    threadId: { type: "string", minLength: 1 },
    runtime: runtimeContextSchema,
  },
} as const;
