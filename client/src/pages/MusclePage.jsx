import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { Icon, PageHeader } from '../components/ui.jsx';
import { MUSCLES } from '@shared/muscles/index.js';
import { findAnatomyByName, getAnatomyStructure } from '@shared/anatomy/index.js';
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

function structureForSlug(slug) {
  if (!slug || !MUSCLES[slug]) return null;
  return { kind: 'muscle', slug, ...MUSCLES[slug] };
}

function restoreStructure(stored) {
  if (!stored) return null;
  if (stored.slug && MUSCLES[stored.slug]) return structureForSlug(stored.slug);
  if (stored.id || stored.name) {
    const anatomy = (stored.id && getAnatomyStructure(stored.id)) || findAnatomyByName(stored.name);
    if (anatomy) return { ...anatomy, id: anatomy.id || stored.id || '' };
  }
  return null;
}

export default function MusclePage() {
  // Deep-link từ bài học: /muscles?muscle=<slug> chọn sẵn đúng cơ.
  const [searchParams] = useSearchParams();
  const urlMuscle = searchParams.get('muscle');
  const [initial] = useState(() => readStored(STORAGE_KEY, {}));
  const [structure, setStructure] = useState(() => {
    if (urlMuscle && MUSCLES[urlMuscle]) {
      writeStored(STORAGE_KEY, { kind: 'muscle', slug: urlMuscle });
      return structureForSlug(urlMuscle);
    }
    return restoreStructure(initial);
  });
  const [chatOpen, setChatOpen] = useState(false);
  const [storedPos, setStoredPos] = useState(() => readStored(PANEL_POS_KEY, null));
  const [dragging, setDragging] = useState(false);
  const [viewport, setViewport] = useState(() => ({
    w: typeof window === 'undefined' ? 1280 : window.innerWidth,
    h: typeof window === 'undefined' ? 800 : window.innerHeight,
  }));
  const panelRef = useRef(null);
  const dragRef = useRef(null);
  const lastStructureRef = useRef(structure);

  const handleMuscleChange = useCallback((next) => {
    // Explorer báo null lúc mount hoặc khi đóng panel: giữ cấu trúc gần nhất để chat không nhảy.
    if (!next?.vi) return;
    const key = next.kind === 'muscle' ? next.slug : next.id || next.en;
    const previous = lastStructureRef.current;
    const previousKey = previous?.kind === 'muscle' ? previous.slug : previous?.id || previous?.en;
    if (next.kind === previous?.kind && key && key === previousKey) return;
    lastStructureRef.current = next;
    setStructure(next);
    writeStored(STORAGE_KEY, {
      kind: next.kind,
      slug: next.slug,
      id: next.id,
      name: next.en,
    });
  }, []);

  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isNarrow = viewport.w < 640;
  const panelWidth = isNarrow ? Math.max(280, viewport.w - EDGE * 2) : PANEL_WIDTH;
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
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      stop();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    window.addEventListener('blur', stop);
    window.addEventListener('keydown', onKey, true);
    const previousSelect = document.body.style.userSelect;
    document.body.style.userSelect = 'none';
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
      window.removeEventListener('blur', stop);
      window.removeEventListener('keydown', onKey, true);
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
          'fixed z-[69] flex max-w-[70vw] items-center gap-2 rounded-full border border-line bg-surface py-1.5 pl-1.5 pr-3 text-[12px] font-semibold text-slate-700 shadow-overlay transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none dark:border-white/10 dark:text-slate-100',
          'hover:shadow-lg',
          chatOpen
            ? 'pointer-events-none translate-y-1 scale-90 opacity-0'
            : 'translate-y-0 scale-100 opacity-100',
        )}
        style={{ right: pillRight, bottom: pillBottom }}
      >
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-pine-700 text-white dark:bg-pine-400 dark:text-pine-950">
          <Icon name="chat" className="h-3.5 w-3.5" />
        </span>
        <span>Hỏi AI</span>
        {structure ? (
          <span className="max-w-[120px] truncate font-normal text-slate-500 dark:text-slate-400">
            · {structure.vi}
          </span>
        ) : null}
      </button>

      {/* Lớp ngoài: giữ vị trí + nhận transform khi kéo, KHÔNG có transition.
          Nhờ tách khỏi lớp animation bên trong nên lúc thả chuột không bị "giật"
          do transition transform chạy ngược. */}
      <div
        ref={panelRef}
        aria-hidden={chatOpen ? undefined : true}
        inert={chatOpen ? undefined : ''}
        style={{ left: position.x, top: position.y, width: panelWidth, height: panelHeight }}
        className={clsx('fixed z-[70]', !chatOpen && 'pointer-events-none')}
      >
        {/* Lớp animation mở/đóng: chỉ opacity + trượt nhẹ, không scale để chữ không bị mờ. */}
        <div
          className={clsx(
            'h-full w-full origin-bottom-right transition-[opacity,transform] motion-reduce:transition-none',
            chatOpen ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
          )}
          style={{
            transitionDuration: chatOpen ? '240ms' : '170ms',
            transitionTimingFunction: chatOpen
              ? 'cubic-bezier(0.16, 1, 0.3, 1)'
              : 'cubic-bezier(0.4, 0, 1, 1)',
          }}
        >
          <section
            role="dialog"
            aria-label="Hỏi HLV AI về cơ đang chọn"
            className={clsx(
              'flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-paper transition-shadow duration-200 ease-out dark:border-white/10',
              dragging
                ? 'shadow-[0_32px_80px_-24px_rgba(15,23,42,0.6)] ring-1 ring-brand-500/20'
                : 'shadow-overlay',
            )}
          >
            <div className="h-0.5 shrink-0 bg-gradient-to-r from-pine-600 via-brand-500 to-teal-400" />
            <MuscleChat
              structure={structure}
              onClose={closeChat}
              onHeaderPointerDown={startDrag}
              active={chatOpen}
            />
          </section>
        </div>
      </div>
    </>
  );

  return (
    <div>
      <PageHeader
        title="Cơ bắp 3D"
        subtitle="Human Atlas: 2.234 mảnh giải phẫu, 15 hệ cơ quan và 3.432 cấu trúc được đặt tên. Bấm vào cơ, xương hoặc mô liên kết để xem metadata, tách lớp, phóng to hoặc bấm “Hỏi AI” để hỏi ngay về cấu trúc đó."
        actions={
          <span className="badge badge-pine">
            BodyParts3D 4.0 · CC BY 4.0
          </span>
        }
      />

      <HumanAtlasExplorer
        onMuscleChange={handleMuscleChange}
        initialSlug={structure?.kind === 'muscle' ? structure.slug : ''}
        onAsk={openChat}
      />

      {/* Portal ra body để không bị stacking context của header/animate-fade-up che. */}
      {createPortal(widget, document.body)}
    </div>
  );
}
