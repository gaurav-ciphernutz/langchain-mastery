import { tool } from "@langchain/core/tools";

import { z } from "zod";

export const sendWhatsAppTool = tool(
  async ({ phone, message }) => {
    return {
      success: true,
      phone,
      message,
    };
  },
  {
    name: "send_whatsapp_message",

    description: "Send WhatsApp message to customer",

    schema: z.object({
      phone: z.string(),

      message: z.string(),
    }),
  }
);
