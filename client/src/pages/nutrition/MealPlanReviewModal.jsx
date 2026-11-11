import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Card, Icon, InfoTip, Spinner, Portal } from '../../components/ui.jsx';
import MarkdownText from '../../components/MarkdownText.jsx';
import {
  evaluateMealPlanWeek,
  getMealPlanAdherence,
  listMealPlanReviews,
} from '../../api/mealPlans.js';
import { getErrorMessage } from '../../api/client.js';
import { formatDateKey, todayKey } from '../../lib/date.js';
import { formatNumber, formatSigned } from '../../lib/format.js';

const SCORE_TONES = {
  emerald: 'text-emerald-600 dark:text-emerald-400',
  brand: 'text-brand-600 dark:text-brand-400',
  amber: 'text-amber-600 dark:text-amber-400',
  rose: 'text-rose-600 dark:text-rose-400',
};

function Metric({ label, value, unit, hint, info, tone = 'default' }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.04]">
      <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
        {info && <InfoTip label={label}>{info}</InfoTip>}
      </p>
      <p
        className={`mt-1 text-xl font-extrabold ${
          tone === 'default'
            ? 'text-slate-900 dark:text-white'
            : SCORE_TONES[tone] || SCORE_TONES.brand
        }`}
      >
        {value}
        {unit && <span className="ml-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{unit}</span>}
      </p>
      {hint && <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}

function ReviewContent({ review }) {
  if (!review) return null;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`badge ${
            review.source === 'ai'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
          }`}
        >
          {review.source === 'ai' ? 'AI nhận xét' : 'Nhận xét theo quy tắc'}
        </span>
        {review.model && <span className="text-[11px] text-slate-500 dark:text-slate-400">Model: {review.model}</span>}
      </div>
      {review.headline && (
        <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
          {review.headline}
        </h3>
      )}
      {review.summary && (
        <MarkdownText className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          {review.summary}
        </MarkdownText>
      )}
      {review.notice && (
        <p className="mt-2 text-[11px] text-amber-600 dark:text-amber-400">{review.notice}</p>
      )}

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {[
          ['Điều làm tốt', review.wins, 'text-emerald-500'],
          ['Điểm lệch', review.gaps, 'text-amber-500'],
        ].map(([title, items, color]) => (
          <div key={title} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</p>
            {items?.length ? (
              <ul className="mt-1.5 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                {items.map((item) => (
                  <li key={item} className="flex gap-1.5">
                    <span className={color}>•</span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">Chưa có dữ liệu để kết luận.</p>
            )}
          </div>
        ))}
      </div>

      {review.suggestions?.length > 0 && (
        <div className="mt-3 rounded-xl bg-brand-50/60 p-3 dark:bg-brand-950/20">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-600 dark:text-brand-300">
            Gợi ý cho tuần sau
          </p>
          <ul className="mt-1.5 space-y-1 text-xs text-slate-600 dark:text-slate-300">
            {review.suggestions.map((item) => (
              <li key={item} className="flex gap-1.5">
                <span className="text-brand-500">→</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {review.caution && (
        <p className="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{review.caution}</p>
      )}
    </div>
  );
}

export default function MealPlanReviewModal({ plan, onClose }) {
  const queryClient = useQueryClient();
  const [weekStart, setWeekStart] = useState('');
  const [error, setError] = useState(null);

  const weeksQuery = useQuery({
    queryKey: ['meal-plan-reviews', plan._id],
    queryFn: () => listMealPlanReviews(plan._id),
  });

  const weeks = useMemo(() => weeksQuery.data?.weeks || [], [weeksQuery.data]);

  useEffect(() => {
    if (weekStart || !weeks.length) return;
    const past = weeks.filter((week) => week.isPast);
    setWeekStart((past.length ? past[past.length - 1] : weeks[0]).start);
  }, [weeks, weekStart]);

  const adherenceQuery = useQuery({
    queryKey: ['meal-plan-adherence', plan._id, weekStart],
    queryFn: () => getMealPlanAdherence(plan._id, weekStart),
    enabled: Boolean(weekStart) && weekStart <= (weeksQuery.data?.todayKey || todayKey()),
  });

  const data = adherenceQuery.data;
  const stats = data?.adherence;
  const review = data?.review?.content?.review || null;
  const selectedWeek = data?.week || weeks.find((week) => week.start === weekStart);
  const today = weeksQuery.data?.todayKey || todayKey();

  const evaluate = useMutation({
    mutationFn: () => evaluateMealPlanWeek(plan._id, weekStart),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['meal-plan-reviews', plan._id] });
      queryClient.setQueryData(['meal-plan-adherence', plan._id, weekStart], {
        week: result.week,
        adherence: result.adherence,
        review: result.review,
      });
      setError(null);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const canEvaluate = useMemo(() => {
    if (!stats) return false;
    return stats.countedDays > 0;
  }, [stats]);

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 sm:items-center sm:p-4">
        <div className="max-h-[94vh] w-full overflow-auto rounded-t-lg bg-white p-5 shadow-overlay dark:bg-slate-900 sm:max-w-3xl sm:rounded-lg">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="mt-1 font-display text-[20px] font-semibold text-slate-900 dark:text-white">{plan.name}</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                So sánh bữa ăn thực tế bạn log với thực đơn mẫu của plan trong từng tuần.
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

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Chọn tuần:</span>
            <select
              className="select max-w-md !py-1.5 text-xs"
              value={weekStart}
              onChange={(e) => {
                setWeekStart(e.target.value);
                setError(null);
              }}
              disabled={weeksQuery.isLoading}
            >
              {weeks.map((week) => (
                <option key={week.start} value={week.start}>
                  {week.label} · {formatDateKey(week.start)}–{formatDateKey(week.end)}
                  {week.hasReview ? ` · ${week.score}/100` : ''}
                  {week.isPast ? '' : ' (chưa kết thúc)'}
                </option>
              ))}
            </select>
          </div>

          {adherenceQuery.isLoading && (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          )}

          {adherenceQuery.error && (
            <Alert tone="danger" className="mt-3">
              {getErrorMessage(adherenceQuery.error)}
            </Alert>
          )}

          {weekStart && weekStart > today && (
            <Alert tone="info" className="mt-3">
              Tuần này chưa bắt đầu (từ {formatDateKey(weekStart, true)}). Bạn có thể quay lại đánh
              giá sau khi plan chạy được ít nhất 1 ngày.
            </Alert>
          )}

          {stats && (
            <>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Metric
                  label="Điểm bám plan"
                  value={stats.score}
                  unit="/100"
                  tone={stats.gradeTone}
                  hint={stats.grade}
                  info="Điểm 0-100 = 40% số ngày có log + 35% mức đúng calo + 25% mức đạt protein. Điểm do code tính, AI không tự đổi."
                />
                <Metric
                  label="Ngày đã log"
                  value={`${stats.loggedDays}/${stats.countedDays}`}
                  hint={`${stats.coveragePct}% số ngày`}
                  info="Số ngày có ít nhất một bữa ăn được ghi lại, trên tổng số ngày của tuần đã tới."
                />
                <Metric
                  label="Calo trung bình"
                  value={formatNumber(stats.averages.actual.calories, 0)}
                  unit="kcal"
                  hint={`Plan: ${formatNumber(stats.averages.planned.calories, 0)} kcal`}
                  info="Calo trung bình mỗi ngày đã log, so với trung bình thực đơn mẫu của plan."
                />
                <Metric
                  label="Protein trung bình"
                  value={formatNumber(stats.averages.actual.proteinG, 0)}
                  unit="g"
                  hint={`Plan: ${formatNumber(stats.averages.planned.proteinG, 0)} g`}
                  info="Protein trung bình mỗi ngày đã log, so với trung bình thực đơn mẫu của plan."
                />
              </div>

              <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="min-w-full text-xs">
                  <thead className="bg-slate-50 text-left uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:bg-slate-800">
                    <tr>
                      <th className="px-3 py-2">Ngày</th>
                      <th className="px-3 py-2">Plan</th>
                      <th className="px-3 py-2">Thực tế</th>
                      <th className="px-3 py-2">Lệch calo</th>
                      <th className="px-3 py-2">Protein</th>
                      <th className="px-3 py-2">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {stats.rows.map((row) => (
                      <tr key={row.dateKey} className={row.logged ? '' : 'opacity-60'}>
                        <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-200">
                          {formatDateKey(row.dateKey)}
                        </td>
                        <td className="px-3 py-2 text-slate-500">
                          {formatNumber(row.planned.calories, 0)} kcal
                        </td>
                        <td className="px-3 py-2 text-slate-500">
                          {formatNumber(row.actual.calories, 0)} kcal
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={
                              !row.logged
                                ? 'text-slate-500 dark:text-slate-400'
                                : Math.abs(row.calorieDeltaPct) <= 10
                                  ? 'font-semibold text-emerald-600 dark:text-emerald-400'
                                  : Math.abs(row.calorieDeltaPct) <= 25
                                    ? 'font-semibold text-amber-600 dark:text-amber-400'
                                    : 'font-semibold text-rose-600 dark:text-rose-400'
                            }
                          >
                            {row.logged ? formatSigned(row.calorieDeltaPct, 0, '%') : '—'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-500">
                          {row.logged
                            ? `${formatNumber(row.actual.proteinG, 0)}/${formatNumber(row.planned.proteinG, 0)} g`
                            : `—/${formatNumber(row.planned.proteinG, 0)} g`}
                        </td>
                        <td className="px-3 py-2">
                          {row.logged ? (
                            <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                              Đã log
                            </span>
                          ) : (
                            <span className="badge bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              Chưa log
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {stats.mealTypes
                  .filter((item) => item.planned.calories > 0 || item.actual.calories > 0)
                  .map((item) => (
                    <div
                      key={item.type}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-white/[0.04]"
                    >
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        {item.label}
                      </span>
                      <span className="text-slate-500">
                        Plan {formatNumber(item.planned.calories, 0)} · Thực tế{' '}
                        {formatNumber(item.actual.calories, 0)} kcal
                      </span>
                    </div>
                  ))}
              </div>

              {selectedWeek && !selectedWeek.isPast && (
                <Alert tone="info" className="mt-3">
                  Tuần này chưa kết thúc. Bạn vẫn có thể xem tiến độ, nhưng nên đánh giá vào cuối
                  tuần để số liệu đầy đủ.
                </Alert>
              )}

              <Card className="mt-3 border-brand-200 bg-brand-50/40 dark:border-brand-900 dark:bg-brand-950/20">
                {review ? (
                  <ReviewContent review={review} />
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      Nhận xét tuần này
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      AI đọc số liệu bạn đã log, nêu điều làm tốt, chỗ lệch và gợi ý cho tuần sau.
                      Điểm số vẫn do code tính.
                    </p>
                    <button
                      type="button"
                      className="btn-primary mt-3"
                      disabled={evaluate.isPending || !canEvaluate}
                      onClick={() => evaluate.mutate()}
                    >
                      {evaluate.isPending ? (
                        <Spinner className="h-4 w-4 text-white" />
                      ) : (
                        <Icon name="target" className="h-4 w-4" />
                      )}
                      {evaluate.isPending
                        ? 'AI đang đọc dữ liệu tuần...'
                        : 'Nhận xét tuần này bằng AI'}
                    </button>
                    {evaluate.isPending && (
                      <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">Thường mất 5–20 giây.</p>
                    )}
                  </div>
                )}
              </Card>
            </>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Đóng
            </button>
            {weeksQuery.data?.reviews?.length > 0 && (
              <span className="self-center text-[11px] text-slate-500 dark:text-slate-400">
                Đã lưu {weeksQuery.data.reviews.length} nhận xét tuần.
              </span>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}
