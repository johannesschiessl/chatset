import { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { models, modelAPIs, modelProviders } from "../../models";
import { Badge } from "@/components/ui/badge";

interface ModelSelectionProps {
  children: ReactNode;
  onSelect: (modelString: string, modelLabel: string, modelApi: string) => void;
}

export default function ModelSelection({
  children,
  onSelect,
}: ModelSelectionProps) {
  const modelsByProvider = Object.entries(models).reduce(
    (acc, [modelKey, model]) => {
      const providerLabel = model.provider.label;
      if (!acc[providerLabel]) {
        acc[providerLabel] = [];
      }
      acc[providerLabel].push({
        key: modelKey,
        label: model.label,
        api: model.api,
        provider: model.provider,
      });
      return acc;
    },
    {} as Record<
      string,
      Array<{
        key: string;
        label: string;
        api: (typeof modelAPIs)[keyof typeof modelAPIs];
        provider: (typeof modelProviders)[keyof typeof modelProviders];
      }>
    >,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {Object.entries(modelsByProvider).map(
          ([providerLabel, providerModels]) => (
            <DropdownMenuSub key={providerLabel}>
              <DropdownMenuSubTrigger>{providerLabel}</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {providerModels.map((model) => (
                  <DropdownMenuItem
                    key={model.key}
                    onClick={() =>
                      onSelect(model.key, model.label, model.api.badge)
                    }
                  >
                    {model.label}
                    <Badge variant="outline" className="ml-2">
                      {model.api.badge} API
                    </Badge>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
