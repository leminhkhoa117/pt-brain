import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Alert, Card, Icon, Spinner } from '../ui.jsx';
import { askSummary, clearSummaryChat } from '../../api/summaries.js';
import { getErrorMessage } from '../../api/client.js';

const SUGGESTIONS = [
  'Cỡ mẫu và đối tượng nghiên cứu là ai?',
  'Kết quả chính có ý nghĩa thống kê không?',
  'Hạn chế chính của nghiên cứu là gì?',
  'Có thể áp dụng cho người mới tập không?',
];

export default function AskPanel({ summaryId, initialQa = [], sourceChars = 0 }) {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const history = [];
    for (const item of initialQa) {
      history.push({ role: 'user', text: item.question });
      history.push({ role: 'assistant', text: item.answer });
    }
    setMessages(history);
    setQuestion('');
    setError(null);
  }, [summaryId]); // eslint-disable-line react-hooks/exhaustive-deps

  const ask = useMutation({
    mutationFn: (q) => askSummary(summaryId, q),
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: 'assistant', text: data.answer }]);
      setError(null);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const clear = useMutation({
    mutationFn: () => clearSummaryChat(summaryId),
    onSuccess: () => {
      setMessages([]);
      setError(null);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const submit = (value) => {
    const text = String(value || question).trim();
    if (text.length < 3 || ask.isPending) return;
    setError(null);
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setQuestion('');
    ask.mutate(text);
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, ask.isPending]);

  return (
    <Card id="paper-chat" className="scroll-mt-24">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Hỏi về bài này</h3>
          <p className="text-xs text-slate-400">
            AI đã nạp{' '}
            <strong className="font-semibold text-slate-500 dark:text-slate-300">
              {sourceChars.toLocaleString('vi-VN')}
            </strong>{' '}
            ký tự từ bài · lịch sử được lưu riêng cho bài này.
          </p>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              type="button"
              className="btn-ghost !px-2 !py-1 text-[11px] text-slate-400 hover:text-rose-500"
              disabled={clear.isPending}
              onClick={() => {
                if (window.confirm('Xóa toàn bộ lịch sử hỏi đáp của bài này?')) clear.mutate();
              }}
            >
              {clear.isPending ? 'Đang xóa...' : 'Xóa lịch sử'}
            </button>
          )}
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300">
            <Icon name="book" className="h-4 w-4" />
          </span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="mt-3 max-h-80 space-y-2.5 overflow-auto rounded-xl bg-slate-50 p-3 dark:bg-slate-950/40"
      >
        {!messages.length && (
          <div className="py-4 text-center text-xs text-slate-400">
            Chưa có câu hỏi. Thử một gợi ý bên dưới.
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={
              message.role === 'user'
                ? 'ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-brand-600 px-3 py-2 text-sm text-white'
                : 'mr-auto max-w-[92%] whitespace-pre-wrap rounded-2xl rounded-bl-md bg-white px-3 py-2 text-sm text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200'
            }
          >
            {message.text}
          </div>
        ))}
        {ask.isPending && (
          <div className="mr-auto flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-xs text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-400">
            <Spinner className="h-3.5 w-3.5" /> Đang tìm trong bài...
          </div>
        )}
      </div>

      {error && (
        <Alert tone="danger" className="mt-2">
          {error}
        </Alert>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => submit(s)}
            disabled={ask.isPending}
            className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] text-slate-500 transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-50 dark:border-slate-700 dark:text-slate-400 dark:hover:text-brand-300"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        className="mt-3 flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <input
          className="input"
          placeholder="Ví dụ: effect size của kết quả chính là bao nhiêu?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={2000}
        />
        <button
          type="submit"
          className="btn-primary !px-3"
          disabled={ask.isPending || question.trim().length < 3}
          aria-label="Gửi câu hỏi"
        >
          <Icon name="send" className="h-4 w-4" />
        </button>
      </form>
    </Card>
  );
}
