import { openai } from "@ai-sdk/openai";
import { groq } from "@ai-sdk/groq";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";

import { GlobeIcon } from "lucide-react";

export const modelProviders = {
  openai: {
    label: "OpenAI",
  },
  groq: {
    label: "Groq",
  },
  anthropic: {
    label: "Anthropic",
  },
  google: {
    label: "Google",
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
    byok: true,
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
    byok: true,
    tools: [] as ToolName[],
  },
  o3: {
    label: "o3",
    model: openai.responses("o3"),
    provider: modelProviders.openai,
    byok: true,
    tools: [] as ToolName[],
  },
  "claude-sonnet-4": {
    label: "Claude Sonnet 4",
    model: anthropic("claude-sonnet-4-20250514"),
    provider: modelProviders.anthropic,
    byok: true,
    tools: [] as ToolName[],
  },
  "claude-opus-4": {
    label: "Claude 4 Opus",
    model: anthropic("claude-opus-4-20250514"),
    provider: modelProviders.anthropic,
    byok: true,
    tools: [] as ToolName[],
  },
  "gemini-2.5-flash": {
    label: "Gemini 2.5 Flash",
    model: google("gemini-2.5-flash-preview-05-20"),
    provider: modelProviders.google,
    byok: true,
    tools: [] as ToolName[],
  },
  "gemini-2.5-pro": {
    label: "Gemini 2.5 Pro",
    model: google("gemini-2.5-pro-preview"),
    provider: modelProviders.google,
    byok: true,
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
  "llama-3.1-8b": {
    label: "Llama 3.1 8B",
    model: groq("llama-3.1-8b-instant"),
    provider: modelProviders.groq,
    byok: false,
    tools: [] as ToolName[],
  },
};
