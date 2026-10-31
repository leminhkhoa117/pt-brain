import clsx from 'clsx';
import { Alert, Card, Icon } from '../ui.jsx';
import { summaryExportUrl, summaryPdfUrl } from '../../api/summaries.js';
import { formatNumber } from '../../lib/format.js';

const LEVEL_STYLES = {
  1: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  2: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  3: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  4: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  5: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

function Info({ label, children }) {
  if (!children) return null;
  return (
    <div className="rounded-xl border border-slate-100 p-3 dark:border-slate-800">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-200">
        {children}
      </p>
    </div>
  );
}

function Section({ title, children }) {
  if (!children) return null;
  return (
    <section className="mt-5">
      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {title}
      </h3>
      <div className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{children}</div>
    </section>
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
  favorite,
  onToggleFavorite,
}) {
  const c = summary.content || {};
  const level = c.evidenceLevel?.level ?? 5;
  const authors = (c.metadata?.authors || paper?.authors || []).slice(0, 8);
  const abstractOnly = c.confidence?.basedOn === 'abstract_only' || summary.basedOn === 'abstract_only';

  return (
    <Card className="flex flex-col">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={clsx('badge', LEVEL_STYLES[level] || LEVEL_STYLES[5])}>
            Mức bằng chứng {level}/5
          </span>
          <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {c.studyType || 'Chưa rõ thiết kế'}
          </span>
          {summary.cached && (
            <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              Lấy từ cache
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleFavorite}
            className={clsx(
              'btn-ghost !px-2.5 !py-1.5 text-sm',
              favorite ? 'text-amber-500' : 'text-slate-400',
            )}
            title={favorite ? 'Bỏ ghim khỏi thư viện' : 'Ghim vào thư viện'}
            aria-label="Ghim vào thư viện"
          >
            {favorite ? '★' : '☆'}
          </button>
          {onApply && (
            <button
              type="button"
              onClick={onApply}
              className="btn-secondary !px-2.5 !py-1.5 text-xs"
              title="Đề xuất chỉnh giáo án từ bài này"
            >
              <Icon name="target" className="h-4 w-4" />
              Áp dụng vào plan
            </button>
          )}
          <a
            href={summaryExportUrl(summary._id)}
            className="btn-ghost !px-2.5 !py-1.5 text-xs"
            title="Tải Markdown"
          >
            <Icon name="download" className="h-4 w-4" />
            .md
          </a>
          <a
            href={summaryPdfUrl(summary._id)}
            className="btn-ghost !px-2.5 !py-1.5 text-xs"
            title="Tải PDF"
          >
            .pdf
          </a>
          {summary.sourceUrl || paper?.url ? (
            <a
              href={paper?.url || summary.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost !px-2.5 !py-1.5 text-xs"
              title="Mở bài gốc"
            >
              <Icon name="external" className="h-4 w-4" />
            </a>
          ) : null}
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="btn-ghost !px-2.5 !py-1.5 text-xs text-rose-500 hover:text-rose-600"
            title="Xóa bản tóm tắt"
          >
            <Icon name="trash" className="h-4 w-4" />
          </button>
        </div>
      </div>

      <h2 className="mt-3 text-xl font-bold leading-snug tracking-tight text-slate-900 dark:text-white">
        {c.metadata?.title || paper?.title || 'Bản tóm tắt bài nghiên cứu'}
      </h2>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {authors.join(', ')}
        {authors.length ? ' · ' : ''}
        {c.metadata?.journal || paper?.journal || 'Không rõ tạp chí'}
        {c.metadata?.year || paper?.year ? ` · ${c.metadata?.year || paper?.year}` : ''}
        {c.metadata?.doi || paper?.doi ? ` · DOI ${c.metadata?.doi || paper?.doi}` : ''}
      </p>

      {abstractOnly && (
        <Alert tone="warning" className="mt-4">
          <strong>Chỉ dựa trên abstract.</strong> Có thể thiếu thiết kế chi tiết, bảng số liệu và nhiều
          kết quả phụ. Nên tải PDF hoặc đọc bài gốc trước khi dùng cho kết luận quan trọng.
        </Alert>
      )}

      <div className="mt-4 rounded-2xl bg-brand-50 p-4 dark:bg-brand-950/40">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Tóm tắt nhanh
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-brand-900 dark:text-brand-100">{c.tldr}</p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Info label="Câu hỏi nghiên cứu">{c.researchQuestion}</Info>
        <Info label="Người tham gia">
          {c.participants
            ? `${c.participants.n ? `n = ${formatNumber(c.participants.n, 0)} · ` : ''}${
                c.participants.description || ''
              }`
            : ''}
        </Info>
        <Info label="Thiết kế">{c.design}</Info>
        <Info label="Can thiệp / so sánh">{c.intervention}</Info>
        <Info label="Chỉ số đo">{c.outcomes}</Info>
        <Info label="Mức bằng chứng">{c.evidenceLevel?.explanation}</Info>
      </div>

      <Section title="Kết quả chính">
        <div className="space-y-2.5">
          {(c.mainResults || []).map((item, index) => (
            <div
              key={`${item.finding}-${index}`}
              className="rounded-xl border border-slate-200 p-3 dark:border-slate-800"
            >
              <p className="font-semibold text-slate-800 dark:text-slate-100">{item.finding}</p>
              <p className="mt-1 rounded-lg bg-amber-50 px-2.5 py-1.5 font-mono text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                {item.numbers}
              </p>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{item.plainMeaning}</p>
            </div>
          ))}
        </div>
      </Section>

      {c.secondaryResults?.length ? (
        <Section title="Kết quả phụ">
          <ul className="list-disc space-y-1.5 pl-5">
            {c.secondaryResults.map((item, index) => (
              <li key={`${item.finding}-${index}`}>
                <strong>{item.finding}</strong> — {item.numbers}. {item.plainMeaning}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section title="Kết luận của tác giả">{c.authorsConclusion}</Section>

      {c.limitations?.length ? (
        <Section title="Hạn chế">
          <ul className="list-disc space-y-1 pl-5">
            {c.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section title="Xung đột lợi ích">{c.conflictOfInterest}</Section>

      {c.practicalTakeaways?.length ? (
        <Section title="Ứng dụng thực tế">
          <ul className="space-y-2">
            {c.practicalTakeaways.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-0.5 text-brand-600 dark:text-brand-400">▸</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section title="Không áp dụng cho">{c.whoItDoesNotApplyTo}</Section>

      {c.glossary?.length ? (
        <Section title="Thuật ngữ">
          <div className="space-y-2">
            {c.glossary.map((term) => {
              const saved = savedTerms?.has(term.en);
              return (
                <div
                  key={term.en}
                  className="flex flex-wrap items-start justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {term.en} <span className="font-normal text-slate-500">· {term.vi}</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{term.explanation}</p>
                  </div>
                  <button
                    type="button"
                    disabled={saved || savingTerm === term.en}
                    onClick={() => onSaveTerm(term)}
                    className={clsx(
                      'badge shrink-0',
                      saved
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:text-brand-700 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700',
                    )}
                  >
                    {saved ? 'Đã lưu' : savingTerm === term.en ? 'Đang lưu...' : '+ Từ điển'}
                  </button>
                </div>
              );
            })}
          </div>
        </Section>
      ) : null}

      <div className="mt-5 rounded-xl border border-slate-200 p-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <p className="font-semibold text-slate-600 dark:text-slate-300">Độ tin cậy</p>
        <p className="mt-1">
          Nguồn: {abstractOnly ? 'chỉ abstract' : 'toàn văn bài báo'}. Số liệu do AI trích xuất, cần đối
          chiếu cột “Bài gốc” bên cạnh.
        </p>
        {c.confidence?.missingInfo?.length ? (
          <ul className="mt-1.5 list-disc pl-4">
            {c.confidence.missingInfo.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </Card>
  );
}
