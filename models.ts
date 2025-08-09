import { createOpenAI } from "@ai-sdk/openai";
import { createGroq } from "@ai-sdk/groq";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export const modelProviders = {
  openai: {
    label: "OpenAI",
  },
  anthropic: {
    label: "Anthropic",
  },
  google: {
    label: "Google",
  },
  meta: {
    label: "Meta",
  },
  deepseek: {
    label: "DeepSeek",
  },
};

export const modelAPIs = {
  openai: {
    badge: "OpenAI",
  },
  anthropic: {
    badge: "Anthropic",
  },
  google: {
    badge: "Google",
  },
  groq: {
    badge: "Groq",
  },
  openrouter: {
    badge: "OpenRouter",
  },
};

export const createModels = (apiKeys: {
  openai?: string;
  groq?: string;
  anthropic?: string;
  google?: string;
  openrouter?: string;
}) => {
  const openai = createOpenAI({
    apiKey: apiKeys.openai,
  });

  const groq = createGroq({
    apiKey: apiKeys.groq,
  });

  const anthropic = createAnthropic({
    apiKey: apiKeys.anthropic,
  });

  const google = createGoogleGenerativeAI({
    apiKey: apiKeys.google,
  });
  const openrouter = createOpenRouter({
    apiKey: apiKeys.openrouter,
  });

  const webSearchTool = openai.tools.webSearchPreview({
    searchContextSize: "medium",
  });

  return {
    "gpt-5": {
      label: "GPT-5",
      model: openai.responses("gpt-5"),
      provider: modelProviders.openai,
      api: modelAPIs.openai,
      webSearch: {
        tool: webSearchTool,
        name: "web_search_preview",
      },
    },
    "gpt-5-mini": {
      label: "GPT-5 Mini",
      model: openai.responses("gpt-5-mini"),
      provider: modelProviders.openai,
      api: modelAPIs.openai,
      webSearch: {
        tool: webSearchTool,
        name: "web_search_preview",
      },
    },
    "gpt-5-nano": {
      label: "GPT-5 Nano",
      model: openai.responses("gpt-5-nano"),
      provider: modelProviders.openai,
      api: modelAPIs.openai,
      webSearch: {
        tool: webSearchTool,
        name: "web_search_preview",
      },
    },
    "gpt-4.1": {
      label: "GPT-4.1",
      model: openai.responses("gpt-4.1"),
      provider: modelProviders.openai,
      api: modelAPIs.openai,
      webSearch: {
        tool: webSearchTool,
        name: "web_search_preview",
      },
    },
    "gpt-4.1-mini": {
      label: "GPT-4.1 Mini",
      model: openai.responses("gpt-4.1-mini"),
      provider: modelProviders.openai,
      api: modelAPIs.openai,
      webSearch: {
        tool: webSearchTool,
        name: "web_search_preview",
      },
    },
    "o4-mini": {
      label: "o4-mini",
      model: openai.responses("o4-mini"),
      provider: modelProviders.openai,
      api: modelAPIs.openai,
    },
    o3: {
      label: "o3",
      model: openai.responses("o3"),
      provider: modelProviders.openai,
      api: modelAPIs.openai,
    },
    "claude-sonnet-4": {
      label: "Claude Sonnet 4",
      model: anthropic("claude-sonnet-4-20250514"),
      provider: modelProviders.anthropic,
      api: modelAPIs.anthropic,
    },
    "claude-opus-4": {
      label: "Claude 4 Opus",
      model: anthropic("claude-opus-4-20250514"),
      provider: modelProviders.anthropic,
      api: modelAPIs.anthropic,
    },

    "gemini-2.5-flash-lite": {
      label: "Gemini 2.5 Flash Lite",
      model: google("gemini-2.5-flash-lite-preview-06-17"),
      provider: modelProviders.google,
      api: modelAPIs.google,
    },
    "gemini-2.5-flash": {
      label: "Gemini 2.5 Flash",
      model: google("gemini-2.5-flash"),
      provider: modelProviders.google,
      api: modelAPIs.google,
    },
    "gemini-2.5-pro": {
      label: "Gemini 2.5 Pro",
      model: google("gemini-2.5-pro"),
      provider: modelProviders.google,
      api: modelAPIs.google,
    },

    "deepseek-r1": {
      label: "DeepSeek R1",
      model: groq("deepseek-r1-distill-llama-70b"),
      provider: modelProviders.deepseek,
      api: modelAPIs.groq,
    },
    "llama-4-maverick": {
      label: "Llama 4 Maverick",
      model: groq("meta-llama/llama-4-maverick-17b-128e-instruct"),
      provider: modelProviders.meta,
      api: modelAPIs.groq,
    },
    "llama-3.1-8b": {
      label: "Llama 3.1 8B",
      model: groq("llama-3.1-8b-instant"),
      provider: modelProviders.meta,
      api: modelAPIs.groq,
    },

    // OpenRouter models

    "gpt-4.1-openrouter": {
      label: "GPT-4.1",
      model: openrouter("openai/gpt-4.1"),
      provider: modelProviders.openai,
      api: modelAPIs.openrouter,
    },
    "gpt-4.1-mini-openrouter": {
      label: "GPT-4.1 Mini",
      model: openrouter("openai/gpt-4.1-mini"),
      provider: modelProviders.openai,
      api: modelAPIs.openrouter,
    },
    "o4-mini-openrouter": {
      label: "o4-mini",
      model: openrouter("openai/o4-mini"),
      provider: modelProviders.openai,
      api: modelAPIs.openrouter,
    },
    "claude-sonnet-4-openrouter": {
      label: "Claude Sonnet 4",
      model: openrouter("anthropic/claude-sonnet-4"),
      provider: modelProviders.anthropic,
      api: modelAPIs.openrouter,
    },
    "claude-opus-4-openrouter": {
      label: "Claude 4 Opus",
      model: openrouter("anthropic/claude-opus-4"),
      provider: modelProviders.anthropic,
      api: modelAPIs.openrouter,
    },
    "gemini-2.5-flash-lite-openrouter": {
      label: "Gemini 2.5 Flash Lite",
      model: openrouter("google/gemini-2.5-flash-lite-preview-06-17"),
      provider: modelProviders.google,
      api: modelAPIs.openrouter,
    },
    "gemini-2.5-flash-openrouter": {
      label: "Gemini 2.5 Flash",
      model: openrouter("google/gemini-2.5-flash"),
      provider: modelProviders.google,
      api: modelAPIs.openrouter,
    },
    "gemini-2.5-pro-openrouter": {
      label: "Gemini 2.5 Pro",
      model: openrouter("google/gemini-2.5-pro"),
      provider: modelProviders.google,
      api: modelAPIs.openrouter,
    },
  };
};

// Backwards compatibility
export const models = createModels({});
