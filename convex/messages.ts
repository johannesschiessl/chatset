import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getMessages = query({
  handler: async (ctx) => {
    const messages = await ctx.db.query("messages").order("asc").take(100);
    return messages;
  },
});

export const createMessage = mutation({
  args: {
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      role: "user",
      content: args.content,
    });

    await ctx.db.insert("messages", {
      role: "assistant",
      content: "Thanks for your message, this is a test response.",
    });
  },
});
