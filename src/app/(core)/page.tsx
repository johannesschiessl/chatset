"use client";

import { useState } from "react";
import MessageInput from "@/components/message-input";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

const examplePrompts = [
  'How many Rs are in the word "strawberry"?',
  "What is the purpose of the universe?",
  "Explain quantum computing in simple terms",
  "Help me write a React component",
  "What are the best practices for TypeScript?",
  "Create a simple to-do list app",
];

export default function HomePage() {
  const [hasMessage, setHasMessage] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const session = authClient.useSession();

  const handlePromptSelect = (prompt: string) => {
    setSelectedPrompt(prompt);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto pr-2 pb-4">
        {!hasMessage && !session.isPending && (
          <div className="flex h-full flex-col items-center justify-center space-y-8">
            <h1 className="text-foreground text-center text-3xl font-semibold">
              How can I help you, {session.data?.user?.name.split(" ")[0]}?
            </h1>

            {/* Example prompts */}
            <div className="w-full max-w-md space-y-4">
              {examplePrompts.map((prompt, index) => (
                <Button
                  key={index}
                  onClick={() => handlePromptSelect(prompt)}
                  variant="outline"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="mb-5 flex-shrink-0">
        <MessageInput
          onMessageChange={setHasMessage}
          message={selectedPrompt}
        />
      </div>
    </div>
  );
}
