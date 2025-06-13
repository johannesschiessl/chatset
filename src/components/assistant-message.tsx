"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { CopyIcon, CheckIcon, BrainIcon, AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useStream } from "@convex-dev/persistent-text-streaming/react";
import { api } from "../../convex/_generated/api";
import type { StreamId } from "@convex-dev/persistent-text-streaming";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { models } from "../../models";

interface CodeBlockProps {
  children: string;
  className?: string;
}

function CodeBlock({ children, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";

  async function handleCopy() {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (match) {
    return (
      <div className="group relative">
        <div className="bg-muted flex items-center justify-between rounded-t-md px-4 py-2 text-sm">
          <span className="font-mono">{language}</span>
          <Button variant="outline" className="font-mono" onClick={handleCopy}>
            {copied ? (
              <>
                <CheckIcon />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <CopyIcon />
                <span>Copy</span>
              </>
            )}
          </Button>
        </div>
        <SyntaxHighlighter
          style={oneLight}
          language={language}
          PreTag="div"
          className="!rounded-b-md"
          customStyle={{
            margin: 0,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
          }}
        >
          {children}
        </SyntaxHighlighter>
      </div>
    );
  }

  return (
    <code className="rounded-md bg-neutral-100 px-1.5 py-0.5 font-mono text-sm dark:bg-neutral-800">
      {children}
    </code>
  );
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert prose-headings:font-semibold prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-p:text-sm prose-li:text-sm prose-blockquote:text-sm prose-code:text-xs max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code(props: any) {
            const { children, className, ...rest } = props;
            const childrenString = String(children).replace(/\n$/, "");
            const isInline = !className;

            if (isInline) {
              return (
                <code
                  className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-sm dark:bg-neutral-800"
                  {...rest}
                >
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock className={className}>{childrenString}</CodeBlock>
            );
          },
          h1: ({ children }) => (
            <h1 className="mt-6 mb-4 text-xl font-semibold first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-5 mb-3 text-lg font-semibold first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-4 mb-2 text-base font-semibold first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="mt-3 mb-2 text-sm font-semibold first:mt-0">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="mb-3 text-sm last:mb-0">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-3 list-disc space-y-1 pl-4 text-sm">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 list-decimal space-y-1 pl-4 text-sm">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="text-sm">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="mb-3 border-l-4 pl-4 text-sm italic">
              {children}
            </blockquote>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-blue-600 hover:underline dark:text-blue-400"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="mb-3 overflow-hidden rounded-md border-2">
              <table className="min-w-full text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-neutral-100 dark:bg-neutral-800">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-border divide-y-2">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="divide-border divide-x-2">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left font-semibold">{children}</th>
          ),
          td: ({ children }) => <td className="px-3 py-2">{children}</td>,
          hr: () => <hr className="my-4 rounded-md border" />,
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function extractThinkingSections(content: string) {
  const thinkingRegex = /<think>([\s\S]*?)<\/think>/g;
  const thinkingSections: string[] = [];
  let match;

  while ((match = thinkingRegex.exec(content)) !== null) {
    thinkingSections.push(match[1].trim());
  }

  const mainContent = content.replace(thinkingRegex, "").trim();

  return { thinkingSections, mainContent };
}

if (!process.env.NEXT_PUBLIC_CONVEX_HTTP_URL) {
  throw new Error("NEXT_PUBLIC_CONVEX_HTTP_URL must be set");
}

interface AssistantMessageProps {
  streamId: StreamId;
  clientId: string;
  model: string;
  content?: string;
}

export default function AssistantMessage({
  clientId,
  streamId,
  model,
  content,
}: AssistantMessageProps) {
  function useConditionalStream() {
    if (content) {
      return { text: "", status: "done" as const };
    }

    var driven = false;
    if (clientId === window.localStorage.getItem("clientId")) {
      driven = true;
    }

    return useStream(
      api.streaming.getStreamBody,
      new URL(process.env.NEXT_PUBLIC_CONVEX_HTTP_URL + "/streamMessage"),
      driven,
      streamId,
    );
  }

  const streamResult = useConditionalStream();

  const text = content || streamResult.text || "";
  const status = content ? "done" : streamResult.status;

  const { thinkingSections, mainContent } = extractThinkingSections(text);

  return (
    <div className="mb-4">
      {status === "pending" && (
        <div className="text-muted-foreground">
          <div className="flex gap-1">
            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]"></div>
            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]"></div>
            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-current"></div>
          </div>
        </div>
      )}
      {status === "error" && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Sorry, something went wrong.</AlertTitle>
          <AlertDescription>Please try again.</AlertDescription>
        </Alert>
      )}
      {status === "timeout" && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Request timed out.</AlertTitle>
          <AlertDescription>Please try again.</AlertDescription>
        </Alert>
      )}

      {thinkingSections.length > 0 && (
        <div className="mb-4">
          <Accordion type="single" collapsible className="w-full rounded-md">
            <AccordionItem value="thinking">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <BrainIcon className="size-4" />
                  Thinking...
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-muted-foreground space-y-4">
                  {thinkingSections.map((thinking, index) => (
                    <div className="border-l-2 pl-2" key={index}>
                      <MarkdownContent content={thinking} />
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}

      <MarkdownContent content={mainContent} />
      {status === "done" && (
        <span className="text-muted-foreground text-xs">
          Generated with {models[model as keyof typeof models].label}
        </span>
      )}
    </div>
  );
}
