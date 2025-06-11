import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  chats: defineTable({
    title: v.string(),
  }),
  messages: defineTable(
    v.union(
      v.object({
        role: v.literal("user"),
        content: v.string(),
        chat: v.id("chats"),
      }),
      v.object({
        role: v.literal("assistant"),
        content: v.string(),
        chat: v.id("chats"),
      }),
    ),
  ).index("by_chat", ["chat"]),
});
