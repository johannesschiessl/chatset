"use client";

import { useState, KeyboardEvent, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUpIcon, ChevronDownIcon, GlobeIcon } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { useMutation } from "convex/react";
import { Id } from "../../convex/_generated/dataModel";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import ModelSelection from "./model-selection";
import { models } from "../../models";
import { authClient } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";

export default function MessageInput() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();

  const chatId = params.chatId as Id<"chats">;

  const selectedModelString = searchParams.get("model") || "gpt-4.1";
  const webSearchEnabled = searchParams.get("webSearch") === "true";

  const selectedModel = {
    string: selectedModelString,
    label: models[selectedModelString as keyof typeof models]?.label,
    api: models[selectedModelString as keyof typeof models]?.api.badge,
  };

  const sendMessage = useMutation(api.messages.sendMessage);
  const startChatWithFirstMessage = useMutation(
    api.chats.startChatWithFirstMessage,
  );

  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const updateSearchParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, value);
        }
      });

      const newUrl = chatId
        ? `/chat/${chatId}?${newSearchParams.toString()}`
        : `/?${newSearchParams.toString()}`;

      router.replace(newUrl);
    },
    [searchParams, chatId, router],
  );

  const handleModelSelect = useCallback(
    (modelString: string) => {
      updateSearchParams({ model: modelString });
    },
    [updateSearchParams],
  );

  const handleWebSearchToggle = useCallback(() => {
    updateSearchParams({ webSearch: webSearchEnabled ? undefined : "true" });
  }, [updateSearchParams, webSearchEnabled]);

  // Auto-clear web search when model changes to one that doesn't support it
  useEffect(() => {
    const modelConfig = models[selectedModelString as keyof typeof models];

    if (webSearchEnabled && modelConfig && !("webSearch" in modelConfig)) {
      updateSearchParams({ webSearch: undefined });
    }
  }, [selectedModelString, webSearchEnabled, updateSearchParams]);

  // Auto-resize textarea
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
    const session = await authClient.getSession();

    if (!chatId) {
      const newChatId = await startChatWithFirstMessage({
        prompt: message,
        clientId: window.localStorage.getItem("clientId") || "",
        model: selectedModelString,
        webSearch: webSearchEnabled,
        sessionToken: session.data?.session.token ?? "",
      });
      router.push(
        `/chat/${newChatId}?model=${selectedModelString}${
          webSearchEnabled ? `&webSearch=true` : ""
        }`,
      );
      return;
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage) {
      setMessage("");
      sendMessage({
        prompt: trimmedMessage,
        chatId,
        model: selectedModelString,
        clientId: window.localStorage.getItem("clientId") || "",
        webSearch: webSearchEnabled,
        sessionToken: session.data?.session.token || "",
      });
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const modelConfig = models[selectedModelString as keyof typeof models];
  const hasWebSearch = !!(
    modelConfig &&
    "webSearch" in modelConfig &&
    modelConfig.webSearch
  );

  return (
    <div className="bg-muted mx-auto w-2xl max-w-2xl rounded-md p-4">
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
            onSelect={(modelString) => handleModelSelect(modelString)}
          >
            <Button variant="outline" className="gap-2">
              {selectedModel.label}
              <Badge variant="outline" className="ml-2">
                {selectedModel.api} API
              </Badge>
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </ModelSelection>

          {hasWebSearch && (
            <Button
              variant={webSearchEnabled ? "default" : "outline"}
              onClick={handleWebSearchToggle}
            >
              <GlobeIcon className="h-4 w-4" />
              Web Search
            </Button>
          )}
        </div>

        <Button disabled={!message.trim()} onClick={handleSend} size="icon">
          <ArrowUpIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
