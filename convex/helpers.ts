import { models, toolConfigs, ToolName } from "../models";
import { internal } from "./_generated/api";

export function getTools(model: string, forceTool?: string) {
  const modelConfig = models[model as keyof typeof models];
  if (!modelConfig) {
    return { tools: {}, toolChoice: undefined };
  }

  const tools: Record<string, any> = {};
  for (const toolName of modelConfig.tools) {
    const toolConfig = toolConfigs[toolName];
    if (toolConfig) {
      tools[toolConfig.name] = toolConfig.tool;
    }
  }

  let toolChoice: { type: "tool"; toolName: string } | undefined;
  if (forceTool && modelConfig.tools.includes(forceTool as ToolName)) {
    const toolConfig = toolConfigs[forceTool as ToolName];
    if (toolConfig) {
      toolChoice = { type: "tool", toolName: toolConfig.name };
    }
  }

  return {
    tools,
    ...(toolChoice && { toolChoice }),
  };
}

export function getRequiredApiKeyForModel(
  modelName: string,
  apiKeys: {
    openai?: string;
    groq?: string;
    anthropic?: string;
    google?: string;
    openrouter?: string;
  } | null,
): string | null {
  if (!apiKeys) return null;

  // OpenAI models (via OpenAI API)
  if (
    modelName.startsWith("gpt-") ||
    modelName.startsWith("o3") ||
    modelName.startsWith("o4-")
  ) {
    return apiKeys.openai || null;
  }

  // Anthropic models (via Anthropic API)
  if (modelName.startsWith("claude-") && !modelName.includes("openrouter")) {
    return apiKeys.anthropic || null;
  }

  // Google models (via Google API)
  if (modelName.startsWith("gemini-") && !modelName.includes("openrouter")) {
    return apiKeys.google || null;
  }

  // Groq models
  if (
    modelName.includes("deepseek-r1") ||
    (modelName.includes("llama-") && !modelName.includes("openrouter"))
  ) {
    return apiKeys.groq || null;
  }

  // OpenRouter models
  if (modelName.includes("openrouter")) {
    return apiKeys.openrouter || null;
  }

  return null;
}

export async function verifyAuth(ctx: any, sessionToken: string) {
  // FIXME: make this not any
  const session = await ctx.runQuery(internal.betterAuth.getSession, {
    sessionToken: sessionToken,
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const user = await ctx.db
    .query("user")
    .filter((q: any) => q.eq(q.field("_id"), session.userId)) // FIXME: make this not any, I'm SO sorry...
    .first();

  return { session, user };
}
