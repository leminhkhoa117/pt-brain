import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, Card, Field, Icon, Spinner, Portal } from '../../components/ui.jsx';
import MarkdownText from '../../components/MarkdownText.jsx';
import { aiSuggestMealPlan, createMealPlan } from '../../api/mealPlans.js';
import { getErrorMessage } from '../../api/client.js';
import { useAuth } from '../../hooks/useAuth.jsx';
import { addDaysKey, daysBetween, formatDateKey, todayKey } from '../../lib/date.js';
import { GOAL_LABELS } from '../../lib/format.js';
import MealPlanDays from './MealPlanDays.jsx';

const DURATION_PRESETS = [
  { days: 7, label: '1 tuần' },
  { days: 14, label: '2 tuần' },
  { days: 28, label: '4 tuần' },
  { days: 56, label: '8 tuần' },
  { days: 90, label: '3 tháng' },
];

const DIET_STYLES = [
  { value: 'omnivore', label: 'Ăn đa dạng' },
  { value: 'high_protein', label: 'Ưu tiên đạm cao' },
  { value: 'vegetarian', label: 'Ăn chay (có trứng/sữa)' },
  { value: 'vegan', label: 'Thuần chay' },
  { value: 'pescatarian', label: 'Cá/hải sản' },
];

const BUDGETS = [
  { value: 'low', label: 'Tiết kiệm' },
  { value: 'medium', label: 'Trung bình' },
  { value: 'high', label: 'Thoải mái' },
];

const EMPTY_FORM = () => {
  const start = todayKey();
  return {
    name: '',
    goal: 'maintain',
    startDate: start,
    endDate: addDaysKey(start, 27),
    mealsPerDay: 3,
    dietStyle: 'omnivore',
    allergies: '',
    dislikes: '',
    budget: 'medium',
    cookingMinutes: 30,
    notes: '',
  };
};

function splitList(value = '') {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 20);
}

export default function AiMealPlanModal({ onClose, onSaved }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM(),
    goal: user?.profile?.goal || 'maintain',
  }));
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const today = todayKey();
  const durationDays = daysBetween(form.endDate, form.startDate) + 1;
  const dateError =
    !form.startDate || !form.endDate
      ? 'Chọn đủ ngày bắt đầu và kết thúc'
      : form.startDate < today
        ? 'Ngày bắt đầu không được trước hôm nay'
        : form.endDate < form.startDate
          ? 'Ngày kết thúc phải sau ngày bắt đầu'
          : durationDays < 7
            ? 'Cần ít nhất 7 ngày'
            : durationDays > 90
              ? 'Tối đa 90 ngày (3 tháng)'
              : null;

  const preferences = () => ({
    mealsPerDay: Number(form.mealsPerDay) || 3,
    dietStyle: form.dietStyle,
    allergies: splitList(form.allergies),
    dislikes: form.dislikes,
    budget: form.budget,
    cookingMinutes: Number(form.cookingMinutes) || 30,
    notes: form.notes,
  });

  const suggest = useMutation({
    mutationFn: () =>
      aiSuggestMealPlan({
        ...(form.name.trim() ? { name: form.name.trim() } : {}),
        goal: form.goal,
        startDate: form.startDate,
        endDate: form.endDate,
        ...preferences(),
      }),
    onSuccess: (data) => {
      setPreview(data);
      setError(null);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const save = useMutation({
    mutationFn: () =>
      createMealPlan({
        name: form.name.trim() || preview.name,
        goal: preview.goal,
        startDate: preview.startDate,
        endDate: preview.endDate,
        preferences: preferences(),
        cycleDays: preview.cycleDays.map((day) => ({
          label: day.label,
          meals: day.meals.map((meal) => ({
            type: meal.type,
            name: meal.name,
            foods: meal.foods.map((food) => ({
              name: food.name,
              portion: food.portion,
              calories: food.calories,
              proteinG: food.proteinG,
              carbsG: food.carbsG,
              fatG: food.fatG,
            })),
          })),
        })),
        rationale: preview.rationale,
        cautions: preview.cautions,
        evidenceIds: preview.evidenceIds,
        source: preview.source,
        model: preview.model,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      onSaved?.(data.plan);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const setStartDate = (value) => {
    setForm((prev) => {
      if (!value) return { ...prev, startDate: value };
      const maxEnd = addDaysKey(value, 89);
      const endDate =
        !prev.endDate || prev.endDate < value || prev.endDate > maxEnd
          ? addDaysKey(value, 27)
          : prev.endDate;
      return { ...prev, startDate: value, endDate };
    });
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 sm:items-center sm:p-4">
        <div className="max-h-[94vh] w-full overflow-auto rounded-t-lg bg-white p-5 shadow-overlay dark:bg-slate-900 sm:max-w-3xl sm:rounded-lg">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="mt-1 font-display text-[20px] font-semibold text-slate-900 dark:text-white">
                AI đề xuất kế hoạch ăn uống
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                AI lập thực đơn mẫu 7 ngày; calo/protein do code tính từ hồ sơ và cân nặng mới nhất.
                Bạn duyệt rồi mới lưu.
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

          {!preview ? (
            <>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="Tên plan (tùy chọn)">
                  <input
                    className="input"
                    placeholder="Để trống để AI đặt tên"
                    value={form.name}
                    maxLength={160}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </Field>
                <Field label="Mục tiêu">
                  <select
                    className="select"
                    value={form.goal}
                    onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
                  >
                    {Object.entries(GOAL_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Bắt đầu">
                  <input
                    type="date"
                    className="input"
                    value={form.startDate}
                    min={today}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </Field>
                <Field label="Kết thúc">
                  <input
                    type="date"
                    className="input"
                    value={form.endDate}
                    min={form.startDate || today}
                    max={form.startDate ? addDaysKey(form.startDate, 89) : undefined}
                    onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                  />
                </Field>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {DURATION_PRESETS.map((preset) => {
                  const presetEnd = addDaysKey(form.startDate || today, preset.days - 1);
                  const selected = form.endDate === presetEnd;
                  return (
                    <button
                      key={preset.days}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, endDate: presetEnd }))}
                      className={`inline-flex h-8 items-center rounded-md border px-2.5 text-[11px] font-medium transition-colors ${
                        selected
                          ? 'border-pine-600 bg-pine-50 text-pine-800 dark:border-pine-400/60 dark:bg-pine-950/50 dark:text-pine-200'
                          : 'border-line text-slate-600 hover:border-line-strong dark:border-white/10 dark:text-slate-400 dark:hover:border-white/20'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
                <span className={`text-[11px] ${dateError ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'}`}>
                  {dateError || `${durationDays} ngày`}
                </span>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Số bữa/ngày">
                  <select
                    className="select"
                    value={form.mealsPerDay}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, mealsPerDay: Number(e.target.value) }))
                    }
                  >
                    {[3, 4, 5].map((value) => (
                      <option key={value} value={value}>
                        {value} bữa
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Kiểu ăn">
                  <select
                    className="select"
                    value={form.dietStyle}
                    onChange={(e) => setForm((f) => ({ ...f, dietStyle: e.target.value }))}
                  >
                    {DIET_STYLES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Ngân sách">
                  <select
                    className="select"
                    value={form.budget}
                    onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                  >
                    {BUDGETS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Thời gian nấu (phút)">
                  <select
                    className="select"
                    value={form.cookingMinutes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, cookingMinutes: Number(e.target.value) }))
                    }
                  >
                    {[10, 20, 30, 45, 60, 90].map((value) => (
                      <option key={value} value={value}>
                        {value} phút
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Dị ứng / cần tránh">
                  <input
                    className="input"
                    placeholder="Ví dụ: đậu phộng, hải sản"
                    value={form.allergies}
                    maxLength={600}
                    onChange={(e) => setForm((f) => ({ ...f, allergies: e.target.value }))}
                  />
                </Field>
                <Field label="Món không thích">
                  <input
                    className="input"
                    placeholder="Ví dụ: nội tạng, rau đắng"
                    value={form.dislikes}
                    maxLength={1000}
                    onChange={(e) => setForm((f) => ({ ...f, dislikes: e.target.value }))}
                  />
                </Field>
              </div>

              <Field label="Ghi chú thêm" className="mt-3">
                <textarea
                  className="input min-h-[70px]"
                  placeholder="Lịch làm việc, ăn ngoài, món yêu thích, lưu ý tiêu hóa..."
                  value={form.notes}
                  maxLength={2000}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </Field>

              <button
                type="button"
                className="btn-primary mt-4"
                disabled={suggest.isPending || Boolean(dateError)}
                onClick={() => suggest.mutate()}
              >
                {suggest.isPending ? (
                  <Spinner className="h-4 w-4 text-white" />
                ) : (
                  <Icon name="target" className="h-4 w-4" />
                )}
                {suggest.isPending ? 'AI đang lập thực đơn 7 ngày...' : 'Để AI đề xuất'}
              </button>
              {suggest.isPending && (
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Có thể mất 30–120 giây. Không đóng cửa sổ trong lúc AI đang xử lý.
                </p>
              )}
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                Đây là gợi ý dinh dưỡng chung, không thay thế tư vấn y tế. Nếu có bệnh lý, dị ứng
                nặng hoặc đang mang thai, hãy hỏi bác sĩ/chuyên gia dinh dưỡng.
              </p>
            </>
          ) : (
            <>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  {preview.durationDays} ngày
                </span>
                <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {formatDateKey(preview.startDate, true)} → {formatDateKey(preview.endDate, true)}
                </span>
                <span
                  className={`badge ${
                    preview.source === 'ai'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {preview.source === 'ai' ? 'AI đề xuất' : 'Phương án dự phòng'}
                </span>
              </div>

              <div className="mt-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {form.name.trim() || preview.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {preview.dailyTargets.calories} kcal · P{preview.dailyTargets.proteinG} · C
                    {preview.dailyTargets.carbsG} · F{preview.dailyTargets.fatG}
                  </p>
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Khoảng calo mục tiêu: {preview.targetDetails?.calorieRange?.min}–
                  {preview.targetDetails?.calorieRange?.max} kcal/ngày · thực đơn 7 ngày lặp lại.
                </p>
              </div>

              {preview.cautions?.length > 0 && (
                <Alert tone="warning" className="mt-3">
                  <ul className="list-disc space-y-1 pl-4">
                    {preview.cautions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </Alert>
              )}

              <div className="mt-3">
                <MealPlanDays cycleDays={preview.cycleDays} />
              </div>

              {preview.rationale && (
                <Card className="mt-3 border-brand-200 bg-brand-50/50 dark:border-brand-900 dark:bg-brand-950/20">
                  <MarkdownText>{preview.rationale}</MarkdownText>
                </Card>
              )}

              {preview.evidence?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {preview.evidence.map((item) => (
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
                <button
                  type="button"
                  className="btn-primary"
                  disabled={save.isPending}
                  onClick={() => save.mutate()}
                >
                  {save.isPending ? (
                    <Spinner className="h-4 w-4 text-white" />
                  ) : (
                    <Icon name="check" className="h-4 w-4" />
                  )}
                  {save.isPending ? 'Đang lưu...' : 'Lưu & áp dụng plan'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={suggest.isPending}
                  onClick={() => {
                    setPreview(null);
                    suggest.mutate();
                  }}
                >
                  Tạo phương án khác
                </button>
                <button type="button" className="btn-ghost" onClick={() => setPreview(null)}>
                  Quay lại chỉnh
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Portal>
  );
}
