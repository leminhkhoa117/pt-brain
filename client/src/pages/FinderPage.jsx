import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import clsx from 'clsx';
import { Alert, Card, Field, Icon, PageHeader, Spinner } from '../components/ui.jsx';
import { useDialog } from '../components/DialogProvider.jsx';
import { createPaper } from '../api/summaries.js';
import { getErrorMessage } from '../api/client.js';
import ResearchJobProgress from '../components/research/ResearchJobProgress.jsx';
import ResearchTopics from '../components/research/ResearchTopics.jsx';
import { formatNumber, formatDoi, htmlToPlainText } from '../lib/format.js';
import { useAuth } from '../hooks/useAuth.jsx';
import { useFlushOnPageHide } from '../hooks/useFlushOnPageHide.js';
import {
  clearPendingSearch,
  clearSearchHistory,
  loadFinderDraft,
  loadLastSearch,
  loadPendingSearch,
  loadSearchHistory,
  removeSearchHistory,
  saveFinderDraft,
  saveLastSearch,
} from '../lib/finderHistory.js';
import { getFinderSnapshot, startFinderSearch, subscribeFinderStore } from '../lib/finderStore.js';

const LEVEL_STYLES = {
  1: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  2: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  3: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  4: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  5: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const STAGES = [
  'AI đang dịch câu hỏi sang truy vấn học thuật',
  'Đang tìm bài open access trên PubMed, Europe PMC, OpenAlex và Crossref',
  'Đang xác minh toàn văn và xếp hạng bằng code',
];

const QUERY_EXAMPLES = [
  {
    label: 'Kỹ thuật thở khi tập kháng lực',
    query:
      '("breathing technique" OR "breathing pattern") AND ("resistance training" OR "strength training")',
  },
  {
    label: 'Valsalva khi squat/deadlift',
    query: '("Valsalva maneuver" OR Valsalva) AND (squat OR deadlift OR "resistance exercise")',
  },
  {
    label: 'Luyện cơ hô hấp',
    query:
      '("respiratory muscle training" OR "inspiratory muscle training") AND (performance OR athletes)',
  },
];

const buildFilters = (filters) => {
  const result = {};
  if (filters.yearFrom) result.yearFrom = Number(filters.yearFrom);
  if (filters.yearTo) result.yearTo = Number(filters.yearTo);
  if (filters.maxLevel) result.maxLevel = Number(filters.maxLevel);
  // OA + toàn văn do server ép; client không gửi cờ để tránh vô hiệu hoá chính sách.
  return result;
};

const paperKey = (r) => r.doi || r.pmid || r.title;

const EMPTY_FILTERS = {
  yearFrom: '',
  yearTo: '',
  maxLevel: '',
};

const toFormFilters = (filters = {}) => ({
  yearFrom: filters.yearFrom ? String(filters.yearFrom) : '',
  yearTo: filters.yearTo ? String(filters.yearTo) : '',
  maxLevel: filters.maxLevel ? String(filters.maxLevel) : '',
});

const formatSavedAt = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

function LandscapeList({ title, items, empty }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {title}
      </h4>
      {items?.length ? (
        <ul className="mt-1.5 space-y-1.5">
          {items.map((item, index) => (
            <li key={`${item.doi || item.title}-${index}`} className="text-xs leading-relaxed">
              {item.doi ? (
                <a
                  href={`https://doi.org/${item.doi}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-slate-800 hover:text-brand-700 dark:text-slate-100 dark:hover:text-brand-300"
                >
                  {item.title}
                </a>
              ) : (
                <span className="font-medium text-slate-800 dark:text-slate-100">{item.title}</span>
              )}
              <span className="text-slate-500 dark:text-slate-400">
                {item.year ? ` · ${item.year}` : ''}
                {item.citationCount ? ` · ${formatNumber(item.citationCount, 0)} trích dẫn` : ''}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{empty}</p>
      )}
    </div>
  );
}

function LandscapeCard({ landscape }) {
  if (!landscape) return null;
  const { seminal = [], recent = [], venues = [], authors = [] } = landscape;
  if (!seminal.length && !recent.length && !venues.length && !authors.length) return null;
  return (
    <Card className="mt-4">
      <div className="flex items-center gap-2">
        <Icon name="book" className="h-4 w-4 text-brand-600 dark:text-brand-400" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Bức tranh nghiên cứu
        </h3>
      </div>
      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
        Tổng hợp bằng code từ danh sách kết quả, không dùng AI và không thêm bài ngoài danh sách.
      </p>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <LandscapeList title="Bài nền tảng" items={seminal} empty="Chưa có bài cũ nổi bật." />
        <LandscapeList title="Mới nhất" items={recent} empty="Chưa có bài trong 3 năm gần đây." />
      </div>
      {(venues.length > 0 || authors.length > 0) && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Tạp chí
            </h4>
            <ul className="mt-1.5 space-y-1 text-xs text-slate-600 dark:text-slate-300">
              {venues.map((item) => (
                <li key={item.venue} className="flex justify-between gap-2">
                  <span className="truncate">{item.venue}</span>
                  <span className="shrink-0 text-slate-400">{item.count}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Tác giả
            </h4>
            <ul className="mt-1.5 space-y-1 text-xs text-slate-600 dark:text-slate-300">
              {authors.map((item) => (
                <li key={item.author} className="flex justify-between gap-2">
                  <span className="truncate">{item.author}</span>
                  <span className="shrink-0 text-slate-400">{item.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function FinderPage() {
  const dialog = useDialog();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?._id || 'anon';
  const [question, setQuestion] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [data, setData] = useState(null);
  const [draftQueries, setDraftQueries] = useState([]);
  const [newQuery, setNewQuery] = useState('');
  const [error, setError] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [saved, setSaved] = useState({});
  const [expanded, setExpanded] = useState({});
  const [history, setHistory] = useState([]);
  const [recovery, setRecovery] = useState(null);
  const draftReady = useRef(false);
  const draftDirty = useRef(false);
  const draftValues = useRef({ question, filters });
  const draftUserId = useRef(userId);
  draftValues.current = { question, filters };

  // Nếu user đổi mà component còn mounted, không mang nháp của user cũ ghi
  // sang key mới. Trường hợp logout bình thường thì unmount flush đã chạy.
  if (draftUserId.current !== userId) {
    draftUserId.current = userId;
    draftDirty.current = false;
  }

  // Request nằm ở store module-level nên vẫn chạy khi FinderPage unmount.
  const search = useSyncExternalStore(subscribeFinderStore, getFinderSnapshot);
  const searchIsMine = !search.userId || search.userId === userId;
  const searchPending = search.status === 'pending' && searchIsMine;
  const lastStoreVersion = useRef(search.version);

  useEffect(() => {
    draftReady.current = false;
    const pending = loadPendingSearch(userId);
    const draft = loadFinderDraft(userId);
    const last = loadLastSearch(userId);
    const storeIsOurs = !search.userId || search.userId === userId;

    if (search.status === 'pending' && storeIsOurs) {
      // Rời trang rồi quay lại khi request vẫn đang chạy.
      setQuestion(search.payload?.question || draft?.question || '');
      setFilters(toFormFilters(search.payload?.filters || draft?.filters));
      setData(last?.data || null);
      setDraftQueries(last?.queries || last?.data?.queries || []);
      setSaved(last?.saved || {});
      setRecovery(null);
    } else if (pending) {
      // Trình duyệt đã reload giữa lúc tìm: request cũ không thể tiếp tục.
      setQuestion(pending.question || draft?.question || '');
      setFilters(toFormFilters(pending.filters || draft?.filters));
      setData(last?.data || null);
      setDraftQueries(pending.queries || last?.queries || []);
      setSaved(last?.saved || {});
      setRecovery(pending);
    } else {
      setQuestion(draft?.question || last?.question || '');
      setFilters(toFormFilters(draft?.filters || last?.filters));
      setData(last?.data || null);
      setDraftQueries(last?.queries || last?.data?.queries || []);
      setSaved(last?.saved || {});
      setRecovery(null);
    }
    setHistory(loadSearchHistory(userId));
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (search.version <= lastStoreVersion.current) return;
    lastStoreVersion.current = search.version;
    if (search.userId && search.userId !== userId) {
      setHistory(loadSearchHistory(userId));
      return;
    }
    if (search.status === 'success' && search.data) {
      setData(search.data);
      setDraftQueries(search.data.queries || []);
      setSaved({});
      setError(null);
      setRecovery(null);
      setHistory(loadSearchHistory(userId));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (search.status === 'error') {
      setError(search.error);
      setRecovery(null);
    } else if (search.status === 'pending') {
      setError(null);
      setRecovery(null);
    }
  }, [search, userId]);

  // Lưu nháp câu hỏi + bộ lọc khi người dùng gõ/chỉnh, kể cả chưa bấm tìm.
  useEffect(() => {
    if (!draftReady.current) {
      draftReady.current = true;
      return undefined;
    }
    draftDirty.current = true;
    const timer = setTimeout(() => {
      draftDirty.current = false;
      saveFinderDraft(userId, { ...draftValues.current, updatedAt: Date.now() });
    }, 250);
    return () => clearTimeout(timer);
  }, [question, filters, userId]);

  // Chuyển route hoặc reload/đóng tab ngay sau khi gõ: flush phần debounce
  // còn nợ. pagehide + visibilitychange xử lý cả trường hợp hard reload.
  const flushDraft = () => {
    if (!draftDirty.current) return;
    draftDirty.current = false;
    saveFinderDraft(draftUserId.current, { ...draftValues.current, updatedAt: Date.now() });
  };
  useFlushOnPageHide(flushDraft);
  useEffect(() => () => flushDraft(), []);

  const savePaper = useMutation({
    mutationFn: (paper) => createPaper(paper),
    onSuccess: (_result, paper) => {
      setSaved((prev) => ({ ...prev, [paperKey(paper)]: true }));
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  useEffect(() => {
    if (!searchPending) {
      setElapsed(0);
      return undefined;
    }
    const startedAt = search.startedAt || Date.now();
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [searchPending, search.startedAt]);

  const submit = (e) => {
    e.preventDefault();
    setError(null);
    if (searchPending) return;
    if (question.trim().length < 5) {
      setError('Nhập câu hỏi cụ thể hơn (tối thiểu 5 ký tự).');
      return;
    }
    startFinderSearch({ question: question.trim(), filters: buildFilters(filters) }, userId);
  };

  const queriesMatchData =
    Array.isArray(data?.queries) &&
    data.queries.length === draftQueries.length &&
    data.queries.every((query, index) => query === draftQueries[index]);
  const currentConcepts = queriesMatchData ? data?.concepts || [] : [];

  const rerun = () => {
    if (!draftQueries.length || searchPending) return;
    setError(null);
    const payload = {
      question: question.trim(),
      queries: draftQueries.filter(Boolean).slice(0, 4),
      filters: buildFilters(filters),
    };
    if (currentConcepts.length) payload.concepts = currentConcepts;
    startFinderSearch(payload, userId);
  };

  const rerunWithoutFilters = () => {
    if (searchPending) return;
    setError(null);
    setFilters(EMPTY_FILTERS);
    const payload = { question: question.trim(), filters: {} };
    const usable = draftQueries.filter(Boolean).slice(0, 4);
    if (usable.length) payload.queries = usable;
    if (usable.length && currentConcepts.length) payload.concepts = currentConcepts;
    startFinderSearch(payload, userId);
  };

  const regenerateQueries = () => {
    if (searchPending || question.trim().length < 5) return;
    setError(null);
    startFinderSearch({ question: question.trim(), filters: buildFilters(filters) }, userId);
  };

  const applyTopic = (topic) => {
    if (searchPending || !topic) return;
    setError(null);
    setFilters(EMPTY_FILTERS);
    setQuestion(topic.exampleQuestion);
    setDraftQueries(topic.queries.slice(0, 4));
    startFinderSearch(
      {
        question: topic.exampleQuestion,
        queries: topic.queries.slice(0, 4),
        concepts: topic.concepts,
        filters: {},
      },
      userId,
    );
  };

  const addExampleQuery = (query) => {
    setDraftQueries((prev) => {
      if (prev.includes(query) || prev.length >= 4) return prev;
      return [...prev, query];
    });
  };

  const resumeSearch = () => {
    if (!recovery || searchPending) return;
    setError(null);
    const payload = {
      question: recovery.question || question.trim(),
      queries: (recovery.queries || []).filter(Boolean).slice(0, 4),
      filters: recovery.filters || buildFilters(filters),
    };
    if (Array.isArray(recovery.concepts) && recovery.concepts.length) {
      payload.concepts = recovery.concepts;
    }
    startFinderSearch(payload, userId);
  };

  const dismissRecovery = () => {
    clearPendingSearch(userId);
    setRecovery(null);
  };

  const openReader = (paper) => {
    if (paper.doi) {
      navigate(`/research?doi=${encodeURIComponent(paper.doi)}&auto=1&from=finder`);
      return;
    }
    if (paper.pmcid) {
      navigate(
        `/research?url=${encodeURIComponent(`https://www.ncbi.nlm.nih.gov/pmc/articles/${paper.pmcid}/`)}&auto=1&from=finder`,
      );
      return;
    }
    if (paper.url) {
      navigate(`/research?url=${encodeURIComponent(paper.url)}&auto=1&from=finder`);
      return;
    }
    if (paper.fullTextUrl) {
      navigate(`/research?url=${encodeURIComponent(paper.fullTextUrl)}&auto=1&from=finder`);
      return;
    }
    if (paper.pdfUrl) {
      navigate(`/research?url=${encodeURIComponent(paper.pdfUrl)}&auto=1&from=finder`);
    }
  };

  const restoreSearch = (entry) => {
    if (!entry || searchPending) return;
    setError(null);
    setQuestion(entry.question || '');
    setFilters(toFormFilters(entry.filters));
    setDraftQueries(entry.queries || entry.data?.queries || []);
    if (entry.data) {
      setData(entry.data);
      setSaved(entry.saved || {});
      saveLastSearch(userId, entry);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    startFinderSearch(
      {
        question: entry.question,
        queries: (entry.queries || []).slice(0, 4),
        concepts: entry.concepts || entry.data?.concepts || [],
        filters: entry.filters || {},
      },
      userId,
    );
  };

  const stage = STAGES[Math.min(STAGES.length - 1, Math.floor(elapsed / 8))];
  const results = data?.results || [];

  return (
    <div>
      <PageHeader
        title="Tìm nghiên cứu"
        subtitle="Chỉ trả bài open access đã xác minh và có toàn văn đọc được. Bài paywall hoặc chỉ có abstract bị loại; không tóm tắt từ abstract."
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

      {recovery && !searchPending && (
        <Alert tone="warning" title="Lần tìm trước bị gián đoạn" className="mb-4">
          <p>
            Trình duyệt đã tải lại khi đang tìm nên kết quả dở dang không còn. Câu hỏi và bộ lọc đã
            được khôi phục sẵn. Bấm “Tiếp tục tìm” để chạy lại — thao tác này tốn 1 lượt tìm AI.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-primary !px-3 !py-1.5 text-xs"
              onClick={resumeSearch}
            >
              <Icon name="search" className="h-3.5 w-3.5" />
              Tiếp tục tìm
            </button>
            <button
              type="button"
              className="btn-ghost !px-3 !py-1.5 text-xs"
              onClick={dismissRecovery}
            >
              Bỏ qua
            </button>
          </div>
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
              disabled={searchPending}
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
                disabled={searchPending}
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
                disabled={searchPending}
              />
            </Field>
            <Field label="Mức bằng chứng">
              <select
                className="select"
                value={filters.maxLevel}
                onChange={(e) => setFilters((f) => ({ ...f, maxLevel: e.target.value }))}
                disabled={searchPending}
              >
                <option value="">Tất cả mức</option>
                <option value="1">Chỉ mức 1 (mạnh nhất)</option>
                <option value="2">Mức 1-2</option>
                <option value="3">Mức 1-3</option>
                <option value="4">Mức 1-4</option>
              </select>
            </Field>
            <div className="flex flex-col justify-end gap-1 pb-1">
              <span className="badge bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                OA + toàn văn bắt buộc
              </span>
              <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                Server tự xác minh; không có tuỳ chọn tắt.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kết quả chỉ gồm bài open access đã xác minh, có PMC XML hoặc PDF trực tiếp. Bài chỉ có
              abstract hoặc landing page chưa chắc toàn văn sẽ bị loại. Không có bài do AI tự sinh.
            </p>
            <button type="submit" className="btn-primary" disabled={searchPending}>
              {searchPending ? (
                <Spinner className="h-4 w-4 text-white" />
              ) : (
                <Icon name="search" className="h-4 w-4" />
              )}
              {searchPending ? 'Đang tìm...' : 'Tìm bài OA'}
            </button>
          </div>
        </form>

        {searchPending && (
          <ResearchJobProgress
            stage={stage}
            elapsed={elapsed}
            note="Thường 1–2 phút tùy số truy vấn và nguồn. Bạn có thể rời tab, job vẫn chạy nền."
            progressBase={10}
            progressRate={4}
          />
        )}
      </Card>

      <ResearchTopics onSelect={applyTopic} disabled={searchPending} />

      {history.length > 0 && (
        <Card className="mt-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Lịch sử tìm kiếm
              </h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Bấm để mở lại kết quả đã lưu trên trình duyệt này. Nếu kết quả không còn được lưu,
                hệ thống sẽ tìm lại từ đầu.
              </p>
            </div>
            <button
              type="button"
              className="btn-ghost !px-2.5 !py-1.5 text-xs text-slate-500 hover:text-rose-500 dark:text-slate-400"
              onClick={async () => {
                const ok = await dialog.confirm({
                  title: 'Xóa lịch sử tìm kiếm',
                  message: 'Xóa toàn bộ lịch sử tìm kiếm trên thiết bị này?',
                  confirmLabel: 'Xóa lịch sử',
                });
                if (ok) {
                  clearSearchHistory(userId);
                  setHistory([]);
                }
              }}
            >
              Xóa lịch sử
            </button>
          </div>
          <div className="mt-2 space-y-1.5">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-800"
              >
                <button
                  type="button"
                  onClick={() => restoreSearch(entry)}
                  disabled={searchPending}
                  className="min-w-0 flex-1 text-left disabled:opacity-60"
                >
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                    {entry.question}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                    {formatSavedAt(entry.savedAt)}
                    {(entry.resultCount ?? entry.data?.results?.length)
                      ? ` · ${entry.resultCount ?? entry.data.results.length} bài`
                      : ''}
                    {entry.data ? '' : ' · cần tìm lại'}
                  </p>
                </button>
                <span
                  className={clsx(
                    'badge shrink-0',
                    entry.data
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                  )}
                >
                  {entry.data ? 'Mở lại' : 'Tìm lại'}
                </span>
                <button
                  type="button"
                  className="btn-ghost !px-1.5 !py-1 text-slate-400 hover:text-rose-500"
                  onClick={() => setHistory(removeSearchHistory(userId, entry.id))}
                  aria-label="Xóa lịch sử này"
                >
                  <Icon name="close" className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {data && (
        <div className="mt-4">
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Truy vấn tiếng Anh
                </h3>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {draftQueries.length
                    ? 'Sửa hoặc thêm truy vấn cụ thể hơn rồi bấm “Tìm lại”. Tối đa 4 truy vấn.'
                    : 'Chưa có truy vấn. Thêm truy vấn tiếng Anh hoặc bấm “Tạo lại truy vấn”.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-ghost !px-2.5 !py-1.5 text-xs"
                  onClick={() => setDraftQueries([])}
                  disabled={searchPending || !draftQueries.length}
                >
                  Xóa hết
                </button>
                <button
                  type="button"
                  className="btn-ghost !px-2.5 !py-1.5 text-xs"
                  onClick={regenerateQueries}
                  disabled={searchPending || question.trim().length < 5}
                >
                  Tạo lại truy vấn
                </button>
                <button
                  type="button"
                  className="btn-secondary !px-2.5 !py-1.5 text-xs"
                  onClick={rerun}
                  disabled={searchPending || !draftQueries.length}
                >
                  Tìm lại với truy vấn này
                </button>
              </div>
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
                    className="text-slate-500 dark:text-slate-400 hover:text-rose-500"
                    aria-label="Xóa truy vấn"
                  >
                    <Icon name="close" className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            {Array.isArray(data.concepts) && data.concepts.length > 0 && (
              <div className="mt-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Khái niệm chính
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {data.concepts.map((concept, index) => (
                    <span
                      key={`${concept.label}-${index}`}
                      className="badge bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                      title={(concept.terms || []).join(', ')}
                    >
                      {concept.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

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

            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              Mẹo: bọc cụm từ trong ngoặc kép, dùng <code>OR</code> cho từ đồng nghĩa và{' '}
              <code>AND</code> để giao nhau.
            </p>
            <details className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              <summary className="cursor-pointer font-semibold text-slate-600 dark:text-slate-300">
                Công thức & ví dụ
              </summary>
              <div className="mt-1 space-y-1">
                <p>
                  <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
                    (&quot;từ đồng nghĩa A&quot; OR &quot;từ đồng nghĩa B&quot;) AND (&quot;từ đồng
                    nghĩa C&quot; OR &quot;từ đồng nghĩa D&quot;)
                  </code>
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {QUERY_EXAMPLES.map((example) => (
                    <button
                      key={example.label}
                      type="button"
                      className="rounded-full border border-slate-200 px-2 py-0.5 text-left hover:border-brand-300 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:border-brand-700 dark:hover:text-brand-300"
                      onClick={() => addExampleQuery(example.query)}
                      disabled={draftQueries.includes(example.query) || draftQueries.length >= 4}
                      title={example.query}
                    >
                      + {example.label}
                    </button>
                  ))}
                </div>
              </div>
            </details>

            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              Đã quét {data.scanned} kết quả thô · gộp còn {data.total} bài đủ điều kiện · hiển thị{' '}
              {results.length} bài tốt nhất.
              {data.dropped
                ? ` · loại ${data.dropped.notOa + data.dropped.noFullText} bài không OA/không có toàn văn`
                : ''}
              {data.probe ? ` · kiểm tra ${data.probe.checked} URL` : ''}
              {data.expanded ? ' · đã tự mở rộng truy vấn' : ''}
            </p>
          </Card>

          <LandscapeCard landscape={data.landscape} />

          {!results.length && (
            <Card className="mt-4 border-amber-200 bg-amber-50/60 dark:border-amber-900/60 dark:bg-amber-950/20">
              <div className="flex items-start gap-2">
                <Icon
                  name="info"
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
                />
                <div>
                  <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                    Không có bài OA + toàn văn phù hợp
                  </h3>
                  <p className="mt-1 text-xs text-amber-800/90 dark:text-amber-200/80">
                    Hệ thống không hạ chuẩn xuống bài paywall hoặc chỉ có abstract. Thử mở rộng năm,
                    mức bằng chứng hoặc đổi từ khoá:
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn-secondary !px-3 !py-1.5 text-xs"
                      onClick={rerunWithoutFilters}
                      disabled={searchPending}
                    >
                      Bỏ lọc năm/mức &amp; tìm lại
                    </button>
                    <button
                      type="button"
                      className="btn-ghost !px-3 !py-1.5 text-xs"
                      onClick={rerun}
                      disabled={searchPending || !draftQueries.length}
                    >
                      Thử lại
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] text-amber-800/70 dark:text-amber-200/60">
                    Nếu bài bạn cần không có bản OA, hãy mở DOI/nhà xuất bản, nhờ tác giả gửi bản,
                    dùng thư viện, hoặc tải PDF bạn có quyền truy cập. Không dùng Sci-Hub.
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="mt-4 space-y-3">
            {results.map((item) => {
              const key = paperKey(item);
              const isSaved = saved[key];
              const isExpanded = expanded[key];
              const abstractText = htmlToPlainText(item.abstract);
              return (
                <Card
                  key={key}
                  className="transition hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="flex gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-sm font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {item.id}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={clsx(
                            'badge',
                            LEVEL_STYLES[item.evidenceLevel] || LEVEL_STYLES[5],
                          )}
                        >
                          Mức {item.evidenceLevel}/5
                        </span>
                        {item.isRetracted && (
                          <span className="badge bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                            Đã bị rút
                          </span>
                        )}
                        {item.isOpenAccess && (
                          <span
                            className="badge bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            title={
                              item.oaStatus === 'bronze'
                                ? 'Free to read: đọc được trên trang nhà xuất bản nhưng không có giấy phép mở'
                                : 'Open access đã xác minh'
                            }
                          >
                            {item.oaStatus === 'bronze'
                              ? 'Free to read'
                              : `OA${item.oaStatus ? ` · ${item.oaStatus}` : ''}`}
                          </span>
                        )}
                        <span
                          className={clsx(
                            'badge',
                            item.hasFullText
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : item.hasFullTextLink
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                          )}
                        >
                          {item.fullTextLabel ||
                            (item.hasFullText
                              ? item.fullTextSource === 'pmc_xml'
                                ? 'Toàn văn PMC'
                                : 'Có PDF'
                              : item.hasFullTextLink
                                ? 'Có link toàn văn'
                                : 'Chỉ abstract')}
                        </span>
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
                        {item.doi ? ` · DOI ${formatDoi(item.doi)}` : ''}
                        {item.providers?.length ? ` · ${item.providers.join(' + ')}` : ''}
                      </p>

                      {abstractText && (
                        <div className="mt-2">
                          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                            Abstract gốc — chỉ để sàng lọc, không phải bản tóm tắt AI
                          </p>
                          <p
                            className={clsx(
                              'mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400',
                              !isExpanded && 'line-clamp-2',
                            )}
                          >
                            {abstractText}
                          </p>
                          <button
                            type="button"
                            className="mt-1 text-[11px] font-semibold text-brand-600 hover:underline dark:text-brand-400"
                            onClick={() => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))}
                          >
                            {isExpanded ? 'Thu gọn abstract gốc' : 'Xem abstract gốc'}
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
                          Đọc toàn văn &amp; tóm tắt
                        </button>
                        {item.pdfUrl && (
                          <a
                            href={item.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-secondary !px-3 !py-1.5 text-xs"
                          >
                            PDF
                            <Icon name="external" className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {item.pmcid && (
                          <a
                            href={`https://www.ncbi.nlm.nih.gov/pmc/articles/${item.pmcid}/`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-ghost !px-2.5 !py-1.5 text-xs"
                          >
                            PMC
                            <Icon name="external" className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {item.fullTextSource === 'oa_html' && item.fullTextUrl && (
                          <a
                            href={item.fullTextUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-ghost !px-2.5 !py-1.5 text-xs"
                          >
                            HTML
                            <Icon name="external" className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          className={clsx(
                            'btn-secondary !px-3 !py-1.5 text-xs',
                            isSaved && 'text-emerald-600',
                          )}
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
                              abstract: abstractText.slice(0, 50000),
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
