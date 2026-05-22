import { z } from "zod";

export const leadAnalysisSchema = z.object({
  leadCategory: z.enum(["hot", "warm", "cold"]),

  score: z.number(),

  summary: z.string(),

  recommendedAction: z.string(),
});

export type LeadAnalysis = z.infer<typeof leadAnalysisSchema>;
