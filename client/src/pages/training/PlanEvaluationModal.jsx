import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Alert, Card, Icon, Spinner } from '../../components/ui.jsx';
import MarkdownText from '../../components/MarkdownText.jsx';
import { evaluateProgram } from '../../api/training.js';
import { getErrorMessage } from '../../api/client.js';

const SEVERITY = {
  high: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

const PRIORITY = {
  high: 'Ưu tiên cao',
  medium: 'Ưu tiên vừa',
  low: 'Ưu tiên thấp',
};

function scoreColor(score) {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  return '#f43f5e';
}

export default function PlanEvaluationModal({ program, onClose }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = useMutation({
    mutationFn: () => evaluateProgram(program._id),
    onSuccess: (data) => {
      setResult(data.evaluation);
      setError(null);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 sm:items-center sm:p-4">
      <div className="max-h-[94vh] w-full overflow-auto rounded-t-lg bg-white p-5 shadow-overlay dark:bg-slate-900 sm:max-w-3xl sm:rounded-lg">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="mt-1 font-display text-[20px] font-semibold text-slate-900 dark:text-white">
              Đánh giá giáo án: {program.name}
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Điểm số tính bằng quy tắc từ volume, tần suất, cân bằng, RIR, hồi phục và đặc hiệu. AI viết
              nhận xét và đề xuất dựa trên bằng chứng.
            </p>
          </div>
          <button type="button" className="btn-ghost !p-2" onClick={onClose}>
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <Alert tone="danger" className="mt-3">
            {error}
          </Alert>
        )}

        {!result && !run.isPending && (
          <div className="mt-6 text-center">
            <Icon name="target" className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              AI sẽ đọc giáo án, tính toán volume và đối chiếu với 6 nguồn nghiên cứu đã kiểm chứng.
            </p>
            <button type="button" className="btn-primary mt-4" onClick={() => run.mutate()}>
              Bắt đầu đánh giá
            </button>
          </div>
        )}

        {run.isPending && (
          <div className="flex flex-col items-center py-14 text-center">
            <Spinner className="h-8 w-8" />
            <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
              AI đang phân tích giáo án...
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Thường 10-30 giây.</p>
          </div>
        )}

        {result && (
          <>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div
                className="grid h-28 w-28 shrink-0 place-items-center rounded-full"
                style={{
                  background: `conic-gradient(${scoreColor(result.score)} ${result.score}%, rgba(148,163,184,0.18) 0)`,
                }}
              >
                <div className="grid h-[92px] w-[92px] place-items-center rounded-full bg-white dark:bg-slate-900">
                  <div className="text-center">
                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{result.score}</p>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">/ 100</p>
                  </div>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                    Hạng {result.grade}
                  </span>
                  {result.metrics && (
                    <span className="badge bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {result.metrics.totalSets} set/tuần · {result.metrics.days} ngày
                    </span>
                  )}
                </div>
                <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                  {result.headline}
                </h3>
                <MarkdownText className="mt-1 text-slate-600 dark:text-slate-300">
                  {result.summary}
                </MarkdownText>
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {result.subscores.map((item) => (
                <div key={item.key}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600 dark:text-slate-300">{item.label}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{item.score}/100</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.score}%`,
                        background: scoreColor(item.score),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Card className="!p-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Điểm mạnh</h3>
                <ul className="mt-2 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                  {(result.strengths || []).map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-emerald-500">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="!p-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Vấn đề cần chú ý</h3>
                <div className="mt-2 space-y-2">
                  {(result.issues || []).map((item, index) => (
                    <div key={index} className="rounded-lg bg-slate-50 p-2.5 text-xs dark:bg-white/[0.04]">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-slate-700 dark:text-slate-200">{item.point}</p>
                        <span className={`badge shrink-0 ${SEVERITY[item.severity] || SEVERITY.medium}`}>
                          {item.severity}
                        </span>
                      </div>
                      {(item.evidenceIds || []).length > 0 && (
                        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                          Bằng chứng: {item.evidenceIds.join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card className="mt-3 !p-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Đề xuất cải thiện</h3>
              <div className="mt-2 space-y-2">
                {(result.recommendations || []).map((item, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="font-semibold text-slate-800 dark:text-slate-100">{item.action}</p>
                      <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                        {PRIORITY[item.priority] || item.priority}
                      </span>
                    </div>
                    {item.rationale && (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.rationale}</p>
                    )}
                    {(item.evidenceIds || []).length > 0 && (
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        Bằng chứng: {item.evidenceIds.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {result.caveats?.length > 0 && (
              <Alert tone="info" className="mt-3">
                {result.caveats.join(' · ')}
              </Alert>
            )}

            <div className="mt-3 flex flex-wrap gap-1.5">
              {(result.evidence || []).map((item) => (
                <a
                  key={item.id}
                  href={item.doi ? `https://doi.org/${item.doi}` : '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="badge bg-slate-100 text-slate-500 hover:text-brand-700 dark:bg-slate-800 dark:text-slate-400"
                  title={`${item.title} (${item.journal}, ${item.year})`}
                >
                  [{item.id}] {item.authors.split(',')[0]} {item.year}
                </a>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className="btn-secondary" onClick={() => run.mutate()}>
                Chấm lại
              </button>
              <button type="button" className="btn-ghost" onClick={onClose}>
                Đóng
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

