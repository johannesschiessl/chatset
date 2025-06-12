import { openai } from "@ai-sdk/openai";

export const modelProviders = {
  openai: {
    label: "OpenAI",
  },
};

export const models = {
  "gpt-4.1": {
    label: "GPT-4.1",
    model: openai.responses("gpt-4.1"),
    provider: modelProviders.openai,
  },
  "gpt-4.1-mini": {
    label: "GPT-4.1 Mini",
    model: openai.responses("gpt-4.1-mini"),
    provider: modelProviders.openai,
  },
  "o4-mini": {
    label: "o4-mini",
    model: openai.responses("o4-mini"),
    provider: modelProviders.openai,
  },
};
