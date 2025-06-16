"use client";

import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUpIcon, ChevronDownIcon, WrenchIcon } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { useMutation } from "convex/react";
import { Id } from "../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import ModelSelection from "./model-selection";
import ToolSelection from "./tool-selection";
import { models, toolConfigs } from "../../models";

interface MessageInputProps {
  chatId?: Id<"chats">;
  model?: string;
  forceTool?: string;
}

export default function MessageInput({
  chatId,
  model,
  forceTool,
}: MessageInputProps) {
  const sendMessage = useMutation(api.messages.sendMessage);
  const startChatWithFirstMessage = useMutation(
    api.chats.startChatWithFirstMessage,
  );

  const [message, setMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState({
    string: model || "llama-3.1-8b",
    label:
      models[model as keyof typeof models]?.label ||
      models["llama-3.1-8b"].label,
  });
  const [selectedTool, setSelectedTool] = useState<{
    string?: string;
    label: string;
  }>({
    string: forceTool,
    label: forceTool
      ? toolConfigs[forceTool as keyof typeof toolConfigs]?.label || ""
      : "",
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const router = useRouter();

  useEffect(() => {
    const modelConfig = models[selectedModel.string as keyof typeof models];
    const availableTools = modelConfig?.tools || [];

    if (
      selectedTool.string &&
      !availableTools.includes(selectedTool.string as keyof typeof toolConfigs)
    ) {
      setSelectedTool({ string: undefined, label: "" });
    }
  }, [selectedModel.string, selectedTool.string]);

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
        forceTool: selectedTool.string,
      });
      router.push(
        `/chat/${newChatId}?model=${selectedModel.string}${
          selectedTool.string ? `&tool=${selectedTool.string}` : ""
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
        model: selectedModel.string,
        clientId: window.localStorage.getItem("clientId") || "",
        forceTool: selectedTool.string,
      });
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const modelConfig = models[selectedModel.string as keyof typeof models];
  const hasTools = modelConfig?.tools && modelConfig.tools.length > 0;

  const selectedToolIcon = selectedTool.string
    ? toolConfigs[selectedTool.string as keyof typeof toolConfigs]?.icon
    : null;
  const ToolIcon = selectedToolIcon || WrenchIcon;

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
            onSelect={(modelString, modelLabel) =>
              setSelectedModel({ string: modelString, label: modelLabel })
            }
          >
            <Button variant="outline" className="gap-2">
              {selectedModel.label}
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </ModelSelection>

          {hasTools && (
            <ToolSelection
              selectedModel={selectedModel.string}
              selectedTool={selectedTool.string}
              onSelect={(toolString, toolLabel) =>
                setSelectedTool({ string: toolString, label: toolLabel })
              }
            >
              <Button variant="outline" className="gap-2">
                <ToolIcon className="h-4 w-4" />
                {selectedTool.label}
                <ChevronDownIcon className="h-4 w-4" />
              </Button>
            </ToolSelection>
          )}
        </div>

        <Button disabled={!message.trim()} onClick={handleSend} size="icon">
          <ArrowUpIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
