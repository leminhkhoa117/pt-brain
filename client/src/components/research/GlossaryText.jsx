import { Fragment, useMemo } from 'react';

function escapeRegExp(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Bọc thuật ngữ khó bằng <abbr> có tooltip ngay tại chỗ.
 * Mỗi thuật ngữ chỉ được bọc lần xuất hiện đầu tiên trong đoạn text.
 */
export default function GlossaryText({ text = '', glossary = [], className = '' }) {
  const nodes = useMemo(() => {
    const source = String(text || '');
    const terms = (glossary || [])
      .flatMap((term) => [
        { key: term.en, term },
        { key: term.vi, term },
      ])
      .filter((item) => item.key && item.key.length >= 3)
      .sort((a, b) => b.key.length - a.key.length);

    if (!terms.length || !source) return source;

    const used = new Set();
    const pattern = new RegExp(`(${terms.map((item) => escapeRegExp(item.key)).join('|')})`, 'gi');
    const parts = source.split(pattern);

    return parts.map((part, index) => {
      const match = terms.find((item) => item.key.toLowerCase() === part.toLowerCase());
      if (!match || used.has(match.term.en)) return <Fragment key={index}>{part}</Fragment>;
      used.add(match.term.en);
      const title = [match.term.vi, match.term.explanation, match.term.example ? `Ví dụ: ${match.term.example}` : '']
        .filter(Boolean)
        .join(' — ');
      return (
        <abbr
          key={index}
          title={title}
          className="cursor-help border-b border-dotted border-brand-400/70 no-underline dark:border-brand-500/70"
        >
          {part}
        </abbr>
      );
    });
  }, [text, glossary]);

  return <span className={className}>{nodes}</span>;
}
