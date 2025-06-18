import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import { verifyAuth } from "./helpers";

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

    return {
      openai: apiKeys.openai,
      groq: apiKeys.groq,
      anthropic: apiKeys.anthropic,
      google: apiKeys.google,
      openrouter: apiKeys.openrouter,
    };
  },
});

export const getApiKeysPreview = query({
  args: {
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    const auth: any = await verifyAuth(ctx, args.sessionToken); // TODO: fix type

    const apiKeys = await ctx.db
      .query("apiKeys")
      .withIndex("by_user", (q) => q.eq("userId", auth.user._id))
      .first();

    if (!apiKeys) {
      return null;
    }

    if (!apiKeys) {
      return null;
    }

    const result = [];

    if (apiKeys.openai) {
      result.push({
        provider: "openai",
        key: apiKeys.openai.slice(0, 4) + "..." + apiKeys.openai.slice(-4),
      });
    }

    if (apiKeys.groq) {
      result.push({
        provider: "groq",
        key: apiKeys.groq.slice(0, 4) + "..." + apiKeys.groq.slice(-4),
      });
    }

    if (apiKeys.anthropic) {
      result.push({
        provider: "anthropic",
        key:
          apiKeys.anthropic.slice(0, 4) + "..." + apiKeys.anthropic.slice(-4),
      });
    }

    if (apiKeys.google) {
      result.push({
        provider: "google",
        key: apiKeys.google.slice(0, 4) + "..." + apiKeys.google.slice(-4),
      });
    }

    if (apiKeys.openrouter) {
      result.push({
        provider: "openrouter",
        key:
          apiKeys.openrouter.slice(0, 4) + "..." + apiKeys.openrouter.slice(-4),
      });
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

    const existingApiKeys = await ctx.db
      .query("apiKeys")
      .withIndex("by_user", (q) => q.eq("userId", auth.user._id))
      .first();

    if (existingApiKeys) {
      const updateFields: any = {};
      updateFields[provider] = key;
      await ctx.db.patch(existingApiKeys._id, updateFields);
    } else {
      const insertFields: any = {
        userId: auth.user._id,
      };
      insertFields[provider] = key;
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
