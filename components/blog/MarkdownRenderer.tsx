import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { cn } from "@/lib/utils/cn";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const components: Components = {
  h1: ({ node, ...props }) => <h1 className="mb-4 text-3xl font-bold text-slate-900" {...props} />,
  h2: ({ node, ...props }) => (
    <h2 className="mb-3 mt-8 text-2xl font-semibold text-slate-800" {...props} />
  ),
  h3: ({ node, ...props }) => (
    <h3 className="mb-2 mt-6 text-xl font-semibold text-slate-800" {...props} />
  ),
  p: ({ node, ...props }) => <p className="mb-4 leading-relaxed text-slate-600" {...props} />,
  a: ({ node, ...props }) => (
    <a
      className="text-brand-600 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  ul: ({ node, ...props }) => <ul className="mb-4 list-disc space-y-1 pl-5" {...props} />,
  ol: ({ node, ...props }) => <ol className="mb-4 list-decimal space-y-1 pl-5" {...props} />,
  li: ({ node, ...props }) => <li className="text-slate-600" {...props} />,
  blockquote: ({ node, ...props }) => (
    <blockquote
      className="mb-4 rounded-r border-l-4 border-brand-300 bg-slate-50 py-2 pl-4 italic text-slate-500"
      {...props}
    />
  ),
  code: ({ node, className, children, ...props }) => {
    const isBlock = /language-/.test(className || "");
    if (isBlock) {
      return (
        <pre className="mb-4 overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm text-slate-100">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      );
    }
    return (
      <code
        className={cn(
          "rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-slate-700",
          className
        )}
        {...props}
      >
        {children}
      </code>
    );
  },
  img: ({ node, ...props }) => (
    <img className="my-6 w-full rounded-xl" {...props} alt={props.alt || ""} />
  ),
  hr: ({ node, ...props }) => <hr className="my-8 border-slate-200" {...props} />,
};

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("prose-custom", className)}>
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}
