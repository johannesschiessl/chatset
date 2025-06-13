"use client";

import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUpIcon, ChevronDownIcon } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { useMutation } from "convex/react";
import { Id } from "../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import ModelSelection from "./model-selection";
import { models } from "../../models";

interface MessageInputProps {
  chatId?: Id<"chats">;
  model?: string;
}

export default function MessageInput({ chatId, model }: MessageInputProps) {
  const sendMessage = useMutation(api.messages.sendMessage);
  const startChatWithFirstMessage = useMutation(
    api.chats.startChatWithFirstMessage,
  );

  const [message, setMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState({
    string: model || "gpt-4.1",
    label:
      models[model as keyof typeof models]?.label || models["gpt-4.1"].label,
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const router = useRouter();

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";

    const lineHeight = 24;
    const minHeight = lineHeight * 2;
    const maxHeight = lineHeight * 5;

    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);

    textarea.style.height = `${newHeight}px`;

    textarea.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
  }, [message]);

  async function handleSend() {
    if (!chatId) {
      const newChatId = await startChatWithFirstMessage({
        prompt: message,
        clientId: window.localStorage.getItem("clientId") || "",
        model: selectedModel.string,
      });
      router.push(`/chat/${newChatId}?model=${selectedModel.string}`);
      return;
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage) {
      setMessage("");
      sendMessage({
        prompt: trimmedMessage,
        chatId,
        model: selectedModel.string,
        clientId: window.localStorage.getItem("clientId") || "",
      });
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="bg-background fixed right-0 bottom-0 left-0 z-50 pb-5">
      <div className="bg-muted mx-auto max-w-2xl rounded-md p-4">
        {/* Message input */}
        <div className="mb-3">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setMessage(e.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-[48px] resize-none border-none bg-transparent p-1 shadow-none focus-visible:ring-0 dark:bg-transparent"
            rows={2}
            aria-label="Message input"
          />
        </div>

        {/* Action row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ModelSelection
              onSelect={(modelString, modelLabel) =>
                setSelectedModel({ string: modelString, label: modelLabel })
              }
            >
              <Button variant="outline" className="gap-2">
                {selectedModel.label}
                <ChevronDownIcon className="h-4 w-4" />
              </Button>
            </ModelSelection>
          </div>

          <Button disabled={!message.trim()} onClick={handleSend} size="icon">
            <ArrowUpIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
