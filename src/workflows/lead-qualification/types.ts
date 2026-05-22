export interface LeadData {
  email: string;
  budget: number;
  timeline: string;
  interest: string;
}

export type LeadQualificationNodeName =
  | "fetchLead"
  | "analyzeLead"
  | "scoreLead"
  | "routeLead"
  | "hotLead"
  | "warmLead"
  | "coldLead"
  | "generateFollowup";

export type LeadRoute = "hotLead" | "warmLead" | "coldLead";
