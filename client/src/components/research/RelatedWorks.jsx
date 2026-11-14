import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { Alert, Card, Icon, Spinner } from '../ui.jsx';
import { getResearchGraph } from '../../api/summaries.js';
import { getErrorMessage } from '../../api/client.js';
import { formatDoi, formatNumber } from '../../lib/format.js';

const TABS = [
  { value: 'references', label: 'Bài này dẫn' },
  { value: 'citations', label: 'Được dẫn bởi' },
  { value: 'related', label: 'Liên quan' },
];

export default function RelatedWorks({ doi }) {
  const navigate = useNavigate();
  const [kind, setKind] = useState('references');

  const query = useQuery({
    queryKey: ['research-graph', doi, kind],
    queryFn: () => getResearchGraph({ doi, kind, limit: 12 }),
    enabled: Boolean(doi),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  if (!doi) return null;

  const items = query.data?.items || [];

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon name="book" className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Bản đồ bằng chứng
          </h3>
        </div>
        <div className="flex flex-wrap gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={clsx(
                'rounded-full px-2.5 py-1 text-[11px] font-semibold transition',
                kind === tab.value
                  ? 'bg-brand-600 text-white dark:bg-brand-500'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
              )}
              onClick={() => setKind(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
        Dữ liệu citation từ OpenAlex. Bấm “Đọc” để mở bài trong Reader; link DOI mở bản gốc.
      </p>

      {query.isPending && (
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Spinner className="h-4 w-4" />
          Đang lấy dữ liệu citation...
        </div>
      )}

      {query.isError && (
        <Alert tone="warning" className="mt-3">
          {getErrorMessage(query.error)}
        </Alert>
      )}

      {!query.isPending && !query.isError && !items.length && (
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          OpenAlex chưa có dữ liệu cho mục này.
        </p>
      )}

      {items.length > 0 && (
        <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800">
          {items.map((item, index) => {
            const key = item.doi || `${kind}-${index}`;
            const meta = [
              (item.authors || []).slice(0, 2).join(', '),
              item.journal,
              item.year,
              `${formatNumber(item.citationCount || 0, 0)} trích dẫn`,
            ]
              .filter(Boolean)
              .join(' · ');
            return (
              <div key={key} className="flex items-start gap-2 py-2.5">
                <span
                  className={clsx(
                    'badge shrink-0',
                    item.isRetracted
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
                  )}
                >
                  {item.isRetracted ? 'Đã rút' : `Mức ${item.evidenceLevel || 5}/5`}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug text-slate-800 dark:text-slate-100">
                    {item.title || 'Không rõ tiêu đề'}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                    {meta}
                    {item.doi ? ` · DOI ${formatDoi(item.doi)}` : ''}
                  </p>
                </div>
                {item.doi && (
                  <button
                    type="button"
                    className="btn-ghost shrink-0 !px-2 !py-1 text-[11px]"
                    onClick={() => navigate(`/research?doi=${encodeURIComponent(item.doi)}&auto=1&from=graph`)}
                  >
                    Đọc
                  </button>
                )}
                {item.doi && (
                  <a
                    href={`https://doi.org/${item.doi}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost shrink-0 !px-1.5 !py-1 text-slate-500 dark:text-slate-400"
                    title="Mở DOI"
                  >
                    <Icon name="external" className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
