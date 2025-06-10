export default function AssistantMessage({ content }: { content: string }) {
  return (
    <div className="mb-4">
      <p className="text-sm">{content}</p>
    </div>
  );
}
