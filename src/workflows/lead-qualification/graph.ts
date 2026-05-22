import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

import type { LeadQualificationState } from "./state.js";

import { analyzeLeadNode } from "./nodes/analyze-lead.js";
import { coldLeadNode } from "./nodes/cold-lead.js";
import { fetchLeadNode } from "./nodes/fetch-lead.js";
import { generateFollowupNode } from "./nodes/generate-followup.js";
import { hotLeadNode } from "./nodes/hot-lead.js";
import { routeLeadNode } from "./nodes/route-lead.js";
import { scoreLeadNode } from "./nodes/score-lead.js";
import { warmLeadNode } from "./nodes/warm-lead.js";
import { leadRouter } from "./router.js";

const LeadQualificationAnnotation = Annotation.Root({
  email: Annotation<LeadQualificationState["email"]>(),
  leadData: Annotation<LeadQualificationState["leadData"]>(),
  analysis: Annotation<LeadQualificationState["analysis"]>(),
  score: Annotation<LeadQualificationState["score"]>(),
  followupMessage: Annotation<LeadQualificationState["followupMessage"]>(),
});

export const leadQualificationWorkflow = new StateGraph(
  LeadQualificationAnnotation
)
  .addNode("fetchLead", fetchLeadNode)
  .addNode("analyzeLead", analyzeLeadNode)
  .addNode("scoreLead", scoreLeadNode)
  .addNode("routeLead", routeLeadNode)
  .addNode("hotLead", hotLeadNode)
  .addNode("warmLead", warmLeadNode)
  .addNode("coldLead", coldLeadNode)
  .addNode("generateFollowup", generateFollowupNode)
  .addEdge(START, "fetchLead")
  .addEdge("fetchLead", "analyzeLead")
  .addEdge("analyzeLead", "scoreLead")
  .addEdge("scoreLead", "routeLead")
  .addConditionalEdges("routeLead", leadRouter, {
    hotLead: "hotLead",
    warmLead: "warmLead",
    coldLead: "coldLead",
  })
  .addEdge("hotLead", "generateFollowup")
  .addEdge("warmLead", "generateFollowup")
  .addEdge("coldLead", "generateFollowup")
  .addEdge("generateFollowup", END)
  .compile();
