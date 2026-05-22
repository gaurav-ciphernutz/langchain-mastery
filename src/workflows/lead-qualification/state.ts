import type { BaseMessage } from "@langchain/core/messages";
import { Annotation } from "@langchain/langgraph";

import type {
  CrmData,
  EmailHistory,
  EnrichedContext,
  LeadData,
  LeadQualificationNodeName,
  WhatsAppHistory,
} from "./types.js";

export interface WorkflowExecutionMetrics {
  startedAt?: string;
  completedAt?: string;
  nodeDurations: Partial<Record<LeadQualificationNodeName, number>>;
  totalTokens?: number;
  modelUsed?: string;
}

export const LeadStateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (current, update) => current.concat(update),
    default: () => [],
  }),

  email: Annotation<string>(),

  leadData: Annotation<LeadData | undefined>(),

  crmData: Annotation<CrmData | undefined>(),

  emailHistory: Annotation<EmailHistory | undefined>(),

  whatsappHistory: Annotation<WhatsAppHistory | undefined>(),

  enrichedContext: Annotation<EnrichedContext | undefined>(),

  analysis: Annotation<string | undefined>(),

  score: Annotation<number | undefined>(),

  approvalStatus: Annotation<"pending" | "approved" | "rejected" | undefined>(),

  followupMessage: Annotation<string | undefined>(),

  executionMetrics: Annotation<WorkflowExecutionMetrics>({
    reducer: (current, update) => ({
      ...current,
      ...update,
      nodeDurations: {
        ...current.nodeDurations,
        ...update.nodeDurations,
      },
    }),
    default: () => ({
      nodeDurations: {},
    }),
  }),
});

export type LeadQualificationState = typeof LeadStateAnnotation.State;
