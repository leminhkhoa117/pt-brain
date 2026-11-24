import { useEffect, useRef } from 'react';

/**
 * Các lớp hiệu ứng toàn cục: nền, texture và con trỏ.
 * Tất cả đều pointer-events: none và nằm sau nội dung (nền) hoặc trên nội
 * dung với độ phủ rất thấp (texture/con trỏ).
 */
export default function ThemeFxLayer({ customization }) {
  const cursorRef = useRef(null);
  const frame = useRef(0);
  const point = useRef({ x: 0, y: 0 });
  const { effects } = customization;

  useEffect(() => {
    if (effects.cursor === 'none') return undefined;
    const element = cursorRef.current;
    if (!element) return undefined;

    const paint = () => {
      frame.current = 0;
      element.style.transform = `translate3d(${point.current.x}px, ${point.current.y}px, 0)`;
    };
    const onMove = (event) => {
      point.current = { x: event.clientX, y: event.clientY };
      if (!frame.current) frame.current = requestAnimationFrame(paint);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [effects.cursor]);

  // Đèn theo chuột trên panel: chỉ chạy khi hiệu ứng đang được áp dụng.
  useEffect(() => {
    if (effects.hover !== 'spotlight') return undefined;
    let raf = 0;
    let panel = null;
    let last = null;

    const paint = () => {
      raf = 0;
      if (!panel || !last || !panel.isConnected) return;
      const rect = panel.getBoundingClientRect();
      panel.style.setProperty('--ts-mx', `${last.x - rect.left}px`);
      panel.style.setProperty('--ts-my', `${last.y - rect.top}px`);
    };
    const onMove = (event) => {
      const next = event.target?.closest?.('.panel');
      if (!next) return;
      panel = next;
      last = { x: event.clientX, y: event.clientY };
      if (!raf) raf = requestAnimationFrame(paint);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [effects.hover]);

  return (
    <>
      <div className="ts-bg-layer" data-ts-bg={effects.bg} aria-hidden="true">
        <div className="ts-aurora" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      </div>
      <div className="ts-texture" data-ts-texture={effects.texture} aria-hidden="true" />
      <div
        ref={cursorRef}
        className="ts-cursor"
        data-ts-cursor={effects.cursor}
        aria-hidden="true"
      />
    </>
  );
}
