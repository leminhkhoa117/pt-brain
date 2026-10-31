import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Card,
  Field,
  Icon,
  PageHeader,
  Segmented,
  Spinner,
} from '../components/ui.jsx';
import SummaryView from '../components/research/SummaryView.jsx';
import SourcePane from '../components/research/SourcePane.jsx';
import AskPanel from '../components/research/AskPanel.jsx';
import ApplyPlanModal from '../components/research/ApplyPlanModal.jsx';
import {
  createNote,
  createSummary,
  createTerm,
  deleteSummary,
  getSummary,
  listSummaries,
  listTerms,
  updateSummaryMeta,
} from '../api/summaries.js';
import { getErrorMessage } from '../api/client.js';
import { formatDateKey } from '../lib/date.js';
import { formatNumber } from '../lib/format.js';

const MODES = [
  { value: 'link', label: 'Link / DOI' },
  { value: 'pdf', label: 'PDF' },
  { value: 'text', label: 'Văn bản' },
];

const STAGES = [
  'Đang xác định bài báo',
  'Đang tải toàn văn / abstract',
  'Đang trích nội dung chính',
  'AI đang đọc và tóm tắt',
];

function NoteBox({ summaryId, paperId }) {
  const [text, setText] = useState('');
  const [notice, setNotice] = useState(null);
  const save = useMutation({
    mutationFn: () => createNote({ text: text.trim(), summaryId, paperId }),
    onSuccess: () => {
      setText('');
      setNotice('Đã lưu ghi chú.');
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });

  return (
    <Card className="mt-4">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Ghi chú của bạn</h3>
      <textarea
        className="input mt-2 min-h-[80px]"
        placeholder="Ý áp dụng vào giáo án, điều cần kiểm chứng thêm..."
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setNotice(null);
        }}
        maxLength={10000}
      />
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-xs text-slate-400">Lưu gắn với bài này và thư viện ghi chú.</p>
        <button
          type="button"
          className="btn-secondary"
          disabled={text.trim().length < 3 || save.isPending}
          onClick={() => save.mutate()}
        >
          {save.isPending ? 'Đang lưu...' : 'Lưu ghi chú'}
        </button>
      </div>
      {notice && (
        <p className={`mt-2 text-xs ${save.isError ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
          {notice}
        </p>
      )}
    </Card>
  );
}

export default function ReaderPage() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState('link');
  const [link, setLink] = useState('');
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [active, setActive] = useState(null);
  const [pane, setPane] = useState('summary');
  const [error, setError] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [loadingId, setLoadingId] = useState(null);
  const [applyOpen, setApplyOpen] = useState(false);

  const listQuery = useQuery({ queryKey: ['summaries'], queryFn: () => listSummaries() });
  const termsQuery = useQuery({ queryKey: ['terms'], queryFn: listTerms });

  useEffect(() => {
    const doi = searchParams.get('doi');
    const url = searchParams.get('url');
    if (doi) {
      setMode('link');
      setLink(doi);
      setActive(null);
    } else if (url) {
      setMode('link');
      setLink(url);
      setActive(null);
    }
  }, [searchParams]);

  useEffect(() => {
    const id = searchParams.get('summary');
    if (!id) return undefined;
    let cancelled = false;
    setLoadingId(id);
    getSummary(id)
      .then((data) => {
        if (!cancelled) {
          setActive(data);
          setPane('summary');
        }
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoadingId(null);
      });
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const savedTerms = new Set((termsQuery.data?.terms || []).map((t) => t.en));

  const createMutation = useMutation({
    mutationFn: createSummary,
    onSuccess: (data) => {
      setActive(data);
      setPane('summary');
      setError(null);
      setLink('');
      setText('');
      setTitle('');
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ['summaries'] });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const saveTermMutation = useMutation({
    mutationFn: (term) =>
      createTerm({
        en: term.en,
        vi: term.vi,
        explanation: term.explanation,
        sourcePaperId: active?.paper?._id,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['terms'] }),
    onError: (err) => setError(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteSummary(id),
    onSuccess: () => {
      setActive(null);
      queryClient.invalidateQueries({ queryKey: ['summaries'] });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const metaMutation = useMutation({
    mutationFn: ({ id, isFavorite }) => updateSummaryMeta(id, { isFavorite }),    onSuccess: (data) => {
      setActive((prev) =>
        prev
          ? {
              ...prev,
              summary: {
                ...prev.summary,
                isFavorite: data.summary.isFavorite,
                tags: data.summary.tags,
              },
            }
          : prev,
      );
      queryClient.invalidateQueries({ queryKey: ['summaries'] });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  useEffect(() => {
    if (!createMutation.isPending) {
      setElapsed(0);
      return undefined;
    }
    setElapsed(0);
    const timer = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [createMutation.isPending]);

  const submit = (e) => {
    e.preventDefault();
    setError(null);
    if (mode === 'pdf') {
      if (!file) return setError('Chọn file PDF trước khi gửi.');
      return createMutation.mutate({ file, title: title.trim() || undefined });
    }
    if (mode === 'text') {
      if (text.trim().length < 80) return setError('Văn bản cần tối thiểu 80 ký tự.');
      return createMutation.mutate({ text: text.trim(), title: title.trim() || undefined });
    }
    const value = link.trim();
    if (!value) return setError('Nhập link bài báo hoặc DOI.');
    if (/^10\.\d{4,9}\//.test(value)) {
      return createMutation.mutate({ doi: value, title: title.trim() || undefined });
    }
    if (!/^https?:\/\//i.test(value)) {
      return setError('Link phải bắt đầu bằng http:// hoặc https://, hoặc nhập DOI (10.xxxx/...).');
    }
    return createMutation.mutate({ url: value, title: title.trim() || undefined });
  };

  const loadSaved = async (id) => {
    setLoadingId(id);
    setError(null);
    try {
      const data = await getSummary(id);
      setActive(data);
      setPane('summary');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingId(null);
    }
  };

  const stage = STAGES[Math.min(STAGES.length - 1, Math.floor(elapsed / 6))];
  const summaries = listQuery.data?.summaries || [];
  const usage = listQuery.data?.usage;
  const [processingElapsed, setProcessingElapsed] = useState(0);

  useEffect(() => {
    const id = active?.summary?._id;
    const status = active?.summary?.status;
    if (!id || status !== 'processing') return undefined;
    let cancelled = false;
    const started = Date.now();
    setProcessingElapsed(0);

    const poll = setInterval(async () => {
      try {
        const data = await getSummary(id);
        if (cancelled) return;
        setActive(data);
        if (data.summary.status !== 'processing') {
          queryClient.invalidateQueries({ queryKey: ['summaries'] });
        }
      } catch (err) {
        if (cancelled) return;
        if (err?.response?.status === 404 || err?.response?.status === 403) {
          clearInterval(poll);
          clearInterval(tick);
          setError('Không tìm thấy bản tóm tắt (có thể đã bị xóa).');
          setActive(null);
        }
      }
    }, 3500);

    const tick = setInterval(() => {
      if (!cancelled) setProcessingElapsed(Math.round((Date.now() - started) / 1000));
    }, 1000);

    return () => {
      cancelled = true;
      clearInterval(poll);
      clearInterval(tick);
    };
  }, [active?.summary?._id, active?.summary?.status, queryClient]);

  return (
    <div>
      <PageHeader
        title="Research Reader"
        subtitle="Dán link/DOI, tải PDF hoặc dán văn bản. AI tóm tắt tiếng Việt, giữ nguyên số liệu gốc để bạn đối chiếu."
        actions={
          usage ? (
            <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              AI hôm nay: {usage.summarize}/{usage.limit} lượt tóm tắt
            </span>
          ) : null
        }
      />

      {error && (
        <Alert tone="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {active ? (
        <>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setActive(null)}
            >
              ← Thư viện
            </button>
            <Segmented
              className="lg:hidden"
              options={[
                { value: 'summary', label: 'Tóm tắt' },
                { value: 'source', label: 'Bài gốc' },
              ]}
              value={pane}
              onChange={setPane}
            />
          </div>

          {active.summary.status === 'processing' ? (
            <Card className="py-16 text-center">
              <Spinner className="mx-auto h-9 w-9" />
              <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                Đang tóm tắt bài...
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {active.summary.progress || 'Đang xử lý...'}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Đã {processingElapsed}s · bạn có thể rời tab và quay lại thư viện sau.
              </p>
              <button
                type="button"
                className="btn-secondary mt-5"
                onClick={() => setActive(null)}
              >
                Về thư viện
              </button>
            </Card>
          ) : active.summary.status === 'failed' ? (
            <Alert tone="danger" title="Tóm tắt thất bại">
              {active.summary.error || 'Có lỗi khi gọi AI. Hãy thử lại với PDF khác hoặc dán nội dung.'}
              <div className="mt-3">
                <button type="button" className="btn-secondary" onClick={() => setActive(null)}>
                  Quay lại thư viện
                </button>
              </div>
            </Alert>
          ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className={pane === 'source' ? 'hidden lg:block' : ''}>
              <SummaryView
                summary={active.summary}
                paper={active.paper}
                savedTerms={savedTerms}
                savingTerm={saveTermMutation.isPending ? saveTermMutation.variables?.en : null}
                onSaveTerm={(term) => saveTermMutation.mutate(term)}
                deleting={deleteMutation.isPending}
                onDelete={() => {
                  if (window.confirm('Xóa bản tóm tắt này?')) {
                    deleteMutation.mutate(active.summary._id);
                  }
                }}
                onApply={() => setApplyOpen(true)}
                favorite={Boolean(active.summary.isFavorite)}
                onToggleFavorite={() =>
                  metaMutation.mutate({
                    id: active.summary._id,
                    isFavorite: !active.summary.isFavorite,
                  })
                }
              />
            </div>

            <div className={pane === 'summary' ? 'hidden lg:block' : ''}>
              <SourcePane
                text={active.sourceText}
                url={active.paper?.url || active.summary.sourceUrl}
                title={active.paper?.title}
              />
              <div className="mt-4">
                <AskPanel summaryId={active.summary._id} initialQa={active.summary.qa || []} />
              </div>
              <NoteBox summaryId={active.summary._id} paperId={active.paper?._id} />
            </div>
          </div>
          )}
          {applyOpen && active.summary.status === 'ready' && (
            <ApplyPlanModal
              summaryId={active.summary._id}
              onClose={() => setApplyOpen(false)}
            />
          )}
        </>
      ) : (
        <>
          <Card>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <Segmented options={MODES} value={mode} onChange={setMode} />
              <span className="text-xs text-slate-400">PDF tối đa 20 MB · ưu tiên bài open access</span>
            </div>

            <form onSubmit={submit} className="space-y-4" noValidate>
              {mode === 'link' && (
                <Field
                  label="Link bài báo hoặc DOI"
                  hint="Hỗ trợ PubMed, PMC, doi.org, Europe PMC, arXiv/SportRxiv hoặc trang tạp chí."
                >
                  <input
                    className="input"
                    placeholder="https://doi.org/10.1080/02640414.2016.1210197"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    disabled={createMutation.isPending}
                  />
                </Field>
              )}

              {mode === 'pdf' && (
                <Field label="File PDF" hint="PDF có lớp text. Bản scan chưa hỗ trợ OCR.">
                  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-slate-300 px-4 py-4 text-sm transition hover:border-brand-400 dark:border-slate-700">
                    <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Icon name="book" className="h-5 w-5" />
                      {file ? `${file.name} · ${formatNumber(file.size / 1024 / 1024, 2)} MB` : 'Chọn file PDF'}
                    </span>
                    <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                      Chọn
                    </span>
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const selected = e.target.files?.[0] || null;
                        if (selected && selected.size > 20 * 1024 * 1024) {
                          setError('PDF vượt quá 20 MB.');
                          setFile(null);
                          return;
                        }
                        setError(null);
                        setFile(selected);
                      }}
                      disabled={createMutation.isPending}
                    />
                  </label>
                </Field>
              )}

              {mode === 'text' && (
                <Field label="Dán văn bản hoặc abstract" hint="Tối thiểu 80 ký tự, tối đa 400.000 ký tự.">
                  <textarea
                    className="input min-h-[180px]"
                    placeholder="Dán abstract hoặc nội dung bài báo..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={createMutation.isPending}
                    maxLength={400000}
                  />
                </Field>
              )}

              <Field label="Tiêu đề (tùy chọn)" hint="Bỏ trống để hệ thống tự lấy từ bài báo.">
                <input
                  className="input"
                  placeholder="Ví dụ: Volume tập và phì đại cơ"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={createMutation.isPending}
                  maxLength={300}
                />
              </Field>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="max-w-xl text-xs leading-relaxed text-slate-400">
                  Chỉ nạp toàn văn từ nguồn hợp pháp (open access) hoặc file bạn tự tải lên. Bài paywall
                  sẽ được gắn nhãn “chỉ dựa trên abstract”.
                </p>
                <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Spinner className="h-4 w-4 text-white" /> : <Icon name="book" className="h-4 w-4" />}
                  {createMutation.isPending ? 'Đang xử lý...' : 'Tóm tắt bài này'}
                </button>
              </div>
            </form>

            {createMutation.isPending && (
              <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-900 dark:bg-brand-950/40">
                <div className="flex items-center gap-3">
                  <Spinner className="h-5 w-5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-brand-800 dark:text-brand-200">
                      {stage}... ({elapsed}s)
                    </p>
                    <p className="text-xs text-brand-700/70 dark:text-brand-300/70">
                      Thường mất 20-90 giây; bài dài có thể lâu hơn. Đừng đóng tab.
                    </p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-brand-200/70 dark:bg-brand-900">
                  <div
                    className="h-full rounded-full bg-brand-600 transition-all duration-700 dark:bg-brand-400"
                    style={{ width: `${Math.min(95, 8 + elapsed * 3)}%` }}
                  />
                </div>
              </div>
            )}
          </Card>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Bài đã lưu {summaries.length ? `(${summaries.length})` : ''}
              </h2>
              {listQuery.isFetching && <Spinner className="h-4 w-4" />}
            </div>

            {!summaries.length && !listQuery.isLoading && (
              <Card className="text-center text-sm text-slate-400">
                Chưa có bản tóm tắt. Thử một DOI quen thuộc như{' '}
                <code className="text-xs">10.1080/02640414.2016.1210197</code>.
              </Card>
            )}

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {summaries.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => loadSaved(item.id)}
                  className="card group text-left transition hover:border-brand-300 hover:shadow-soft dark:hover:border-brand-800"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      Mức {item.paper?.evidenceLevel || '?'}
                    </span>
                    {item.basedOn === 'abstract_only' && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-500">
                        Abstract
                      </span>
                    )}
                    {loadingId === item.id && <Spinner className="h-4 w-4" />}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-slate-800 group-hover:text-brand-700 dark:text-slate-100 dark:group-hover:text-brand-300">
                    {item.paper?.title || 'Không rõ tiêu đề'}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {item.paper?.journal || 'Không rõ tạp chí'}
                    {item.paper?.year ? ` · ${item.paper.year}` : ''}
                    {item.createdAt ? ` · lưu ${formatDateKey(String(item.createdAt).slice(0, 10))}` : ''}
                  </p>
                  {item.tldr && (
                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {item.tldr}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

