import { models, toolConfigs, ToolName } from "../models";

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
