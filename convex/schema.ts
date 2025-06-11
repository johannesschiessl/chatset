import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable(
    v.union(
      v.object({
        role: v.literal("user"),
        content: v.string(),
      }),
      v.object({
        role: v.literal("assistant"),
        content: v.string(),
      }),
    ),
  ),
});
