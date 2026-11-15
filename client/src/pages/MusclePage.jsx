import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { PageHeader } from '../components/ui.jsx';
import { MUSCLES } from '@shared/muscles/index.js';
import { readStored, writeStored } from '../lib/persist.js';
import HumanAtlasExplorer from './atlas/HumanAtlasExplorer.jsx';
import MuscleChat from './muscles/MuscleChat.jsx';

// Nhớ cơ đang xem để rời trang (ví dụ sang Học tập) rồi quay lại vẫn đúng ngữ cảnh.
const STORAGE_KEY = 'ptbrain:muscle:last';

export default function MusclePage() {
  const [initial] = useState(() => readStored(STORAGE_KEY, {}));
  const [slug, setSlug] = useState(() => (initial?.slug && MUSCLES[initial.slug] ? initial.slug : ''));
  const [chatOpen, setChatOpen] = useState(false);
  const lastSlugRef = useRef(slug);

  const selectedMuscle = slug && MUSCLES[slug] ? { slug, ...MUSCLES[slug] } : null;

  const handleMuscleChange = useCallback((muscle) => {
    // Explorer báo null lúc mount hoặc khi đóng panel: giữ cơ gần nhất để chat không nhảy.
    if (!muscle?.slug) return;
    lastSlugRef.current = muscle.slug;
    setSlug(muscle.slug);
    writeStored(STORAGE_KEY, { slug: muscle.slug });
  }, []);

  const openChat = useCallback(() => {
    setChatOpen(true);
  }, []);

  const closeChat = useCallback(() => setChatOpen(false), []);

  // Esc để đóng; khoá cuộn nền để bánh xe không đẩy trang phía sau khi chat mở.
  useEffect(() => {
    if (!chatOpen) return undefined;
    const onKey = (event) => {
      if (event.key !== 'Escape') return;
      // Chặn để Escape không đóng luôn bảng chi tiết / panel của atlas phía sau.
      event.stopPropagation();
      setChatOpen(false);
    };
    window.addEventListener('keydown', onKey, true);
    // Đưa con trỏ vào ô nhập sau khi tấm trượt mở xong.
    const focusTimer = window.setTimeout(() => {
      document.querySelector('#muscle-chat textarea')?.focus();
    }, 140);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey, true);
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previous;
    };
  }, [chatOpen]);

  const drawer = (
    <div
      className={clsx(
        'fixed inset-0 z-[70]',
        chatOpen ? 'visible' : 'pointer-events-none invisible',
      )}
      aria-hidden={chatOpen ? undefined : true}
    >
      <button
        type="button"
        aria-label="Đóng khung chat"
        tabIndex={chatOpen ? 0 : -1}
        onClick={closeChat}
        className={clsx(
          'absolute inset-0 bg-slate-950/45 backdrop-blur-[2px] transition-opacity duration-200',
          chatOpen ? 'opacity-100' : 'opacity-0',
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Hỏi HLV AI về cơ đang chọn"
        className={clsx(
          'absolute flex flex-col bg-paper p-3 shadow-overlay transition-transform duration-200 ease-out dark:bg-[#0e1211]',
          'inset-x-0 bottom-0 h-[88dvh] rounded-t-2xl',
          'md:inset-y-0 md:right-0 md:left-auto md:h-full md:w-[440px] md:rounded-none md:rounded-l-2xl md:border-l md:border-line md:dark:border-white/10',
          chatOpen
            ? 'translate-y-0 md:translate-x-0'
            : 'translate-y-full md:translate-y-0 md:translate-x-full',
        )}
      >
        <MuscleChat muscle={selectedMuscle} onClose={closeChat} />
      </aside>
    </div>
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

      {/* Khung chat: cố định bên phải trên desktop, tấm trượt từ đáy trên mobile.
          Portal ra body để không bị stacking context của animate-fade-up/header che.
          Luôn mounted để không mất câu trả lời đang stream khi đóng/mở. */}
      {createPortal(drawer, document.body)}
    </div>
  );
}
