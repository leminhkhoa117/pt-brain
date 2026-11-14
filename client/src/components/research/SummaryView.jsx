import { useState } from 'react';
import clsx from 'clsx';
import { Alert, Card, Icon } from '../ui.jsx';
import MarkdownText from '../MarkdownText.jsx';
import {
  summaryExportUrl,
  summaryPdfUrl,
  summarySourcePdfUrl,
} from '../../api/summaries.js';
import { formatNumber, formatDoi } from '../../lib/format.js';
import FigureViewer from './FigureViewer.jsx';
import GlossaryText from './GlossaryText.jsx';

const LABEL_STYLES = {
  data: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  author: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  ai: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
};

const LABEL_TEXT = {
  data: 'Dữ kiện',
  author: 'Tác giả diễn giải',
  ai: 'Nhận xét của AI',
};

const AXIS_TEXT = {
  design: 'Thiết kế',
  certainty: 'Độ chắc chắn',
  relevance: 'Liên quan tới PT',
};

const RATING_STYLES = {
  cao: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  'vừa': 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  'thấp': 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
};

const APPLICATION_GROUPS = [
  {
    key: 'supported',
    title: 'Có cơ sở',
    note: 'Dữ kiện trực tiếp của bài',
    tone: 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/60 dark:bg-emerald-950/20',
    heading: 'text-emerald-800 dark:text-emerald-300',
  },
  {
    key: 'hypothesis',
    title: 'Chỉ là giả thuyết',
    note: 'Tác giả nêu nhưng chưa được đo',
    tone: 'border-amber-200 bg-amber-50/60 dark:border-amber-900/60 dark:bg-amber-950/20',
    heading: 'text-amber-800 dark:text-amber-300',
  },
  {
    key: 'notYet',
    title: 'Chưa nên áp dụng',
    note: 'AI nhận thấy chưa đủ chắc',
    tone: 'border-rose-200 bg-rose-50/60 dark:border-rose-900/60 dark:bg-rose-950/20',
    heading: 'text-rose-800 dark:text-rose-300',
  },
  {
    key: 'unanswered',
    title: 'Bài không trả lời',
    note: 'Câu hỏi còn mở',
    tone: 'border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/40',
    heading: 'text-slate-700 dark:text-slate-300',
  },
];

function splitLabel(value = '') {
  const match = String(value || '').match(
    /^\s*\[(Dữ kiện|Tác giả diễn giải|Nhận xét của AI)\]\s*/i,
  );
  if (!match) return { type: '', text: String(value || '') };
  const map = {
    'dữ kiện': 'data',
    'tác giả diễn giải': 'author',
    'nhận xét của ai': 'ai',
  };
  return { type: map[match[1].toLowerCase()] || '', text: String(value).slice(match[0].length) };
}

function Label({ type }) {
  if (!type || !LABEL_TEXT[type]) return null;
  return (
    <span className={clsx('badge shrink-0 !px-1.5 !py-0.5 !text-[9px]', LABEL_STYLES[type])}>
      {LABEL_TEXT[type]}
    </span>
  );
}

function LabeledText({ text, type, glossary = [], className = '' }) {
  const parsed = splitLabel(text);
  const labelType = parsed.type || type;
  return (
    <span className={clsx('inline-flex flex-wrap items-baseline gap-1.5', className)}>
      <Label type={labelType} />
      <GlossaryText text={parsed.text} glossary={glossary} className="min-w-0" />
    </span>
  );
}

function Info({ label, children, glossary = [] }) {
  if (!children) return null;
  return (
    <div className="p-3.5">
      <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-wrap text-[13.5px] leading-relaxed text-slate-800 dark:text-slate-200">
        {typeof children === 'string' ? (
          <GlossaryText text={children} glossary={glossary} />
        ) : (
          children
        )}
      </p>
    </div>
  );
}

function Section({ title, step, children, hint }) {
  if (!children) return null;
  return (
    <section className="mt-6 border-t border-line pt-5 dark:border-white/[0.08]">
      <div className="flex items-center gap-2.5">
        {step ? (
          <span className="rounded bg-pine-50 px-1.5 py-0.5 font-mono text-[10.5px] font-semibold tabular-nums text-pine-700 dark:bg-pine-950/60 dark:text-pine-300">
            {String(step).padStart(2, '0')}
          </span>
        ) : null}
        <h3 className="font-display text-[17.5px] font-semibold tracking-[-0.01em] text-slate-900 dark:text-slate-100">
          {title}
        </h3>
      </div>
      {hint ? <p className="mt-1 text-[11.5px] text-slate-500 dark:text-slate-400">{hint}</p> : null}
      <div className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{children}</div>
    </section>
  );
}

function ReadingLegend({ hasCi }) {
  return (
    <details className="mt-3 rounded-md border border-line bg-paper-2/50 px-3.5 py-2.5 dark:border-white/[0.08] dark:bg-white/[0.02]">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
        <Icon name="info" className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
        Cách đọc số liệu và nhãn
      </summary>
      <div className="mt-2 grid gap-2 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 sm:grid-cols-2">
        <p>
          <strong className="text-slate-800 dark:text-slate-100">p &lt; 0.05:</strong> thường được xem là
          có ý nghĩa thống kê; p càng nhỏ càng ít khả năng kết quả chỉ do ngẫu nhiên.
        </p>
        <p>
          <strong className="text-slate-800 dark:text-slate-100">Effect size (d):</strong> độ lớn ảnh
          hưởng. Quy ước tham khảo: khoảng 0.2 = nhỏ, 0.5 = vừa, 0.8 = lớn.
        </p>
        {hasCi ? (
          <p>
            <strong className="text-slate-800 dark:text-slate-100">KTC 95%:</strong> khoảng giá trị thật
            của kết quả. Nếu khoảng không chứa 0, kết quả thường có ý nghĩa thống kê.
          </p>
        ) : null}
        <p className={hasCi ? '' : 'sm:col-span-2'}>
          <strong className="text-slate-800 dark:text-slate-100">Nhãn:</strong> mỗi ý được ghi rõ là dữ
          kiện bài đo, tác giả diễn giải, hay nhận xét thêm của AI.
        </p>
        <p className="sm:col-span-2 text-slate-500 dark:text-slate-400">
          Đây là quy ước tham khảo, không phải ngưỡng tuyệt đối. Luôn đọc cùng thiết kế nghiên cứu.
        </p>
      </div>
    </details>
  );
}

function EvidenceAxes({ axes, fallbackLevel }) {
  const entries = ['design', 'certainty', 'relevance'].filter((key) => axes?.[key]?.reason);
  if (!entries.length) {
    return fallbackLevel ? (
      <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        Mức bằng chứng {fallbackLevel}/5
      </span>
    ) : null;
  }
  return (
    <div className="mt-4 grid overflow-hidden rounded-md border border-line bg-paper-2/40 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:border-white/[0.08] dark:bg-white/[0.02] dark:divide-white/[0.07]">
      {entries.map((key) => {
        const axis = axes[key];
        return (
          <div key={key} className="p-3.5">
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                {AXIS_TEXT[key]}
              </p>
              <span className={clsx('badge !px-1.5 !py-0.5 !text-[10px]', RATING_STYLES[axis.rating])}>
                {axis.rating}
              </span>
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-slate-600 dark:text-slate-300">
              {axis.reason}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function MechanismDiagram() {
  const steps = [
    { label: 'Tay cầm / thanh', detail: 'người tập kéo' },
    { label: 'Dây đàn hồi', detail: 'giãn trước' },
    { label: 'Cáp máy', detail: 'truyền lực' },
    { label: 'Tạ', detail: 'nhấc sau' },
  ];
  return (
    <div className="mt-3 rounded-md border border-dashed border-brand-300 bg-brand-50/45 p-3 dark:border-brand-800 dark:bg-brand-950/20">
      <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-brand-700 dark:text-brand-300">
        Sơ đồ minh hoạ — dây mắc nối tiếp
      </p>
      <div className="mt-2 grid grid-cols-2 items-stretch gap-2 sm:grid-cols-4">
        {steps.map((step, index) => (
          <div key={step.label} className="relative rounded border border-line bg-surface px-2.5 py-2 text-center dark:border-white/[0.08] dark:bg-slate-900">
            <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-100">{step.label}</p>
            <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">{step.detail}</p>
            {index < steps.length - 1 ? (
              <span className="absolute -right-1.5 top-1/2 hidden -translate-y-1/2 text-brand-500 sm:block">
                →
              </span>
            ) : null}
          </div>
        ))}
      </div>
      <p className="mt-2 text-[10px] italic text-slate-500 dark:text-slate-400">
        Không theo tỉ lệ. Mũi tên là chiều truyền lực khi kéo, không phải chiều tạ chạy.
      </p>
    </div>
  );
}

function ResultCard({ item, index, glossary }) {
  const certainty = item.certainty || { rating: 'vừa', reason: '' };
  return (
    <article className="rounded-md border border-line bg-paper-2/30 p-3.5 dark:border-white/[0.08] dark:bg-white/[0.02]">
      <div className="flex gap-3">
        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded bg-pine-100 font-mono text-[11px] font-semibold text-pine-700 dark:bg-pine-950 dark:text-pine-300">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold leading-snug text-slate-900 dark:text-slate-100">
            <LabeledText text={item.finding} type={item.claimType} glossary={glossary} />
          </p>
          {item.plainMeaning && (
            <div className="mt-2 rounded border border-line/70 bg-surface px-3 py-2 dark:border-white/[0.06] dark:bg-white/[0.025]">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                Nghĩa là gì trong phòng tập
              </p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-slate-700 dark:text-slate-200">
                <LabeledText text={item.plainMeaning} type={item.claimType} glossary={glossary} />
              </p>
            </div>
          )}
          <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
              Số liệu gốc
            </span>
            <span className="font-mono text-[11.5px] leading-relaxed text-amber-800 dark:text-amber-300">
              {item.numbers}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-start gap-2">
            <span className={clsx('badge !px-1.5 !py-0.5 !text-[10px]', RATING_STYLES[certainty.rating])}>
              Mức chắc chắn: {certainty.rating}
            </span>
            {certainty.reason ? (
              <span className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                {certainty.reason}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function ApplicationItem({ text, glossary }) {
  const parsed = splitLabel(text);
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1 text-[10px] text-slate-400">▸</span>
      <span className="min-w-0">
        <LabeledText text={parsed.text} type={parsed.type || 'ai'} glossary={glossary} />
      </span>
    </li>
  );
}

export default function SummaryView({
  summary,
  paper,
  onDelete,
  deleting,
  onSaveTerm,
  savedTerms,
  savingTerm,
  onApply,
  onAsk,
  onRefresh,
  refreshing,
  favorite,
  onToggleFavorite,
  onReview,
  reviewing,
}) {
  const c = summary.content || {};
  const meta = c.metadata || {};
  const authors = meta.authors?.length ? meta.authors : paper?.authors || [];
  const abstractOnly = c.confidence?.basedOn === 'abstract_only' || summary.basedOn === 'abstract_only';
  const figures = Array.isArray(c.figures) ? c.figures : [];
  const glossary = Array.isArray(c.glossary) ? c.glossary : [];
  const canViewPdf = summary.sourceKind === 'user_pdf' && Boolean(summary.pdfHash);
  const pdfUrl = canViewPdf ? summarySourcePdfUrl(summary._id) : '';
  const sourceLink = paper?.url || summary.sourceUrl || '';
  const [viewer, setViewer] = useState(null);

  const doi = meta.doi || paper?.doi || '';
  const doiDisplay = formatDoi(doi);
  const doiUrl = doi
    ? `https://doi.org/${String(doi).replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')}`
    : '';
  const citation = [
    meta.journal || paper?.journal,
    meta.year || paper?.year,
    meta.volume || paper?.volume
      ? `${meta.volume || paper?.volume}${meta.issue || paper?.issue ? `(${meta.issue || paper?.issue})` : ''}`
      : '',
    meta.pages || paper?.pages,
  ].filter(Boolean);

  const mainResults = Array.isArray(c.mainResults) ? c.mainResults : [];
  const hasCi = mainResults.some((item) => /KTC|95\s*%\s*CI|khoảng tin cậy/i.test(item.numbers || ''));
  const quickLines = Array.isArray(c.quickRead?.lines) ? c.quickRead.lines : [];
  const applications = c.application || {};
  const hasApplications = APPLICATION_GROUPS.some((group) => applications[group.key]?.length);
  const hasMechanism = Boolean(c.mechanism?.summary || c.mechanism?.steps?.length);
  const showWeightStays =
    Boolean(c.mechanism?.whyWeightStaysStill) &&
    !/^không áp dụng/i.test(c.mechanism.whyWeightStaysStill);
  const showMechanismDiagram =
    /nối tiếp|in series/i.test(JSON.stringify(c.mechanism || {})) && showWeightStays;
  const hasAxes = Boolean(c.evidenceAxes?.design?.reason);

  const openFigure = (figure) => {
    if (pdfUrl && Number(figure.page) > 0) {
      setViewer(figure);
      return;
    }
    const target = sourceLink || pdfUrl;
    if (target) window.open(target, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="flex flex-col">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {c.studyType || 'Chưa rõ thiết kế'}
          </span>
          {paper?.isRetracted ? (
            <span className="badge bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
              Bài đã bị rút
            </span>
          ) : null}
          {/cấp tính|acute/i.test(c.studyType || '') ? (
            <span className="badge bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
              Cấp tính · 1 set/1 buổi
            </span>
          ) : null}
          {summary.cached ? (
            <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              Lấy từ cache
            </span>
          ) : null}
          {summary.isLegacy ? (
            <span className="badge bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              Bản cũ — nên tạo lại
            </span>
          ) : null}
          {summary.needsReview ? (
            <span className="badge bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
              Cần đối chiếu
            </span>
          ) : null}
          {hasAxes ? (
            <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              3 trục bằng chứng
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={onToggleFavorite}
            className={clsx(
              'btn-ghost !px-2.5 !py-1.5 text-sm',
              favorite ? 'text-amber-500' : 'text-slate-500 dark:text-slate-400',
            )}
            title={favorite ? 'Bỏ ghim khỏi thư viện' : 'Ghim vào thư viện'}
            aria-label="Ghim vào thư viện"
          >
            {favorite ? '★' : '☆'}
          </button>
          {onAsk ? (
            <button type="button" onClick={onAsk} className="btn-secondary !px-2.5 !py-1.5 text-xs" title="Hỏi đáp về bài này">
              <Icon name="book" className="h-4 w-4" />
              Hỏi đáp
            </button>
          ) : null}
          {onApply ? (
            <button
              type="button"
              onClick={onApply}
              disabled={summary.needsReview}
              className="btn-secondary !px-2.5 !py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
              title={
                summary.needsReview
                  ? 'Bản chưa qua kiểm tra tự động — không áp dụng vào giáo án'
                  : 'Đề xuất chỉnh giáo án từ bài này'
              }
            >
              <Icon name="target" className="h-4 w-4" />
              Áp dụng vào plan
            </button>
          ) : null}
          <a href={summaryExportUrl(summary._id)} className="btn-ghost !px-2.5 !py-1.5 text-xs" title="Tải Markdown">
            <Icon name="download" className="h-4 w-4" />
            .md
          </a>
          <a href={summaryPdfUrl(summary._id)} className="btn-ghost !px-2.5 !py-1.5 text-xs" title="Tải PDF">
            .pdf
          </a>
          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className="btn-ghost !px-2.5 !py-1.5 text-xs"
              title="Tạo lại bản tóm tắt bằng AI"
            >
              <Icon name="refresh" className="h-4 w-4" />
              Tạo lại
            </button>
          ) : null}
          {sourceLink ? (
            <a href={sourceLink} target="_blank" rel="noreferrer" className="btn-ghost !px-2.5 !py-1.5 text-xs" title="Mở bài gốc" aria-label="Mở bài gốc">
              <Icon name="external" className="h-4 w-4" />
            </a>
          ) : null}
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="btn-ghost !px-2.5 !py-1.5 text-xs text-rose-500 hover:text-rose-600"
            title="Xóa bản tóm tắt"
            aria-label="Xóa bản tóm tắt"
          >
            <Icon name="trash" className="h-4 w-4" />
          </button>
        </div>
      </div>

      <h2 className="mt-4 font-display text-[22px] font-semibold leading-snug tracking-[-0.015em] text-slate-900 sm:text-[26px] dark:text-white">
        {meta.title || paper?.title || 'Bản tóm tắt bài nghiên cứu'}
      </h2>
      <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        {authors.length ? authors.join(', ') : 'Không rõ tác giả'}
      </p>
      <p className="mt-1 font-mono text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
        {citation.length ? citation.join(' · ') : 'Không rõ tạp chí/năm'}
        {doi ? (
          <>
            {' · '}
            <a href={doiUrl} target="_blank" rel="noreferrer" className="text-brand-700 underline decoration-dotted underline-offset-2 hover:decoration-solid dark:text-brand-300">
              DOI {doiDisplay}
            </a>
          </>
        ) : (
          ' · DOI không nêu'
        )}
      </p>

      <EvidenceAxes axes={c.evidenceAxes} fallbackLevel={c.evidenceLevel?.level} />

      {abstractOnly ? (
        <Alert tone="warning" className="mt-4">
          <strong>Chỉ dựa trên abstract.</strong> Có thể thiếu thiết kế chi tiết, bảng số liệu và nhiều
          kết quả phụ. Nên tải PDF hoặc đọc bài gốc trước khi dùng cho kết luận quan trọng.
        </Alert>
      ) : null}

      {summary.needsReview ? (
        <Alert tone="warning" className="mt-4">
          <strong>Chưa qua kiểm tra tự động.</strong> Bản này vẫn được lưu để đọc và xuất, nhưng chưa
          đối chiếu đủ số liệu/nhãn. Hãy bấm “Tạo lại” hoặc đọc PDF gốc trước khi dùng để lập giáo án.
          Nút “Áp dụng vào plan” đã bị khoá cho bản này.
          {onReview ? (
            <button
              type="button"
              onClick={onReview}
              disabled={reviewing}
              className="btn-secondary mt-2 !px-2.5 !py-1.5 text-xs"
            >
              {reviewing ? 'Đang ghi nhận...' : 'Tôi đã đối chiếu PDF gốc — cho phép áp dụng'}
            </button>
          ) : null}
        </Alert>
      ) : null}

      <Section title="30 giây" step="2" hint="Ba dòng nắm nhanh, rồi tự hỏi có dùng được cho PT chưa.">
        {quickLines.length ? (
          <ol className="space-y-2">
            {quickLines.map((line, index) => (
              <li key={`${line}-${index}`} className="flex gap-2.5">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded bg-pine-100 font-mono text-[10px] font-semibold text-pine-700 dark:bg-pine-950 dark:text-pine-300">
                  {index + 1}
                </span>
                <LabeledText text={line} glossary={glossary} />
              </li>
            ))}
          </ol>
        ) : (
          <MarkdownText>{c.tldr}</MarkdownText>
        )}
        {c.quickRead?.readyForPt ? (
          <div className="mt-3 rounded-md border border-brand-200 bg-brand-50/60 p-3 dark:border-brand-900/60 dark:bg-brand-950/30">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-brand-700 dark:text-brand-300">
              Dùng được cho PT chưa?
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-brand-900 dark:text-brand-100">
              <LabeledText text={c.quickRead.readyForPt} type="ai" glossary={glossary} />
            </p>
          </div>
        ) : null}
      </Section>

      {c.whyStudy ? (
        <Section title="Vì sao làm nghiên cứu" step="3">
          <p className="rounded-md border border-line bg-paper-2/40 p-3.5 dark:border-white/[0.08] dark:bg-white/[0.02]">
            <LabeledText text={c.whyStudy} glossary={glossary} />
          </p>
        </Section>
      ) : null}

      <Section title="Họ đã làm gì" step="4">
        <div className="grid overflow-hidden rounded-md border border-line bg-paper-2/35 divide-y divide-line sm:grid-cols-2 sm:divide-x sm:[&>*:nth-child(-n+2)]:border-t-0 dark:border-white/[0.08] dark:bg-white/[0.02] dark:divide-white/[0.07]">
          <Info label="Thiết kế" glossary={glossary}>{c.design}</Info>
          <Info label="Người tham gia" glossary={glossary}>
            {c.participants
              ? `${c.participants.n ? `n = ${formatNumber(c.participants.n, 0)} · ` : ''}${
                  c.participants.description || ''
                }`
              : ''}
          </Info>
          <Info label="Can thiệp" glossary={glossary}>{c.intervention}</Info>
          <Info label="Chỉ số đo" glossary={glossary}>{c.outcomes}</Info>
        </div>

        {c.measurementNote ? (
          <p className="mt-2 rounded-md border border-amber-200 bg-amber-50/70 p-3 text-[13px] leading-relaxed text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            <LabeledText text={c.measurementNote} glossary={glossary} />
          </p>
        ) : null}

        {hasMechanism ? (
          <div className="mt-4 rounded-md border border-line bg-paper-2/30 p-3.5 dark:border-white/[0.08] dark:bg-white/[0.02]">
            <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
              Cơ chế can thiệp
            </p>
            {c.mechanism.summary ? (
              <p className="mt-1.5 text-[13px] leading-relaxed">
                <LabeledText text={c.mechanism.summary} glossary={glossary} />
              </p>
            ) : null}
            {c.mechanism.steps?.length ? (
              <ol className="mt-2 space-y-1.5">
                {c.mechanism.steps.map((step, index) => (
                  <li key={`${step}-${index}`} className="flex gap-2 text-[13px]">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded bg-paper-2 font-mono text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {index + 1}
                    </span>
                    <LabeledText text={step} glossary={glossary} />
                  </li>
                ))}
              </ol>
            ) : null}
            {showWeightStays ? (
              <p className="mt-2 rounded-md bg-brand-50/70 px-3 py-2 text-[12px] leading-relaxed text-brand-900 dark:bg-brand-950/30 dark:text-brand-100">
                <strong>Vì sao tạ đứng yên lúc đầu: </strong>
                <LabeledText text={c.mechanism.whyWeightStaysStill} type="data" glossary={glossary} />
              </p>
            ) : null}
            {c.mechanism.analogy ? (
              <p className="mt-2 text-[12px] italic leading-relaxed text-slate-500 dark:text-slate-400">
                <LabeledText text={c.mechanism.analogy} glossary={glossary} />
              </p>
            ) : null}
            {showMechanismDiagram ? <MechanismDiagram /> : null}
          </div>
        ) : null}
      </Section>

      <Section title="Kết quả" step="5">
        {c.resultsOverview ? (
          <div className="rounded-md border border-brand-200/70 bg-brand-50/60 p-3.5 dark:border-brand-900/60 dark:bg-brand-950/30">
            <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-brand-700 dark:text-brand-300">
              Đọc nhanh
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-brand-900 dark:text-brand-100">
              <LabeledText text={c.resultsOverview} glossary={glossary} />
            </p>
          </div>
        ) : null}

        <ReadingLegend hasCi={hasCi} />

        <div className="mt-3 space-y-2.5">
          {mainResults.map((item, index) => (
            <ResultCard key={`${item.finding}-${index}`} item={item} index={index} glossary={glossary} />
          ))}
        </div>
      </Section>

      {c.secondaryResults?.length ? (
        <Section title="Kết quả phụ">
          <ul className="list-disc space-y-1.5 pl-5">
            {c.secondaryResults.map((item, index) => (
              <li key={`${item.finding}-${index}`}>
                <LabeledText text={item.finding} type={item.claimType} glossary={glossary} />
                {item.numbers && item.numbers !== 'Không nêu trong bài' ? ` — ${item.numbers}.` : ''}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section title="Tác giả diễn giải" step="6">
        <div className="rounded-md border border-line bg-paper-2/40 p-3.5 dark:border-white/[0.08] dark:bg-white/[0.02]">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
            Kết luận của tác giả
          </p>
          <p className="mt-1 text-[13px] leading-relaxed">
            <LabeledText
              text={c.authorsView?.conclusion || c.authorsConclusion}
              type="author"
              glossary={glossary}
            />
          </p>
        </div>

        {c.authorsView?.interpretations?.length ? (
          <div className="mt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Cách tác giả giải thích
            </p>
            <ul className="mt-1.5 space-y-1.5">
              {c.authorsView.interpretations.map((item, index) => (
                <li key={`${item}-${index}`} className="flex gap-2">
                  <span className="mt-1 text-[10px] text-slate-400">▸</span>
                  <LabeledText text={item} type="author" glossary={glossary} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {c.authorsView?.applications?.length ? (
          <div className="mt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Ứng dụng tác giả nêu
            </p>
            <ul className="mt-1.5 space-y-1.5">
              {c.authorsView.applications.map((item, index) => (
                <li key={`${item}-${index}`} className="flex gap-2">
                  <span className="mt-1 text-[10px] text-slate-400">▸</span>
                  <LabeledText text={item} type="author" glossary={glossary} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Section>

      {c.limitationsStructured?.authors?.length || c.limitationsStructured?.ai?.length || c.limitations?.length ? (
        <Section title="Hạn chế" step="7">
          <div className="grid gap-2.5 sm:grid-cols-2">
            <div className="rounded-md border border-amber-200 bg-amber-50/50 p-3.5 dark:border-amber-900/60 dark:bg-amber-950/20">
              <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-amber-800 dark:text-amber-300">
                Tác giả nêu
              </p>
              <ul className="mt-1.5 space-y-1.5">
                {(c.limitationsStructured?.authors?.length
                  ? c.limitationsStructured.authors
                  : (c.limitations || []).filter((item) => !/nhận xét thêm|AI/i.test(item))
                ).map((item, index) => (
                  <li key={`${item}-${index}`} className="text-[12px] leading-relaxed">
                    <LabeledText text={item} type="author" glossary={glossary} />
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-md border border-violet-200 bg-violet-50/50 p-3.5 dark:border-violet-900/60 dark:bg-violet-950/20">
              <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-violet-800 dark:text-violet-300">
                AI nhận thấy
              </p>
              <ul className="mt-1.5 space-y-1.5">
                {(c.limitationsStructured?.ai?.length
                  ? c.limitationsStructured.ai
                  : (c.limitations || []).filter((item) => /nhận xét thêm|AI/i.test(item))
                ).map((item, index) => (
                  <li key={`${item}-${index}`} className="text-[12px] leading-relaxed">
                    <LabeledText text={item} type="ai" glossary={glossary} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>
      ) : null}

      <Section
        title="Áp dụng cho PT"
        step="8"
        hint="Bốn nhóm tách bạch: dữ kiện, giả thuyết chưa đo, điều chưa nên áp dụng, và câu hỏi bài không trả lời."
      >
        {hasApplications ? (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {APPLICATION_GROUPS.map((group) => {
              const items = applications[group.key] || [];
              return (
                <div key={group.key} className={clsx('rounded-md border p-3.5', group.tone)}>
                  <p className={clsx('font-mono text-[10.5px] font-bold uppercase tracking-[0.08em]', group.heading)}>
                    {group.title}
                  </p>
                  <p className="mt-0.5 text-[10.5px] text-slate-500 dark:text-slate-400">{group.note}</p>
                  {items.length ? (
                    <ul className="mt-2 space-y-1.5">
                      {items.map((item, index) => (
                        <ApplicationItem key={`${item}-${index}`} text={item} glossary={glossary} />
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-[12px] italic text-slate-500 dark:text-slate-400">
                      Không có ý nào trong nhóm này.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <ul className="space-y-2">
            {(c.practicalTakeaways || []).map((item, index) => (
              <ApplicationItem key={`${item}-${index}`} text={item} glossary={glossary} />
            ))}
          </ul>
        )}

        {applications.notApplicableTo || c.whoItDoesNotApplyTo ? (
          <p className="mt-3 rounded-md border border-line bg-paper-2/50 px-3.5 py-2.5 text-[12px] leading-relaxed text-slate-600 dark:border-white/[0.08] dark:bg-white/[0.02] dark:text-slate-300">
            <strong>Không áp dụng cho: </strong>
            <GlossaryText
              text={applications.notApplicableTo || c.whoItDoesNotApplyTo}
              glossary={glossary}
            />
          </p>
        ) : null}
      </Section>

      <Section title="Lợi ích & tài trợ" step="9">
        <div
          className={clsx(
            'rounded-md border p-3.5',
            c.benefitSignals?.flags?.length
              ? 'border-amber-300 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/30'
              : 'border-line bg-paper-2/40 dark:border-white/[0.08] dark:bg-white/[0.02]',
          )}
        >
          <p className="text-[13px] leading-relaxed">
            <LabeledText
              text={c.benefitSignals?.statement || c.conflictOfInterest}
              type={c.benefitSignals?.flags?.length ? 'data' : undefined}
              glossary={glossary}
            />
          </p>
          {c.benefitSignals?.flags?.length ? (
            <>
              <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-amber-800 dark:text-amber-300">
                Dấu hiệu cần lưu ý
              </p>
              <ul className="mt-1 space-y-1">
                {c.benefitSignals.flags.map((flag, index) => (
                  <li key={`${flag.text}-${index}`} className="text-[12px] leading-relaxed text-amber-900 dark:text-amber-200">
                    • {flag.text}
                    {flag.source ? ` (${flag.source}${flag.page ? `, tr. ${flag.page}` : ''})` : ''}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </Section>

      {c.selfCheck?.length ? (
        <Section title="3 câu tự kiểm tra" step="10">
          <div className="space-y-2">
            {c.selfCheck.map((item, index) => (
              <details
                key={`${item.question}-${index}`}
                className="rounded-md border border-line bg-paper-2/30 px-3.5 py-2.5 dark:border-white/[0.08] dark:bg-white/[0.02]"
              >
                <summary className="cursor-pointer text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                  {index + 1}. {item.question}
                </summary>
                <p className="mt-1.5 text-[12px] leading-relaxed text-slate-600 dark:text-slate-300">
                  <LabeledText text={item.answer} type="ai" glossary={glossary} />
                </p>
              </details>
            ))}
          </div>
        </Section>
      ) : null}

      {figures.length ? (
        <Section title="Hình & bảng" hint="Giải thích do AI viết từ chú thích và nội dung bài.">
          <div className="grid gap-3 sm:grid-cols-2">
            {figures.map((figure, index) => (
              <article
                key={`${figure.label}-${index}`}
                className="flex flex-col rounded-md border border-line bg-paper-2/30 p-3.5 dark:border-white/[0.08] dark:bg-white/[0.02]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={clsx(
                      'badge',
                      figure.kind === 'table'
                        ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                        : 'bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300',
                    )}
                  >
                    {figure.label}
                  </span>
                  {figure.page ? (
                    <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">Trang {figure.page}</span>
                  ) : null}
                </div>
                {figure.title ? (
                  <h4 className="mt-2 text-sm font-semibold leading-snug text-slate-800 dark:text-slate-100">
                    {figure.title}
                  </h4>
                ) : null}
                {figure.caption ? (
                  <p className="mt-1 line-clamp-3 text-[11px] italic leading-relaxed text-slate-500 dark:text-slate-400">
                    “{figure.caption}”
                  </p>
                ) : null}
                {figure.explanation ? (
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-700 dark:text-slate-200">
                    <GlossaryText text={figure.explanation} glossary={glossary} />
                  </p>
                ) : null}
                {figure.whatToLookFor ? (
                  <p className="mt-2 rounded bg-amber-50 px-2.5 py-2 text-xs leading-relaxed text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                    <strong>Cần chú ý:</strong> {figure.whatToLookFor}
                  </p>
                ) : null}
                {canViewPdf || sourceLink ? (
                  <button
                    type="button"
                    onClick={() => openFigure(figure)}
                    className="btn-secondary mt-3 w-full !py-1.5 text-xs"
                  >
                    <Icon name="external" className="h-3.5 w-3.5" />
                    {canViewPdf && figure.page ? `Xem hình · trang ${figure.page}` : 'Xem trong bài gốc'}
                  </button>
                ) : null}
              </article>
            ))}
          </div>
        </Section>
      ) : null}

      {glossary.length ? (
        <Section title="Thuật ngữ trong bài">
          <details className="rounded-md border border-line bg-paper-2/40 px-3.5 py-2.5 dark:border-white/[0.08] dark:bg-white/[0.02]">
            <summary className="cursor-pointer text-xs font-semibold text-slate-600 dark:text-slate-300">
              Mở danh sách {glossary.length} thuật ngữ
            </summary>
            <div className="mt-2.5 divide-y divide-line rounded-md border border-line bg-surface dark:divide-white/[0.07] dark:border-white/[0.08] dark:bg-white/[0.02]">
              {glossary.map((term) => {
                const saved = savedTerms?.has(term.en);
                return (
                  <div
                    key={term.en}
                    className="flex flex-wrap items-start justify-between gap-2 px-3 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {term.en} <span className="font-normal text-slate-500">· {term.vi}</span>
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{term.explanation}</p>
                      {term.example ? (
                        <p className="mt-0.5 text-[11px] italic text-slate-500 dark:text-slate-400">
                          Ví dụ: {term.example}
                        </p>
                      ) : null}
                    </div>
                    {onSaveTerm ? (
                      <button
                        type="button"
                        disabled={saved || savingTerm === term.en}
                        onClick={() => onSaveTerm(term)}
                        className={clsx(
                          'badge shrink-0',
                          saved
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-surface text-slate-600 border-line hover:border-pine-600 hover:text-brand-700 dark:bg-slate-900 dark:text-slate-300 dark:border-white/15',
                        )}
                      >
                        {saved ? 'Đã lưu' : savingTerm === term.en ? 'Đang lưu...' : '+ Từ điển'}
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </details>
        </Section>
      ) : null}

      <div className="mt-5 rounded-md border border-line bg-paper-2/40 p-3.5 text-xs text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.02] dark:text-slate-400">
        <p className="font-semibold text-slate-600 dark:text-slate-300">Độ tin cậy</p>
        <p className="mt-1">
          Nguồn: {abstractOnly ? 'chỉ abstract' : 'toàn văn bài báo'}. Số liệu do AI trích xuất, cần đối
          chiếu cột “Bài gốc” bên cạnh.
        </p>
        {c.verification && c.verification.passed === false ? (
          summary.reviewedAt ? (
            <p className="mt-1.5 rounded-lg bg-emerald-50 px-2 py-1.5 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              Đã đối chiếu thủ công ngày {new Date(summary.reviewedAt).toLocaleDateString('vi-VN')}. Vẫn nên
              kiểm tra lại nếu tạo bản mới.
            </p>
          ) : (
            <p className="mt-1.5 rounded-lg bg-rose-50 px-2 py-1.5 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
              Kiểm tra tự động còn {c.verification.issues?.length || 0} điểm chưa đạt. Nên đối chiếu PDF gốc.
            </p>
          )
        ) : null}
        {c.verification?.factsWarnings?.length ? (
          <details className="mt-1.5 rounded-lg bg-amber-50 px-2 py-1.5 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            <summary className="cursor-pointer text-[11px] font-semibold">
              {c.verification.factsWarnings.length} trích nguyên văn chưa khớp hoàn toàn
            </summary>
            <ul className="mt-1 list-disc pl-4 text-[11px]">
              {c.verification.factsWarnings.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          </details>
        ) : null}
        {c.confidence?.missingInfo?.length ? (
          <ul className="mt-1.5 list-disc pl-4">
            {c.confidence.missingInfo.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </div>

      {viewer ? (
        <FigureViewer
          src={pdfUrl}
          page={viewer.page}
          label={viewer.label}
          title={viewer.title}
          onClose={() => setViewer(null)}
        />
      ) : null}
    </Card>
  );
}
