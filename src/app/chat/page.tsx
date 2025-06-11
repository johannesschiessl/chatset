import MessageInput from "@/components/message-input";
import MessagesList from "@/components/messages-list";
import { api } from "../../../convex/_generated/api";
import { preloadQuery } from "convex/nextjs";

export default async function ChatPage() {
  const preloadedMessages = await preloadQuery(api.messages.getMessages);

  return (
    <div className="mx-auto max-w-2xl pt-4 pb-20">
      <MessagesList preloadedMessages={preloadedMessages} />
      <MessageInput />
    </div>
  );
}
