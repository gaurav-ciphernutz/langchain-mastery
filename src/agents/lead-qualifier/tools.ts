import { tool } from "@langchain/core/tools";

import { z } from "zod";

const MOCK_LEADS = [
  {
    id: "lead_000",
    name: "John Carter",
    email: "john@example.com",
    phone: "+1-555-0100",
    city: "Austin",
    interestedVehicle: "Tesla Model Y",
    budget: 90000,
    timeline: "immediate",
  },
  {
    id: "lead_001",
    name: "Aarav Mehta",
    email: "aarav.mehta@example.com",
    phone: "+91-90000-00001",
    city: "Bengaluru",
    interestedVehicle: "Tesla Model 3",
    budget: 90000,
    timeline: "immediate",
  },
  {
    id: "lead_002",
    name: "Riya Sharma",
    email: "riya.sharma@example.com",
    phone: "+91-90000-00002",
    city: "Mumbai",
    interestedVehicle: "Hyundai Ioniq 5",
    budget: 65000,
    timeline: "1_month",
  },
] as const;

export const leadScoreTool = tool(
  async ({ budget, timeline }) => {
    let score = 0;

    if (budget > 50000) {
      score += 50;
    }

    if (timeline === "immediate") {
      score += 50;
    }

    return {
      leadScore: score,
      category: score >= 80 ? "hot" : score >= 50 ? "warm" : "cold",
    };
  },
  {
    name: "lead_score_tool",

    description: "Score incoming leads based on budget and purchase timeline",

    schema: z.object({
      budget: z.number(),

      timeline: z.enum(["immediate", "1_month", "3_months", "6_months"]),
    }),
  }
);

export const getLeadByEmailTool = tool(
  async ({ email }) => {
    const lead = MOCK_LEADS.find(
      (mockLead) => mockLead.email.toLowerCase() === email.toLowerCase()
    );

    if (!lead) {
      return {
        found: false,
        message: "No lead found for the provided email address.",
      };
    }

    return {
      found: true,
      lead,
    };
  },
  {
    name: "getLeadByEmail",

    description:
      "Fetch a lead profile from the mock CRM using the lead's email address",

    schema: z.object({
      email: z.string().email(),
    }),
  }
);

export const generateFollowupMessageTool = tool(
  async ({ name, vehicle, category, nextStep }) => {
    const urgencyByCategory = {
      hot: "I can help you lock in the next available slot",
      warm: "I can help you compare options and plan the next step",
      cold: "I can share details so you can review them at your pace",
    } satisfies Record<string, string>;

    return {
      channel: "whatsapp",
      message: `Hi ${name}, thanks for your interest in the ${vehicle}. ${urgencyByCategory[category]}. ${nextStep}`,
    };
  },
  {
    name: "generateFollowupMessage",

    description:
      "Draft a concise WhatsApp follow-up message for a qualified vehicle lead",

    schema: z.object({
      name: z.string(),
      vehicle: z.string(),
      category: z.enum(["hot", "warm", "cold"]),
      nextStep: z.string(),
    }),
  }
);

export const scheduleTestDriveTool = tool(
  async ({ leadId, vehicle, preferredDate, preferredTime, location }) => {
    return {
      appointmentId: `td_${leadId}_${preferredDate.replaceAll("-", "")}`,
      status: "scheduled",
      vehicle,
      scheduledFor: `${preferredDate} ${preferredTime}`,
      location,
      reminder:
        "Send the WhatsApp draft after confirming the appointment details with the lead.",
    };
  },
  {
    name: "scheduleTestDrive",

    description:
      "Schedule a mock test drive appointment for a qualified vehicle lead",

    schema: z.object({
      leadId: z.string(),
      vehicle: z.string(),
      preferredDate: z.string(),
      preferredTime: z.string(),
      location: z.string(),
    }),
  }
);
