"use client";

import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpIcon } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { useAction, useMutation } from "convex/react";
import { Id } from "../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";

export default function MessageInput({ chatId }: { chatId?: Id<"chats"> }) {
  const sendMessage = useMutation(api.messages.sendMessage);
  const startChatWithFirstMessage = useMutation(
    api.chats.startChatWithFirstMessage,
  );

  const [message, setMessage] = useState("");

  const router = useRouter();

  async function handleSend() {
    if (!chatId) {
      const newChatId = await startChatWithFirstMessage({
        prompt: message,
        clientId: window.localStorage.getItem("clientId") || "",
      });
      router.push(`/chat/${newChatId}`);
      return;
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage) {
      setMessage("");
      sendMessage({
        prompt: trimmedMessage,
        chatId,
        clientId: window.localStorage.getItem("clientId") || "",
      });
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="bg-background fixed right-0 bottom-0 left-0 z-50 pb-5">
      <div className="bg-muted mx-auto flex max-w-2xl items-center gap-2 rounded-md px-4 py-2">
        <div className="relative flex-1">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="border-none p-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
        </div>
        <Button disabled={!message.trim()} onClick={handleSend} size="icon">
          <ArrowUpIcon />
        </Button>
      </div>
    </div>
  );
}
