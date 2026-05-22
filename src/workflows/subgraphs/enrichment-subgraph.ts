import { END, START, StateGraph } from "@langchain/langgraph";

import { fetchCRMNode } from "../lead-qualification/nodes/fetch-crm.js";
import { fetchEmailNode } from "../lead-qualification/nodes/fetch-email.js";
import { fetchWhatsAppNode } from "../lead-qualification/nodes/fetch-whatsapp.js";
import { mergeContextNode } from "../lead-qualification/nodes/merge-context.js";
import { LeadStateAnnotation } from "../lead-qualification/state.js";

const graph = new StateGraph(LeadStateAnnotation)
  .addNode("fetchCRM", fetchCRMNode)
  .addNode("fetchEmail", fetchEmailNode)
  .addNode("fetchWhatsApp", fetchWhatsAppNode)
  .addNode("mergeContext", mergeContextNode)
  .addEdge(START, "fetchCRM")
  .addEdge(START, "fetchEmail")
  .addEdge(START, "fetchWhatsApp")
  .addEdge(["fetchCRM", "fetchEmail", "fetchWhatsApp"], "mergeContext")
  .addEdge("mergeContext", END);

export const enrichmentSubgraph = graph.compile();
