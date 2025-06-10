import UserMessage from "@/components/user-message";
import AssistantMessage from "@/components/assistant-message";

interface MessagesListProps {
  messages: any[];
}

export default function MessagesList({ messages }: MessagesListProps) {
  return (
    <div className="space-y-2">
      {messages.map((message, index) => (
        <div key={index}>
          {message.role === "user" ? (
            <UserMessage content={message.content} />
          ) : (
            <AssistantMessage content={message.content} />
          )}
        </div>
      ))}
    </div>
  );
}
