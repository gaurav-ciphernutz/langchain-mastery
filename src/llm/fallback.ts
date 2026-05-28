import { emitRuntimeEvent } from "@/runtime/events.js";

import { geminiFlash } from "./gemini.js";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export async function invokeWithFallback(prompt: string) {
  try {
    return await geminiFlash.invoke(prompt);
  } catch (error) {
    emitRuntimeEvent({
      type: "model.fallback",
      errorMessage: getErrorMessage(error),
    });

    throw error;
  }
}
