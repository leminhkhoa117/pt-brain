import { useState } from 'react';

/**
 * Giữ các tab đã từng mở luôn mounted, chỉ ẩn pane không active.
 *
 * Nhờ vậy state cục bộ (form, filter, câu trả lời quiz...) và mọi request
 * đang chạy trong pane đều không bị hủy khi người dùng chuyển tab.
 * Pane chỉ được mount ở lần đầu truy cập nên không tốn công dựng tất cả
 * tab nặng ngay khi mở trang.
 *
 * @param {{
 *   active: string,
 *   items: Array<{ value: string, children: import('react').ReactNode }>,
 *   className?: string,
 * }} props
 */
export default function KeepAliveTabs({ active, items, className }) {
  const [mounted, setMounted] = useState(() => [active]);

  // Cập nhật ngay trong render để pane vừa bấm không bị trống một frame.
  if (!mounted.includes(active)) {
    setMounted((prev) => (prev.includes(active) ? prev : [...prev, active]));
  }

  return (
    <div className={className}>
      {items.map((item) => {
        if (!mounted.includes(item.value)) return null;
        const isActive = item.value === active;
        return (
          <div
            key={item.value}
            role="tabpanel"
            hidden={!isActive}
            aria-hidden={isActive ? undefined : 'true'}
            className={isActive ? undefined : 'hidden'}
          >
            {item.children}
          </div>
        );
      })}
    </div>
  );
}
