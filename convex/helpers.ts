import { models } from "../models";
import { internal } from "./_generated/api";

export function getTools(model: string, webSearch?: boolean) {
  const modelConfig = models[model as keyof typeof models];
  if (!modelConfig) {
    return;
  }

  if (
    webSearch &&
    modelConfig &&
    "webSearch" in modelConfig &&
    modelConfig.webSearch
  ) {
    return {
      tools: {
        [modelConfig.webSearch.name]: modelConfig.webSearch.tool,
      },
      toolChoice: {
        type: "tool" as const,
        toolName: modelConfig.webSearch.name,
      },
    };
  }
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
    .filter((q: any) => q.eq(q.field("_id"), session.userId)) // FIXME: make this not any
    .first();

  return { session, user };
}

export async function deriveKey(
  password: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptApiKey(apiKey: string): Promise<string> {
  const encryptionKey = process.env.API_KEY_ENCRYPTION_SECRET;
  if (!encryptionKey) {
    throw new Error("API_KEY_ENCRYPTION_SECRET environment variable not set");
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveKey(encryptionKey, salt);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    data,
  );

  const combined = new Uint8Array(
    salt.length + iv.length + encrypted.byteLength,
  );
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);

  return btoa(String.fromCharCode(...combined));
}

export async function decryptApiKey(encryptedApiKey: string): Promise<string> {
  const encryptionKey = process.env.API_KEY_ENCRYPTION_SECRET;
  if (!encryptionKey) {
    throw new Error("API_KEY_ENCRYPTION_SECRET environment variable not set");
  }

  const combined = new Uint8Array(
    atob(encryptedApiKey)
      .split("")
      .map((char) => char.charCodeAt(0)),
  );

  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const encrypted = combined.slice(28);

  const key = await deriveKey(encryptionKey, salt);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encrypted,
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}
