import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Card, Field, Icon, PageHeader, Spinner } from '../components/ui.jsx';
import { useDialog } from '../components/DialogProvider.jsx';
import MarkdownText from '../components/MarkdownText.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import {
  analyzeBody,
  bodyAssessmentPhotoUrl,
  deleteBodyAssessment,
  listBodyAssessments,
} from '../api/vision.js';
import { getErrorMessage } from '../api/client.js';
import { compressImage } from '../lib/images.js';
import { formatDateKey } from '../lib/date.js';
import { GOAL_LABELS, formatNumber } from '../lib/format.js';

const VIEWS = ['front', 'side', 'back', 'detail'];
const VIEW_LABELS = { front: 'Trước', side: 'Nghiêng', back: 'Sau', detail: 'Chi tiết' };

function ConfidenceBadge({ value }) {
  const label = value === 'high' ? 'Cao' : value === 'medium' ? 'Trung bình' : 'Thấp';
  const cls =
    value === 'high'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
      : value === 'medium'
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
        : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
  return <span className={`badge ${cls}`}>Độ tin cậy: {label}</span>;
}

export default function BodyAssessmentPage() {
  const dialog = useDialog();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [goal, setGoal] = useState(user?.profile?.goal || 'maintain');
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState([]);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const historyQuery = useQuery({
    queryKey: ['body-assessments'],
    queryFn: listBodyAssessments,
  });
  const history = historyQuery.data?.assessments || [];

  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files],
  );
  useEffect(() => () => previews.forEach((item) => URL.revokeObjectURL(item.url)), [previews]);

  const analyze = useMutation({
    mutationFn: async () => {
      const compressed = await Promise.all(files.map((file) => compressImage(file)));
      return analyzeBody({
        files: compressed,
        views: compressed.map((_, index) => VIEWS[index] || 'detail'),
        goal,
        notes,
      });
    },
    onSuccess: (data) => {
      setResult(data);
      setFiles([]);
      setConsent(false);
      queryClient.invalidateQueries({ queryKey: ['body-assessments'] });
      setError(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: (id) => deleteBodyAssessment(id),
    onSuccess: () => {
      setResult(null);
      queryClient.invalidateQueries({ queryKey: ['body-assessments'] });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const analysis = result?.assessment?.analysis;

  return (
    <div>
      <PageHeader
        title="AI đánh giá thể trạng"
        subtitle="Tải 1-4 ảnh (trước/nghiêng/sau) và cho AI nhận xét dựa trên mục tiêu của bạn. Đây là ước lượng từ ảnh, không phải chẩn đoán y tế."
        actions={
          <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
            Vision · {formatNumber(history.length, 0)} lần đánh giá
          </span>
        }
      />

      {error && (
        <Alert tone="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h2 className="font-display text-[16px] font-semibold text-slate-900 dark:text-white">Ảnh &amp; mục tiêu</h2>
          <div className="mt-3 space-y-3">
            <Field label="Mục tiêu hiện tại">
              <select className="select" value={goal} onChange={(e) => setGoal(e.target.value)}>
                {Object.entries(GOAL_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Ảnh cơ thể (tối đa 4)">
              <label className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-line bg-paper-2/60 px-3 py-3 text-[12px] text-slate-500 transition-colors hover:border-pine-600 dark:border-white/15 dark:bg-white/[0.03] dark:text-slate-400">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-line bg-surface text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                  <Icon name="upload" className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-slate-700 dark:text-slate-200">
                    {files.length ? `${files.length} ảnh đã chọn` : 'Chọn tối đa 4 ảnh'}
                  </span>
                  <span className="block text-[11px] text-slate-400">
                    Trước / nghiêng / sau · JPG, PNG, WebP
                  </span>
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="sr-only"
                  onChange={(e) => {
                    const list = Array.from(e.target.files || []).slice(0, 4);
                    setFiles(list);
                    setError(null);
                  }}
                />
              </label>
            </Field>

            {previews.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {previews.map((item, index) => (
                  <div key={item.url} className="relative">
                    <img
                      src={item.url}
                      alt={VIEW_LABELS[VIEWS[index]]}
                      className="h-20 w-full rounded-lg object-cover"
                    />
                    <span className="absolute bottom-1 left-1 rounded bg-slate-950/70 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                      {VIEW_LABELS[VIEWS[index]] || 'Ảnh'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <Field label="Ghi chú (tùy chọn)">
              <textarea
                className="textarea min-h-[80px]"
                placeholder="Chấn thương cũ, vùng muốn cải thiện, lịch tập..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={2000}
              />
            </Field>

            <label className="flex cursor-pointer items-start gap-2 rounded-md border border-line bg-paper-2/60 p-3 text-[12px] leading-relaxed text-slate-600 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-300">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span>
                Tôi đồng ý để AI phân tích ảnh này. Ảnh được lưu riêng tư và chỉ tôi xem được; có thể xóa
                bất cứ lúc nào.
              </span>
            </label>

            <button
              type="button"
              className="btn-primary w-full"
              disabled={!files.length || !consent || analyze.isPending}
              onClick={() => analyze.mutate()}
            >
              {analyze.isPending ? <Spinner className="h-4 w-4 text-white" /> : <Icon name="target" className="h-4 w-4" />}
              {analyze.isPending ? 'AI đang phân tích ảnh...' : 'Phân tích thể trạng'}
            </button>
            {analyze.isPending && (
              <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                Thường 10-40 giây cho 1-4 ảnh.
              </p>
            )}
          </div>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          {!analysis && (
            <Card className="py-12 text-center">
              <Icon name="activity" className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
              <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                Chưa có đánh giá nào
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Thêm ảnh và mục tiêu để AI nhận xét về cân bằng cơ, tư thế và hướng cải thiện.
              </p>
            </Card>
          )}

          {analysis && (
            <>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="mt-1 font-display text-[20px] font-semibold text-slate-900 dark:text-white">
                      {GOAL_LABELS[result.assessment.goal]}
                    </h2>
                  </div>
                  <ConfidenceBadge value={analysis.estimatedBodyFat?.confidence} />
                </div>

                <MarkdownText className="mt-3 text-slate-700 dark:text-slate-200">
                  {analysis.overall}
                </MarkdownText>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-xl bg-brand-50 p-3 dark:bg-brand-950/30">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-brand-600 dark:text-brand-300">
                      % mỡ ước tính từ ảnh
                    </p>
                    <p className="mt-1 text-xl font-extrabold text-brand-800 dark:text-brand-200">
                      {analysis.estimatedBodyFat?.rangeMin != null &&
                      analysis.estimatedBodyFat?.rangeMax != null
                        ? `${formatNumber(analysis.estimatedBodyFat.rangeMin, 1)}–${formatNumber(
                            analysis.estimatedBodyFat.rangeMax,
                            1,
                          )}%`
                        : 'Không đủ dữ liệu'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.04]">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Cân bằng cơ
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {analysis.physique?.summary || '—'}
                    </p>
                  </div>
                </div>

                {analysis.estimatedBodyFat?.caveat && (
                  <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                    {analysis.estimatedBodyFat.caveat}
                  </p>
                )}
              </Card>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Ưu tiên cải thiện</h3>
                  <ul className="mt-2 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                    {(analysis.priorities || []).map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="text-brand-500">▸</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Tư thế / quan sát</h3>
                  <div className="mt-2 space-y-2">
                    {(analysis.posture || []).map((item, index) => (
                      <div key={index} className="rounded-lg bg-slate-50 p-2.5 text-xs dark:bg-white/[0.04]">
                        <p className="font-semibold text-slate-700 dark:text-slate-200">
                          {item.observation}
                        </p>
                        {item.implication && (
                          <p className="mt-0.5 text-slate-500 dark:text-slate-400">{item.implication}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>

                <Card>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Điều chỉnh tập luyện</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-600 dark:text-slate-300">
                    {(analysis.trainingAdjustments || []).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </Card>

                <Card>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Điều chỉnh dinh dưỡng</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-600 dark:text-slate-300">
                    {(analysis.nutritionAdjustments || []).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </Card>
              </div>

              <Card>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Theo dõi tiếp</h3>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-600 dark:text-slate-300">
                  {(analysis.progressTracking || []).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(result.evidence || []).map((item) => (
                    <a
                      key={item.id}
                      href={item.doi ? `https://doi.org/${item.doi}` : '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="badge bg-slate-100 text-slate-500 hover:text-brand-700 dark:bg-slate-800 dark:text-slate-400"
                      title={item.title}
                    >
                      [{item.id}] {item.year}
                    </a>
                  ))}
                  <button
                    type="button"
                    className="btn-ghost !px-2 !py-1 text-xs text-rose-500"
                    title="Xóa đánh giá thể trạng"
                    aria-label="Xóa đánh giá thể trạng"
                    onClick={() => {
                      dialog
                        .confirm({
                          title: 'Xóa đánh giá thể trạng',
                          message: 'Xóa đánh giá này và toàn bộ ảnh đi kèm?',
                          confirmLabel: 'Xóa đánh giá',
                        })
                        .then((ok) => {
                          if (ok) remove.mutate(result.assessment._id);
                        });
                    }}
                  >
                    Xóa đánh giá
                  </button>
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  {analysis.disclaimer}
                  {analysis.limitations?.length ? ` Hạn chế: ${analysis.limitations.join('; ')}.` : ''}
                </p>
              </Card>
            </>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <Card className="mt-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Lịch sử đánh giá</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {history.map((item) => (
              <button
                key={item._id}
                type="button"
                onClick={() => setResult({ assessment: item, evidence: [] })}
                className="rounded-xl border border-slate-200 p-3 text-left transition hover:border-brand-300 dark:border-slate-800 dark:hover:border-brand-800"
              >
                <p className="text-xs font-semibold text-slate-500">
                  {formatDateKey(item.dateKey, true)} · {GOAL_LABELS[item.goal]}
                </p>
                <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-100">
                  {item.analysis?.estimatedBodyFat?.rangeMin != null
                    ? `${formatNumber(item.analysis.estimatedBodyFat.rangeMin, 1)}–${formatNumber(
                        item.analysis.estimatedBodyFat.rangeMax,
                        1,
                      )}% mỡ`
                    : 'Không đủ dữ liệu % mỡ'}
                </p>
                {item.images?.[0] && (
                  <img
                    src={bodyAssessmentPhotoUrl(item._id, item.images[0].filename)}
                    alt="Ảnh đánh giá"
                    loading="lazy"
                    className="mt-2 h-24 w-full rounded-lg object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
