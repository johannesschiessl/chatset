import MessageInput from "@/components/message-input";

export default function ChatPage() {
  return (
    // TODO: Remove mt-80
    <div className="mt-80 flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="text-foreground text-2xl font-semibold">
          How can I help you today?
        </h1>
      </div>
      <div className="w-full">
        <MessageInput />
      </div>
    </div>
  );
}
