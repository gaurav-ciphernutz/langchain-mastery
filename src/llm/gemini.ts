import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

import { env } from "../config/env.js";

import { MODELS } from "./models.js";

export const geminiFlash = new ChatGoogleGenerativeAI({
  model: MODELS.GEMINI_3_5_FLASH,
  apiKey: env.GOOGLE_API_KEY,

  temperature: 0.2,

  maxOutputTokens: 2048,
});
