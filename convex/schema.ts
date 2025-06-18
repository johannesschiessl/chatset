import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  account: defineTable({
    accessToken: v.string(),
    accessTokenExpiresAt: v.string(),
    accountId: v.string(),
    idToken: v.string(),
    providerId: v.string(),
    scope: v.string(),
    updatedAt: v.string(),
    userId: v.id("user"),
  }),
  chats: defineTable({
    title: v.string(),
    userId: v.id("user"),
  }).index("by_user", ["userId"]),
  messages: defineTable(
    v.union(
      v.object({
        chat: v.id("chats"),
        content: v.string(),
        role: v.literal("user"),
        userId: v.id("user"),
      }),
      v.object({
        chat: v.id("chats"),
        clientId: v.string(),
        content: v.optional(v.string()),
        forceTool: v.optional(v.string()),
        model: v.string(),
        role: v.literal("assistant"),
        generationDone: v.boolean(),
        error: v.optional(v.string()),
        stream: v.string(),
        userId: v.id("user"),
      }),
    ),
  ).index("by_chat", ["chat"]),
  apiKeys: defineTable({
    userId: v.id("user"),
    openai: v.optional(v.string()),
    groq: v.optional(v.string()),
    anthropic: v.optional(v.string()),
    google: v.optional(v.string()),
    openrouter: v.optional(v.string()),
  }).index("by_user", ["userId"]),
  session: defineTable({
    expiresAt: v.string(),
    ipAddress: v.string(),
    token: v.string(),
    updatedAt: v.string(),
    userAgent: v.string(),
    userId: v.id("user"),
  }),
  user: defineTable({
    email: v.string(),
    emailVerified: v.boolean(),
    image: v.string(),
    name: v.string(),
    updatedAt: v.string(),
  }),
});
