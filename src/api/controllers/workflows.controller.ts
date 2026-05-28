import { HumanMessage } from "@langchain/core/messages";
import { Command } from "@langchain/langgraph";

import type { StreamEnvelope } from "@/api/responses/index.js";
import {
  LEAD_QUALIFICATION_WORKFLOW_NAME,
  type LeadQualificationInvokeBody,
  type LeadQualificationResumeBody,
  type LeadQualificationStreamBody,
} from "@/api/schemas/index.js";
import {
  runWithRuntimeContext,
  toSerializableRuntimeContext,
  type RuntimeContext,
} from "@/runtime/context.js";
import { emitRuntimeEvent } from "@/runtime/events.js";
import { leadQualificationWorkflow } from "@/workflows/lead-qualification/graph.js";

function workflowConfig(runtimeContext: RuntimeContext) {
  return {
    context: toSerializableRuntimeContext(runtimeContext),
    configurable: {
      thread_id: runtimeContext.threadId,
    },
    signal: runtimeContext.abortSignal,
    abortSignal: runtimeContext.abortSignal,
  };
}

function leadQualificationInput(body: LeadQualificationInvokeBody) {
  return {
    email: body.email,
    messages: [new HumanMessage(body.message ?? "Analyze this lead")],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function workflowStatus(output: unknown) {
  if (!isRecord(output)) {
    return "completed";
  }

  if ("__interrupt__" in output) {
    return "waiting_approval";
  }

  return output.workflowStatus === "failed" ? "failed" : "completed";
}

function streamMeta(runtimeContext: RuntimeContext) {
  return {
    requestId: runtimeContext.requestId,
    traceId: runtimeContext.traceId,
    threadId: runtimeContext.threadId,
    workflowName: LEAD_QUALIFICATION_WORKFLOW_NAME,
  };
}

export async function invokeLeadQualificationWorkflow(
  body: LeadQualificationInvokeBody,
  runtimeContext: RuntimeContext
) {
  return runWithRuntimeContext(runtimeContext, async () => {
    const startedAt = Date.now();

    emitRuntimeEvent({
      type: "workflow.started",
      workflowName: LEAD_QUALIFICATION_WORKFLOW_NAME,
      inputKeys: Object.keys(body),
    });

    try {
      const result = await leadQualificationWorkflow.invoke(
        leadQualificationInput(body),
        workflowConfig(runtimeContext)
      );

      emitRuntimeEvent({
        type: "workflow.completed",
        workflowName: LEAD_QUALIFICATION_WORKFLOW_NAME,
        status: workflowStatus(result),
        durationMs: Date.now() - startedAt,
      });

      return result;
    } catch (error) {
      emitRuntimeEvent({
        type: "workflow.completed",
        workflowName: LEAD_QUALIFICATION_WORKFLOW_NAME,
        status: "failed",
        durationMs: Date.now() - startedAt,
      });

      throw error;
    }
  });
}

export async function resumeLeadQualificationWorkflow(
  body: LeadQualificationResumeBody,
  runtimeContext: RuntimeContext
) {
  return runWithRuntimeContext(runtimeContext, async () => {
    const startedAt = Date.now();

    emitRuntimeEvent({
      type: "workflow.started",
      workflowName: LEAD_QUALIFICATION_WORKFLOW_NAME,
      inputKeys: ["resume"],
    });

    try {
      const result = await leadQualificationWorkflow.invoke(
        new Command({
          resume: body.resume,
        }),
        workflowConfig(runtimeContext)
      );

      emitRuntimeEvent({
        type: "workflow.completed",
        workflowName: LEAD_QUALIFICATION_WORKFLOW_NAME,
        status: workflowStatus(result),
        durationMs: Date.now() - startedAt,
      });

      return result;
    } catch (error) {
      emitRuntimeEvent({
        type: "workflow.completed",
        workflowName: LEAD_QUALIFICATION_WORKFLOW_NAME,
        status: "failed",
        durationMs: Date.now() - startedAt,
      });

      throw error;
    }
  });
}

export async function* streamLeadQualificationWorkflow(
  body: LeadQualificationStreamBody,
  runtimeContext: RuntimeContext
): AsyncGenerator<StreamEnvelope> {
  const startedAt = Date.now();

  emitRuntimeEvent({
    type: "workflow.started",
    workflowName: LEAD_QUALIFICATION_WORKFLOW_NAME,
    inputKeys: Object.keys(body),
  });

  try {
    const stream = await leadQualificationWorkflow.stream(
      leadQualificationInput(body),
      {
        ...workflowConfig(runtimeContext),
        streamMode: "updates",
      }
    );

    let lastChunk: unknown;

    for await (const chunk of stream) {
      lastChunk = chunk;

      yield {
        event: "workflow.update",
        meta: streamMeta(runtimeContext),
        data: chunk,
      };
    }

    emitRuntimeEvent({
      type: "workflow.completed",
      workflowName: LEAD_QUALIFICATION_WORKFLOW_NAME,
      status: workflowStatus(lastChunk),
      durationMs: Date.now() - startedAt,
    });

    yield {
      event: "workflow.completed",
      meta: streamMeta(runtimeContext),
      data: {
        status: workflowStatus(lastChunk),
      },
    };
  } catch (error) {
    emitRuntimeEvent({
      type: "workflow.completed",
      workflowName: LEAD_QUALIFICATION_WORKFLOW_NAME,
      status: "failed",
      durationMs: Date.now() - startedAt,
    });

    yield {
      event: "workflow.error",
      meta: streamMeta(runtimeContext),
      data: {
        message: error instanceof Error ? error.message : String(error),
      },
    };
  }
}
