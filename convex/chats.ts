import { api, internal } from "./_generated/api";
import {
  internalAction,
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import { v } from "convex/values";
import Groq from "groq-sdk";
import { verifyAuth } from "./helpers";
import { GENERATE_TITLE_PROMPT } from "../prompts";

export const getChatsGroupedByDate = query({
  args: {
    sessionToken: v.string(),
  },
  returns: v.array(
    v.object({
      date: v.string(),
      chats: v.array(
        v.object({
          _id: v.id("chats"),
          _creationTime: v.number(),
          title: v.string(),
          userId: v.id("user"),
        }),
      ),
    }),
  ),
  handler: async (ctx, args) => {
    const auth: any = await verifyAuth(ctx, args.sessionToken); // FIXME: make this not any

    const chats = await ctx.db
      .query("chats")
      .withIndex("by_user", (q) => q.eq("userId", auth.user._id))
      .order("desc")
      .take(100);

    const groupedChats = new Map<string, typeof chats>();

    for (const chat of chats) {
      const date = new Date(chat._creationTime);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let dateKey: string;

      if (date.toDateString() === today.toDateString()) {
        dateKey = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateKey = "Yesterday";
      } else {
        dateKey = date.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }

      if (!groupedChats.has(dateKey)) {
        groupedChats.set(dateKey, []);
      }
      groupedChats.get(dateKey)!.push(chat);
    }

    const result = Array.from(groupedChats.entries()).map(([date, chats]) => ({
      date,
      chats,
    }));

    return result;
  },
});

export const startChatWithFirstMessage = mutation({
  args: {
    prompt: v.string(),
    clientId: v.string(),
    model: v.string(),
    webSearch: v.optional(v.boolean()),
    sessionToken: v.string(),
  },
  returns: v.id("chats"),
  handler: async (ctx, args) => {
    console.log("[CHAT] Starting chat with first message. ARGS: ", args);
    const auth: any = await verifyAuth(ctx, args.sessionToken); // FIXME: make this not any

    const chatId = await ctx.db.insert("chats", {
      title: "New Chat",
      userId: auth.user._id,
    });

    await ctx.scheduler.runAfter(0, api.messages.sendMessage, {
      prompt: args.prompt,
      chatId,
      clientId: args.clientId,
      model: args.model,
      webSearch: args.webSearch,
      sessionToken: args.sessionToken,
    });

    await ctx.scheduler.runAfter(0, internal.chats.generateChatTitle, {
      prompt: args.prompt,
      chatId,
    });

    return chatId;
  },
});

export const updateChatTitle = internalMutation({
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
          content: GENERATE_TITLE_PROMPT(),
        },
        { role: "user", content: args.prompt },
      ],
      model: "llama3-70b-8192",
      max_completion_tokens: 100,
    });

    if (!response.choices[0].message.content) {
      throw new Error("No response from Groq");
    }

    await ctx.runMutation(internal.chats.updateChatTitle, {
      chatId: args.chatId,
      title: response.choices[0].message.content,
    });
  },
});
