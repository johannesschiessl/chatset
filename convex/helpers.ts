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

export async function verifyAuth(ctx: any, sessionToken: string) {
  // FIXME: make this not any
  console.log(
    "[VERIFY AUTH] Verifying auth, Received sessionToken: ",
    sessionToken,
  );
  console.log(sessionToken);
  const session = await ctx.runQuery(internal.betterAuth.getSession, {
    sessionToken: sessionToken,
  });

  console.log(session);

  if (!session) {
    throw new Error("Unauthorized");
  }

  console.log("[VERIFY AUTH] Session: ", session);

  const user = await ctx.db
    .query("user")
    .filter((q: any) => q.eq(q.field("_id"), session.userId)) // FIXME: make this not any, I'm SO sorry...
    .first();

  console.log("[VERIFY AUTH] User: ", user);

  return { session, user };
}
