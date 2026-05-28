export interface LeadData {
  email: string;
  budget: number;
  timeline: string;
  interest: string;
}

export interface CrmData {
  previousPurchases: number;
  preferredBrand: string;
}

export type EmailHistory = string[];

export type WhatsAppHistory = string[];

export interface EnrichedContext {
  crm: CrmData | undefined;
  emails: EmailHistory | undefined;
  whatsapp: WhatsAppHistory | undefined;
}

export type LeadQualificationNodeName =
  | "fetchLead"
  | "fetchCRM"
  | "fetchEmail"
  | "fetchWhatsApp"
  | "mergeContext"
  | "analyzeLead"
  | "scoreLead"
  | "routeLead"
  | "hotLead"
  | "warmLead"
  | "coldLead"
  | "requestApproval"
  | "generateFollowup"
  | "errorHandler";

export type LeadRoute = "hotLead" | "warmLead" | "coldLead";
