import { geminiFlash } from "./gemini.js";

export async function invokeWithFallback(prompt: string) {
  try {
    return await geminiFlash.invoke(prompt);
  } catch (error) {
    console.log("Primary model failed");

    throw error;
  }
}
