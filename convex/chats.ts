import { api, internal } from "./_generated/api";
import { internalAction, mutation } from "./_generated/server";
import { v } from "convex/values";
import Groq from "groq-sdk";

export const startChatWithFirstMessage = mutation({
  args: {
    prompt: v.string(),
    clientId: v.string(),
    model: v.string(),
  },
  handler: async (ctx, args) => {
    const chatId = await ctx.db.insert("chats", { title: "New Chat" });

    await ctx.scheduler.runAfter(0, api.messages.sendMessage, {
      prompt: args.prompt,
      chatId,
      clientId: args.clientId,
      model: args.model,
    });

    await ctx.scheduler.runAfter(0, internal.chats.generateChatTitle, {
      prompt: args.prompt,
      chatId,
    });

    return chatId;
  },
});

export const updateChatTitle = mutation({
  args: {
    chatId: v.id("chats"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.chatId, { title: args.title });
  },
});

export const generateChatTitle = internalAction({
  args: {
    prompt: v.string(),
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Generate a title for this chat based on the user message. It must be short with only a few words. Never output anything other than the title, and never mention that you are an AI model. The title must be in the same language as the user's message.",
        },
        { role: "user", content: args.prompt },
      ],
      model: "llama-3.1-8b-instant",
      max_completion_tokens: 100,
    });

    if (!response.choices[0].message.content) {
      throw new Error("No response from Groq");
    }

    await ctx.runMutation(api.chats.updateChatTitle, {
      chatId: args.chatId,
      title: response.choices[0].message.content,
    });
  },
});
