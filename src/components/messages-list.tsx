"use client";

import UserMessage from "@/components/user-message";
import AssistantMessage from "@/components/assistant-message";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { StreamId } from "@convex-dev/persistent-text-streaming";
import { useRef, useEffect } from "react";

interface MessagesListProps {
  preloadedMessages: Preloaded<typeof api.messages.getMessages>;
}

export default function MessagesList({ preloadedMessages }: MessagesListProps) {
  const messages = usePreloadedQuery(preloadedMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!messages) return null;

  return (
    <div className="space-y-2">
      {messages.map((message, index) => (
        <div key={index}>
          {message.role === "user" ? (
            <UserMessage content={message.content} />
          ) : (
            <AssistantMessage
              model={message.model}
              streamId={message.stream as StreamId}
              clientId={message.clientId}
              content={message.content}
            />
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
