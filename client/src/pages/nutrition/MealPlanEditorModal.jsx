import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { Alert, Field, Icon, Spinner, Portal } from '../../components/ui.jsx';
import { createMealPlan, updateMealPlan } from '../../api/mealPlans.js';
import { getErrorMessage } from '../../api/client.js';
import { addDaysKey, daysBetween, formatDateKey, todayKey } from '../../lib/date.js';
import { formatNumber, GOAL_LABELS } from '../../lib/format.js';
import { sumFoods, sumMeals } from '@shared/nutrition/mealPlan.js';

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Sáng' },
  { value: 'lunch', label: 'Trưa' },
  { value: 'dinner', label: 'Tối' },
  { value: 'snack', label: 'Phụ' },
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

const DURATION_PRESETS = [7, 14, 28, 56, 90];

const emptyFood = () => ({
  name: '',
  portion: '',
  calories: 0,
  proteinG: 0,
  carbsG: 0,
  fatG: 0,
});

const emptyMeal = (type = 'breakfast') => ({ type, name: '', foods: [emptyFood()] });

const emptyDay = (index) => ({
  label: `Ngày ${index + 1}`,
  meals: [emptyMeal('breakfast'), emptyMeal('lunch'), emptyMeal('dinner')],
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function splitList(value = '') {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 20);
}

function draftFromPlan(plan) {
  if (!plan) {
    const start = todayKey();
    return {
      name: '',
      goal: 'maintain',
      startDate: start,
      endDate: addDaysKey(start, 27),
      preferences: {
        mealsPerDay: 3,
        dietStyle: 'omnivore',
        allergies: [],
        dislikes: '',
        budget: 'medium',
        cookingMinutes: 30,
        notes: '',
      },
      cycleDays: Array.from({ length: 7 }, (_, index) => emptyDay(index)),
    };
  }
  return {
    name: plan.name || '',
    goal: plan.goal || 'maintain',
    startDate: plan.startDate,
    endDate: plan.endDate,
    preferences: {
      mealsPerDay: plan.preferences?.mealsPerDay || 3,
      dietStyle: plan.preferences?.dietStyle || 'omnivore',
      allergies: plan.preferences?.allergies || [],
      dislikes: plan.preferences?.dislikes || '',
      budget: plan.preferences?.budget || 'medium',
      cookingMinutes: plan.preferences?.cookingMinutes || 30,
      notes: plan.preferences?.notes || '',
    },
    cycleDays: Array.from({ length: 7 }, (_, index) => {
      const day = plan.cycleDays?.[index] || emptyDay(index);
      return {
        label: day.label || `Ngày ${index + 1}`,
        meals: (day.meals || []).map((meal) => ({
          type: meal.type || 'lunch',
          name: meal.name || '',
          foods: (meal.foods || []).map((food) => ({
            name: food.name || '',
            portion: food.portion || '',
            calories: food.calories || 0,
            proteinG: food.proteinG || 0,
            carbsG: food.carbsG || 0,
            fatG: food.fatG || 0,
          })),
        })),
      };
    }),
  };
}

export default function MealPlanEditorModal({ plan, onClose, onSaved }) {
  const queryClient = useQueryClient();
  const isNew = !plan?._id;
  const [draft, setDraft] = useState(() => draftFromPlan(plan));
  const [allergiesText, setAllergiesText] = useState(() =>
    (plan?.preferences?.allergies || []).join(', '),
  );
  const [dayIndex, setDayIndex] = useState(0);
  const [error, setError] = useState(null);

  const today = todayKey();
  const durationDays = daysBetween(draft.endDate, draft.startDate) + 1;
  const dateError =
    !draft.startDate || !draft.endDate
      ? 'Chọn đủ ngày bắt đầu và kết thúc'
      : draft.endDate < draft.startDate
        ? 'Ngày kết thúc phải sau ngày bắt đầu'
        : durationDays < 7
          ? 'Cần ít nhất 7 ngày'
          : durationDays > 90
            ? 'Tối đa 90 ngày (3 tháng)'
            : null;

  const dayTotals = useMemo(
    () => draft.cycleDays.map((day) => sumMeals(day.meals)),
    [draft.cycleDays],
  );
  const cycleAverage = useMemo(() => {
    const total = dayTotals.reduce(
      (sum, item) => ({
        calories: sum.calories + item.calories,
        proteinG: sum.proteinG + item.proteinG,
        carbsG: sum.carbsG + item.carbsG,
        fatG: sum.fatG + item.fatG,
      }),
      { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
    );
    return {
      calories: Math.round(total.calories / 7),
      proteinG: Math.round((total.proteinG / 7) * 10) / 10,
      carbsG: Math.round((total.carbsG / 7) * 10) / 10,
      fatG: Math.round((total.fatG / 7) * 10) / 10,
    };
  }, [dayTotals]);

  const setDay = (index, patch) =>
    setDraft((prev) => ({
      ...prev,
      cycleDays: prev.cycleDays.map((day, i) => (i === index ? { ...day, ...patch } : day)),
    }));

  const setMeal = (mealIndex, patch) =>
    setDay(dayIndex, {
      meals: draft.cycleDays[dayIndex].meals.map((meal, i) =>
        i === mealIndex ? { ...meal, ...patch } : meal,
      ),
    });

  const setFood = (mealIndex, foodIndex, patch) =>
    setDay(dayIndex, {
      meals: draft.cycleDays[dayIndex].meals.map((meal, i) =>
        i === mealIndex
          ? {
              ...meal,
              foods: meal.foods.map((food, f) => (f === foodIndex ? { ...food, ...patch } : food)),
            }
          : meal,
      ),
    });

  const addMeal = () => {
    if (draft.cycleDays[dayIndex].meals.length >= 6) return;
    setDay(dayIndex, {
      meals: [
        ...draft.cycleDays[dayIndex].meals,
        emptyMeal(MEAL_TYPES[Math.min(draft.cycleDays[dayIndex].meals.length, 3)].value),
      ],
    });
  };

  const removeMeal = (mealIndex) =>
    setDay(dayIndex, {
      meals: draft.cycleDays[dayIndex].meals.filter((_, i) => i !== mealIndex),
    });

  const addFood = (mealIndex) => {
    if (draft.cycleDays[dayIndex].meals[mealIndex].foods.length >= 12) return;
    setMeal(mealIndex, {
      foods: [...draft.cycleDays[dayIndex].meals[mealIndex].foods, emptyFood()],
    });
  };

  const removeFood = (mealIndex, foodIndex) =>
    setMeal(mealIndex, {
      foods: draft.cycleDays[dayIndex].meals[mealIndex].foods.filter((_, i) => i !== foodIndex),
    });

  const copyDay = () => {
    const source = draft.cycleDays[dayIndex];
    setDraft((prev) => ({
      ...prev,
      cycleDays: prev.cycleDays.map((day, index) =>
        index === dayIndex + 1 ? { ...clone(source), label: day.label } : day,
      ),
    }));
  };

  const save = useMutation({
    mutationFn: () => {
      if (draft.name.trim().length < 2) throw new Error('Tên plan cần ít nhất 2 ký tự.');
      if (dateError) throw new Error(dateError);
      const cycleDays = draft.cycleDays.map((day, index) => {
        const meals = day.meals
          .map((meal) => ({
            type: meal.type,
            name: meal.name.trim(),
            foods: meal.foods
              .filter((food) => food.name.trim())
              .map((food) => ({
                name: food.name.trim(),
                portion: food.portion.trim(),
                calories: Number(food.calories) || 0,
                proteinG: Number(food.proteinG) || 0,
                carbsG: Number(food.carbsG) || 0,
                fatG: Number(food.fatG) || 0,
              })),
          }))
          .filter((meal) => meal.foods.length > 0);
        if (!meals.length) throw new Error(`${day.label}: thêm ít nhất 1 món.`);
        return { label: day.label || `Ngày ${index + 1}`, meals };
      });

      const payload = {
        name: draft.name.trim(),
        goal: draft.goal,
        startDate: draft.startDate,
        endDate: draft.endDate,
        preferences: {
          ...draft.preferences,
          allergies: splitList(allergiesText),
        },
        cycleDays,
        rationale: 'Thực đơn do bạn tự xây dựng.',
        cautions: ['Mục tiêu calo/macro được tính bằng trung bình 7 ngày của thực đơn bạn nhập.'],
        evidenceIds: [],
        source: 'manual',
        model: '',
      };
      return isNew ? createMealPlan(payload) : updateMealPlan(plan._id, payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      onSaved?.(data.plan);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const selectedDay = draft.cycleDays[dayIndex];

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 sm:items-center sm:p-4">
        <div className="max-h-[94vh] w-full overflow-auto rounded-t-lg bg-white p-5 shadow-overlay dark:bg-slate-900 sm:max-w-4xl sm:rounded-lg">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="mt-1 font-display text-[20px] font-semibold text-slate-900 dark:text-white">
                {draft.name || 'Kế hoạch ăn uống của tôi'}
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Nhập 7 ngày thực đơn mẫu, chọn khoảng thời gian tối đa 3 tháng. Hệ thống lặp lại chu
                kỳ 7 ngày và tính mục tiêu calo/macro từ chính thực đơn này.
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

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Tên plan">
              <input
                className="input"
                placeholder="Ví dụ: Thực đơn tăng cơ 8 tuần"
                value={draft.name}
                maxLength={160}
                onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
              />
            </Field>
            <Field label="Mục tiêu">
              <select
                className="select"
                value={draft.goal}
                onChange={(e) => setDraft((prev) => ({ ...prev, goal: e.target.value }))}
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
                value={draft.startDate}
                min={isNew ? today : undefined}
                onChange={(e) => {
                  const value = e.target.value;
                  setDraft((prev) => ({
                    ...prev,
                    startDate: value,
                    endDate:
                      !prev.endDate || prev.endDate < value ? addDaysKey(value, 27) : prev.endDate,
                  }));
                }}
              />
            </Field>
            <Field label="Kết thúc">
              <input
                type="date"
                className="input"
                value={draft.endDate}
                min={draft.startDate || today}
                max={draft.startDate ? addDaysKey(draft.startDate, 89) : undefined}
                onChange={(e) => setDraft((prev) => ({ ...prev, endDate: e.target.value }))}
              />
            </Field>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {DURATION_PRESETS.map((days) => {
              const end = addDaysKey(draft.startDate || today, days - 1);
              const selected = draft.endDate === end;
              return (
                <button
                  key={days}
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, endDate: end }))}
                  className={clsx(
                    'rounded-full border px-2.5 py-1 text-[11px] font-semibold transition',
                    selected
                      ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                      : 'border-slate-200 text-slate-500 hover:border-brand-300 dark:border-slate-700 dark:text-slate-400',
                  )}
                >
                  {days === 90 ? '3 tháng' : days >= 28 ? `${days / 7} tuần` : `${days} ngày`}
                </button>
              );
            })}
            <span className={`text-[11px] ${dateError ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'}`}>
              {dateError || `${durationDays} ngày`}
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <Field label="Số bữa/ngày">
              <select
                className="select"
                value={draft.preferences.mealsPerDay}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    preferences: { ...prev.preferences, mealsPerDay: Number(e.target.value) },
                  }))
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
                value={draft.preferences.dietStyle}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    preferences: { ...prev.preferences, dietStyle: e.target.value },
                  }))
                }
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
                value={draft.preferences.budget}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    preferences: { ...prev.preferences, budget: e.target.value },
                  }))
                }
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
                value={draft.preferences.cookingMinutes}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    preferences: { ...prev.preferences, cookingMinutes: Number(e.target.value) },
                  }))
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
                placeholder="Đậu phộng, hải sản..."
                value={allergiesText}
                onChange={(e) => setAllergiesText(e.target.value)}
              />
            </Field>
            <Field label="Món không thích">
              <input
                className="input"
                placeholder="Nội tạng, rau đắng..."
                value={draft.preferences.dislikes}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    preferences: { ...prev.preferences, dislikes: e.target.value },
                  }))
                }
              />
            </Field>
          </div>

          <div className="mt-5 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Thực đơn mẫu 7 ngày
              </p>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                TB plan: {formatNumber(cycleAverage.calories, 0)} kcal · P
                {formatNumber(cycleAverage.proteinG, 0)} · C{formatNumber(cycleAverage.carbsG, 0)} ·
                F{formatNumber(cycleAverage.fatG, 0)}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap gap-1">
              {draft.cycleDays.map((day, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setDayIndex(index)}
                  className={clsx(
                    'rounded-lg px-2.5 py-1 text-[11px] font-semibold transition',
                    index === dayIndex
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/[0.06] dark:text-slate-300',
                  )}
                >
                  {day.label || `Ngày ${index + 1}`}
                  <span className="ml-1 text-[11px] font-normal opacity-80">
                    {formatNumber(dayTotals[index].calories, 0)} kcal
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <input
                className="input !py-1.5 max-w-[180px] text-xs"
                value={selectedDay.label}
                maxLength={40}
                onChange={(e) => setDay(dayIndex, { label: e.target.value })}
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {formatNumber(dayTotals[dayIndex].calories, 0)} kcal · P
                {formatNumber(dayTotals[dayIndex].proteinG, 0)} · C
                {formatNumber(dayTotals[dayIndex].carbsG, 0)} · F
                {formatNumber(dayTotals[dayIndex].fatG, 0)}
              </span>
              {dayIndex < 6 && (
                <button type="button" className="btn-ghost !py-1 text-[11px]" onClick={copyDay}>
                  <Icon name="cards" className="h-3.5 w-3.5" />
                  Chép sang ngày sau
                </button>
              )}
            </div>

            <div className="mt-3 space-y-3">
              {selectedDay.meals.map((meal, mealIndex) => (
                <div
                  key={mealIndex}
                  className="rounded-xl border border-slate-200 p-2.5 dark:border-slate-800"
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    <select
                      className="select !w-auto !py-1 text-xs"
                      value={meal.type}
                      onChange={(e) => setMeal(mealIndex, { type: e.target.value })}
                    >
                      {MEAL_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <input
                      className="input !py-1 text-xs sm:max-w-[240px]"
                      placeholder="Tên bữa (tùy chọn)"
                      value={meal.name}
                      maxLength={160}
                      onChange={(e) => setMeal(mealIndex, { name: e.target.value })}
                    />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {formatNumber(sumFoods(meal.foods).calories, 0)} kcal
                    </span>
                    <button
                      type="button"
                      className="btn-ghost ml-auto !px-1.5 !py-1 text-rose-500"
                      aria-label="Xóa bữa"
                      onClick={() => removeMeal(mealIndex)}
                    >
                      <Icon name="trash" className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mt-1.5 space-y-1.5">
                    <div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_repeat(4,minmax(0,0.55fr))_auto] gap-1 px-1 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 sm:grid">
                      <span>Món</span>
                      <span>Khẩu phần</span>
                      <span>kcal</span>
                      <span>P (g)</span>
                      <span>C (g)</span>
                      <span>F (g)</span>
                      <span />
                    </div>
                    {meal.foods.map((food, foodIndex) => (
                      <div
                        key={foodIndex}
                        className="grid grid-cols-2 gap-1 rounded-lg bg-slate-50 p-2 dark:bg-white/[0.03] sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_repeat(4,minmax(0,0.55fr))_auto] sm:bg-transparent sm:p-0 dark:sm:bg-transparent"
                      >
                        <input
                          className="input col-span-2 !py-1 text-xs sm:col-span-1"
                          placeholder="Tên món"
                          value={food.name}
                          maxLength={160}
                          onChange={(e) => setFood(mealIndex, foodIndex, { name: e.target.value })}
                        />
                        <input
                          className="input col-span-2 !py-1 text-xs sm:col-span-1"
                          placeholder="150 g / 1 bát"
                          value={food.portion}
                          maxLength={120}
                          onChange={(e) =>
                            setFood(mealIndex, foodIndex, { portion: e.target.value })
                          }
                        />
                        {[
                          ['calories', 'kcal'],
                          ['proteinG', 'P'],
                          ['carbsG', 'C'],
                          ['fatG', 'F'],
                        ].map(([key, label]) => (
                          <input
                            key={key}
                            type="number"
                            inputMode="decimal"
                            min="0"
                            step="0.1"
                            aria-label={label}
                            className="input !px-1.5 !py-1 text-xs"
                            value={food[key]}
                            onChange={(e) =>
                              setFood(mealIndex, foodIndex, { [key]: e.target.value })
                            }
                          />
                        ))}
                        <button
                          type="button"
                          className="btn-ghost !p-1 text-rose-500"
                          aria-label="Xóa món"
                          onClick={() => removeFood(mealIndex, foodIndex)}
                        >
                          <Icon name="trash" className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:underline dark:text-brand-400"
                    onClick={() => addFood(mealIndex)}
                  >
                    <Icon name="plus" className="h-3 w-3" />
                    Thêm món
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
              onClick={addMeal}
            >
              <Icon name="plus" className="h-3.5 w-3.5" />
              Thêm bữa
            </button>
          </div>

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
              {save.isPending ? 'Đang lưu...' : isNew ? 'Lưu & áp dụng plan' : 'Lưu thay đổi'}
            </button>
            <button type="button" className="btn-ghost" onClick={onClose}>
              Hủy
            </button>
            <span className="self-center text-[11px] text-slate-500 dark:text-slate-400">
              {formatDateKey(draft.startDate, true)} → {formatDateKey(draft.endDate, true)}
            </span>
          </div>
        </div>
      </div>
    </Portal>
  );
}
