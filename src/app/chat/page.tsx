import MessageInput from "@/components/message-input";

export default function ChatPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="text-foreground text-2xl font-semibold">
          How can I help you today?
        </h1>
      </div>
      <div className="w-full max-w-2xl">
        <MessageInput />
      </div>
    </div>
  );
}
