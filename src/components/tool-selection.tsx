import { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { models, toolConfigs } from "../../models";
import { Badge } from "@/components/ui/badge";

interface ToolSelectionProps {
  children: ReactNode;
  selectedModel: string;
  selectedTool?: string;
  onSelect: (toolName: string | undefined, toolLabel: string) => void;
}

export default function ToolSelection({
  children,
  selectedModel,
  selectedTool,
  onSelect,
}: ToolSelectionProps) {
  const modelConfig = models[selectedModel as keyof typeof models];
  const availableTools = modelConfig?.tools || [];

  if (availableTools.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {/* Default option - no forced tool */}
        <DropdownMenuItem
          onClick={() => onSelect(undefined, "")}
          className={selectedTool === undefined ? "bg-accent" : ""}
        >
          <div className="flex items-center gap-2">Auto</div>
          <Badge variant="outline" className="ml-2">
            DEFAULT
          </Badge>
        </DropdownMenuItem>

        {/* Available tools for the selected model */}
        {availableTools.map((toolName) => {
          const toolConfig = toolConfigs[toolName];
          if (!toolConfig) return null;

          return (
            <DropdownMenuItem
              key={toolName}
              onClick={() => onSelect(toolName, toolConfig.label)}
              className={selectedTool === toolName ? "bg-accent" : ""}
            >
              <div className="flex items-center gap-2">{toolConfig.label}</div>
              <Badge variant="outline" className="ml-2">
                FORCE
              </Badge>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
