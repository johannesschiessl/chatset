"use client";

import MessageInput from "@/components/message-input";
import MessagesList from "@/components/messages-list";
import { useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);

  function handleSend(message: string) {
    setMessages([...messages, { role: "user", content: message }]);
  }

  return (
    <div className="mx-auto max-w-2xl pt-4 pb-20">
      <MessagesList messages={messages} />
      <MessageInput onSend={handleSend} />
    </div>
  );
}
