import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Card, Field, Icon, PageHeader, Spinner } from '../components/ui.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import {
  createMeal,
  deleteMeal,
  listMeals,
  mealPhotoUrl,
  mealSummary,
  updateMeal,
} from '../api/vision.js';
import { fetchSummary } from '../api/metrics.js';
import { getErrorMessage } from '../api/client.js';
import { compressImage } from '../lib/images.js';
import { formatDateKey, todayKey } from '../lib/date.js';
import { formatNumber, GOAL_LABELS } from '../lib/format.js';
import { calorieTarget } from '@shared/calculators/index.js';

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Bữa sáng' },
  { value: 'lunch', label: 'Bữa trưa' },
  { value: 'dinner', label: 'Bữa tối' },
  { value: 'snack', label: 'Bữa phụ' },
];

const CONFIDENCE = {
  high: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  low: 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

function Progress({ value, max, label, unit }) {
  const pct = Math.min(100, max ? (value / max) * 100 : 0);
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600 dark:text-slate-300">{label}</span>
        <span className="text-slate-500 dark:text-slate-400">
          {formatNumber(value, 0)} / {formatNumber(max, 0)} {unit}
        </span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-teal-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function NutritionPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [date, setDate] = useState(todayKey());
  const [mealType, setMealType] = useState('lunch');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const mealsQuery = useQuery({ queryKey: ['meals', date], queryFn: () => listMeals(date) });
  const summaryQuery = useQuery({
    queryKey: ['meal-summary', date],
    queryFn: () => mealSummary(date),
  });
  const metricsQuery = useQuery({
    queryKey: ['summary', 90],
    queryFn: () => fetchSummary(90),
  });

  const meals = mealsQuery.data?.meals || [];
  const totals = summaryQuery.data?.totals || { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 };
  const latest = metricsQuery.data?.latest;
  const goal = user?.profile?.goal || 'maintain';
  const tdee = latest?.computed?.tdee;
  const target = tdee ? calorieTarget(tdee, goal) : null;
  const proteinTarget = latest?.weightKg ? Math.round(latest.weightKg * 1.8) : null;

  const create = useMutation({
    mutationFn: async () => {
      const compressed = await compressImage(file);
      return createMeal({
        file: compressed,
        mealType,
        description,
        notes,
        dateKey: date,
      });
    },
    onSuccess: () => {
      setFile(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      setDescription('');
      setNotes('');
      setNotice('Đã phân tích và lưu bữa ăn.');
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['meals', date] });
      queryClient.invalidateQueries({ queryKey: ['meal-summary', date] });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: (id) => deleteMeal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals', date] });
      queryClient.invalidateQueries({ queryKey: ['meal-summary', date] });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const edit = useMutation({
    mutationFn: ({ id, payload }) => updateMeal(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['meals', date] }),
    onError: (err) => setError(getErrorMessage(err)),
  });

  const progress = useMemo(() => {
    if (!target) return null;
    return {
      calories: target.recommended,
      protein: proteinTarget,
    };
  }, [target, proteinTarget]);

  return (
    <div>
      <PageHeader
        title="Dinh dưỡng &amp; calo từ ảnh"
        subtitle="Chụp bữa ăn, AI ước tính món, khẩu phần và calo/macro. Lưu ảnh kèm thông tin để theo dõi cả ngày."
        actions={
          <input
            type="date"
            className="input max-w-[180px]"
            value={date}
            max={todayKey()}
            onChange={(e) => setDate(e.target.value || todayKey())}
          />
        }
      />

      {error && (
        <Alert tone="danger" className="mb-4">
          {error}
        </Alert>
      )}
      {notice && (
        <Alert tone="success" className="mb-4">
          {notice}
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Thêm bữa ăn</h2>
          <div className="mt-3 space-y-3">
            <Field label="Loại bữa">
              <select
                className="input"
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                disabled={create.isPending}
              >
                {MEAL_TYPES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Ảnh bữa ăn">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="block w-full text-xs text-slate-500 file:mr-2 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-brand-700 dark:file:bg-brand-950 dark:file:text-brand-300"
                onChange={(e) => {
                  const selected = e.target.files?.[0] || null;
                  if (preview) URL.revokeObjectURL(preview);
                  setFile(selected);
                  setPreview(selected ? URL.createObjectURL(selected) : null);
                  setError(null);
                }}
              />
            </Field>

            {preview && (
              <img src={preview} alt="Bữa ăn" className="h-40 w-full rounded-xl object-cover" />
            )}

            <Field label="Mô tả (tùy chọn)">
              <input
                className="input"
                placeholder="Cơm gà, 1 bát cơm, ức gà áp chảo..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
              />
            </Field>

            <Field label="Ghi chú">
              <input
                className="input"
                placeholder="Ăn ngoài, có sốt, ước lượng..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={2000}
              />
            </Field>

            <button
              type="button"
              className="btn-primary w-full"
              disabled={!file || create.isPending}
              onClick={() => create.mutate()}
            >
              {create.isPending ? <Spinner className="h-4 w-4 text-white" /> : <Icon name="flame" className="h-4 w-4" />}
              {create.isPending ? 'AI đang ước tính...' : 'Phân tích & lưu bữa ăn'}
            </button>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Calo từ ảnh là ước lượng, sai số có thể lớn do khẩu phần, dầu mỡ và món hỗn hợp. Dùng như
              hướng dẫn, không phải phép đo chính xác.
            </p>
          </div>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Tổng hôm nay
                </h2>
                <p className="text-xs text-slate-400">
                  {formatDateKey(date, true)} · {summaryQuery.data?.meals || 0} bữa · mục tiêu{' '}
                  {GOAL_LABELS[goal]}
                </p>
              </div>
              {target && (
                <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  {formatNumber(target.min, 0)}–{formatNumber(target.max, 0)} kcal
                </span>
              )}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Progress
                label="Calo"
                value={totals.calories}
                max={progress?.calories || 0}
                unit="kcal"
              />
              <Progress
                label="Protein"
                value={totals.proteinG}
                max={progress?.protein || 0}
                unit="g"
              />
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              {[
                ['Protein', totals.proteinG, 'g'],
                ['Carb', totals.carbsG, 'g'],
                ['Fat', totals.fatG, 'g'],
              ].map(([label, value, unit]) => (
                <div key={label} className="rounded-xl bg-slate-50 p-2 dark:bg-white/[0.04]">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                  <p className="mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-100">
                    {formatNumber(value, 0)} {unit}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-3">
            {meals.map((meal) => (
              <Card key={meal._id}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {MEAL_TYPES.find((t) => t.value === meal.mealType)?.label || 'Bữa ăn'}
                      </span>
                      <span className={`badge ${CONFIDENCE[meal.analysis?.confidence] || CONFIDENCE.low}`}>
                        Tin cậy {meal.analysis?.confidence || 'low'}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatNumber(meal.analysis?.totals?.calories, 0)} kcal
                      </span>
                    </div>
                    {meal.description && (
                      <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {meal.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="btn-ghost !px-2 !py-1 text-xs"
                      onClick={() => {
                        const value = window.prompt('Sửa ghi chú bữa ăn', meal.notes || '');
                        if (value !== null) edit.mutate({ id: meal._id, payload: { notes: value } });
                      }}
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      className="btn-ghost !px-2 !py-1 text-xs text-rose-500"
                      onClick={() => {
                        if (window.confirm('Xóa bữa ăn này?')) remove.mutate(meal._id);
                      }}
                    >
                      <Icon name="trash" className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  {meal.image?.filename && (
                    <img
                      src={mealPhotoUrl(meal._id)}
                      alt={meal.description || 'Bữa ăn'}
                      loading="lazy"
                      className="h-32 w-full rounded-xl object-cover sm:w-44"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {(meal.analysis?.items || []).map((item, index) => (
                        <div
                          key={`${item.name}-${index}`}
                          className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs dark:bg-white/[0.04]"
                        >
                          <p className="font-semibold text-slate-700 dark:text-slate-200">
                            {item.name} · {item.portion}
                          </p>
                          <p className="text-slate-400">
                            {formatNumber(item.calories, 0)} kcal · P{formatNumber(item.proteinG, 0)} ·
                            C{formatNumber(item.carbsG, 0)} · F{formatNumber(item.fatG, 0)}
                          </p>
                        </div>
                      ))}
                    </div>
                    {meal.analysis?.assumptions?.length > 0 && (
                      <p className="mt-2 text-[11px] text-slate-400">
                        Giả định: {meal.analysis.assumptions.join('; ')}.
                      </p>
                    )}
                    {meal.notes && <p className="mt-1 text-xs text-slate-500">{meal.notes}</p>}
                  </div>
                </div>
              </Card>
            ))}

            {!meals.length && (
              <Card className="py-10 text-center text-sm text-slate-400">
                Chưa có bữa ăn nào trong ngày. Chụp ảnh bữa ăn để AI ước tính calo.
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
