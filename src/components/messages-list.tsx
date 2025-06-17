"use client";

import UserMessage from "@/components/user-message";
import AssistantMessage from "@/components/assistant-message";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { StreamId } from "@convex-dev/persistent-text-streaming";
import { useRef, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Id } from "../../convex/_generated/dataModel";
import { authClient } from "@/lib/auth-client";

export default function MessagesList() {
  const params = useParams();
  const chatId = params.chatId as Id<"chats">;
  const session = authClient.useSession();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const messages = useQuery(
    api.messages.getMessages,
    session.data?.session.token
      ? {
          chatId,
          sessionToken: session.data.session.token,
        }
      : "skip",
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth = false) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "instant",
    });
  };

  useEffect(() => {
    if (messages) {
      scrollToBottom(!isInitialLoad);
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  }, [messages, isInitialLoad]);

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
