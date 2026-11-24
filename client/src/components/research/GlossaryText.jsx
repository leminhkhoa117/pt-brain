import { Fragment, createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Hành động dùng chung cho mọi thuật ngữ trong một bản tóm tắt:
 * lưu vào từ điển, tạo flashcard. Provider nằm ở SummaryView, Consumer ở đây,
 * nhờ vậy không phải truyền props qua từng khối văn bản.
 */
export const GlossaryActionsContext = createContext(null);

function escapeRegExp(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function termKeys(term) {
  const keys = [term.en, term.vi, ...(Array.isArray(term.aliases) ? term.aliases : [])];
  const seen = new Set();
  return keys
    .map((key) => String(key || '').trim())
    .filter((key) => {
      if (key.length < 3) return false;
      const normalized = key.toLowerCase();
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
}

function TermHint({ term, label }) {
  const actions = useContext(GlossaryActionsContext);
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const saved = Boolean(actions?.savedTerms?.has(term.en));
  const saving = actions?.savingTerm === term.en;
  const canSave = Boolean(actions?.onSaveTerm);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const tooltip = [term.vi, term.explanation, term.example ? `Ví dụ: ${term.example}` : '']
    .filter(Boolean)
    .join(' — ');

  return (
    <span className="relative inline-block" ref={rootRef}>
      <button
        type="button"
        title={tooltip}
        aria-expanded={open}
        aria-label={`Thuật ngữ ${term.en}: ${term.vi}`}
        onClick={() => setOpen((value) => !value)}
        className="cursor-help rounded-[calc(2px*var(--ts-radius,1))] border-b border-dotted border-brand-500/70 bg-brand-50/40 px-[1px] text-inherit no-underline transition-colors hover:bg-brand-100/60 dark:border-brand-400/70 dark:bg-brand-950/30 dark:hover:bg-brand-950/60"
      >
        {label}
      </button>
      {open ? (
        <span
          role="dialog"
          aria-label={`Giải thích thuật ngữ ${term.en}`}
          className="absolute bottom-full left-0 z-40 mb-1.5 block w-72 max-w-[min(20rem,80vw)] rounded-lg border border-line bg-surface p-3 text-left shadow-overlay dark:border-white/15"
        >
          <span className="block font-mono text-[10px] font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
            {term.en}
          </span>
          <span className="mt-0.5 block text-[13px] font-semibold text-slate-900 dark:text-white">
            {term.vi}
          </span>
          <span className="mt-1 block text-xs font-normal leading-relaxed text-slate-600 dark:text-slate-300">
            {term.explanation}
          </span>
          {term.example ? (
            <span className="mt-1 block text-[11px] font-normal italic leading-relaxed text-slate-500 dark:text-slate-400">
              Ví dụ: {term.example}
            </span>
          ) : null}
          {canSave ? (
            <span className="mt-2 flex flex-wrap items-center gap-1.5">
              {saved ? (
                <>
                  <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    Đã lưu
                  </span>
                  {actions.onMakeFlashcard ? (
                    <button
                      type="button"
                      className="badge border border-line bg-surface text-slate-700 hover:border-pine-600 dark:border-white/15 dark:bg-slate-900 dark:text-slate-200"
                      onClick={() => actions.onMakeFlashcard(term)}
                    >
                      Tạo flashcard
                    </button>
                  ) : null}
                </>
              ) : (
                <button
                  type="button"
                  className="badge bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-60 dark:bg-brand-500 dark:text-brand-950"
                  disabled={saving}
                  onClick={() => actions.onSaveTerm(term)}
                >
                  {saving ? 'Đang lưu...' : '+ Lưu vào từ điển'}
                </button>
              )}
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}

/**
 * Bọc thuật ngữ khó bằng nút có popover giải thích ngay tại chỗ và nút lưu
 * vào từ điển / tạo flashcard. Mỗi thuật ngữ chỉ được bọc lần đầu tiên để
 * đoạn văn không bị rối.
 */
export default function GlossaryText({ text = '', glossary = [], className = '' }) {
  const nodes = useMemo(() => {
    const source = String(text || '');
    const terms = (glossary || [])
      .flatMap((term) => termKeys(term).map((key) => ({ key, term })))
      .filter((item) => item.key)
      .sort((a, b) => b.key.length - a.key.length);

    if (!terms.length || !source) return source;

    const used = new Set();
    const pattern = new RegExp(`(${terms.map((item) => escapeRegExp(item.key)).join('|')})`, 'gi');
    const parts = source.split(pattern);

    return parts.map((part, index) => {
      const match = terms.find((item) => item.key.toLowerCase() === part.toLowerCase());
      if (!match || used.has(match.term.en)) return <Fragment key={index}>{part}</Fragment>;
      used.add(match.term.en);
      return <TermHint key={index} term={match.term} label={part} />;
    });
  }, [text, glossary]);

  return <span className={className}>{nodes}</span>;
}
