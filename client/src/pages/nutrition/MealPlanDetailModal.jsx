import { Alert, Card, Icon, InfoTip, Portal } from '../../components/ui.jsx';
import MarkdownText from '../../components/MarkdownText.jsx';
import { formatDateKey } from '../../lib/date.js';
import { formatNumber, GOAL_LABELS } from '../../lib/format.js';
import { mealPlanPhase } from '@shared/nutrition/mealPlan.js';
import MealPlanDays from './MealPlanDays.jsx';

const DIET_LABELS = {
  omnivore: 'Ăn đa dạng',
  high_protein: 'Ưu tiên đạm cao',
  vegetarian: 'Ăn chay (có trứng/sữa)',
  vegan: 'Thuần chay',
  pescatarian: 'Cá/hải sản',
};

const BUDGET_LABELS = {
  low: 'Tiết kiệm',
  medium: 'Trung bình',
  high: 'Thoải mái',
};

const SOURCE_LABELS = {
  ai: 'AI đề xuất',
  fallback: 'Phương án dự phòng',
  manual: 'Bạn tự tạo',
};

export default function MealPlanDetailModal({
  plan,
  today,
  onClose,
  onActivate,
  onDelete,
  onEdit,
  onReview,
}) {
  const phase = mealPlanPhase(plan.startDate, plan.endDate, today);
  const isActive = plan.status === 'active' && phase.status !== 'ended';

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 sm:items-center sm:p-4">
        <div className="max-h-[94vh] w-full overflow-auto rounded-t-lg bg-white p-5 shadow-overlay dark:bg-slate-900 sm:max-w-3xl sm:rounded-lg">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="mt-1 font-display text-[20px] font-semibold text-slate-900 dark:text-white">{plan.name}</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {formatDateKey(plan.startDate, true)} → {formatDateKey(plan.endDate, true)} ·{' '}
                {plan.durationDays} ngày · {GOAL_LABELS[plan.goal] || plan.goal}
              </p>
            </div>
            <button type="button" className="btn-ghost !p-2" onClick={onClose}>
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`badge ${
                isActive
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : phase.status === 'upcoming'
                    ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {isActive
                ? 'Đang áp dụng'
                : phase.status === 'upcoming'
                  ? `Bắt đầu sau ${phase.daysUntilStart} ngày`
                  : 'Đã kết thúc'}
            </span>
            <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {formatNumber(plan.dailyTargets?.calories, 0)} kcal/ngày
            </span>
            <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              P{formatNumber(plan.dailyTargets?.proteinG, 0)} · C
              {formatNumber(plan.dailyTargets?.carbsG, 0)} · F
              {formatNumber(plan.dailyTargets?.fatG, 0)}
              <InfoTip label="P / C / F" className="ml-1">
                Protein (đạm) / Carb (tinh bột, đường) / Fat (chất béo), gam mỗi ngày.
              </InfoTip>
            </span>
          </div>

          <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-white/[0.04]">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Sở thích
              </p>
              <p className="mt-1 text-slate-600 dark:text-slate-300">
                {plan.preferences?.mealsPerDay || 3} bữa/ngày ·{' '}
                {DIET_LABELS[plan.preferences?.dietStyle] || plan.preferences?.dietStyle} ·{' '}
                {BUDGET_LABELS[plan.preferences?.budget] || plan.preferences?.budget}
              </p>
              {(plan.preferences?.allergies || []).length > 0 && (
                <p className="mt-1 text-rose-500">Tránh: {plan.preferences.allergies.join(', ')}</p>
              )}
            </div>
            <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-white/[0.04]">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Chu kỳ thực đơn
              </p>
              <p className="mt-1 text-slate-600 dark:text-slate-300">
                7 ngày lặp lại · {SOURCE_LABELS[plan.source] || plan.source}
              </p>
              {plan.model && <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Model: {plan.model}</p>}
            </div>
          </div>

          {plan.cautions?.length > 0 && (
            <Alert tone="warning" className="mt-3">
              <ul className="list-disc space-y-1 pl-4">
                {plan.cautions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Alert>
          )}

          <div className="mt-3">
            <MealPlanDays cycleDays={plan.cycleDays} />
          </div>

          {plan.rationale && (
            <Card className="mt-3 border-brand-200 bg-brand-50/50 dark:border-brand-900 dark:bg-brand-950/20">
              <MarkdownText>{plan.rationale}</MarkdownText>
            </Card>
          )}

          {plan.evidence?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {plan.evidence.map((item) => (
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
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn-primary" onClick={() => onReview?.(plan)}>
              <Icon name="target" className="h-4 w-4" />
              Đánh giá theo tuần
            </button>
            {!isActive && phase.status !== 'ended' && (
              <button type="button" className="btn-secondary" onClick={() => onActivate?.(plan)}>
                <Icon name="check" className="h-4 w-4" />
                Áp dụng plan này
              </button>
            )}
            {plan.source === 'manual' && (
              <button type="button" className="btn-secondary" onClick={() => onEdit?.(plan)}>
                <Icon name="settings" className="h-4 w-4" />
                Sửa thực đơn
              </button>
            )}
            <button type="button" className="btn-ghost" onClick={onClose}>
              Đóng
            </button>
            <button
              type="button"
              className="btn-ghost ml-auto text-rose-500"
              onClick={() => onDelete?.(plan)}
            >
              <Icon name="trash" className="h-4 w-4" />
              Xóa plan
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
