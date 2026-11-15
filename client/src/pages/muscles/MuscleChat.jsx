import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { Alert, Card, Icon, Spinner } from '../../components/ui.jsx';
import MarkdownText from '../../components/MarkdownText.jsx';
import { askMuscleCoachStream } from '../../api/muscles.js';
import { getErrorMessage } from '../../api/client.js';
import { readStored, removeStored, writeStored } from '../../lib/persist.js';

const SUGGESTIONS = [
  'Cơ này có chức năng gì khi tập?',
  'Bài tập nào tốt nhất cho cơ này?',
  'Nên tập bao nhiêu set mỗi tuần?',
  'Khởi động và giãn cơ thế nào?',
  'Đau khi tập cơ này thì nên làm gì?',
];

const chatKey = (slug) => `ptbrain:muscle-chat:${slug}`;
const MAX_SAVED = 40;

export default function MuscleChat({ muscle, onClose, onHeaderPointerDown, active = true }) {
  const slug = muscle?.slug || '';
  const [messages, setMessages] = useState(() => (slug ? readStored(chatKey(slug), []) : []));
  const [loadedSlug, setLoadedSlug] = useState(slug);
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef(null);
  const abortRef = useRef(null);
  const slugRef = useRef(slug);
  const inputRef = useRef(null);


  // Đổi cơ: nạp lại lịch sử riêng của cơ đó thay vì xóa trắng.
  if (slug !== loadedSlug) {
    setLoadedSlug(slug);
    setMessages(slug ? readStored(chatKey(slug), []) : []);
  }

  useEffect(() => {
    slugRef.current = slug;
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
    setError(null);
    setInput('');
  }, [slug]);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Lưu lịch sử theo từng cơ để bấm sang cơ khác rồi quay lại vẫn còn hội thoại.
  useEffect(() => {
    if (!slug || loadedSlug !== slug) return;
    writeStored(chatKey(slug), messages.slice(-MAX_SAVED));
  }, [messages, slug, loadedSlug]);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, streaming]);

  // Mở lại khung chat: nhảy xuống tin nhắn mới nhất thay vì giữ vị trí cuộn cũ.
  useEffect(() => {
    if (!active) return;
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [active]);

  const history = useMemo(
    () =>
      messages
        .filter((item) => item.role === 'user' || item.role === 'assistant')
        .filter((item) => item.content)
        .map((item) => ({ role: item.role, content: item.content.slice(0, 3000) }))
        .slice(-8),
    [messages],
  );

  const clearChat = () => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setStreaming(false);
    if (slug) removeStored(chatKey(slug));
  };

  const send = async (text) => {
    const message = String(text || '').trim();
    if (!message || !muscle || streaming) return;
    const past = history;
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: message },
      { role: 'assistant', content: '', streaming: true },
    ]);
    setInput('');
    setError(null);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const result = await askMuscleCoachStream({
        slug: muscle.slug,
        message,
        history: past,
        signal: controller.signal,
        onDelta: (delta) => {
          if (slugRef.current !== muscle.slug) return;
          setMessages((prev) => {
            const next = [...prev];
            const last = next.length - 1;
            if (last >= 0 && next[last].role === 'assistant') {
              next[last] = { ...next[last], content: next[last].content + delta };
            }
            return next;
          });
        },
      });
      setMessages((prev) => {
        const next = [...prev];
        const last = next.length - 1;
        if (last >= 0 && next[last].role === 'assistant') {
          next[last] = {
            role: 'assistant',
            content: result.answer || next[last].content,
          };
        }
        return next;
      });
    } catch (err) {
      if (err?.name === 'AbortError' || slugRef.current !== muscle.slug) return;
      setError(
        err?.response
          ? getErrorMessage(err)
          : err?.message || 'Không trả lời được câu hỏi này. Vui lòng thử lại.',
      );
      setMessages((prev) => {
        const next = [...prev];
        const last = next.length - 1;
        if (last >= 0 && next[last].role === 'assistant' && !next[last].content) {
          next.pop();
        } else if (last >= 0 && next[last].role === 'assistant') {
          next[last] = { ...next[last], streaming: false };
        }
        return next;
      });
    } finally {
      if (slugRef.current === muscle.slug) setStreaming(false);
      if (abortRef.current === controller) abortRef.current = null;
    }
  };

  const visibleMessages = loadedSlug === slug ? messages : [];

  return (
    <Card id="muscle-chat" className="flex min-h-0 flex-1 flex-col !p-3">
      <div
        onPointerDown={onHeaderPointerDown}
        className={clsx(
          'flex select-none items-start justify-between gap-2 rounded-lg px-1 pb-1',
          onHeaderPointerDown && 'cursor-grab touch-none active:cursor-grabbing',
        )}
        title={onHeaderPointerDown ? 'Giữ và kéo để di chuyển khung chat' : undefined}
      >
        <div className="min-w-0">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white">
            <span
              aria-hidden="true"
              className="mr-0.5 grid h-6 w-3.5 shrink-0 grid-cols-2 content-center justify-items-center gap-[2px] text-slate-300 dark:text-slate-600"
            >
              <span className="h-[3px] w-[3px] rounded-full bg-current" />
              <span className="h-[3px] w-[3px] rounded-full bg-current" />
              <span className="h-[3px] w-[3px] rounded-full bg-current" />
              <span className="h-[3px] w-[3px] rounded-full bg-current" />
              <span className="h-[3px] w-[3px] rounded-full bg-current" />
              <span className="h-[3px] w-[3px] rounded-full bg-current" />
            </span>
            <Icon name="chat" className="h-4 w-4 text-brand-500" />
            Hỏi HLV AI về cơ này
          </h3>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            {muscle
              ? `Đang hỏi về ${muscle.vi} (${muscle.en}). Hội thoại được lưu riêng cho cơ này.`
              : 'Chọn một cơ trên mô hình để bắt đầu hỏi.'}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {visibleMessages.length > 0 && (
            <button
              type="button"
              className="rounded-md px-1.5 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-100 hover:text-rose-500 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-white/10"
              onClick={clearChat}
              disabled={streaming}
            >
              Xoá chat
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Thu gọn khung chat"
              title="Thu gọn khung chat"
              className="grid h-7 w-7 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <Icon name="chevronDown" className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <Alert tone="danger" className="mt-3">
          {error}
        </Alert>
      )}

      <div
        ref={scrollRef}
        className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto rounded-xl bg-slate-50/80 p-3 dark:bg-white/[0.03]"
      >
        {!visibleMessages.length && !streaming && (
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

        {visibleMessages.map((item, index) => (
          <div
            key={`${item.role}-${index}`}
            className={item.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
          >
            <div
              className={
                item.role === 'user'
                  ? 'max-w-[88%] whitespace-pre-wrap rounded-lg rounded-br-md bg-brand-600 px-3 py-2 text-xs text-white'
                  : 'max-w-[92%] rounded-lg rounded-bl-md bg-white px-3 py-2 text-xs text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200'
              }
            >
              {item.role === 'user' ? (
                <p className="whitespace-pre-wrap">{item.content}</p>
              ) : item.content ? (
                <>
                  <MarkdownText>{item.content}</MarkdownText>
                  {item.streaming && (
                    <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse rounded-sm bg-brand-500 align-middle dark:bg-brand-300" />
                  )}
                </>
              ) : (
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Spinner className="h-3.5 w-3.5" /> AI đang soạn câu trả lời...
                </span>
              )}
            </div>
          </div>
        ))}

        {streaming && visibleMessages[visibleMessages.length - 1]?.role === 'user' && (
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
          ref={inputRef}
          className="input min-h-[44px] flex-1 resize-none !py-2 text-sm"
          rows={2}
          maxLength={1500}
          placeholder={muscle ? 'Hỏi về cơ này...' : 'Chọn một cơ trước'}
          value={input}
          disabled={!muscle || streaming}
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
          disabled={!muscle || !input.trim() || streaming}
          aria-label="Gửi câu hỏi"
        >
          {streaming ? (
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
