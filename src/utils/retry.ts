import { emitRuntimeEvent } from "@/runtime/events.js";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      emitRuntimeEvent({
        type: "retry.attempt",
        attempt: attempt + 1,
        maxAttempts: retries,
        delayMs: delay,
        errorMessage: getErrorMessage(error),
      });

      await new Promise((resolve) => {
        setTimeout(resolve, delay);
      });
    }
  }

  throw lastError;
}
