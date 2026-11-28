import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Card,
  EmptyState,
  Field,
  Icon,
  PageHeader,
  Segmented,
  Spinner,
} from '../components/ui.jsx';
import SummaryView from '../components/research/SummaryView.jsx';
import ResearchProcessingCard from '../components/research/ResearchProcessingCard.jsx';
import ResearchJobProgress from '../components/research/ResearchJobProgress.jsx';
import ContextLessonCard from '../learning/ContextLessonCard.jsx';
import SourcePane from '../components/research/SourcePane.jsx';
import AskPanel from '../components/research/AskPanel.jsx';
import RelatedWorks from '../components/research/RelatedWorks.jsx';
import ApplyPlanModal from '../components/research/ApplyPlanModal.jsx';
import { useDialog } from '../components/DialogProvider.jsx';
import {
  createNote,
  createSummary,
  createTerm,
  deleteSummary,
  getFullTextCandidates,
  getSummary,
  listSummaries,
  listTerms,
  markSummaryReviewed,
  retrySummary,
  summaryTranslationUrl,
  translateSummary,
  updateSummaryMeta,
} from '../api/summaries.js';
import { getErrorMessage } from '../api/client.js';
import { createFlashcard } from '../api/learning.js';
import { readStored, removeStored, writeStored } from '../lib/persist.js';
import { useAuth } from '../hooks/useAuth.jsx';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { formatDateKey } from '../lib/date.js';
import { formatNumber } from '../lib/format.js';

const SUMMARY_STORAGE_KEY = 'ptbrain:research:last-summary';
const DRAFT_STORAGE_PREFIX = 'ptbrain.reader.draft.v1.';

const MODES = [
  { value: 'link', label: 'Link / DOI' },
  { value: 'pdf', label: 'PDF' },
  { value: 'text', label: 'Văn bản' },
];

const DEFAULT_DRAFT = { mode: 'link', link: '', text: '', title: '' };

const normalizeDraft = (value) => ({
  mode: MODES.some((item) => item.value === value?.mode) ? value.mode : 'link',
  link: typeof value?.link === 'string' ? value.link : '',
  text: typeof value?.text === 'string' ? value.text : '',
  title: typeof value?.title === 'string' ? value.title : '',
});

const STAGES = [
  'Đang xác định bài báo',
  'Đang tải toàn văn open access',
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
        <p className="text-xs text-slate-500 dark:text-slate-400">Lưu gắn với bài này và thư viện ghi chú.</p>
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

function FullTextHelp({ details, onUpload }) {
  const doi = details?.doi || '';
  const title = details?.title || '';
  const publisherUrl = details?.publisherUrl || (doi ? `https://doi.org/${doi}` : '');
  const candidates = useQuery({
    queryKey: ['research-fulltext', doi],
    queryFn: () => getFullTextCandidates(doi),
    enabled: false,
  });

  const subject = encodeURIComponent(`Request for full-text copy: ${title || doi || 'paper'}`);
  const body = encodeURIComponent(
    [
      'Kính gửi tác giả,',
      '',
      `Tôi đang nghiên cứu và rất quan tâm đến bài: ${title || doi || ''}.`,
      doi ? `DOI: ${doi}` : '',
      '',
      'Nếu thuận tiện, anh/chị có thể gửi cho tôi bản PDF của bài báo?',
      'Tôi sẽ dùng cho mục đích nghiên cứu cá nhân và trích dẫn đầy đủ.',
      '',
      'Trân trọng,',
    ]
      .filter(Boolean)
      .join('\n'),
  );
  const mailto = `mailto:?subject=${subject}&body=${body}`;

  return (
    <Card className="mb-4 border-amber-200 bg-amber-50/60 dark:border-amber-900/60 dark:bg-amber-950/20">
      <div className="flex items-start gap-2">
        <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
            Cần toàn văn để tóm tắt
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-amber-800/90 dark:text-amber-200/80">
            Bài này không có bản open access đọc được, nên hệ thống không tạo bản tóm tắt từ
            abstract. Hãy tìm PDF hợp pháp, nhờ tác giả, dùng thư viện, hoặc tải PDF bạn có quyền
            truy cập.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {doi && (
              <button
                type="button"
                className="btn-primary !px-3 !py-1.5 text-xs"
                disabled={candidates.isFetching}
                onClick={() => candidates.refetch()}
              >
                <Icon name="search" className="h-3.5 w-3.5" />
                {candidates.isFetching ? 'Đang tìm...' : 'Tìm bản PDF hợp pháp'}
              </button>
            )}
            {publisherUrl && (
              <a
                href={publisherUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary !px-3 !py-1.5 text-xs"
              >
                Mở nhà xuất bản
                <Icon name="external" className="h-3.5 w-3.5" />
              </a>
            )}
            <a href={mailto} className="btn-ghost !px-3 !py-1.5 text-xs">
              Nhờ tác giả gửi bản
            </a>
            <button
              type="button"
              className="btn-ghost !px-3 !py-1.5 text-xs"
              onClick={onUpload}
            >
              Tải PDF của tôi
            </button>
          </div>

          {candidates.isError && (
            <p className="mt-2 text-xs text-rose-600 dark:text-rose-300">
              {getErrorMessage(candidates.error)}
            </p>
          )}
          {candidates.data?.candidates?.length ? (
            <div className="mt-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-800/80 dark:text-amber-200/70">
                Nguồn hợp pháp đã tìm thấy
              </p>
              <ul className="mt-1.5 space-y-1.5">
                {candidates.data.candidates.map((candidate) => (
                  <li key={`${candidate.source}-${candidate.url}`}>
                    <a
                      href={candidate.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-amber-900 underline decoration-dotted underline-offset-2 hover:decoration-solid dark:text-amber-100"
                    >
                      {candidate.label || candidate.source}
                    </a>
                    <span className="ml-1 text-[10px] text-amber-700/70 dark:text-amber-300/60">
                      {candidate.kind === 'pdf'
                        ? 'PDF'
                        : candidate.kind === 'pmc_xml'
                          ? 'XML'
                          : 'trang'}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[10px] text-amber-700/70 dark:text-amber-300/60">
                Không có Sci-Hub trong danh sách này. Nếu không có bản OA, hãy dùng kênh thư viện
                hoặc liên hệ tác giả.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export default function ReaderPage() {
  const dialog = useDialog();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?._id || 'anon';
  const [searchParams, setSearchParams] = useSearchParams();
  const fromFinder = searchParams.get('from') === 'finder';
  const [draft, setDraft] = usePersistentState(
    `${DRAFT_STORAGE_PREFIX}${userId}`,
    DEFAULT_DRAFT,
    { delay: 250 },
  );
  const { mode, link, text, title } = normalizeDraft(draft);
  const patchDraft = (patch) =>
    setDraft((prev) => normalizeDraft({ ...normalizeDraft(prev), ...patch }));
  const setMode = (value) => patchDraft({ mode: value });
  const setLink = (value) => patchDraft({ link: value });
  const setText = (value) => patchDraft({ text: value });
  const setTitle = (value) => patchDraft({ title: value });
  const [file, setFile] = useState(null);
  const [active, setActive] = useState(null);
  const [error, setError] = useState(null);
  const [errorInfo, setErrorInfo] = useState(null);
  const [notice, setNotice] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [loadingId, setLoadingId] = useState(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [chatFocusSignal, setChatFocusSignal] = useState(0);
  const activeIdRef = useRef(null);

  const listQuery = useQuery({
    queryKey: ['summaries'],
    queryFn: () => listSummaries(),
    // Có bài đang tóm tắt thì làm mới danh sách để trạng thái/tiến trình
    // không bị đứng ở nội dung cũ.
    refetchInterval: (query) =>
      (query.state.data?.summaries || []).some((item) => item.status === 'processing')
        ? 5000
        : false,
  });
  const termsQuery = useQuery({ queryKey: ['terms'], queryFn: listTerms });

  useEffect(() => {
    activeIdRef.current = active?.summary?._id || null;
  }, [active]);

  /** Đưa bài đang đọc vào URL + localStorage để rời trang rồi quay lại vẫn còn. */
  const rememberSummary = (id) => {
    writeStored(SUMMARY_STORAGE_KEY, { id, at: Date.now() });
    if (!id) return;
    // ReaderPage giờ được keep-alive: một bản tóm tắt chạy nền có thể xong khi
    // người dùng đã sang tab khác. Không kéo họ về tab Đọc bằng cách xóa ?tab.
    const activeTab = searchParams.get('tab');
    if (activeTab === 'finder' || activeTab === 'library') return;
    const next = new URLSearchParams(searchParams);
    ['doi', 'url', 'auto', 'from'].forEach((key) => next.delete(key));
    next.delete('tab');
    if (next.get('summary') === id) return;
    next.set('summary', id);
    setSearchParams(next, { replace: true });
  };

  const forgetSummary = () => {
    removeStored(SUMMARY_STORAGE_KEY);
    const next = new URLSearchParams(searchParams);
    next.delete('summary');
    setSearchParams(next, { replace: true });
  };

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
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const id = searchParams.get('summary');
    if (!id) return undefined;
    // Đã hiển thị đúng bài này rồi (ví dụ vừa bấm từ thư viện) thì không tải lại.
    if (activeIdRef.current === id) return undefined;
    let cancelled = false;
    setLoadingId(id);
    getSummary(id)
      .then((data) => {
        if (!cancelled) {
          setActive(data);
          writeStored(SUMMARY_STORAGE_KEY, { id, at: Date.now() });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getErrorMessage(err));
          // Bài đã bị xóa hoặc không còn quyền: bỏ khỏi URL để không lặp lỗi.
          if ([403, 404].includes(err?.response?.status)) forgetSummary();
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingId(null);
      });
    return () => {
      cancelled = true;
    };
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Khôi phục bài đang đọc khi quay lại /research (không có ?summary trên URL).
  useEffect(() => {
    if (searchParams.get('summary')) return;
    if (searchParams.get('doi') || searchParams.get('url')) return;
    const stored = readStored(SUMMARY_STORAGE_KEY);
    if (!stored?.id) return;
    const next = new URLSearchParams(searchParams);
    next.set('summary', stored.id);
    setSearchParams(next, { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const savedTerms = new Set((termsQuery.data?.terms || []).map((t) => t.en));
  const autoStartedFor = useRef(null);
  const autoInFlight = useRef(false);

  const createMutation = useMutation({
    mutationFn: createSummary,
    onSuccess: (data) => {
      autoInFlight.current = false;
      setActive(data);
      setError(null);
      setErrorInfo(null);
      setNotice(null);
      setLink('');
      setText('');
      setTitle('');
      setFile(null);
      rememberSummary(data.summary?._id);
      queryClient.invalidateQueries({ queryKey: ['summaries'] });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onError: (err) => {
      autoInFlight.current = false;
      const apiError = err?.response?.data?.error;
      setError(getErrorMessage(err));
      setErrorInfo(apiError?.code === 'FULLTEXT_REQUIRED' ? apiError : null);
    },
  });

  useEffect(() => {
    // Không còn auto=1 (đã tạo xong hoặc đã rời phiên) thì cho phép chạy lại
    // cho bài tiếp theo. Keep-alive giữ ReaderPage mounted nên không thể dùng
    // một cờ boolean như khi component còn bị unmount mỗi lần đổi tab.
    if (searchParams.get('auto') !== '1') {
      autoStartedFor.current = null;
      autoInFlight.current = false;
      return;
    }
    const doi = searchParams.get('doi');
    const url = searchParams.get('url');
    if (!doi && !url) return;
    const autoKey = `${doi ? 'doi' : 'url'}:${doi || url}`;

    // Cùng một DOI/URL:
    // - đang gửi (kể cả StrictMode gọi effect 2 lần) => không gửi trùng;
    // - đã có kết quả, đang xử lý hoặc đã lỗi => không tự chạy lại.
    // Nhưng nếu trước đó request đã xong trong lúc người dùng ở tab khác
    // (auto=1 còn trên URL, active bị reset khi bấm lại), phải chạy lại/đọc
    // cache thay vì để Reader trống.
    const sameKey = autoStartedFor.current === autoKey;
    if (sameKey && (autoInFlight.current || active || createMutation.isPending || error)) {
      return;
    }

    autoStartedFor.current = autoKey;
    autoInFlight.current = true;
    setError(null);
    createMutation.mutate(doi ? { doi } : { url });
  }, [active, createMutation, error, searchParams]);

  const saveTermMutation = useMutation({
    mutationFn: (term) =>
      createTerm({
        en: term.en,
        vi: term.vi,
        explanation: term.explanation,
        example: term.example || '',
        sourcePaperId: active?.paper?._id,
      }),
    onSuccess: () => {
      setNotice('Đã lưu thuật ngữ vào Từ điển. Sang mục Học tập để ôn hoặc tạo flashcard.');
      queryClient.invalidateQueries({ queryKey: ['terms'] });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  /** Tạo flashcard từ thuật ngữ đã lưu (dùng cho nút trong popover/giải thích). */
  const flashcardMutation = useMutation({
    mutationFn: async (term) => {
      const saved = (termsQuery.data?.terms || []).find((item) => item.en === term.en);
      if (!saved) throw new Error('Thuật ngữ chưa có trong từ điển — bấm lưu trước đã.');
      return createFlashcard({ termId: saved._id });
    },
    onSuccess: () => {
      setNotice('Đã tạo flashcard cho thuật ngữ này. Vào Học tập → Flashcard để ôn.');
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteSummary(id),
    onSuccess: () => {
      setActive(null);
      forgetSummary();
      queryClient.invalidateQueries({ queryKey: ['summaries'] });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const translateMutation = useMutation({
    mutationFn: () => translateSummary(active.summary._id),
    onSuccess: (data) => {
      setActive((prev) =>
        prev
          ? {
              ...prev,
              summary: { ...prev.summary, translation: data.translation },
            }
          : prev,
      );
    },
  });

  const metaMutation = useMutation({
    mutationFn: ({ id, isFavorite }) => updateSummaryMeta(id, { isFavorite }),
    onSuccess: (data) => {
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

  const retryMutation = useMutation({
    mutationFn: () => retrySummary(active.summary._id),
    onSuccess: (data) => {
      setActive((prev) => (prev ? { ...prev, summary: data.summary } : prev));
      setError(null);
      // Cập nhật danh sách ngay: nếu không, Library/Reader còn cache "ready"
      // nên không bật polling và vẫn hiện nội dung cũ trong lúc job chạy lại.
      queryClient.invalidateQueries({ queryKey: ['summaries'] });
    },
    onError: (err) => {
      const apiError = err?.response?.data?.error;
      setError(getErrorMessage(err));
      setErrorInfo(apiError?.code === 'FULLTEXT_REQUIRED' ? apiError : null);
    },
  });

  const reviewMutation = useMutation({
    mutationFn: () => markSummaryReviewed(active.summary._id),
    onSuccess: (data) => {
      setActive((prev) => (prev ? { ...prev, summary: data.summary } : prev));
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
    setErrorInfo(null);
    if (mode === 'pdf') {
      if (!file) return setError('Chọn file PDF trước khi gửi.');
      return createMutation.mutate({ file, title: title.trim() || undefined });
    }
    if (mode === 'text') {
      if (text.trim().length < 5000) {
        return setError('Văn bản phải là toàn văn, tối thiểu 5.000 ký tự. Abstract không được chấp nhận.');
      }
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
    setErrorInfo(null);
    setNotice(null);
    try {
      const data = await getSummary(id);
      setActive(data);
      rememberSummary(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingId(null);
    }
  };

  /** Thoát khỏi bài đang đọc: xóa URL + bộ nhớ để lần sau mở lại là thư viện. */
  const closeSummary = () => {
    setActive(null);
    setErrorInfo(null);
    setNotice(null);
    forgetSummary();
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
      {!active && (
        <PageHeader
          title="Đọc &amp; tóm tắt"
          subtitle="Chỉ tóm tắt khi có toàn văn open access hoặc PDF bạn tải lên. Không tóm tắt từ abstract."
          actions={
            usage ? (
              <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                AI hôm nay: {usage.summarize}/{usage.limit} lượt tóm tắt
              </span>
            ) : null
          }
        />
      )}

      {errorInfo?.code === 'FULLTEXT_REQUIRED' ? (
        <FullTextHelp
          details={errorInfo.details}
          onUpload={() => {
            setError(null);
            setErrorInfo(null);
            setMode('pdf');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : (
        error && (
          <Alert tone="danger" className="mb-4">
            {error}
          </Alert>
        )
      )}

      {notice && (
        <Alert tone="success" className="mb-4">
          {notice}
        </Alert>
      )}

      {active ? (
        <>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {fromFinder && (
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => navigate('/research?tab=finder')}
                >
                  ← Kết quả tìm kiếm
                </button>
              )}
              <button
                type="button"
                className="btn-ghost"
                onClick={closeSummary}
              >
                ← Thư viện
              </button>
            </div>
          </div>

          {active.summary.status === 'processing' ? (
            <ResearchProcessingCard
              progress={active.summary.progress}
              elapsed={processingElapsed}
              onBack={closeSummary}
            />
          ) : active.summary.status === 'failed' ? (
            <Alert tone="danger" title="Tóm tắt thất bại">
              {active.summary.error || 'Có lỗi khi gọi AI. Hãy thử lại với PDF khác hoặc dán nội dung.'}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-primary !px-3 !py-1.5 text-xs"
                  disabled={retryMutation.isPending}
                  onClick={() => retryMutation.mutate()}
                >
                  {retryMutation.isPending ? 'Đang thử lại...' : 'Thử lại'}
                </button>
                <button type="button" className="btn-secondary !px-3 !py-1.5 text-xs" onClick={closeSummary}>
                  Quay lại thư viện
                </button>
              </div>
            </Alert>
          ) : (
          <>
          <div className="mb-4">
            <ContextLessonCard
              surface="research.reader"
              context={{
                query: `${active.summary.title || active.paper?.title || ''} ${active.summary.tldr || ''} ${(active.summary.tags || []).join(' ')}`,
              }}
              title="Nền tảng liên quan bài đang đọc"
              variant="inline"
            />
          </div>
          <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(340px,400px)]">
            <div className="min-w-0 space-y-4">
              <SummaryView
                summary={active.summary}
                paper={active.paper}
                savedTerms={savedTerms}
                savingTerm={saveTermMutation.isPending ? saveTermMutation.variables?.en : null}
                onSaveTerm={(term) => {
                  setError(null);
                  setNotice(null);
                  saveTermMutation.mutate(term);
                }}
                onMakeFlashcard={(term) => {
                  setError(null);
                  setNotice(null);
                  flashcardMutation.mutate(term);
                }}
                deleting={deleteMutation.isPending}
                onDelete={async () => {
                  const ok = await dialog.confirm({
                    title: 'Xóa bản tóm tắt',
                    message: 'Xóa bản tóm tắt này khỏi thư viện?',
                    confirmLabel: 'Xóa bản tóm tắt',
                  });
                  if (ok) deleteMutation.mutate(active.summary._id);
                }}
                onApply={() => setApplyOpen(true)}
                onAsk={() => setChatFocusSignal((value) => value + 1)}
                onRefresh={async () => {
                  const ok = await dialog.confirm({
                    title: 'Tạo lại bản tóm tắt',
                    message:
                      'Tạo lại bản tóm tắt bằng AI? Việc này tốn 1 lượt tóm tắt và có thể mất vài phút (tối đa 15 phút). Bản dịch đã lưu vẫn được giữ.',
                    confirmLabel: 'Tạo lại',
                  });
                  if (ok) retryMutation.mutate();
                }}
                refreshing={retryMutation.isPending || translateMutation.isPending}
                favorite={Boolean(active.summary.isFavorite)}
                reviewing={reviewMutation.isPending}
                onReview={() => reviewMutation.mutate()}
                onToggleFavorite={() =>
                  metaMutation.mutate({
                    id: active.summary._id,
                    isFavorite: !active.summary.isFavorite,
                  })
                }
              />

              <SourcePane
                text={active.sourceText}
                url={active.paper?.url || active.summary.sourceUrl}
                title={active.paper?.title}
                translation={active.summary.translation}
                downloadUrl={summaryTranslationUrl(active.summary._id)}
                onTranslate={() => translateMutation.mutate()}
                translating={translateMutation.isPending}
                translateError={
                  translateMutation.isError ? getErrorMessage(translateMutation.error) : ''
                }
              />

              <NoteBox summaryId={active.summary._id} paperId={active.paper?._id} />
              <RelatedWorks doi={active.paper?.doi} />
            </div>

            {/* Desktop: bám theo khi cuộn bài. Mobile: thanh chat nổi phía trên bottom nav. */}
            <aside
              aria-label="Hỏi AI về bài này"
              className="max-lg:fixed max-lg:inset-x-2 max-lg:bottom-[calc(4rem+env(safe-area-inset-bottom))] max-lg:z-40 lg:sticky lg:top-20 lg:self-start"
            >
              <AskPanel
                summaryId={active.summary._id}
                initialQa={active.summary.qa || []}
                sourceChars={active.sourceText?.length || 0}
                focusSignal={chatFocusSignal}
              />
            </aside>
          </div>
          </>
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
              <span className="text-xs text-slate-500 dark:text-slate-400">PDF tối đa 20 MB · ưu tiên bài open access</span>
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
                <Field
                  label="File PDF"
                  hint="PDF có lớp text. Bản scan chưa hỗ trợ OCR. File PDF không được lưu khi chuyển trang hoặc tải lại — chọn lại file nếu cần."
                >
                  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-dashed border-line bg-paper-2/60 px-4 py-4 text-[13px] transition-colors hover:border-pine-600 dark:border-white/15 dark:bg-white/[0.03]">
                    <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Icon name="book" className="h-4 w-4" />
                      {file ? `${file.name} · ${formatNumber(file.size / 1024 / 1024, 2)} MB` : 'Chọn file PDF'}
                    </span>
                    <span className="badge badge-pine">
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
                <Field
                  label="Dán toàn văn"
                  hint="Tối thiểu 5.000 ký tự, tối đa 400.000 ký tự. Không nhận abstract."
                >
                  <textarea
                    className="input min-h-[180px]"
                    placeholder="Dán toàn văn bài báo (Methods, Results, Discussion...)"
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
                <p className="max-w-xl text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Chỉ nạp toàn văn từ nguồn hợp pháp (open access) hoặc file bạn tự tải lên. Bài
                  paywall/abstract-only sẽ bị từ chối thay vì tạo bản tóm tắt vô nghĩa.
                </p>
                <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Spinner className="h-4 w-4 text-white" /> : <Icon name="book" className="h-4 w-4" />}
                  {createMutation.isPending ? 'Đang xử lý...' : 'Tóm tắt bài này'}
                </button>
              </div>
            </form>

            {createMutation.isPending && (
              <ResearchJobProgress stage={stage} elapsed={elapsed} />
            )}
          </Card>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-[17px] font-semibold text-slate-900 dark:text-white">
                Bài đã lưu {summaries.length ? `(${summaries.length})` : ''}
              </h2>
              {listQuery.isFetching && <Spinner className="h-4 w-4" />}
            </div>

            {!summaries.length && !listQuery.isLoading && (
              <div className="panel">
                <EmptyState
                  icon="book"
                  title="Chưa có bản tóm tắt"
                  note={
                    <>
                      Thử một DOI quen thuộc như{' '}
                      <code className="rounded bg-paper-2 px-1 py-0.5 font-mono text-[11px] dark:bg-white/[0.06]">
                        10.1080/02640414.2016.1210197
                      </code>
                      .
                    </>
                  }
                />
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {summaries.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => loadSaved(item.id)}
                  className="card group flex flex-col justify-between text-left transition-colors hover:border-pine-600/60 hover:bg-paper-2/30 dark:hover:border-pine-400/50 dark:hover:bg-white/[0.02]"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      {item.evidenceAxes?.design?.reason ? (
                        <span
                          className="badge badge-pine"
                          title={`Thiết kế: ${item.evidenceAxes.design?.rating || '?'} · Độ chắc chắn: ${
                            item.evidenceAxes.certainty?.rating || '?'
                          } · Liên quan: ${item.evidenceAxes.relevance?.rating || '?'}`}
                        >
                          3 trục
                        </span>
                      ) : (
                        <span className="badge badge-neutral">
                          Mức {item.paper?.evidenceLevel || '?'}
                        </span>
                      )}
                      {item.isLegacy ? (
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                          Bản cũ
                        </span>
                      ) : null}
                      {item.status === 'processing' ? (
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">
                          Đang xử lý
                        </span>
                      ) : item.status === 'failed' ? (
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-rose-500">
                          Lỗi
                        </span>
                      ) : item.needsReview ? (
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-rose-500">
                          Cần đối chiếu
                        </span>
                      ) : null}
                      {item.basedOn === 'abstract_only' && (
                        <span
                          className="font-mono text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400"
                          title="Bản cũ chỉ dựa trên abstract; chính sách mới không tạo mới từ abstract"
                        >
                          Chỉ abstract
                        </span>
                      )}
                      {loadingId === item.id && <Spinner className="h-4 w-4" />}
                    </div>
                    <p className="mt-2.5 line-clamp-2 font-display text-[16px] font-semibold leading-snug text-slate-900 group-hover:text-pine-700 dark:text-slate-100 dark:group-hover:text-pine-300">
                      {item.paper?.title || 'Không rõ tiêu đề'}
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {item.paper?.journal || 'Không rõ tạp chí'}
                      {item.paper?.year ? ` · ${item.paper.year}` : ''}
                      {item.createdAt ? ` · lưu ${formatDateKey(String(item.createdAt).slice(0, 10))}` : ''}
                    </p>
                  </div>
                  {(item.tldr || item.status === 'processing') && (
                    <p className="mt-2.5 line-clamp-3 border-t border-line/70 pt-2.5 text-xs leading-relaxed text-slate-500 dark:border-white/[0.06] dark:text-slate-400">
                      {item.status === 'processing'
                        ? item.progress || 'Đang xử lý...'
                        : item.tldr}
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

