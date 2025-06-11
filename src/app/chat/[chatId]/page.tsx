import MessageInput from "@/components/message-input";
import MessagesList from "@/components/messages-list";
import { api } from "../../../../convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import { Id } from "../../../../convex/_generated/dataModel";

type Params = Promise<{ chatId: Id<"chats"> }>;

export default async function ChatPage({ params }: { params: Params }) {
  const { chatId } = await params;
  const preloadedMessages = await preloadQuery(api.messages.getMessages, {
    chatId: chatId,
  });

  return (
    <div className="mx-auto max-w-2xl pt-4 pb-20">
      <MessagesList preloadedMessages={preloadedMessages} />
      <MessageInput chatId={chatId} />
    </div>
  );
}
