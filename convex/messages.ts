import { v } from "convex/values";
import { action, internalMutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import Groq from "groq-sdk";

export const getMessages = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chat", args.chatId))
      .order("asc")
      .take(100);
    return messages;
  },
});

export const createUserMessage = internalMutation({
  args: {
    content: v.string(),
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      role: "user",
      content: args.content,
      chat: args.chatId,
    });
  },
});

export const createAssistantMessage = internalMutation({
  args: {
    content: v.string(),
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      role: "assistant",
      content: args.content,
      chat: args.chatId,
    });
  },
});

export const sendMessageAndGenerateResponse = action({
  args: {
    prompt: v.string(),
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.messages.createUserMessage, {
      content: args.prompt,
      chatId: args.chatId,
    });

    const messages = await ctx.runQuery(api.messages.getMessages, {
      chatId: args.chatId,
    });

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const response = await groq.chat.completions.create({
      messages: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      model: "qwen/qwen3-32b",
      max_completion_tokens: 8000,
    });

    if (!response.choices[0].message.content) {
      throw new Error("No response from Groq");
    }

    await ctx.runMutation(internal.messages.createAssistantMessage, {
      content: response.choices[0].message.content,
      chatId: args.chatId,
    });
  },
});
