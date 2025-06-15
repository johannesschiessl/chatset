import MessageInput from "@/components/message-input";
import MessagesList from "@/components/messages-list";
import { api } from "../../../../convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import { Id } from "../../../../convex/_generated/dataModel";

type Params = Promise<{ chatId: Id<"chats"> }>;
type SearchParams = Promise<{ model: string; tool?: string }>;

export default async function ChatPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { chatId } = await params;
  const { model, tool } = await searchParams;

  const preloadedMessages = await preloadQuery(api.messages.getMessages, {
    chatId: chatId,
  });

  // TODO: figure out how to make the scroll bar better, so we don't need pr-2
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto pr-2 pb-4">
        <MessagesList preloadedMessages={preloadedMessages} />
      </div>
      <div className="mb-5 flex-shrink-0">
        <MessageInput chatId={chatId} model={model} forceTool={tool} />
      </div>
    </div>
  );
}
