import { tool } from "@langchain/core/tools";

import { z } from "zod";

const fakeLeads = [
  {
    email: "john@example.com",
    budget: 90000,
    timeline: "immediate",
  },
];

export const getLeadTool = tool(
  async ({ email }) => {
    const lead = fakeLeads.find((l) => l.email === email);

    if (!lead) {
      return "Lead not found";
    }

    return lead;
  },
  {
    name: "get_lead_tool",

    description: "Fetch lead details using email",

    schema: z.object({
      email: z.string().email(),
    }),
  }
);
