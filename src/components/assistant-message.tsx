"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { CopyIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <div className="flex items-center justify-between rounded-t-md bg-neutral-800 px-4 py-2 text-sm">
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
          style={oneDark}
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

export default function AssistantMessage({ content }: { content: string }) {
  return (
    <div className="mb-4">
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
            hr: () => <hr className="my-4 rounded-md border-2" />,
            strong: ({ children }) => (
              <strong className="font-semibold">{children}</strong>
            ),
            em: ({ children }) => <em className="italic">{children}</em>,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
