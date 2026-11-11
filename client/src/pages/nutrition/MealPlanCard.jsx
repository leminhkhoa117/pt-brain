import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Badge, EmptyState, Icon, InfoTip, Panel, Spinner } from '../../components/ui.jsx';
import { activateMealPlan, deleteMealPlan, listMealPlans } from '../../api/mealPlans.js';
import { getErrorMessage } from '../../api/client.js';
import { formatDateKey, todayKey } from '../../lib/date.js';
import { formatNumber, GOAL_LABELS } from '../../lib/format.js';
import { mealPlanPhase } from '@shared/nutrition/mealPlan.js';
import AiMealPlanModal from './AiMealPlanModal.jsx';
import MealPlanDetailModal from './MealPlanDetailModal.jsx';
import MealPlanEditorModal from './MealPlanEditorModal.jsx';
import MealPlanReviewModal from './MealPlanReviewModal.jsx';

const MEAL_LABELS = {
  breakfast: 'Sáng',
  lunch: 'Trưa',
  dinner: 'Tối',
  snack: 'Phụ',
};

const SOURCE_LABELS = {
  ai: 'AI đề xuất',
  fallback: 'Phương án dự phòng',
  manual: 'Bạn tự tạo',
};

function PhaseBadge({ phase }) {
  if (!phase) return null;
  if (phase.status === 'upcoming') {
    return <Badge>Bắt đầu sau {phase.daysUntilStart} ngày</Badge>;
  }
  if (phase.status === 'ended') {
    return <Badge>Đã kết thúc</Badge>;
  }
  return <Badge tone="pine">Đang áp dụng · còn {phase.daysRemaining} ngày</Badge>;
}

export default function MealPlanCard() {
  const queryClient = useQueryClient();
  const [aiOpen, setAiOpen] = useState(false);
  const [editor, setEditor] = useState(null);
  const [reviewPlan, setReviewPlan] = useState(null);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const plansQuery = useQuery({ queryKey: ['meal-plans'], queryFn: listMealPlans });
  const plans = plansQuery.data?.plans || [];
  const active = plans.find((plan) => plan.status === 'active') || null;
  const today = plansQuery.data?.todayKey || todayKey();
  const phase = active ? mealPlanPhase(active.startDate, active.endDate, today) : null;
  const todayMenu =
    active && phase?.cycleIndex !== null && phase?.cycleIndex !== undefined
      ? active.cycleDays?.[phase.cycleIndex]
      : null;

  const activate = useMutation({
    mutationFn: (id) => activateMealPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      setNotice('Đã chọn kế hoạch ăn uống.');
      setError(null);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: (id) => deleteMealPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      setDetail(null);
      setNotice('Đã xóa kế hoạch ăn uống.');
      setError(null);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  return (
    <Panel
      className="mb-4"
      title="Kế hoạch ăn uống"
      note="Thực đơn mẫu 7 ngày lặp lại, chọn thời gian 7–90 ngày. AI đề xuất hoặc bạn tự nhập; mỗi tuần có thể đánh giá thực tế ăn so với plan."
      actions={
        active ? (
          <>
            <button type="button" className="btn-secondary" onClick={() => setEditor({})}>
              <Icon name="plus" className="h-3.5 w-3.5" />
              Tự tạo plan
            </button>
            <button type="button" className="btn-primary" onClick={() => setAiOpen(true)}>
              <Icon name="target" className="h-3.5 w-3.5" />
              AI đề xuất
            </button>
          </>
        ) : undefined
      }
    >
      {error && (
        <Alert tone="danger" className="mb-3">
          {error}
        </Alert>
      )}
      {notice && (
        <Alert tone="success" className="mb-3">
          {notice}
        </Alert>
      )}

      {plansQuery.isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : active ? (
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-[18px] font-semibold text-slate-900 dark:text-white">
                  {active.name}
                </h3>
                <PhaseBadge phase={phase} />
                <Badge>{SOURCE_LABELS[active.source] || active.source}</Badge>
              </div>
              <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">
                {formatDateKey(active.startDate, true)} → {formatDateKey(active.endDate, true)} ·{' '}
                {active.durationDays} ngày · {GOAL_LABELS[active.goal] || active.goal}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge tone="pine">{formatNumber(active.dailyTargets?.calories, 0)} kcal/ngày</Badge>
              <Badge tone="pine">
                P{formatNumber(active.dailyTargets?.proteinG, 0)} · C
                {formatNumber(active.dailyTargets?.carbsG, 0)} · F
                {formatNumber(active.dailyTargets?.fatG, 0)}
                <InfoTip label="P / C / F" className="ml-1">
                  P = protein (chất đạm), C = carb (tinh bột/đường), F = fat (chất béo), đơn vị gam
                  mỗi ngày theo plan.
                </InfoTip>
              </Badge>
            </div>
          </div>

          {phase?.status === 'active' && (
            <div className="mt-3">
              <div className="h-1 overflow-hidden rounded-sm bg-paper-2 dark:bg-white/[0.08]">
                <div
                  className="h-full bg-pine-700 dark:bg-pine-400"
                  style={{
                    width: `${Math.min(100, (phase.daysElapsed / phase.totalDays) * 100)}%`,
                  }}
                />
              </div>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                Ngày {phase.daysElapsed + 1}/{phase.totalDays} · chu kỳ 7 ngày
              </p>
            </div>
          )}

          {phase?.status === 'upcoming' && (
            <p className="mt-3 text-[12px] text-slate-500 dark:text-slate-400">
              Kế hoạch bắt đầu từ {formatDateKey(active.startDate, true)}. Bạn vẫn có thể xem thực
              đơn trước.
            </p>
          )}

          {phase?.status === 'ended' && (
            <p className="mt-3 text-[12px] text-slate-500 dark:text-slate-400">
              Kế hoạch đã hết hạn. Tạo kế hoạch mới hoặc chọn một kế hoạch còn hiệu lực bên dưới.
            </p>
          )}

          {todayMenu && (
            <div className="mt-4 border-t border-line pt-3 dark:border-white/[0.07]">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                  Thực đơn hôm nay · {todayMenu.label}
                </p>
                <span className="num text-[11px] text-slate-500 dark:text-slate-400">
                  {formatNumber(todayMenu.totals?.calories, 0)} kcal · P
                  {formatNumber(todayMenu.totals?.proteinG, 0)}
                </span>
              </div>
              <ul className="mt-2 divide-y divide-line/70 dark:divide-white/[0.06]">
                {(todayMenu.meals || []).map((meal, index) => (
                  <li
                    key={`${meal.type}-${index}`}
                    className="flex flex-wrap items-baseline justify-between gap-2 py-1.5 text-[12.5px]"
                  >
                    <span className="min-w-0 text-slate-700 dark:text-slate-300">
                      <span className="mr-2 font-mono text-[11px] uppercase tracking-[0.06em] text-pine-700 dark:text-pine-300">
                        {MEAL_LABELS[meal.type] || 'Bữa'}
                      </span>
                      {meal.name || (meal.foods || []).map((food) => food.name).join(', ')}
                    </span>
                    <span className="num text-[11px] text-slate-500 dark:text-slate-400">
                      {formatNumber(meal.totals?.calories, 0)} kcal
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3 dark:border-white/[0.07]">
            <button type="button" className="btn-primary btn-sm" onClick={() => setReviewPlan(active)}>
              <Icon name="target" className="h-3.5 w-3.5" />
              Đánh giá tuần
            </button>
            {active.source === 'manual' && (
              <button type="button" className="btn-secondary btn-sm" onClick={() => setEditor(active)}>
                <Icon name="settings" className="h-3.5 w-3.5" />
                Sửa plan
              </button>
            )}
            <button type="button" className="btn-secondary btn-sm" onClick={() => setDetail(active)}>
              Xem 7 ngày
            </button>
            <button
              type="button"
              className="btn-ghost btn-sm ml-auto text-vermilion-600 dark:text-vermilion-300"
              disabled={remove.isPending}
              onClick={() => {
                if (window.confirm(`Xóa kế hoạch “${active.name}”?`)) remove.mutate(active._id);
              }}
            >
              <Icon name="trash" className="h-3.5 w-3.5" />
              Xóa
            </button>
          </div>
        </div>
      ) : (
        <EmptyState
          icon="calendar"
          title="Chưa có kế hoạch ăn uống đang áp dụng"
          note="AI sẽ đề xuất thực đơn 7 ngày trong khoảng 7–90 ngày; hoặc bạn tự nhập thực đơn rồi áp dụng."
          action={
            <>
              <button type="button" className="btn-primary btn-sm" onClick={() => setAiOpen(true)}>
                <Icon name="target" className="h-3.5 w-3.5" />
                Tạo plan với AI
              </button>
              <button type="button" className="btn-ghost btn-sm" onClick={() => setEditor({})}>
                hoặc tự nhập thực đơn
              </button>
            </>
          }
        />
      )}

      {(plans.length > 1 || (!active && plans.length > 0)) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3 dark:border-white/[0.07]">
          <label
            htmlFor="meal-plan-select"
            className="font-mono text-[11px] uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400"
          >
            Plan đã lưu
          </label>
          <select
            id="meal-plan-select"
            className="select max-w-md"
            value={active?._id || ''}
            disabled={activate.isPending}
            onChange={(e) => {
              if (e.target.value) activate.mutate(e.target.value);
            }}
          >
            <option value="">— Chọn plan —</option>
            {plans.map((plan) => (
              <option key={plan._id} value={plan._id} disabled={plan.endDate < today}>
                {plan.name} · {formatDateKey(plan.startDate)}–{formatDateKey(plan.endDate)}
                {plan.endDate < today ? ' (đã kết thúc)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {plans.length > 0 && (
        <button
          type="button"
          className="mt-2 font-mono text-[11px] uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 underline-offset-2 hover:text-pine-700 hover:underline dark:hover:text-pine-300"
          onClick={() => setDetail(active || plans[0])}
        >
          Xem lại thực đơn của plan đã lưu
        </button>
      )}

      {aiOpen && (
        <AiMealPlanModal
          onClose={() => setAiOpen(false)}
          onSaved={(plan) => {
            setAiOpen(false);
            setDetail(plan);
            setNotice('Đã lưu và áp dụng kế hoạch ăn uống mới.');
            setError(null);
            queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
          }}
        />
      )}

      {detail && (
        <MealPlanDetailModal
          plan={detail}
          today={today}
          onClose={() => setDetail(null)}
          onActivate={(plan) => activate.mutate(plan._id)}
          onDelete={(plan) => {
            if (window.confirm(`Xóa kế hoạch “${plan.name}”?`)) remove.mutate(plan._id);
          }}
          onEdit={(plan) => {
            setDetail(null);
            setEditor(plan);
          }}
          onReview={(plan) => setReviewPlan(plan)}
        />
      )}

      {editor !== null && (
        <MealPlanEditorModal
          plan={editor._id ? editor : undefined}
          onClose={() => setEditor(null)}
          onSaved={(plan) => {
            setEditor(null);
            setDetail(plan);
            setNotice(
              plan.source === 'manual'
                ? 'Đã lưu kế hoạch tự tạo và áp dụng.'
                : 'Đã lưu và áp dụng kế hoạch ăn uống mới.',
            );
            setError(null);
            queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
          }}
        />
      )}

      {reviewPlan && <MealPlanReviewModal plan={reviewPlan} onClose={() => setReviewPlan(null)} />}
    </Panel>
  );
}
