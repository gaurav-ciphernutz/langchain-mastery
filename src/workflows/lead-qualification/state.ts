import type { LeadData } from "./types.js";

export interface LeadQualificationState {
  email: string;

  leadData?: LeadData;

  analysis?: {
    summary: string;

    category: string;

    recommendedAction: string;
  };

  score?: number;

  followupMessage?: string;
}
