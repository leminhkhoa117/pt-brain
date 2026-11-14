import { useDeferredValue, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { Alert, Card, Icon, PageHeader, Spinner } from '../components/ui.jsx';
import { useDialog } from '../components/DialogProvider.jsx';
import {
  deleteSummary,
  listSummaries,
  summaryCitationUrl,
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
  const dialog = useDialog();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [onlyFavorite, setOnlyFavorite] = useState(false);
  const [error, setError] = useState(null);

  const deferredSearch = useDeferredValue(search);
  const PAGE_SIZE = 40;
  const summariesQuery = useInfiniteQuery({
    queryKey: ['summaries', { q: deferredSearch.trim(), favorite: onlyFavorite }],
    queryFn: ({ pageParam = 0 }) =>
      listSummaries({
        q: deferredSearch.trim() || undefined,
        favorite: onlyFavorite ? 'true' : undefined,
        limit: PAGE_SIZE,
        offset: pageParam,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.page?.hasMore) return undefined;
      return allPages.reduce((total, page) => total + page.summaries.length, 0);
    },
  });
  const pages = summariesQuery.data?.pages || [];
  const items = pages.flatMap((page) => page.summaries);
  const stats = pages[0]?.stats || { total: items.length, favorites: 0 };
  const lastPage = pages.at(-1);

  const meta = useMutation({
    mutationFn: ({ id, ...payload }) => updateSummaryMeta(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['summaries'] }),
    onError: (err) => setError(getErrorMessage(err)),
  });

  const addTag = async (item) => {
    const value = await dialog.prompt({
      title: 'Thêm tag cho bài',
      message: 'Tag giúp bạn tìm lại bài nhanh hơn.',
      placeholder: 'Ví dụ: hypertrophy, volume, đau lưng',
      maxLength: 50,
      confirmLabel: 'Thêm tag',
    });
    const tag = value?.trim().slice(0, 50);
    if (!tag || (item.tags || []).includes(tag)) return;
    meta.mutate({
      id: item.id,
      isFavorite: item.isFavorite,
      tags: [...(item.tags || []), tag],
    });
  };

  const removeTag = (item, tag) => {
    meta.mutate({
      id: item.id,
      isFavorite: item.isFavorite,
      tags: (item.tags || []).filter((value) => value !== tag),
    });
  };

  const remove = useMutation({
    mutationFn: (id) => deleteSummary(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['summaries'] }),
    onError: (err) => setError(getErrorMessage(err)),
  });

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
          <div className="inline-flex gap-0.5 rounded-md border border-line bg-surface p-0.5 dark:border-white/10 dark:bg-transparent">
            <button
              type="button"
              onClick={() => setOnlyFavorite(false)}
              className={clsx(
                'h-7 rounded px-2.5 text-[12px] font-medium transition-colors',
                !onlyFavorite
                  ? 'bg-pine-700 text-white dark:bg-pine-400 dark:text-pine-950'
                  : 'text-slate-600 hover:bg-paper-2 dark:text-slate-400 dark:hover:bg-white/[0.06]',
              )}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setOnlyFavorite(true)}
              className={clsx(
                'h-7 rounded px-2.5 text-[12px] font-medium transition-colors',
                onlyFavorite
                  ? 'bg-ochre-500 text-white dark:bg-ochre-400 dark:text-ochre-950'
                  : 'text-slate-600 hover:bg-paper-2 dark:text-slate-400 dark:hover:bg-white/[0.06]',
              )}
            >
              Đã ghim
            </button>
          </div>
          <div className="relative">
            <input
              className="input w-64 !py-1.5 pl-8 text-xs"
              placeholder="Tìm theo tiêu đề, DOI, tag, tóm tắt..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Icon name="search" className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
          </div>
        </div>
      </Card>

      {lastPage?.page?.hasMore && !summariesQuery.isFetching && (
        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
          Đã tải {items.length}/{lastPage.stats.filtered ?? stats.total} kết quả phù hợp.
        </p>
      )}

      {summariesQuery.isLoading ? (
        <Card>
          <Spinner />
        </Card>
      ) : !items.length ? (
        <Card className="py-12 text-center">
          <Icon name="book" className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
            {stats.total ? 'Không có bài nào khớp bộ lọc.' : 'Chưa có bài nào được phân tích.'}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Vào tab “Đọc & tóm tắt” để phân tích DOI/PDF đầu tiên.
          </p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {item.evidenceAxes?.design?.reason ? (
                    <span
                      className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      title={`Thiết kế: ${item.evidenceAxes.design?.rating || '?'} · Độ chắc chắn: ${
                        item.evidenceAxes.certainty?.rating || '?'
                      } · Liên quan: ${item.evidenceAxes.relevance?.rating || '?'}`}
                    >
                      3 trục bằng chứng
                    </span>
                  ) : (
                    <span className={clsx('badge', LEVEL_STYLES[item.paper?.evidenceLevel] || LEVEL_STYLES[5])}>
                      Mức {item.paper?.evidenceLevel || '?'}
                    </span>
                  )}
                  {item.isLegacy && (
                    <span className="badge bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                      Bản cũ
                    </span>
                  )}
                  {item.needsReview && (
                    <span className="badge bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      Cần đối chiếu
                    </span>
                  )}
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

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
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

              <div className="mt-2 flex flex-wrap items-center gap-1">
                {(item.tags || []).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => removeTag(item, tag)}
                    title={`Bỏ tag #${tag}`}
                    className="group inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-rose-950/40"
                  >
                    #{tag}
                    <span className="opacity-0 transition-opacity group-hover:opacity-100">×</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => addTag(item)}
                  className="rounded-full border border-dashed border-slate-300 px-2 py-0.5 text-[11px] text-slate-500 transition-colors hover:border-pine-500 hover:text-pine-700 dark:border-slate-600 dark:text-slate-400 dark:hover:border-pine-400 dark:hover:text-pine-300"
                >
                  + tag
                </button>
              </div>

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
                  <a
                    href={summaryCitationUrl(item.id, 'bibtex')}
                    className="btn-ghost !px-2 !py-1 text-xs"
                    title="Tải BibTeX (.bib)"
                  >
                    .bib
                  </a>
                  <a
                    href={summaryCitationUrl(item.id, 'ris')}
                    className="btn-ghost !px-2 !py-1 text-xs"
                    title="Tải RIS (.ris)"
                  >
                    .ris
                  </a>
                  <a
                    href={summaryCitationUrl(item.id, 'apa')}
                    className="btn-ghost !px-2 !py-1 text-xs"
                    title="Tải trích dẫn APA"
                  >
                    .apa
                  </a>
                  <button
                    type="button"
                    className="btn-ghost !px-2 !py-1 text-xs text-rose-500"
                    title="Xóa bài khỏi thư viện"
                    aria-label="Xóa bài khỏi thư viện"
                    onClick={async () => {
                      const ok = await dialog.confirm({
                        title: 'Xóa bài khỏi thư viện',
                        message: 'Xóa bài này khỏi thư viện? Bản tóm tắt và PDF đã lưu sẽ bị xóa.',
                        confirmLabel: 'Xóa bài',
                      });
                      if (ok) remove.mutate(item.id);
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

      {summariesQuery.hasNextPage && (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => summariesQuery.fetchNextPage()}
            disabled={summariesQuery.isFetchingNextPage}
          >
            {summariesQuery.isFetchingNextPage ? (
              <>
                <Spinner className="h-4 w-4" /> Đang tải...
              </>
            ) : (
              `Tải thêm (${items.length}/${lastPage?.stats?.filtered ?? stats.total})`
            )}
          </button>
        </div>
      )}
    </div>
  );
}
