import { END, START, StateGraph } from "@langchain/langgraph";

import { checkpointer } from "@/memory/sqlite/checkpointer.js";
import { createSafeNode } from "@/utils/safe-node.js";
import { enrichmentSubgraph } from "@/workflows/subgraphs/enrichment-subgraph.js";

import { LeadStateAnnotation } from "./state.js";
import type { LeadQualificationState } from "./state.js";

import { analyzeLeadNode } from "./nodes/analyze-lead.js";
import { coldLeadNode } from "./nodes/cold-lead.js";
import { fetchLeadNode } from "./nodes/fetch-lead.js";
import { generateFollowupNode } from "./nodes/generate-followup.js";
import { hotLeadNode } from "./nodes/hot-lead.js";
import { requestApprovalNode } from "./nodes/request-approval.js";
import { routeLeadNode } from "./nodes/route-lead.js";
import { scoreLeadNode } from "./nodes/score-lead.js";
import { warmLeadNode } from "./nodes/warm-lead.js";
import { leadRouter } from "./router.js";

async function runEnrichmentSubgraph(state: LeadQualificationState) {
  return enrichmentSubgraph.invoke(state);
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
  .addEdge(START, "fetchLead")
  .addEdge("fetchLead", "enrichmentSubgraph")
  .addEdge("enrichmentSubgraph", "analyzeLead")
  .addEdge("analyzeLead", "scoreLead")
  .addEdge("scoreLead", "routeLead")
  .addConditionalEdges("routeLead", leadRouter, {
    hotLead: "hotLead",
    warmLead: "warmLead",
    coldLead: "coldLead",
  })
  .addEdge("hotLead", "requestApproval")
  .addEdge("requestApproval", "generateFollowup")
  .addEdge("warmLead", "generateFollowup")
  .addEdge("coldLead", "generateFollowup")
  .addEdge("generateFollowup", END);

export const leadQualificationWorkflow = graph.compile({
  checkpointer,
});
