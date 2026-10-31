import { useMemo, useState } from 'react';
import { Card, Icon } from '../ui.jsx';

export default function SourcePane({ text = '', url = '', title = '' }) {
  const [query, setQuery] = useState('');
  const normalized = text || 'Không có nội dung nguồn được lưu cho bài này.';
  const chars = normalized.length;
  const display =
    normalized.length > 120000
      ? `${normalized.slice(0, 120000)}\n\n[…đã rút gọn để hiển thị. Tải bài gốc để đọc phần còn lại…]`
      : normalized;

  const matches = useMemo(() => {
    if (!query.trim()) return 0;
    const lower = normalized.toLowerCase();
    const needle = query.trim().toLowerCase();
    let count = 0;
    let index = 0;
    while ((index = lower.indexOf(needle, index)) !== -1) {
      count += 1;
      index += needle.length;
    }
    return count;
  }, [normalized, query]);

  return (
    <Card className="flex min-h-[420px] flex-col">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Bài gốc</h3>
          {title && (
            <p className="line-clamp-1 max-w-[340px] text-[11px] text-slate-500 dark:text-slate-400">
              {title}
            </p>
          )}
          <p className="text-xs text-slate-400">
            {chars.toLocaleString('vi-VN')} ký tự
            {url && (
              <>
                {' · '}
                <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-600 hover:underline dark:text-brand-400">
                  Mở link <Icon name="external" className="h-3 w-3" />
                </a>
              </>
            )}
          </p>
        </div>
        <div className="relative">
          <input
            className="input w-44 !py-1.5 pl-8 text-xs"
            placeholder="Tìm trong bài..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Icon name="search" className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
        </div>
      </div>

      {query.trim() && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {matches > 0 ? `Tìm thấy ${matches} lần.` : 'Không tìm thấy.'}
        </p>
      )}

      <div className="mt-3 max-h-[70vh] flex-1 overflow-auto rounded-xl bg-slate-50 p-3 dark:bg-slate-950/50">
        <pre className="whitespace-pre-wrap break-words font-sans text-[13px] leading-6 text-slate-700 dark:text-slate-300">
          {display}
        </pre>
      </div>
      <p className="mt-2 text-[11px] text-slate-400">
        Mẹo: dùng ô tìm kiếm để đối chiếu nhanh một con số trong bản tóm tắt với bài gốc.
      </p>
    </Card>
  );
}
