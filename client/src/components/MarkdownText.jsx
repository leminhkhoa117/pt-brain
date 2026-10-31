import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import clsx from 'clsx';

/**
 * Render Markdown an toàn (không bật HTML thô) cho phản hồi AI.
 * Hỗ trợ in đậm, in nghiêng, danh sách, code, bảng, link.
 */
export default function MarkdownText({ children, className, compact = false }) {
  if (!children) return null;

  return (
    <div
      className={clsx(
        'markdown-body min-w-0 break-words',
        compact ? 'text-xs leading-relaxed' : 'text-sm leading-relaxed',
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children: content }) => (
            <p className="mb-2 leading-relaxed last:mb-0">{content}</p>
          ),
          strong: ({ children: content }) => (
            <strong className="font-bold text-slate-900 dark:text-white">{content}</strong>
          ),
          em: ({ children: content }) => <em className="italic">{content}</em>,
          del: ({ children: content }) => (
            <del className="text-slate-400 line-through">{content}</del>
          ),
          ul: ({ children: content }) => (
            <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0 marker:text-brand-500">
              {content}
            </ul>
          ),
          ol: ({ children: content }) => (
            <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0 marker:font-semibold marker:text-brand-500">
              {content}
            </ol>
          ),
          li: ({ children: content }) => <li className="pl-0.5">{content}</li>,
          h1: ({ children: content }) => (
            <h3 className="mb-1.5 mt-3 text-base font-bold text-slate-900 first:mt-0 dark:text-white">
              {content}
            </h3>
          ),
          h2: ({ children: content }) => (
            <h3 className="mb-1.5 mt-3 text-sm font-bold text-slate-900 first:mt-0 dark:text-white">
              {content}
            </h3>
          ),
          h3: ({ children: content }) => (
            <h4 className="mb-1 mt-2.5 text-sm font-bold text-slate-800 first:mt-0 dark:text-slate-100">
              {content}
            </h4>
          ),
          h4: ({ children: content }) => (
            <h4 className="mb-1 mt-2 text-xs font-bold uppercase tracking-wide text-slate-500 first:mt-0">
              {content}
            </h4>
          ),
          blockquote: ({ children: content }) => (
            <blockquote className="my-2 border-l-2 border-brand-300 pl-3 text-slate-500 italic dark:border-brand-700 dark:text-slate-400">
              {content}
            </blockquote>
          ),
          a: ({ href, children: content }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
            >
              {content}
            </a>
          ),
          code: ({ children: content }) => (
            <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.9em] text-slate-700 dark:bg-white/[0.08] dark:text-slate-200">
              {content}
            </code>
          ),
          pre: ({ children: content }) => (
            <pre className="my-2 overflow-x-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-100 dark:bg-black/50">
              {content}
            </pre>
          ),
          hr: () => <hr className="my-3 border-slate-200 dark:border-slate-700" />,
          table: ({ children: content }) => (
            <div className="my-2 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
              <table className="min-w-full text-xs">{content}</table>
            </div>
          ),
          thead: ({ children: content }) => (
            <thead className="bg-slate-50 text-left text-slate-500 dark:bg-white/[0.04] dark:text-slate-400">
              {content}
            </thead>
          ),
          th: ({ children: content }) => (
            <th className="px-2.5 py-1.5 font-semibold">{content}</th>
          ),
          td: ({ children: content }) => (
            <td className="border-t border-slate-100 px-2.5 py-1.5 dark:border-slate-800">
              {content}
            </td>
          ),
          input: ({ checked, ...props }) => (
            <input type="checkbox" checked={checked} readOnly className="mr-1.5 align-middle" {...props} />
          ),
        }}
      >
        {String(children)}
      </ReactMarkdown>
    </div>
  );
}
