"use client";

import UserMessage from "@/components/user-message";
import AssistantMessage from "@/components/assistant-message";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { StreamId } from "@convex-dev/persistent-text-streaming";

interface MessagesListProps {
  preloadedMessages: Preloaded<typeof api.messages.getMessages>;
}

export default function MessagesList({ preloadedMessages }: MessagesListProps) {
  const messages = usePreloadedQuery(preloadedMessages);
  return (
    <div className="space-y-2">
      {messages.map((message, index) => (
        <div key={index}>
          {message.role === "user" ? (
            <UserMessage content={message.content} />
          ) : (
            <AssistantMessage
              streamId={message.stream as StreamId}
              clientId={message.clientId}
            />
          )}
        </div>
      ))}
    </div>
  );
}
