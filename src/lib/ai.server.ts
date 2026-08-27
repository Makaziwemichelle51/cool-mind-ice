import { streamText, Output, NoObjectGeneratedError } from "ai";
import type { z } from "zod";
import { createLovableAiGatewayProvider, AI_MODEL } from "./ai-gateway.server";

function getModel() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured (missing LOVABLE_API_KEY).");
  return createLovableAiGatewayProvider(key)(AI_MODEL);
}

function friendlyError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("429")) {
    throw new Error("AI is busy right now (rate limited). Please try again shortly.");
  }
  if (message.includes("402")) {
    throw new Error("AI credits are exhausted. Please add credits to continue.");
  }
  if (message.includes("403")) {
    throw new Error("AI access is blocked for this workspace.");
  }
  throw new Error(message || "AI request failed.");
}

export async function runText(system: string, prompt: string) {
  try {
    const result = streamText({ model: getModel(), system, prompt });
    return (await result.text).trim();
  } catch (error) {
    friendlyError(error);
  }
}

export async function runObject<T>(
  system: string,
  prompt: string,
  schema: z.ZodType<T>,
  fallback: T,
): Promise<T> {
  try {
    const result = streamText({
      model: getModel(),
      system,
      prompt,
      output: Output.object({ schema }),
    });
    return (await result.output) as T;
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) return fallback;
    friendlyError(error);
  }
}
