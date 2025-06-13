import MessageInput from "@/components/message-input";
import MessagesList from "@/components/messages-list";
import { api } from "../../../../convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import { Id } from "../../../../convex/_generated/dataModel";

type Params = Promise<{ chatId: Id<"chats"> }>;
type SearchParams = Promise<{ model: string }>;

export default async function ChatPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { chatId } = await params;
  const { model } = await searchParams;

  const preloadedMessages = await preloadQuery(api.messages.getMessages, {
    chatId: chatId,
  });

  return (
    <div className="mx-auto max-w-2xl pt-4 pb-60">
      <MessagesList preloadedMessages={preloadedMessages} />
      <MessageInput chatId={chatId} model={model} />
    </div>
  );
}
