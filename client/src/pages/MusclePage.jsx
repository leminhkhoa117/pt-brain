import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { Icon, PageHeader } from '../components/ui.jsx';
import { MUSCLES } from '@shared/muscles/index.js';
import { readStored, writeStored } from '../lib/persist.js';
import HumanAtlasExplorer from './atlas/HumanAtlasExplorer.jsx';
import MuscleChat from './muscles/MuscleChat.jsx';

// Nhớ cơ đang xem để rời trang (ví dụ sang Học tập) rồi quay lại vẫn đúng ngữ cảnh.
const STORAGE_KEY = 'ptbrain:muscle:last';
// Vị trí khung chat nổi, để lần sau mở vẫn nằm đúng chỗ người dùng đã kéo.
const PANEL_POS_KEY = 'ptbrain:muscle:chat-pos';

const PANEL_WIDTH = 400;
const PANEL_HEIGHT = 540;
const EDGE = 12;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

export default function MusclePage() {
  const [initial] = useState(() => readStored(STORAGE_KEY, {}));
  const [slug, setSlug] = useState(() => (initial?.slug && MUSCLES[initial.slug] ? initial.slug : ''));
  const [chatOpen, setChatOpen] = useState(false);
  const [storedPos, setStoredPos] = useState(() => readStored(PANEL_POS_KEY, null));
  const [dragging, setDragging] = useState(false);
  const [viewport, setViewport] = useState(() => ({
    w: typeof window === 'undefined' ? 1280 : window.innerWidth,
    h: typeof window === 'undefined' ? 800 : window.innerHeight,
  }));
  const panelRef = useRef(null);
  const dragRef = useRef(null);
  const lastSlugRef = useRef(slug);

  const selectedMuscle = slug && MUSCLES[slug] ? { slug, ...MUSCLES[slug] } : null;

  const handleMuscleChange = useCallback((muscle) => {
    // Explorer báo null lúc mount hoặc khi đóng panel: giữ cơ gần nhất để chat không nhảy.
    if (!muscle?.slug) return;
    lastSlugRef.current = muscle.slug;
    setSlug(muscle.slug);
    writeStored(STORAGE_KEY, { slug: muscle.slug });
  }, []);

  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isNarrow = viewport.w < 640;  const panelWidth = isNarrow ? Math.max(280, viewport.w - EDGE * 2) : PANEL_WIDTH;
  const panelHeight = isNarrow
    ? Math.min(Math.round(viewport.h * 0.68), 560)
    : Math.min(PANEL_HEIGHT, viewport.h - 140);

  const bounds = useMemo(
    () => ({
      minX: EDGE,
      maxX: viewport.w - panelWidth - EDGE,
      minY: EDGE,
      maxY: viewport.h - panelHeight - (isNarrow ? 76 : EDGE),
    }),
    [isNarrow, panelHeight, panelWidth, viewport.h, viewport.w],
  );

  const position = useMemo(() => {
    const fallback = {
      x: viewport.w - panelWidth - (isNarrow ? EDGE : EDGE * 2),
      y: viewport.h - panelHeight - (isNarrow ? 84 : EDGE * 2),
    };
    const base = storedPos && Number.isFinite(storedPos.x) ? storedPos : fallback;
    return {
      x: clamp(base.x, bounds.minX, bounds.maxX),
      y: clamp(base.y, bounds.minY, bounds.maxY),
    };
  }, [bounds, isNarrow, panelHeight, panelWidth, storedPos, viewport.h, viewport.w]);

  const openChat = useCallback(() => setChatOpen(true), []);
  const closeChat = useCallback(() => setChatOpen(false), []);

  // Mở khung chat là đưa con trỏ vào ô hỏi luôn.
  useEffect(() => {
    if (!chatOpen) return undefined;
    const timer = window.setTimeout(() => {
      document.querySelector('#muscle-chat textarea')?.focus();
    }, 180);
    return () => window.clearTimeout(timer);
  }, [chatOpen]);

  // Esc thu gọn khung chat; chặn để không đóng luôn bảng chi tiết của atlas.
  useEffect(() => {
    if (!chatOpen) return undefined;
    const onKey = (event) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      setChatOpen(false);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [chatOpen]);

  const startDrag = (event) => {
    if (event.button !== 0) return;
    if (event.target.closest('button, a, input, textarea')) return;
    const rect = panelRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = {
      dx: event.clientX - rect.left,
      dy: event.clientY - rect.top,
      origin: { x: rect.left, y: rect.top },
      latest: { x: rect.left, y: rect.top },
    };
    setDragging(true);
    event.preventDefault();
  };

  // Kéo bằng pointer events trên window để không mất chuột khi con trỏ ra ngoài panel.
  // Trong lúc kéo chỉ dịch bằng transform (compositor, không re-render chat), chốt vị trí khi thả.
  useEffect(() => {
    if (!dragging) return undefined;
    const move = (event) => {
      const drag = dragRef.current;
      const node = panelRef.current;
      if (!drag || !node) return;
      const x = clamp(event.clientX - drag.dx, bounds.minX, bounds.maxX);
      const y = clamp(event.clientY - drag.dy, bounds.minY, bounds.maxY);
      drag.latest = { x, y };
      node.style.transform = `translate3d(${x - drag.origin.x}px, ${y - drag.origin.y}px, 0)`;
    };
    const stop = () => {
      const drag = dragRef.current;
      const node = panelRef.current;
      dragRef.current = null;
      setDragging(false);
      if (!drag) return;
      if (node) {
        // Ghi vị trí cuối vào left/top rồi bỏ transform trong cùng một khung hình.
        node.style.left = `${drag.latest.x}px`;
        node.style.top = `${drag.latest.y}px`;
        node.style.transform = '';
      }
      setStoredPos(drag.latest);
      writeStored(PANEL_POS_KEY, drag.latest);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') stop();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    window.addEventListener('keydown', onKey);
    const previousSelect = document.body.style.userSelect;
    document.body.style.userSelect = 'none';
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
      window.removeEventListener('keydown', onKey);
      document.body.style.userSelect = previousSelect;
    };
  }, [bounds, dragging]);

  const pillRight = Math.max(EDGE, viewport.w - position.x - panelWidth);
  const pillBottom = Math.max(EDGE, viewport.h - position.y - panelHeight);

  const widget = (
    <>
      {/* Nút thu gọn: bấm để mở lại khung chat đúng vị trí đã kéo. */}
      <button
        type="button"
        onClick={openChat}
        aria-expanded={chatOpen}
        className={clsx(
          'fixed z-[69] flex max-w-[70vw] items-center gap-2 rounded-full border border-line bg-surface py-1.5 pl-1.5 pr-3 text-[12px] font-semibold text-slate-700 shadow-overlay transition-all duration-200 ease-out dark:border-white/10 dark:bg-[#171f1b] dark:text-slate-100',
          'hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0',
          chatOpen ? 'pointer-events-none translate-y-2 scale-90 opacity-0' : 'opacity-100',
        )}
        style={{ right: pillRight, bottom: pillBottom }}
      >
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-pine-700 text-white dark:bg-pine-400 dark:text-pine-950">
          <Icon name="chat" className="h-3.5 w-3.5" />
        </span>
        <span>Hỏi AI</span>
        {selectedMuscle ? (
          <span className="max-w-[120px] truncate font-normal text-slate-500 dark:text-slate-400">
            · {selectedMuscle.vi}
          </span>
        ) : null}
      </button>

      {/* Khung chat nổi: kéo tiêu đề để di chuyển, nút chevron để thu gọn.
          Luôn mounted để câu trả lời đang stream không bị mất khi thu gọn/mở lại. */}
      <section
        ref={panelRef}
        role="dialog"
        aria-label="Hỏi HLV AI về cơ đang chọn"
        aria-hidden={chatOpen ? undefined : true}
        inert={chatOpen ? undefined : ''}
        style={{ left: position.x, top: position.y, width: panelWidth, height: panelHeight }}
        className={clsx(
          'fixed z-[70] flex flex-col overflow-hidden rounded-2xl border border-line bg-paper shadow-overlay transition-[opacity,transform] duration-200 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none dark:border-white/10 dark:bg-[#0e1211]',
          'origin-bottom-right will-change-transform',
          chatOpen
            ? 'translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none translate-y-2 scale-90 opacity-0',
          dragging && 'shadow-[0_30px_80px_-20px_rgba(15,23,42,0.55)]',
        )}
      >
        <div className="h-0.5 shrink-0 bg-gradient-to-r from-pine-600 via-brand-500 to-teal-400" />
        <MuscleChat
          muscle={selectedMuscle}
          onClose={closeChat}
          onHeaderPointerDown={startDrag}
          active={chatOpen}
        />
      </section>
    </>
  );

  return (
    <div>
      <PageHeader
        title="Cơ bắp 3D"
        subtitle="Human Atlas: 2.234 mảnh giải phẫu, 15 hệ cơ quan và 3.432 cấu trúc được đặt tên. Bấm vào cơ để xem metadata, tách lớp, phóng to hoặc bấm “Hỏi AI” để hỏi ngay về cơ đó."
        actions={
          <span className="badge badge-pine">
            BodyParts3D 4.0 · CC BY 4.0
          </span>
        }
      />

      <HumanAtlasExplorer
        onMuscleChange={handleMuscleChange}
        initialSlug={lastSlugRef.current}
        onAsk={openChat}
      />

      {/* Portal ra body để không bị stacking context của header/animate-fade-up che. */}
      {createPortal(widget, document.body)}
    </div>
  );
}
