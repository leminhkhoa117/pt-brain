import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import clsx from 'clsx';
import { Alert, Card, Field, Icon, PageHeader, Spinner } from '../components/ui.jsx';
import { createPaper, searchResearch } from '../api/summaries.js';
import { getErrorMessage } from '../api/client.js';
import MarkdownText from '../components/MarkdownText.jsx';
import { formatNumber } from '../lib/format.js';

const LEVEL_STYLES = {
  1: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  2: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  3: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  4: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  5: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const STAGES = [
  'AI đang dịch câu hỏi sang truy vấn học thuật',
  'Đang gọi PubMed, Europe PMC và OpenAlex',
  'Đang gộp kết quả và xếp hạng bằng code',
  'AI đang viết mô tả và tổng hợp bằng chứng',
];

const buildFilters = (filters) => {
  const result = {};
  if (filters.yearFrom) result.yearFrom = Number(filters.yearFrom);
  if (filters.yearTo) result.yearTo = Number(filters.yearTo);
  if (filters.openAccessOnly) result.openAccessOnly = true;
  if (filters.maxLevel) result.maxLevel = Number(filters.maxLevel);
  return result;
};

const paperKey = (r) => r.doi || r.pmid || r.title;

export default function FinderPage() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [filters, setFilters] = useState({
    yearFrom: '',
    yearTo: '',
    openAccessOnly: false,
    maxLevel: '',
  });
  const [data, setData] = useState(null);
  const [draftQueries, setDraftQueries] = useState([]);
  const [newQuery, setNewQuery] = useState('');
  const [error, setError] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [saved, setSaved] = useState({});
  const [expanded, setExpanded] = useState({});

  const search = useMutation({
    mutationFn: (payload) => searchResearch(payload),
    onSuccess: (result) => {
      setData(result);
      setDraftQueries(result.queries || []);
      setSaved({});
      setElapsed(0);
      setError(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const savePaper = useMutation({
    mutationFn: (paper) => createPaper(paper),
    onSuccess: (_result, paper) => {
      setSaved((prev) => ({ ...prev, [paperKey(paper)]: true }));
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  useEffect(() => {
    if (!search.isPending) {
      setElapsed(0);
      return undefined;
    }
    setElapsed(0);
    const timer = setInterval(() => setElapsed((v) => v + 1), 1000);
    return () => clearInterval(timer);
  }, [search.isPending]);

  const submit = (e) => {
    e.preventDefault();
    setError(null);
    if (question.trim().length < 5) {
      setError('Nhập câu hỏi cụ thể hơn (tối thiểu 5 ký tự).');
      return;
    }
    search.mutate({ question: question.trim(), filters: buildFilters(filters) });
  };

  const rerun = () => {
    if (!draftQueries.length) return;
    setError(null);
    search.mutate({
      question: question.trim(),
      queries: draftQueries.filter(Boolean).slice(0, 4),
      filters: buildFilters(filters),
    });
  };

  const openReader = (paper) => {
    if (paper.doi) {
      navigate(`/research?doi=${encodeURIComponent(paper.doi)}`);
      return;
    }
    if (paper.url) navigate(`/research?url=${encodeURIComponent(paper.url)}`);
  };

  const stage = STAGES[Math.min(STAGES.length - 1, Math.floor(elapsed / 8))];
  const results = data?.results || [];

  return (
    <div>
      <PageHeader
        title="Tìm nghiên cứu"
        subtitle="Hỏi bằng tiếng Việt, nhận danh sách nghiên cứu thật từ PubMed, Europe PMC và OpenAlex. Hệ thống xếp hạng bằng code, AI chỉ viết mô tả."
        actions={
          data?.quota ? (
            <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              AI hôm nay: {data.quota.search}/{data.quota.limit} lượt tìm
            </span>
          ) : null
        }
      />

      {error && (
        <Alert tone="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Card>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field
            label="Câu hỏi của bạn"
            hint="Ví dụ: volume tập tối ưu cho hypertrophy, tần suất tập mỗi nhóm cơ, lượng protein cần thiết."
          >
            <textarea
              className="input min-h-[90px]"
              placeholder="Tôi nên tập bao nhiêu set mỗi nhóm cơ mỗi tuần để tăng cơ?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={1000}
              disabled={search.isPending}
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Từ năm">
              <input
                className="input"
                type="number"
                min="1900"
                max="2100"
                placeholder="2015"
                value={filters.yearFrom}
                onChange={(e) => setFilters((f) => ({ ...f, yearFrom: e.target.value }))}
                disabled={search.isPending}
              />
            </Field>
            <Field label="Đến năm">
              <input
                className="input"
                type="number"
                min="1900"
                max="2100"
                placeholder="2026"
                value={filters.yearTo}
                onChange={(e) => setFilters((f) => ({ ...f, yearTo: e.target.value }))}
                disabled={search.isPending}
              />
            </Field>
            <Field label="Mức bằng chứng">
              <select
                className="input"
                value={filters.maxLevel}
                onChange={(e) => setFilters((f) => ({ ...f, maxLevel: e.target.value }))}
                disabled={search.isPending}
              >
                <option value="">Tất cả mức</option>
                <option value="1">Chỉ mức 1 (mạnh nhất)</option>
                <option value="2">Mức 1-2</option>
                <option value="3">Mức 1-3</option>
                <option value="4">Mức 1-4</option>
              </select>
            </Field>
            <div className="flex items-end pb-1">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  checked={filters.openAccessOnly}
                  onChange={(e) => setFilters((f) => ({ ...f, openAccessOnly: e.target.checked }))}
                  disabled={search.isPending}
                />
                Chỉ open access
              </label>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-400">
              Kết quả luôn có link DOI/PubMed thật. Không có bài báo do AI tự sinh.
            </p>
            <button type="submit" className="btn-primary" disabled={search.isPending}>
              {search.isPending ? <Spinner className="h-4 w-4 text-white" /> : <Icon name="search" className="h-4 w-4" />}
              {search.isPending ? 'Đang tìm...' : 'Tìm nghiên cứu'}
            </button>
          </div>
        </form>

        {search.isPending && (
          <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-900 dark:bg-brand-950/40">
            <div className="flex items-center gap-3">
              <Spinner className="h-5 w-5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-brand-800 dark:text-brand-200">
                  {stage}... ({elapsed}s)
                </p>
                <p className="text-xs text-brand-700/70 dark:text-brand-300/70">
                  Thường 20-60 giây tùy số truy vấn và nguồn.
                </p>
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-brand-200/70 dark:bg-brand-900">
              <div
                className="h-full rounded-full bg-brand-600 transition-all duration-700 dark:bg-brand-400"
                style={{ width: `${Math.min(95, 10 + elapsed * 4)}%` }}
              />
            </div>
          </div>
        )}
      </Card>

      {data && (
        <div className="mt-4">
          {draftQueries.length > 0 && (
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Truy vấn tiếng Anh đã dùng
                </h3>
                <button type="button" className="btn-ghost !px-2.5 !py-1.5 text-xs" onClick={rerun} disabled={search.isPending}>
                  Tìm lại với truy vấn này
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {draftQueries.map((query, index) => (
                  <span
                    key={`${query}-${index}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {query}
                    <button
                      type="button"
                      onClick={() => setDraftQueries((prev) => prev.filter((_, i) => i !== index))}
                      className="text-slate-400 hover:text-rose-500"
                      aria-label="Xóa truy vấn"
                    >
                      <Icon name="close" className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  className="input !py-1.5 text-xs"
                  placeholder="Thêm truy vấn tiếng Anh..."
                  value={newQuery}
                  onChange={(e) => setNewQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newQuery.trim()) {
                        setDraftQueries((prev) => [...prev, newQuery.trim()].slice(0, 4));
                        setNewQuery('');
                      }
                    }
                  }}
                  maxLength={220}
                />
                <button
                  type="button"
                  className="btn-secondary !px-3 !py-1.5 text-xs"
                  onClick={() => {
                    if (newQuery.trim()) {
                      setDraftQueries((prev) => [...prev, newQuery.trim()].slice(0, 4));
                      setNewQuery('');
                    }
                  }}
                >
                  Thêm
                </button>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                Đã quét {data.scanned} kết quả thô · gộp còn {data.total} bài · hiển thị {results.length} bài tốt nhất.
              </p>
            </Card>
          )}

          {data.synthesis && (
            <Card className="mt-4 border-brand-200 bg-brand-50/60 dark:border-brand-900 dark:bg-brand-950/30">
              <div className="flex items-center gap-2">
                <Icon name="book" className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                <h3 className="text-sm font-semibold text-brand-900 dark:text-brand-100">
                  Tổng hợp tiếng Việt
                </h3>
              </div>
              <MarkdownText className="mt-2 text-brand-900/90 dark:text-brand-100/90">
                {data.synthesis}
              </MarkdownText>
              <p className="mt-2 text-[11px] text-brand-700/60 dark:text-brand-300/60">
                Tổng hợp chỉ dựa trên abstract của các bài trong danh sách. Trích dẫn [n] tương ứng số thứ tự bên dưới.
              </p>
            </Card>
          )}

          {!results.length && (
            <Alert tone="info" className="mt-4">
              Không có kết quả phù hợp. Thử bỏ lọc hoặc dùng câu hỏi rộng hơn.
            </Alert>
          )}

          <div className="mt-4 space-y-3">
            {results.map((item) => {
              const key = paperKey(item);
              const isSaved = saved[key];
              const isExpanded = expanded[key];
              return (
                <Card key={key} className="transition hover:border-slate-300 dark:hover:border-slate-700">
                  <div className="flex gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-sm font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {item.id}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={clsx('badge', LEVEL_STYLES[item.evidenceLevel] || LEVEL_STYLES[5])}>
                          Mức {item.evidenceLevel}/5
                        </span>
                        {item.isOpenAccess && (
                          <span className="badge bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            Open access
                          </span>
                        )}
                        <span className="badge bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          {formatNumber(item.citationCount || 0, 0)} trích dẫn
                        </span>
                        {item.score ? (
                          <span className="badge bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            Điểm {item.score}
                          </span>
                        ) : null}
                      </div>

                      <h3 className="mt-2 text-base font-semibold leading-snug text-slate-900 dark:text-white">
                        {item.url || item.doi ? (
                          <a
                            href={item.url || `https://doi.org/${item.doi}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-brand-700 dark:hover:text-brand-300"
                          >
                            {item.title}
                          </a>
                        ) : (
                          item.title
                        )}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {(item.authors || []).slice(0, 3).join(', ')}
                        {(item.authors || []).length > 3 ? ' và cộng sự' : ''}
                        {item.journal ? ` · ${item.journal}` : ''}
                        {item.year ? ` · ${item.year}` : ''}
                        {item.doi ? ` · DOI ${item.doi}` : ''}
                      </p>

                      {item.viSummary && (
                        <MarkdownText
                          compact
                          className="mt-2 text-slate-700 dark:text-slate-300"
                        >
                          {item.viSummary}
                        </MarkdownText>
                      )}

                      {item.abstract && (
                        <div className="mt-2">
                          <p
                            className={clsx(
                              'text-xs leading-relaxed text-slate-500 dark:text-slate-400',
                              !isExpanded && 'line-clamp-2',
                            )}
                          >
                            {item.abstract}
                          </p>
                          <button
                            type="button"
                            className="mt-1 text-[11px] font-semibold text-brand-600 hover:underline dark:text-brand-400"
                            onClick={() =>
                              setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
                            }
                          >
                            {isExpanded ? 'Thu gọn abstract' : 'Xem abstract'}
                          </button>
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          className="btn-primary !px-3 !py-1.5 text-xs"
                          onClick={() => openReader(item)}
                        >
                          <Icon name="book" className="h-3.5 w-3.5" />
                          Tóm tắt chi tiết
                        </button>
                        <button
                          type="button"
                          className={clsx('btn-secondary !px-3 !py-1.5 text-xs', isSaved && 'text-emerald-600')}
                          disabled={isSaved || savePaper.isPending}
                          onClick={() =>
                            savePaper.mutate({
                              title: item.title,
                              authors: item.authors || [],
                              year: item.year || undefined,
                              journal: item.journal || '',
                              doi: item.doi || '',
                              pmid: item.pmid || '',
                              pmcid: item.pmcid || '',
                              url: item.url || '',
                              abstract: (item.abstract || '').slice(0, 50000),
                              publicationTypes: item.publicationTypes || [],
                              evidenceLevel: item.evidenceLevel || 5,
                              citationCount: item.citationCount || 0,
                              isOpenAccess: Boolean(item.isOpenAccess),
                              source: ['pubmed', 'europepmc', 'openalex'].includes(item.source)
                                ? item.source
                                : 'manual',
                            })
                          }
                        >
                          <Icon name={isSaved ? 'check' : 'plus'} className="h-3.5 w-3.5" />
                          {isSaved ? 'Đã lưu thư viện' : 'Lưu thư viện'}
                        </button>
                        {item.pmid && (
                          <a
                            href={`https://pubmed.ncbi.nlm.nih.gov/${item.pmid}/`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-ghost !px-2.5 !py-1.5 text-xs"
                          >
                            PubMed
                            <Icon name="external" className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
