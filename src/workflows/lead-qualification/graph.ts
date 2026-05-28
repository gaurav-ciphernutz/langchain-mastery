import { END, START, StateGraph } from "@langchain/langgraph";

import { checkpointer } from "@/memory/sqlite/checkpointer.js";
import { type RuntimeRunnableConfig } from "@/runtime/context.js";
import { createSafeNode } from "@/utils/safe-node.js";
import { enrichmentSubgraph } from "@/workflows/subgraphs/enrichment-subgraph.js";

import { LeadStateAnnotation } from "./state.js";
import type { LeadQualificationState } from "./state.js";

import { analyzeLeadNode } from "./nodes/analyze-lead.js";
import { coldLeadNode } from "./nodes/cold-lead.js";
import { errorHandlerNode } from "./nodes/error-handler.js";
import { fetchLeadNode } from "./nodes/fetch-lead.js";
import { generateFollowupNode } from "./nodes/generate-followup.js";
import { hotLeadNode } from "./nodes/hot-lead.js";
import { requestApprovalNode } from "./nodes/request-approval.js";
import { routeLeadNode } from "./nodes/route-lead.js";
import { scoreLeadNode } from "./nodes/score-lead.js";
import { warmLeadNode } from "./nodes/warm-lead.js";
import { leadRouter } from "./router.js";

async function runEnrichmentSubgraph(
  state: LeadQualificationState,
  config?: RuntimeRunnableConfig
) {
  return enrichmentSubgraph.invoke(state, config);
}

function isWorkflowFailed(state: LeadQualificationState) {
  return state.workflowStatus === "failed" || state.failure !== undefined;
}

function routeTo<TDestination extends string>(destination: TDestination) {
  return (state: LeadQualificationState) =>
    isWorkflowFailed(state) ? "errorHandler" : destination;
}

function routeLeadOrFail(state: LeadQualificationState) {
  return isWorkflowFailed(state) ? "errorHandler" : leadRouter(state);
}

function finishOrFail(state: LeadQualificationState) {
  return isWorkflowFailed(state) ? "errorHandler" : END;
}

const graph = new StateGraph(LeadStateAnnotation)
  .addNode("fetchLead", createSafeNode("fetchLead", fetchLeadNode))
  .addNode(
    "enrichmentSubgraph",
    createSafeNode("enrichmentSubgraph", runEnrichmentSubgraph)
  )
  .addNode("analyzeLead", createSafeNode("analyzeLead", analyzeLeadNode))
  .addNode("scoreLead", createSafeNode("scoreLead", scoreLeadNode))
  .addNode("routeLead", createSafeNode("routeLead", routeLeadNode))
  .addNode("hotLead", createSafeNode("hotLead", hotLeadNode))
  .addNode("warmLead", createSafeNode("warmLead", warmLeadNode))
  .addNode("coldLead", createSafeNode("coldLead", coldLeadNode))
  .addNode("requestApproval", createSafeNode("requestApproval", requestApprovalNode))
  .addNode(
    "generateFollowup",
    createSafeNode("generateFollowup", generateFollowupNode)
  )
  .addNode("errorHandler", createSafeNode("errorHandler", errorHandlerNode))
  .addEdge(START, "fetchLead")
  .addConditionalEdges("fetchLead", routeTo("enrichmentSubgraph"), {
    enrichmentSubgraph: "enrichmentSubgraph",
    errorHandler: "errorHandler",
  })
  .addConditionalEdges("enrichmentSubgraph", routeTo("analyzeLead"), {
    analyzeLead: "analyzeLead",
    errorHandler: "errorHandler",
  })
  .addConditionalEdges("analyzeLead", routeTo("scoreLead"), {
    scoreLead: "scoreLead",
    errorHandler: "errorHandler",
  })
  .addConditionalEdges("scoreLead", routeTo("routeLead"), {
    routeLead: "routeLead",
    errorHandler: "errorHandler",
  })
  .addConditionalEdges("routeLead", routeLeadOrFail, {
    hotLead: "hotLead",
    warmLead: "warmLead",
    coldLead: "coldLead",
    errorHandler: "errorHandler",
  })
  .addConditionalEdges("hotLead", routeTo("requestApproval"), {
    requestApproval: "requestApproval",
    errorHandler: "errorHandler",
  })
  .addConditionalEdges("requestApproval", routeTo("generateFollowup"), {
    generateFollowup: "generateFollowup",
    errorHandler: "errorHandler",
  })
  .addConditionalEdges("warmLead", routeTo("generateFollowup"), {
    generateFollowup: "generateFollowup",
    errorHandler: "errorHandler",
  })
  .addConditionalEdges("coldLead", routeTo("generateFollowup"), {
    generateFollowup: "generateFollowup",
    errorHandler: "errorHandler",
  })
  .addConditionalEdges("generateFollowup", finishOrFail, {
    [END]: END,
    errorHandler: "errorHandler",
  })
  .addEdge("errorHandler", END);

export const leadQualificationWorkflow = graph.compile({
  checkpointer,
});
