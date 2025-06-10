export default function UserMessage({ content }: { content: string }) {
  return (
    <div className="mb-4 flex justify-end">
      <div className="bg-muted ml-auto max-w-3/4 rounded-md p-3 break-words">
        <p className="text-sm whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}
