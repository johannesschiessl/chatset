import { openai } from "@ai-sdk/openai";
import { groq } from "@ai-sdk/groq";
import { GlobeIcon } from "lucide-react";

export const modelProviders = {
  openai: {
    label: "OpenAI",
  },
  groq: {
    label: "Groq",
  },
};

export const toolConfigs = {
  webSearch: {
    tool: openai.tools.webSearchPreview({
      searchContextSize: "low", // TODO: Set to "high" after testing
    }),
    name: "web_search_preview", // THIS HAS TO BE web_search_preview
    label: "Web Search",
    icon: GlobeIcon,
  },
} as const;

export type ToolName = keyof typeof toolConfigs;

export const models = {
  "gpt-4.1": {
    label: "GPT-4.1",
    model: openai.responses("gpt-4.1"),
    provider: modelProviders.openai,
    byok: false,
    tools: ["webSearch"] as ToolName[],
  },
  "gpt-4.1-mini": {
    label: "GPT-4.1 Mini",
    model: openai.responses("gpt-4.1-mini"),
    provider: modelProviders.openai,
    byok: false,
    tools: ["webSearch"] as ToolName[],
  },
  "o4-mini": {
    label: "o4-mini",
    model: openai.responses("o4-mini"),
    provider: modelProviders.openai,
    byok: false,
    tools: [] as ToolName[],
  },
  "deepseek-r1": {
    label: "DeepSeek R1",
    model: groq("deepseek-r1-distill-llama-70b"),
    provider: modelProviders.groq,
    byok: false,
    tools: [] as ToolName[],
  },
  "llama-4-maverick": {
    label: "Llama 4 Maverick",
    model: groq("meta-llama/llama-4-maverick-17b-128e-instruct"),
    provider: modelProviders.groq,
    byok: false,
    tools: [] as ToolName[],
  },
};
