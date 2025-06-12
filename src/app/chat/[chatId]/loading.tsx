export default function ChatLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-muted-foreground">
        <div className="flex gap-2">
          <div className="h-6 w-6 animate-bounce rounded-full bg-current [animation-delay:-0.3s]"></div>
          <div className="h-6 w-6 animate-bounce rounded-full bg-current [animation-delay:-0.15s]"></div>
          <div className="h-6 w-6 animate-bounce rounded-full bg-current"></div>
        </div>
      </div>
    </div>
  );
}
