import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import { decryptApiKey, encryptApiKey, verifyAuth } from "./helpers";

export const getApiKeys = internalQuery({
  args: {
    userId: v.id("user"),
  },
  handler: async (ctx, args) => {
    const apiKeys = await ctx.db
      .query("apiKeys")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!apiKeys) {
      return null;
    }

    const decryptedKeys: any = {};

    if (apiKeys.openai) {
      try {
        decryptedKeys.openai = await decryptApiKey(apiKeys.openai);
      } catch (error) {
        console.error("Failed to decrypt OpenAI key:", error);
      }
    }

    if (apiKeys.groq) {
      try {
        decryptedKeys.groq = await decryptApiKey(apiKeys.groq);
      } catch (error) {
        console.error("Failed to decrypt Groq key:", error);
      }
    }

    if (apiKeys.anthropic) {
      try {
        decryptedKeys.anthropic = await decryptApiKey(apiKeys.anthropic);
      } catch (error) {
        console.error("Failed to decrypt Anthropic key:", error);
      }
    }

    if (apiKeys.google) {
      try {
        decryptedKeys.google = await decryptApiKey(apiKeys.google);
      } catch (error) {
        console.error("Failed to decrypt Google key:", error);
      }
    }

    if (apiKeys.openrouter) {
      try {
        decryptedKeys.openrouter = await decryptApiKey(apiKeys.openrouter);
      } catch (error) {
        console.error("Failed to decrypt OpenRouter key:", error);
      }
    }

    return decryptedKeys;
  },
});

export const getApiKeysPreview = query({
  args: {
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    const auth: any = await verifyAuth(ctx, args.sessionToken); // FIXME: make this not any

    const apiKeys = await ctx.db
      .query("apiKeys")
      .withIndex("by_user", (q) => q.eq("userId", auth.user._id))
      .first();

    if (!apiKeys) {
      return null;
    }

    const result = [];

    if (apiKeys.openai) {
      try {
        const decryptedKey = await decryptApiKey(apiKeys.openai);
        result.push({
          provider: "openai",
          key: decryptedKey.slice(0, 4) + "..." + decryptedKey.slice(-4),
        });
      } catch (error) {
        console.error("Failed to decrypt OpenAI key for preview:", error);
      }
    }

    if (apiKeys.groq) {
      try {
        const decryptedKey = await decryptApiKey(apiKeys.groq);
        result.push({
          provider: "groq",
          key: decryptedKey.slice(0, 4) + "..." + decryptedKey.slice(-4),
        });
      } catch (error) {
        console.error("Failed to decrypt Groq key for preview:", error);
      }
    }

    if (apiKeys.anthropic) {
      try {
        const decryptedKey = await decryptApiKey(apiKeys.anthropic);
        result.push({
          provider: "anthropic",
          key: decryptedKey.slice(0, 4) + "..." + decryptedKey.slice(-4),
        });
      } catch (error) {
        console.error("Failed to decrypt Anthropic key for preview:", error);
      }
    }

    if (apiKeys.google) {
      try {
        const decryptedKey = await decryptApiKey(apiKeys.google);
        result.push({
          provider: "google",
          key: decryptedKey.slice(0, 4) + "..." + decryptedKey.slice(-4),
        });
      } catch (error) {
        console.error("Failed to decrypt Google key for preview:", error);
      }
    }

    if (apiKeys.openrouter) {
      try {
        const decryptedKey = await decryptApiKey(apiKeys.openrouter);
        result.push({
          provider: "openrouter",
          key: decryptedKey.slice(0, 4) + "..." + decryptedKey.slice(-4),
        });
      } catch (error) {
        console.error("Failed to decrypt OpenRouter key for preview:", error);
      }
    }

    return result;
  },
});

export const saveApiKey = mutation({
  args: {
    provider: v.string(),
    key: v.string(),
    sessionToken: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { provider, key, sessionToken } = args;
    const auth = await verifyAuth(ctx, sessionToken);

    const encryptedKey = await encryptApiKey(key);

    const existingApiKeys = await ctx.db
      .query("apiKeys")
      .withIndex("by_user", (q) => q.eq("userId", auth.user._id))
      .first();

    if (existingApiKeys) {
      const updateFields: any = {};
      updateFields[provider] = encryptedKey;
      await ctx.db.patch(existingApiKeys._id, updateFields);
    } else {
      const insertFields: any = {
        userId: auth.user._id,
      };
      insertFields[provider] = encryptedKey;
      await ctx.db.insert("apiKeys", insertFields);
    }

    return null;
  },
});

export const removeApiKey = mutation({
  args: {
    provider: v.string(),
    sessionToken: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { provider, sessionToken } = args;
    const auth = await verifyAuth(ctx, sessionToken);

    const existingApiKeys = await ctx.db
      .query("apiKeys")
      .withIndex("by_user", (q) => q.eq("userId", auth.user._id))
      .first();

    if (existingApiKeys) {
      const updateFields: any = {};
      updateFields[provider] = undefined;
      await ctx.db.patch(existingApiKeys._id, updateFields);
    }

    return null;
  },
});
