import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { Alert, Card, Icon, Spinner } from '../../components/ui.jsx';
import MarkdownText from '../../components/MarkdownText.jsx';
import { askMuscleCoachStream } from '../../api/muscles.js';
import { getErrorMessage } from '../../api/client.js';
import { readStored, removeStored, writeStored } from '../../lib/persist.js';

const SUGGESTIONS = {
  muscle: [
    'Cơ này có chức năng gì khi tập?',
    'Bài tập nào tốt nhất cho cơ này?',
    'Nên tập bao nhiêu set mỗi tuần?',
    'Khởi động và giãn cơ thế nào?',
    'Đau khi tập cơ này thì nên làm gì?',
  ],
  bone: [
    'Xương này có chức năng gì?',
    'Khi tập tạ nên đặt tải lên xương này thế nào?',
    'Bài tập nào an toàn cho xương này?',
    'Đau xương khi tập thì nên làm gì?',
  ],
  connective: [
    'Mô liên kết này có chức năng gì?',
    'Tăng tải cho gân/dây chằng thế nào?',
    'Có nên giãn mạnh không?',
    'Đau khi vận động thì nên xử lý thế nào?',
  ],
};

const KIND_LABEL = {
  muscle: 'cơ',
  bone: 'xương',
  connective: 'mô liên kết',
};

const chatKey = (key) => `ptbrain:muscle-chat:${key}`;
const MAX_SAVED = 40;

export default function MuscleChat({ structure, muscle, onClose, onHeaderPointerDown, active = true }) {
  const selected = structure || muscle;
  const kind = selected?.kind || 'muscle';
  const kindLabel = KIND_LABEL[kind] || 'cấu trúc';
  const structureKey = selected?.slug || selected?.id || '';
  const [messages, setMessages] = useState(() =>
    structureKey ? readStored(chatKey(structureKey), []) : [],
  );
  const [loadedKey, setLoadedKey] = useState(structureKey);
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef(null);
  const abortRef = useRef(null);
  const keyRef = useRef(structureKey);
  const inputRef = useRef(null);

  // Đổi cấu trúc: nạp lại lịch sử riêng của cấu trúc đó thay vì xóa trắng.
  if (structureKey !== loadedKey) {
    setLoadedKey(structureKey);
    setMessages(structureKey ? readStored(chatKey(structureKey), []) : []);
  }

  useEffect(() => {
    keyRef.current = structureKey;
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
    setError(null);
    setInput('');
  }, [structureKey]);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Lưu lịch sử theo từng cấu trúc để bấm sang cấu trúc khác rồi quay lại vẫn còn hội thoại.
  useEffect(() => {
    if (!structureKey || loadedKey !== structureKey) return;
    writeStored(chatKey(structureKey), messages.slice(-MAX_SAVED));
  }, [messages, structureKey, loadedKey]);

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
    if (structureKey) removeStored(chatKey(structureKey));
  };

  const send = async (text) => {
    const message = String(text || '').trim();
    if (!message || !selected || streaming) return;
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
        kind,
        slug: selected.slug,
        id: selected.id,
        name: selected.en,
        message,
        history: past,
        signal: controller.signal,
        onDelta: (delta) => {
          if (keyRef.current !== structureKey) return;
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
      if (err?.name === 'AbortError' || keyRef.current !== structureKey) return;
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
      if (keyRef.current === structureKey) setStreaming(false);
      if (abortRef.current === controller) abortRef.current = null;
    }
  };

  const visibleMessages = loadedKey === structureKey ? messages : [];
  const suggestions = SUGGESTIONS[kind] || SUGGESTIONS.muscle;

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
            Hỏi AI về {kindLabel} này
          </h3>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            {selected
              ? `Đang hỏi về ${selected.vi}${selected.en ? ` (${selected.en})` : ''}. Hội thoại được lưu riêng cho cấu trúc này.`
              : 'Chọn một cấu trúc trên mô hình để bắt đầu hỏi.'}
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
              {selected
                ? `Hỏi về chức năng, kỹ thuật, bài tập, tải trọng hoặc phục hồi liên quan đến ${kindLabel} đang chọn.`
                : 'Nhấn vào một cấu trúc trên mô hình 3D hoặc danh sách bên dưới.'}
            </p>
            {selected && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {suggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="rounded-full border border-slate-200 bg-surface px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-brand-700 dark:hover:text-brand-300"
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
                  : 'max-w-[92%] rounded-lg rounded-bl-md bg-surface px-3 py-2 text-xs text-slate-700 shadow-sm dark:text-slate-200'
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
          placeholder={selected ? `Hỏi về ${kindLabel} này...` : 'Chọn một cấu trúc trước'}
          value={input}
          disabled={!selected || streaming}
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
          disabled={!selected || !input.trim() || streaming}
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
