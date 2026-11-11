import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Alert, Card, Icon, Spinner } from '../../components/ui.jsx';
import MarkdownText from '../../components/MarkdownText.jsx';
import { askMuscleCoach } from '../../api/muscles.js';
import { getErrorMessage } from '../../api/client.js';

const SUGGESTIONS = [
  'Cơ này có chức năng gì khi tập?',
  'Bài tập nào tốt nhất cho cơ này?',
  'Nên tập bao nhiêu set mỗi tuần?',
  'Khởi động và giãn cơ thế nào?',
  'Đau khi tập cơ này thì nên làm gì?',
];

export default function MuscleChat({ muscle }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const muscleSlugRef = useRef(muscle?.slug);

  const ask = useMutation({
    mutationFn: (payload) => askMuscleCoach(payload),
    onSuccess: (data, variables) => {
      // Bỏ qua câu trả lời của cơ cũ nếu người dùng đã chọn cơ khác trong lúc chờ.
      if (variables?.slug !== muscleSlugRef.current) return;
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
      setError(null);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  useEffect(() => {
    muscleSlugRef.current = muscle?.slug;
    setMessages([]);
    setInput('');
    setError(null);
    ask.reset();
  }, [muscle?.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, ask.isPending]);

  const history = useMemo(
    () =>
      messages
        .filter((item) => item.role === 'user' || item.role === 'assistant')
        .map((item) => ({ role: item.role, content: item.content.slice(0, 3000) }))
        .slice(-8),
    [messages],
  );

  const send = (text) => {
    const message = String(text || '').trim();
    if (!message || !muscle || ask.isPending) return;
    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setInput('');
    setError(null);
    ask.mutate({
      slug: muscle.slug,
      message,
      history,
    });
  };

  return (
    <Card className="flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white">
            <Icon name="target" className="h-4 w-4 text-brand-500" />
            Hỏi HLV AI về cơ này
          </h3>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            {muscle
              ? `Đang hỏi về ${muscle.vi} (${muscle.en}).`
              : 'Chọn một cơ trên mô hình để bắt đầu hỏi.'}
          </p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-rose-500"
            onClick={() => {
              setMessages([]);
              setError(null);
            }}
          >
            Xoá chat
          </button>
        )}
      </div>

      {error && (
        <Alert tone="danger" className="mt-3">
          {error}
        </Alert>
      )}

      <div
        ref={scrollRef}
        className="mt-3 max-h-[360px] min-h-[160px] space-y-2 overflow-y-auto rounded-xl bg-slate-50/80 p-3 dark:bg-white/[0.03]"
      >
        {!messages.length && !ask.isPending && (
          <div className="py-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {muscle
                ? 'Hỏi về kỹ thuật, bài tập, lịch tập, khởi động hoặc phục hồi liên quan đến cơ đang chọn.'
                : 'Nhấn vào một cơ trên mô hình 3D hoặc danh sách bên dưới.'}
            </p>
            {muscle && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-brand-700 dark:hover:text-brand-300"
                    onClick={() => send(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((item, index) => (
          <div
            key={`${item.role}-${index}`}
            className={item.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
          >
            <div
              className={
                item.role === 'user'
                  ? 'max-w-[88%] rounded-lg rounded-br-md bg-brand-600 px-3 py-2 text-xs text-white'
                  : 'max-w-[92%] rounded-lg rounded-bl-md bg-white px-3 py-2 text-xs text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200'
              }
            >
              {item.role === 'user' ? (
                <p className="whitespace-pre-wrap">{item.content}</p>
              ) : (
                <MarkdownText>{item.content}</MarkdownText>
              )}
            </div>
          </div>
        ))}

        {ask.isPending && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Spinner className="h-4 w-4" />
            AI đang soạn câu trả lời...
          </div>
        )}
      </div>

      <form
        className="mt-3 flex items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          send(input);
        }}
      >
        <textarea
          className="input min-h-[44px] flex-1 resize-none !py-2 text-sm"
          rows={2}
          maxLength={1500}
          placeholder={muscle ? 'Hỏi về cơ này...' : 'Chọn một cơ trước'}
          value={input}
          disabled={!muscle || ask.isPending}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              send(input);
            }
          }}
        />
        <button
          type="submit"
          className="btn-primary !px-3 !py-2.5"
          disabled={!muscle || !input.trim() || ask.isPending}
          aria-label="Gửi câu hỏi"
        >
          {ask.isPending ? (
            <Spinner className="h-4 w-4 text-white" />
          ) : (
            <Icon name="send" className="h-4 w-4" />
          )}
        </button>
      </form>
      <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
        AI chỉ đưa thông tin tập luyện tham khảo, không chẩn đoán hay điều trị. Đau cấp, sưng, tê
        hoặc mất vận động cần gặp bác sĩ/chuyên gia.
      </p>
    </Card>
  );
}
