import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { useMutation } from '@tanstack/react-query';
import { Alert, Card, Icon, Spinner } from '../ui.jsx';
import { useDialog } from '../DialogProvider.jsx';
import MarkdownText from '../MarkdownText.jsx';
import { askSummaryStream, clearSummaryChat } from '../../api/summaries.js';
import { getErrorMessage } from '../../api/client.js';

const SUGGESTIONS = [
  'Cỡ mẫu và đối tượng nghiên cứu là ai?',
  'Kết quả chính có ý nghĩa thống kê không?',
  'Hạn chế chính của nghiên cứu là gì?',
  'Có thể áp dụng cho người mới tập không?',
];

const MOBILE_QUERY = '(max-width: 1023px)';

export default function AskPanel({ summaryId, initialQa = [], sourceChars = 0, focusSignal = 0 }) {
  const dialog = useDialog();
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [error, setError] = useState(null);
  const [streaming, setStreaming] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches,
  );
  const scrollRef = useRef(null);
  const abortRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const history = [];
    for (const item of initialQa) {
      history.push({ role: 'user', text: item.question });
      history.push({ role: 'assistant', text: item.answer });
    }
    setMessages(history);
    setQuestion('');
    setError(null);
    abortRef.current?.abort();
    setStreaming(false);
  }, [summaryId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => abortRef.current?.abort(), []);

  // Nút "Hỏi đáp" ở phần tóm tắt: mở khung chat trên mobile và đưa con trỏ vào ô nhập.
  useEffect(() => {
    if (!focusSignal) return;
    setCollapsed(false);
  }, [focusSignal]);

  useEffect(() => {
    if (!focusSignal || collapsed) return;
    inputRef.current?.focus();
  }, [focusSignal, collapsed]);

  const clear = useMutation({
    mutationFn: () => clearSummaryChat(summaryId),
    onSuccess: () => {
      setMessages([]);
      setError(null);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const submit = async (value) => {
    const text = String(value || question).trim();
    if (text.length < 3 || streaming) return;
    setError(null);
    setQuestion('');
    setStreaming(true);
    setMessages((prev) => [
      ...prev,
      { role: 'user', text },
      { role: 'assistant', text: '', streaming: true },
    ]);

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const result = await askSummaryStream(summaryId, text, {
        signal: controller.signal,
        onDelta: (delta) => {
          setMessages((prev) => {
            const next = [...prev];
            const last = next.length - 1;
            if (last >= 0 && next[last].role === 'assistant') {
              next[last] = { ...next[last], text: next[last].text + delta };
            }
            return next;
          });
        },
      });
      setMessages((prev) => {
        const next = [...prev];
        const last = next.length - 1;
        if (last >= 0 && next[last].role === 'assistant') {
          next[last] = { ...next[last], text: result.answer || next[last].text, streaming: false };
        }
        return next;
      });
    } catch (err) {
      if (err?.name === 'AbortError') return;
      setError(getErrorMessage(err, 'Không trả lời được câu hỏi này. Vui lòng thử lại.'));
      setMessages((prev) => {
        const next = [...prev];
        const last = next.length - 1;
        if (last >= 0 && next[last].role === 'assistant' && !next[last].text) {
          next.pop();
        } else if (last >= 0 && next[last].role === 'assistant') {
          next[last] = { ...next[last], streaming: false };
        }
        return next;
      });
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  useEffect(() => {
    if (collapsed) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, streaming, collapsed]);

  return (
    <Card
      id="paper-chat"
      className={clsx(
        'flex scroll-mt-24 flex-col max-lg:p-3 max-lg:shadow-overlay',
        'lg:max-h-[calc(100dvh-6.5rem)]',
        collapsed ? 'max-lg:max-h-none' : 'max-lg:max-h-[min(80dvh,640px)]',
      )}
    >
      {/* Thanh gọn cố định trên mobile: luôn bám theo người dùng khi cuộn bài. */}
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        className={clsx(
          'w-full items-center gap-2.5 text-left lg:hidden',
          collapsed ? 'flex' : 'hidden',
        )}
        aria-label="Mở hội thoại với AI"
        aria-expanded="false"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-pine-200 bg-pine-50 text-pine-700 dark:border-pine-800 dark:bg-pine-950/60 dark:text-pine-300">
          <Icon name="book" className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-slate-900 dark:text-white">
            Hỏi AI về bài này
          </span>
          <span className="block truncate text-[11px] text-slate-500 dark:text-slate-400">
            {messages.length
              ? `${messages.length} tin nhắn · chạm để tiếp tục`
              : 'Chạm để hỏi về số liệu, phương pháp, cách áp dụng'}
          </span>
        </span>
        <Icon name="chevronDown" className="h-4 w-4 rotate-180 text-slate-400 dark:text-slate-500" />
      </button>

      <div className={clsx('flex min-h-0 flex-1 flex-col', collapsed && 'max-lg:hidden')}>
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-line pb-3 dark:border-white/[0.07]">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-[17px] font-semibold text-slate-900 dark:text-white">
              Hỏi về bài này
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              AI đã nạp{' '}
              <strong className="font-mono font-medium text-slate-700 dark:text-slate-200">
                {sourceChars.toLocaleString('vi-VN')}
              </strong>{' '}
              ký tự từ bài · lịch sử lưu riêng.
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="btn-ghost !px-2 lg:hidden"
              onClick={() => setCollapsed(true)}
              aria-label="Thu gọn hội thoại"
            >
              <Icon name="chevronDown" className="h-4 w-4" />
            </button>
            {messages.length > 0 && (
              <button
                type="button"
                className="btn-ghost !px-2 !py-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-rose-500"
                disabled={streaming || clear.isPending}
                onClick={async () => {
                  const ok = await dialog.confirm({
                    title: 'Xóa lịch sử hỏi đáp',
                    message: 'Xóa toàn bộ lịch sử hỏi đáp của bài này?',
                    confirmLabel: 'Xóa lịch sử',
                  });
                  if (ok) clear.mutate();
                }}
              >
                {clear.isPending ? 'Đang xóa...' : 'Xóa lịch sử'}
              </button>
            )}
            <span className="hidden h-8 w-8 place-items-center rounded-md border border-pine-200 bg-pine-50 text-pine-700 dark:border-pine-800 dark:bg-pine-950/60 dark:text-pine-300 sm:grid">
              <Icon name="book" className="h-4 w-4" />
            </span>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="mt-3 min-h-0 flex-1 space-y-2.5 overflow-auto rounded-md border border-line bg-paper-2/50 p-3 max-lg:max-h-[45dvh] dark:border-white/[0.08] dark:bg-white/[0.02]"
        >
          {!messages.length && (
            <div className="py-5 text-center text-xs text-slate-500 dark:text-slate-400">
              Chưa có câu hỏi. Chọn nhanh một gợi ý bên dưới hoặc gõ câu hỏi của bạn.
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={
                message.role === 'user'
                  ? 'ml-auto max-w-[85%] whitespace-pre-wrap rounded-md rounded-br-sm bg-pine-700 px-3.5 py-2.5 text-sm text-white dark:bg-pine-600'
                  : 'mr-auto max-w-[92%] rounded-md rounded-bl-sm border border-line bg-surface px-3.5 py-2.5 text-sm text-slate-700 dark:border-white/[0.08] dark:bg-[#19211e] dark:text-slate-200'
              }
            >
              {message.role === 'assistant' ? (
                message.text ? (
                  <>
                    <MarkdownText>{message.text}</MarkdownText>
                    {message.streaming && (
                      <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse rounded-sm bg-brand-500 align-middle dark:bg-brand-300" />
                    )}
                  </>
                ) : (
                  <span className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Spinner className="h-3.5 w-3.5" /> Đang tìm trong bài...
                  </span>
                )
              ) : (
                message.text
              )}
            </div>
          ))}
        </div>

        {error && (
          <Alert tone="danger" className="mt-2 shrink-0">
            {error}
          </Alert>
        )}

        {messages.length === 0 && (
          <div className="mt-3 flex shrink-0 flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => submit(s)}
                disabled={streaming}
                className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] text-slate-500 transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-50 dark:border-slate-700 dark:text-slate-400 dark:hover:text-brand-300"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          className="mt-3 flex shrink-0 items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <input
            ref={inputRef}
            className="input"
            placeholder="Hỏi về số liệu, phương pháp, cách áp dụng..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={2000}
          />
          <button
            type="submit"
            className="btn-primary !px-3"
            disabled={streaming || question.trim().length < 3}
            aria-label="Gửi câu hỏi"
          >
            <Icon name="send" className="h-4 w-4" />
          </button>
        </form>
      </div>
    </Card>
  );
}
