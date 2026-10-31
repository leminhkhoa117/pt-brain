import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { Alert, Card, Icon, PageHeader, Spinner } from '../components/ui.jsx';
import {
  deleteSummary,
  listSummaries,
  summaryPdfUrl,
  updateSummaryMeta,
} from '../api/summaries.js';
import { getErrorMessage } from '../api/client.js';
import { formatDateKey } from '../lib/date.js';

const LEVEL_STYLES = {
  1: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  2: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  3: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  4: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  5: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export default function LibraryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [onlyFavorite, setOnlyFavorite] = useState(false);
  const [error, setError] = useState(null);

  const summariesQuery = useQuery({ queryKey: ['summaries'], queryFn: () => listSummaries() });
  const items = useMemo(
    () => summariesQuery.data?.summaries || [],
    [summariesQuery.data],
  );
  const stats = summariesQuery.data?.stats || { total: items.length, favorites: 0 };

  const meta = useMutation({
    mutationFn: ({ id, isFavorite }) => updateSummaryMeta(id, { isFavorite }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['summaries'] }),
    onError: (err) => setError(getErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: (id) => deleteSummary(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['summaries'] }),
    onError: (err) => setError(getErrorMessage(err)),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (onlyFavorite && !item.isFavorite) return false;
      if (!q) return true;
      const haystack = [
        item.paper?.title,
        item.paper?.journal,
        item.paper?.doi,
        item.tldr,
        ...(item.tags || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [items, search, onlyFavorite]);

  return (
    <div>
      <PageHeader
        title="Thư viện nghiên cứu"
        subtitle="Mọi bài đã phân tích đều được lưu tự động. Ghim (★) để đánh dấu bài quan trọng và tìm lại nhanh."
        actions={
          <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {stats.total} bài · {stats.favorites} đã ghim
          </span>
        }
      />

      {error && (
        <Alert tone="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Card className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setOnlyFavorite(false)}
              className={clsx(
                'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                !onlyFavorite
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
              )}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setOnlyFavorite(true)}
              className={clsx(
                'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                onlyFavorite
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
              )}
            >
              ★ Đã ghim
            </button>
          </div>
          <div className="relative">
            <input
              className="input w-64 !py-1.5 pl-8 text-xs"
              placeholder="Tìm theo tiêu đề, DOI, tag, tóm tắt..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Icon name="search" className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>
      </Card>

      {summariesQuery.isLoading ? (
        <Card>
          <Spinner />
        </Card>
      ) : !filtered.length ? (
        <Card className="py-12 text-center">
          <Icon name="book" className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
            {items.length ? 'Không có bài nào khớp bộ lọc.' : 'Chưa có bài nào được phân tích.'}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Vào tab “Đọc & tóm tắt” để phân tích DOI/PDF đầu tiên.
          </p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <Card key={item.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={clsx('badge', LEVEL_STYLES[item.paper?.evidenceLevel] || LEVEL_STYLES[5])}>
                    Mức {item.paper?.evidenceLevel || '?'}
                  </span>
                  {item.basedOn === 'abstract_only' && (
                    <span className="badge bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                      Abstract
                    </span>
                  )}
                  {item.status === 'processing' && (
                    <span className="badge bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                      Đang xử lý
                    </span>
                  )}
                  {item.status === 'failed' && (
                    <span className="badge bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      Lỗi
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    meta.mutate({ id: item.id, isFavorite: !item.isFavorite })
                  }
                  className={clsx(
                    'text-lg leading-none transition',
                    item.isFavorite ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400',
                  )}
                  title={item.isFavorite ? 'Bỏ ghim' : 'Ghim bài này'}
                  aria-label="Ghim bài"
                >
                  {item.isFavorite ? '★' : '☆'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/research?summary=${item.id}`)}
                className="mt-2 text-left"
              >
                <p className="line-clamp-3 text-sm font-semibold leading-snug text-slate-800 hover:text-brand-700 dark:text-slate-100 dark:hover:text-brand-300">
                  {item.paper?.title || 'Không rõ tiêu đề'}
                </p>
              </button>

              <p className="mt-1 text-xs text-slate-400">
                {item.paper?.journal || 'Không rõ tạp chí'}
                {item.paper?.year ? ` · ${item.paper.year}` : ''}
                {item.createdAt
                  ? ` · lưu ${formatDateKey(String(item.createdAt).slice(0, 10))}`
                  : ''}
              </p>

              {item.tldr && (
                <p className="mt-2 line-clamp-3 flex-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {item.status === 'processing' ? item.progress || 'Đang xử lý...' : item.tldr}
                </p>
              )}

              {(item.tags || []).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-3 flex items-center justify-between gap-1 border-t border-slate-100 pt-2 dark:border-slate-800">
                <button
                  type="button"
                  className="btn-ghost !px-2 !py-1 text-xs"
                  onClick={() => navigate(`/research?summary=${item.id}`)}
                >
                  <Icon name="book" className="h-3.5 w-3.5" />
                  Mở
                </button>
                <div className="flex items-center gap-1">
                  <a
                    href={`${import.meta.env.VITE_API_BASE || '/api'}/summaries/${item.id}/export.md`}
                    className="btn-ghost !px-2 !py-1 text-xs"
                    title="Tải Markdown"
                  >
                    .md
                  </a>
                  <a
                    href={summaryPdfUrl(item.id)}
                    className="btn-ghost !px-2 !py-1 text-xs"
                    title="Tải PDF"
                  >
                    .pdf
                  </a>
                  <button
                    type="button"
                    className="btn-ghost !px-2 !py-1 text-xs text-rose-500"
                    onClick={() => {
                      if (window.confirm('Xóa bài này khỏi thư viện?')) remove.mutate(item.id);
                    }}
                  >
                    <Icon name="trash" className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
