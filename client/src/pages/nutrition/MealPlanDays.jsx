import { formatNumber } from '../../lib/format.js';

const MEAL_LABELS = {
  breakfast: 'Sáng',
  lunch: 'Trưa',
  dinner: 'Tối',
  snack: 'Phụ',
};

export default function MealPlanDays({ cycleDays = [] }) {
  if (!cycleDays.length) {
    return <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">Chưa có thực đơn.</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
        P = protein (đạm) · C = carb (tinh bột/đường) · F = fat (chất béo) · kcal = năng lượng.
      </p>
      {cycleDays.map((day, index) => (
        <details
          key={`${day.label}-${index}`}
          open={index === 0}
          className="group rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
        >
          <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 p-3 text-sm [&::-webkit-details-marker]:hidden">
            <span className="font-semibold text-slate-800 dark:text-slate-100">
              {day.label || `Ngày ${index + 1}`}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formatNumber(day.totals?.calories, 0)} kcal · P{formatNumber(day.totals?.proteinG)} ·
              C{formatNumber(day.totals?.carbsG)} · F{formatNumber(day.totals?.fatG)}
            </span>
          </summary>
          <div className="space-y-3 border-t border-slate-100 px-3 pb-3 pt-2 dark:border-white/[0.06]">
            {(day.meals || []).map((meal, mealIndex) => (
              <div key={`${meal.type}-${mealIndex}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                    {MEAL_LABELS[meal.type] || 'Bữa'}
                  </span>
                  {meal.name && (
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {meal.name}
                    </span>
                  )}
                  <span className="ml-auto text-[11px] text-slate-500 dark:text-slate-400">
                    {formatNumber(meal.totals?.calories, 0)} kcal
                  </span>
                </div>
                <ul className="mt-1 space-y-0.5">
                  {(meal.foods || []).map((food, foodIndex) => (
                    <li
                      key={`${food.name}-${foodIndex}`}
                      className="flex flex-wrap items-baseline justify-between gap-2 text-xs text-slate-500 dark:text-slate-400"
                    >
                      <span>
                        {food.name}
                        {food.portion ? <span className="text-slate-500 dark:text-slate-400"> · {food.portion}</span> : null}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {formatNumber(food.calories, 0)} kcal · P{formatNumber(food.proteinG)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-1 flex flex-wrap gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>
                    P{formatNumber(meal.totals?.proteinG)} · C{formatNumber(meal.totals?.carbsG)} · F
                    {formatNumber(meal.totals?.fatG)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
