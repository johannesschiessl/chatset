"use client";

import MessageInput from "@/components/message-input";
import MessagesList from "@/components/messages-list";

export default function ChatPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto pr-2 pb-4">
        <MessagesList />
      </div>
      <div className="mb-5 flex-shrink-0">
        <MessageInput />
      </div>
    </div>
  );
}
