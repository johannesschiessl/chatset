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
import { models, modelProviders } from "../../models";
import { Badge } from "@/components/ui/badge";

interface ModelSelectionProps {
  children: ReactNode;
  onSelect: (modelString: string, modelLabel: string) => void;
}

export default function ModelSelection({
  children,
  onSelect,
}: ModelSelectionProps) {
  const modelsByProvider = Object.entries(models).reduce(
    (acc, [modelKey, model]) => {
      const providerKey = model.provider.label.toLowerCase();
      if (!acc[providerKey]) {
        acc[providerKey] = [];
      }
      acc[providerKey].push({ key: modelKey, ...model });
      return acc;
    },
    {} as Record<
      string,
      Array<{
        key: string;
        label: string;
        provider: typeof modelProviders.openai;
        byok: boolean;
      }>
    >,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {Object.entries(modelsByProvider).map(
          ([providerKey, providerModels]) => (
            <DropdownMenuSub key={providerKey}>
              <DropdownMenuSubTrigger>
                {
                  modelProviders[providerKey as keyof typeof modelProviders]
                    .label
                }
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {providerModels.map((model) => (
                  <DropdownMenuItem
                    key={model.key}
                    onClick={() => onSelect(model.key, model.label)}
                  >
                    {model.label}
                    {model.byok ? (
                      <Badge variant="outline" className="ml-2">
                        BYOK
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="ml-2">
                        FREE
                      </Badge>
                    )}
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
