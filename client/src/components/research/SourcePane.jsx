import { useMemo, useState } from 'react';
import { Card, Icon, Spinner } from '../ui.jsx';

export default function SourcePane({
  text = '',
  url = '',
  title = '',
  translation = null,
  downloadUrl = '',
  onTranslate,
  translating = false,
  translateError = '',
}) {
  const [query, setQuery] = useState('');
  const cleanPages = (value = '') =>
    String(value).replace(/\[\[page\s+(\d+)\]\]\s*/gi, '\n— Trang $1 —\n');
  const normalized = cleanPages(text) || 'Không có nội dung nguồn được lưu cho bài này.';
  const chars = normalized.length;
  const display =
    normalized.length > 120000
      ? `${normalized.slice(0, 120000)}\n\n[…đã rút gọn để hiển thị. Tải bài gốc để đọc phần còn lại…]`
      : normalized;
  const translationText = cleanPages(translation?.text || '');

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
          <p className="text-xs text-slate-500 dark:text-slate-400">
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
          <Icon name="search" className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
        </div>
      </div>

      {query.trim() && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {matches > 0 ? `Tìm thấy ${matches} lần.` : 'Không tìm thấy.'}
        </p>
      )}

      <div className="mt-3 max-h-[55vh] flex-1 overflow-auto rounded-md border border-line bg-paper-2/50 p-3.5 dark:border-white/[0.08] dark:bg-white/[0.02]">
        <pre className="whitespace-pre-wrap break-words font-sans text-[13px] leading-6 text-slate-700 dark:text-slate-300">
          {display}
        </pre>
      </div>
      <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
        Mẹo: dùng ô tìm kiếm để đối chiếu nhanh một con số trong bản tóm tắt với bài gốc.
      </p>

      <div className="mt-3 rounded-md border border-brand-200/70 bg-brand-50/45 p-3.5 dark:border-brand-900/70 dark:bg-brand-950/30">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
              Bản dịch tiếng Việt
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Dịch tự động từ bài gốc, giữ nguyên số liệu và thuật ngữ. Có thể sai — đối chiếu bản gốc khi quan trọng.
            </p>
          </div>
          {!translationText && onTranslate && (
            <button
              type="button"
              className="btn-secondary !px-2.5 !py-1.5 text-xs"
              onClick={onTranslate}
              disabled={translating}
            >
              {translating ? (
                <>
                  <Spinner className="h-3.5 w-3.5" /> Đang dịch...
                </>
              ) : (
                'Dịch bài này'
              )}
            </button>
          )}
          {translationText && downloadUrl && (
            <a
              href={downloadUrl}
              download
              className="btn-secondary !px-2.5 !py-1.5 text-xs"
              title="Tải bản dịch tiếng Việt dạng .txt"
            >
              <Icon name="download" className="h-3.5 w-3.5" />
              Tải bản dịch
            </a>
          )}
        </div>

        {translating && !translationText && (
          <p className="mt-2 rounded-lg bg-white/70 px-3 py-2 text-xs text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
            Đang dịch từng đoạn — bài dài có thể mất 1–2 phút. Bạn có thể cuộn xuống đọc bản gốc trong lúc chờ.
          </p>
        )}

        {translateError && <p className="mt-2 text-xs text-rose-500">{translateError}</p>}

        {translationText ? (
          <>
            <div className="mt-2 max-h-[50vh] overflow-auto rounded-lg bg-white/80 p-3 dark:bg-slate-950/40">
              <pre className="whitespace-pre-wrap break-words font-sans text-[13px] leading-6 text-slate-700 dark:text-slate-300">
                {translationText}
              </pre>
            </div>
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              {translation?.chars
                ? `Đã dịch ${Number(translation.chars).toLocaleString('vi-VN')} ký tự`
                : 'Bản dịch đã lưu'}
              {translation?.truncated ? ' (phần đầu bài; phần còn lại xem bản gốc)' : ''}.
            </p>
          </>
        ) : (
          !translating && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Bấm “Dịch bài này” để tạo bản tiếng Việt ngay dưới bài gốc.
            </p>
          )
        )}
      </div>
    </Card>
  );
}
