import { v } from "convex/values";
import {
  httpAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { api, internal } from "./_generated/api";
import { StreamId } from "@convex-dev/persistent-text-streaming";
import { streamingComponent } from "./streaming";
import { streamText } from "ai";
import { models } from "../models";
import { getTools, verifyAuth } from "./helpers";

export const getMessages = query({
  args: {
    chatId: v.id("chats"),
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    await verifyAuth(ctx, args.sessionToken);

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
    userId: v.id("user"),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      role: "user",
      content: args.content,
      chat: args.chatId,
      userId: args.userId,
    });
  },
});

export const createAssistantMessage = internalMutation({
  args: {
    streamId: v.string(),
    chatId: v.id("chats"),
    clientId: v.string(),
    model: v.string(),
    forceTool: v.optional(v.string()),
    userId: v.id("user"),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      role: "assistant",
      stream: args.streamId,
      chat: args.chatId,
      clientId: args.clientId,
      model: args.model,
      forceTool: args.forceTool,
      userId: args.userId,
    });
  },
});

export const addContentToAssistantMessage = internalMutation({
  args: {
    content: v.string(),
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      content: args.content,
    });
  },
});

export const sendMessage = mutation({
  args: {
    prompt: v.string(),
    chatId: v.id("chats"),
    clientId: v.string(),
    model: v.string(),
    forceTool: v.optional(v.string()),
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    const auth = await verifyAuth(ctx, args.sessionToken);

    await ctx.runMutation(internal.messages.createUserMessage, {
      content: args.prompt,
      chatId: args.chatId,
      userId: auth.user._id,
    });

    const streamId = await streamingComponent.createStream(ctx);

    await ctx.runMutation(internal.messages.createAssistantMessage, {
      streamId,
      chatId: args.chatId,
      clientId: args.clientId,
      model: args.model,
      forceTool: args.forceTool,
      userId: auth.user._id,
    });
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
  // TODO: auth the user here
  console.log("[STREAM ASSISTANT MESSAGE] BODY: ", body);

  const response = await streamingComponent.stream(
    ctx,
    request,
    body.streamId as StreamId,
    async (ctx, request, streamId, append) => {
      const message = await ctx.runQuery(
        internal.messages.getMessageByStreamId,
        {
          streamId: streamId,
        },
      );

      if (!message) {
        throw new Error("Message not found for streamId: " + streamId);
      }

      // Should never happen, here for type safety
      if (message.role === "user") {
        throw new Error("User message found for streamId: " + streamId);
      }

      if (!models[message.model as keyof typeof models]) {
        throw new Error("Model not found: " + message.model);
      }

      const { textStream } = streamText({
        model: models[message.model as keyof typeof models].model,
        messages: await ctx.runQuery(internal.messages.getHistory, {
          chatId: message.chat,
        }),
        ...getTools(message.model, message.forceTool),
      });

      for await (const textPart of textStream) {
        await append(textPart);
      }
    },
  );

  const message = await ctx.runQuery(internal.messages.getMessageByStreamId, {
    streamId: body.streamId,
  });

  if (!message) {
    throw new Error("Message not found for streamId: " + body.streamId);
  }

  const finalResponse = await ctx.runQuery(api.streaming.getStreamBody, {
    streamId: body.streamId,
  });

  await ctx.runMutation(internal.messages.addContentToAssistantMessage, {
    messageId: message._id,
    content: finalResponse.text,
  });

  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Vary", "Origin");
  return response;
});
