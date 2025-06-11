import { v } from "convex/values";
import { action, internalMutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import Groq from "groq-sdk";

export const getMessages = query({
  handler: async (ctx) => {
    const messages = await ctx.db.query("messages").order("asc").take(100);
    return messages;
  },
});

export const createUserMessage = internalMutation({
  args: {
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      role: "user",
      content: args.content,
    });
  },
});

export const createAssistantMessage = internalMutation({
  args: {
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      role: "assistant",
      content: args.content,
    });
  },
});

export const sendMessageAndGenerateResponse = action({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.messages.createUserMessage, {
      content: args.prompt,
    });

    const messages = await ctx.runQuery(api.messages.getMessages);

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const response = await groq.chat.completions.create({
      messages: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      model: "llama-3.3-70b-versatile",
    });

    if (!response.choices[0].message.content) {
      throw new Error("No response from Groq");
    }

    await ctx.runMutation(internal.messages.createAssistantMessage, {
      content: response.choices[0].message.content,
    });
  },
});
