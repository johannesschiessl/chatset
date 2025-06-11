import { v } from "convex/values";
import {
  httpAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import Groq from "groq-sdk";
import { StreamId } from "@convex-dev/persistent-text-streaming";
import { streamingComponent } from "./streaming";

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
    streamId: v.string(),
    chatId: v.id("chats"),
    clientId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      role: "assistant",
      stream: args.streamId,
      chat: args.chatId,
      clientId: args.clientId,
    });
  },
});

export const sendMessage = mutation({
  args: {
    prompt: v.string(),
    chatId: v.id("chats"),
    clientId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("[SEND MESSAGE] PROMPT: ", args.prompt);
    console.log("[SEND MESSAGE] CHAT ID: ", args.chatId);

    await ctx.runMutation(internal.messages.createUserMessage, {
      content: args.prompt,
      chatId: args.chatId,
    });

    console.log("[SEND MESSAGE] CREATED USER MESSAGE");

    const streamId = await streamingComponent.createStream(ctx);

    console.log("[SEND MESSAGE] CREATED STREAM ID: ", streamId);

    await ctx.runMutation(internal.messages.createAssistantMessage, {
      streamId,
      chatId: args.chatId,
      clientId: args.clientId,
    });

    console.log("[SEND MESSAGE] CREATED ASSISTANT MESSAGE");
  },
});

export const getMessageByStreamId = internalQuery({
  args: {
    streamId: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("stream"), args.streamId))
      .first();
    return message;
  },
});

export const getHistory = internalQuery({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chat", args.chatId))
      .collect();

    const messagesWithContent = await Promise.all(
      messages.map(async (message) => {
        if (message.role === "user") return { message };

        return {
          message,
          content: await streamingComponent.getStreamBody(
            ctx,
            message.stream as StreamId,
          ),
        };
      }),
    );

    return messagesWithContent.flatMap((joined) => {
      if (joined.message.role === "user") {
        return {
          role: "user" as const,
          content: joined.message.content,
        };
      }
      if (joined.content?.status !== "done") return [];
      return {
        role: "assistant" as const,
        content: joined.content.text,
      };
    });
  },
});

export const streamAssistantMessage = httpAction(async (ctx, request) => {
  const body = (await request.json()) as { streamId: string };

  console.log("[STREAM ASSISTANT MESSAGE] BODY: ", body);

  const response = await streamingComponent.stream(
    ctx,
    request,
    body.streamId as StreamId,
    async (ctx, request, streamId, append) => {
      console.log("[STREAM ASSISTANT MESSAGE] STREAM ID: ", streamId);

      const message = await ctx.runQuery(
        internal.messages.getMessageByStreamId,
        {
          streamId: streamId,
        },
      );

      if (!message) {
        throw new Error("Message not found for streamId: " + streamId);
      }

      console.log("[STREAM ASSISTANT MESSAGE] MESSAGE: ", message);

      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

      const stream = await groq.chat.completions.create({
        messages: await ctx.runQuery(internal.messages.getHistory, {
          chatId: message.chat,
        }),
        model: "qwen/qwen3-32b",
        max_completion_tokens: 8000,
        stream: true,
      });

      console.log("[STREAM ASSISTANT MESSAGE] Call to Groq");

      for await (const chunk of stream) {
        console.log("[STREAM ASSISTANT MESSAGE] CHUNK: ", chunk);
        await append(chunk.choices[0].delta.content || "");
      }
    },
  );

  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Vary", "Origin");
  return response;
});
