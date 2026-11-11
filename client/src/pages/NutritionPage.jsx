import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Badge,
  EmptyState,
  Field,
  Icon,
  InfoTip,
  PageHeader,
  Panel,
  Segmented,
  Spinner,
} from '../components/ui.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import {
  createManualMeal,
  createMeal,
  deleteMeal,
  estimateMeal,
  listMeals,
  mealPhotoUrl,
  mealSummary,
  updateMeal,
} from '../api/vision.js';
import { listMealPlans } from '../api/mealPlans.js';
import { fetchSummary } from '../api/metrics.js';
import { getErrorMessage } from '../api/client.js';
import { compressImage } from '../lib/images.js';
import { formatDateKey, todayKey } from '../lib/date.js';
import { formatNumber, GOAL_LABELS } from '../lib/format.js';
import { calorieTarget } from '@shared/calculators/index.js';
import { mealPlanPhase } from '@shared/nutrition/mealPlan.js';
import MealPlanCard from './nutrition/MealPlanCard.jsx';

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Bữa sáng' },
  { value: 'lunch', label: 'Bữa trưa' },
  { value: 'dinner', label: 'Bữa tối' },
  { value: 'snack', label: 'Bữa phụ' },
];

const ENTRY_MODES = [
  { value: 'photo', label: 'AI đọc ảnh' },
  { value: 'estimate', label: 'AI tính calo' },
  { value: 'manual', label: 'Tự nhập calo' },
];

// Chế độ AI: người dùng chỉ nhập tên món + khối lượng (gram).
const EMPTY_ESTIMATE_ITEM = () => ({
  name: '',
  grams: '',
  portion: '',
  calories: '',
  proteinG: '',
  carbsG: '',
  fatG: '',
  per100g: null,
  autoScale: false,
});

// Chế độ tự nhập: người dùng tự điền calo/macro đã biết.
const EMPTY_MANUAL_ITEM = () => ({
  name: '',
  portion: '',
  calories: '',
  proteinG: '',
  carbsG: '',
  fatG: '',
});

const round1 = (value) => Math.round((Number(value) || 0) * 10) / 10;

const sumMacros = (list) =>
  list.reduce(
    (sum, item) => ({
      calories: sum.calories + (Number(item.calories) || 0),
      proteinG: sum.proteinG + (Number(item.proteinG) || 0),
      carbsG: sum.carbsG + (Number(item.carbsG) || 0),
      fatG: sum.fatG + (Number(item.fatG) || 0),
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  );

const CONFIDENCE_LABEL = {
  high: 'tin cậy cao',
  medium: 'tin cậy vừa',
  low: 'tin cậy thấp',
};

function Progress({ value, max, label, unit, info }) {
  const pct = Math.min(100, max ? (value / max) * 100 : 0);
  return (
    <div>
      <p className="metric-label">
        {label}
        {info && <InfoTip label={label}>{info}</InfoTip>}
      </p>
      <p className="mt-1 font-mono text-[21px] font-medium leading-none tracking-[-0.03em] tabular-nums text-slate-900 dark:text-slate-50">
        {formatNumber(value, 0)}
        <span className="ml-1 font-sans text-[11px] font-medium text-slate-500 dark:text-slate-400">
          {unit}
        </span>
      </p>
      {max ? (
        <>
          <div className="mt-2 h-1 overflow-hidden rounded-sm bg-paper-2 dark:bg-white/[0.08]">
            <div className="h-full bg-pine-700 dark:bg-pine-400" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1 font-mono text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
            / {formatNumber(max, 0)} {unit}
          </p>
        </>
      ) : (
        <p className="mt-2 font-mono text-[11px] text-slate-500 dark:text-slate-400">chưa có mục tiêu</p>
      )}
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
  const [mode, setMode] = useState('photo');
  const [estimateRows, setEstimateRows] = useState(() => [EMPTY_ESTIMATE_ITEM()]);
  const [manualItems, setManualItems] = useState(() => [EMPTY_MANUAL_ITEM()]);
  const [estimateMeta, setEstimateMeta] = useState(null);
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
  const mealPlansQuery = useQuery({ queryKey: ['meal-plans'], queryFn: listMealPlans });

  const meals = mealsQuery.data?.meals || [];
  const totals = summaryQuery.data?.totals || { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 };
  const latest = metricsQuery.data?.latest;
  const goal = user?.profile?.goal || 'maintain';
  const tdee = latest?.computed?.tdee;
  const target = tdee ? calorieTarget(tdee, goal) : null;
  const proteinTarget = latest?.weightKg ? Math.round(latest.weightKg * 1.8) : null;
  const activePlan = (mealPlansQuery.data?.plans || []).find((plan) => plan.status === 'active');
  const activePlanPhase = activePlan
    ? mealPlanPhase(
        activePlan.startDate,
        activePlan.endDate,
        mealPlansQuery.data?.todayKey || todayKey(),
      )
    : null;
  const planTargetToday = activePlanPhase?.status === 'active' ? activePlan.dailyTargets : null;

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

  const estimate = useMutation({
    mutationFn: () => {
      const valid = estimateRows
        .map((item) => ({ name: item.name.trim(), grams: Number(item.grams) }))
        .filter((item) => item.name && item.grams > 0);
      if (!valid.length) {
        throw new Error('Nhập tên món và khối lượng (gram) cho ít nhất 1 món.');
      }
      return estimateMeal({ mealType, items: valid, description, notes });
    },
    onSuccess: (data) => {
      const analysis = data?.analysis;
      if (!analysis?.items?.length) {
        setError('AI không trả về kết quả. Thử lại giúp mình.');
        return;
      }
      setEstimateRows(
        analysis.items.map((item) => ({
          name: item.name || '',
          grams: String(item.grams ?? ''),
          portion: item.portion || `${item.grams ?? ''} g`,
          calories: String(Math.round(Number(item.calories) || 0)),
          proteinG: String(round1(item.proteinG)),
          carbsG: String(round1(item.carbsG)),
          fatG: String(round1(item.fatG)),
          per100g: item.per100g || null,
          autoScale: Boolean(item.per100g),
        })),
      );
      setEstimateMeta({
        confidence: analysis.confidence || 'low',
        assumptions: analysis.assumptions || [],
        caveats: analysis.caveats || [],
        disclaimer: analysis.disclaimer || '',
      });
      setError(null);
      setNotice('AI đã ước tính calo. Kiểm tra, sửa nếu cần rồi bấm "Lưu bữa ăn".');
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const saveMeal = useMutation({
    mutationFn: ({ list, source }) => {
      const valid = list.filter((item) => item.name.trim());
      if (!valid.length) throw new Error('Thêm ít nhất 1 món có tên.');
      return createManualMeal({
        dateKey: date,
        mealType,
        description,
        notes,
        source,
        ...(source === 'ai' && estimateMeta
          ? {
              confidence: estimateMeta.confidence,
              assumptions: estimateMeta.assumptions.slice(0, 8),
            }
          : {}),
        items: valid.map((item) => ({
          name: item.name.trim(),
          portion:
            Number(item.grams) > 0
              ? `${Number(item.grams)} g`
              : item.portion.trim(),
          calories: Number(item.calories) || 0,
          proteinG: Number(item.proteinG) || 0,
          carbsG: Number(item.carbsG) || 0,
          fatG: Number(item.fatG) || 0,
        })),
      });
    },
    onSuccess: (_data, variables) => {
      if (variables.source === 'ai') setEstimateRows([EMPTY_ESTIMATE_ITEM()]);
      else setManualItems([EMPTY_MANUAL_ITEM()]);
      setEstimateMeta(null);
      setDescription('');
      setNotes('');
      setNotice('Đã lưu bữa ăn.');
      setError(null);
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
    const calories = planTargetToday?.calories || target?.recommended;
    const protein = planTargetToday?.proteinG || proteinTarget;
    if (!calories && !protein) return null;
    return {
      calories: calories || 0,
      protein: protein || 0,
    };
  }, [planTargetToday, target, proteinTarget]);

  const estimateTotals = useMemo(() => sumMacros(estimateRows), [estimateRows]);
  const manualTotals = useMemo(() => sumMacros(manualItems), [manualItems]);

  // Sửa khối lượng của dòng đã có kết quả AI → scale lại macro theo giá trị /100 g.
  const updateEstimateItem = (index, key, value) =>
    setEstimateRows((prev) =>
      prev.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        if (key === 'grams') {
          const grams = Number(value);
          if (item.autoScale && item.per100g && grams > 0) {
            const factor = grams / 100;
            return {
              ...item,
              grams: value,
              portion: `${grams} g`,
              calories: String(Math.round(item.per100g.calories * factor)),
              proteinG: String(round1(item.per100g.proteinG * factor)),
              carbsG: String(round1(item.per100g.carbsG * factor)),
              fatG: String(round1(item.per100g.fatG * factor)),
            };
          }
          return { ...item, grams: value };
        }
        if (['calories', 'proteinG', 'carbsG', 'fatG'].includes(key)) {
          return { ...item, [key]: value, autoScale: false };
        }
        return { ...item, [key]: value };
      }),
    );

  const removeEstimateItem = (index) =>
    setEstimateRows((prev) =>
      prev.length === 1 ? [EMPTY_ESTIMATE_ITEM()] : prev.filter((_, i) => i !== index),
    );

  const updateManualItem = (index, key, value) =>
    setManualItems((prev) =>
      prev.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)),
    );

  const removeManualItem = (index) =>
    setManualItems((prev) =>
      prev.length === 1 ? [EMPTY_MANUAL_ITEM()] : prev.filter((_, i) => i !== index),
    );

  return (
    <div>
      <PageHeader
        title="Dinh dưỡng"
        subtitle="Ghi bữa ăn bằng ảnh, bằng tên món + khối lượng, hoặc tự nhập calo. Số liệu dùng để đối chiếu với kế hoạch ăn uống theo tuần."
        actions={
          <>
            <input
              type="date"
              className="input max-w-[170px]"
              value={date}
              max={todayKey()}
              onChange={(e) => setDate(e.target.value || todayKey())}
            />
          </>
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

      <MealPlanCard />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Panel
          className="order-1 lg:order-2 lg:sticky lg:top-20 lg:self-start"
          title="Ghi bữa ăn"
          note="AI đọc ảnh, AI tính calo từ tên món + khối lượng, hoặc tự nhập calo."
        >
          <Segmented
            options={ENTRY_MODES}
            value={mode}
            onChange={(value) => {
              setMode(value);
              setError(null);
            }}
            className="mt-1 w-full"
          />

          <div className="mt-3 space-y-3">
            <Field label="Loại bữa">
              <select
                className="select"
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                disabled={create.isPending || saveMeal.isPending}
              >
                {MEAL_TYPES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>

            {mode === 'photo' ? (
              <>
                <Field label="Ảnh bữa ăn">
                  <label className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-line bg-paper-2/60 px-3 py-2.5 text-[12px] text-slate-500 transition-colors hover:border-pine-600 dark:border-white/15 dark:bg-white/[0.03] dark:text-slate-400">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-line bg-surface text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                      <Icon name="upload" className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-slate-700 dark:text-slate-200">
                        {file ? file.name : 'Chọn ảnh JPG / PNG / WebP'}
                      </span>
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                        {file ? 'Bấm để chọn ảnh khác' : 'Ảnh được nén trước khi gửi'}
                      </span>
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={(e) => {
                        const selected = e.target.files?.[0] || null;
                        if (preview) URL.revokeObjectURL(preview);
                        setFile(selected);
                        setPreview(selected ? URL.createObjectURL(selected) : null);
                        setError(null);
                      }}
                    />
                  </label>
                </Field>

                {preview && (
                  <img
                    src={preview}
                    alt="Bữa ăn"
                    className="h-40 w-full rounded-md border border-line object-cover dark:border-white/10"
                  />
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
                  {create.isPending ? (
                    <Spinner className="h-4 w-4 text-white" />
                  ) : (
                    <Icon name="flame" className="h-4 w-4" />
                  )}
                  {create.isPending ? 'AI đang ước tính...' : 'Phân tích & lưu bữa ăn'}
                </button>
                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  Calo từ ảnh là ước lượng, sai số có thể lớn do khẩu phần, dầu mỡ và món hỗn hợp.
                  Dùng như hướng dẫn, không phải phép đo chính xác.
                </p>
              </>
            ) : mode === 'estimate' ? (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="label !mb-0">Món + khối lượng (gram)</p>
                    <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-300">
                      {formatNumber(estimateTotals.calories, 0)} kcal
                    </span>
                  </div>
                  {estimateRows.map((item, index) => {
                    const hasMacros =
                      item.calories !== '' ||
                      item.proteinG !== '' ||
                      item.carbsG !== '' ||
                      item.fatG !== '';
                    return (
                      <div
                        key={index}
                        className="space-y-2 rounded-xl border border-slate-200 p-2.5 dark:border-slate-800"
                      >
                        <div className="flex items-center gap-1.5">
                          <input
                            className="input !py-1.5 text-xs"
                            placeholder="Tên món (VD: ức gà)"
                            value={item.name}
                            maxLength={160}
                            onChange={(e) => updateEstimateItem(index, 'name', e.target.value)}
                          />
                          <button
                            type="button"
                            className="btn-ghost !p-1.5 text-rose-500"
                            aria-label="Xóa món"
                            onClick={() => removeEstimateItem(index)}
                          >
                            <Icon name="trash" className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <label className="relative block">
                          <input
                            type="number"
                            inputMode="decimal"
                            min="1"
                            step="1"
                            className="input !py-1.5 pr-8 text-xs"
                            placeholder="Khối lượng"
                            value={item.grams}
                            onChange={(e) => updateEstimateItem(index, 'grams', e.target.value)}
                          />
                          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            gram
                          </span>
                        </label>
                        {hasMacros && (
                          <div className="grid grid-cols-4 gap-1.5">
                            {[
                              ['calories', 'kcal'],
                              ['proteinG', 'P (g)'],
                              ['carbsG', 'C (g)'],
                              ['fatG', 'F (g)'],
                            ].map(([key, label]) => (
                              <label key={key} className="text-[11px] text-slate-500 dark:text-slate-400">
                                <span className="mb-0.5 block font-semibold">{label}</span>
                                <input
                                  type="number"
                                  inputMode="decimal"
                                  min="0"
                                  step="0.1"
                                  className="input !px-2 !py-1.5 text-xs"
                                  value={item[key]}
                                  onChange={(e) => updateEstimateItem(index, key, e.target.value)}
                                />
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
                    onClick={() => setEstimateRows((prev) => [...prev, EMPTY_ESTIMATE_ITEM()])}
                  >
                    <Icon name="plus" className="h-3.5 w-3.5" />
                    Thêm món
                  </button>
                </div>

                {estimateMeta && (
                  <div className="rounded-xl border border-brand-200/70 bg-brand-50/70 p-2.5 dark:border-brand-900/60 dark:bg-brand-950/30">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-brand-700 dark:text-brand-300">
                        AI ước tính · tin cậy {estimateMeta.confidence}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {formatNumber(estimateTotals.calories, 0)} kcal
                      </span>
                    </div>
                    {estimateMeta.assumptions.length > 0 && (
                      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                        {estimateMeta.assumptions.slice(0, 3).map((text, index) => (
                          <li key={`${index}-${text}`}>{text}</li>
                        ))}
                      </ul>
                    )}
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                      Đây là ước lượng, có thể lệch do cách chế biến. Đổi khối lượng sẽ tự tính lại;
                      sửa tay calo/macro nếu bạn biết chính xác.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-slate-50 p-2 text-center text-[11px] dark:bg-white/[0.04]">
                  <span>
                    P <b>{formatNumber(estimateTotals.proteinG, 0)}</b> g
                  </span>
                  <span>
                    C <b>{formatNumber(estimateTotals.carbsG, 0)}</b> g
                  </span>
                  <span>
                    F <b>{formatNumber(estimateTotals.fatG, 0)}</b> g
                  </span>
                </div>

                <Field label="Mô tả / ghi chú (tùy chọn)">
                  <input
                    className="input"
                    placeholder="VD: ức gà áp chảo ít dầu, cơm gạo lứt..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={1000}
                  />
                </Field>

                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    className="btn-secondary w-full"
                    disabled={
                      estimate.isPending ||
                      !estimateRows.some((item) => item.name.trim() && Number(item.grams) > 0)
                    }
                    onClick={() => estimate.mutate()}
                  >
                    {estimate.isPending ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <Icon name="flame" className="h-4 w-4" />
                    )}
                    {estimate.isPending ? 'AI đang tính...' : 'AI tính calo'}
                  </button>
                  <button
                    type="button"
                    className="btn-primary w-full"
                    disabled={
                      saveMeal.isPending ||
                      !estimateRows.some((item) => item.name.trim() && item.calories !== '')
                    }
                    onClick={() => saveMeal.mutate({ list: estimateRows, source: 'ai' })}
                  >
                    {saveMeal.isPending ? (
                      <Spinner className="h-4 w-4 text-white" />
                    ) : (
                      <Icon name="check" className="h-4 w-4" />
                    )}
                    {saveMeal.isPending ? 'Đang lưu...' : 'Lưu bữa ăn'}
                  </button>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  Nhập tên món + khối lượng rồi bấm “AI tính calo”. Kết quả là ước lượng; bạn có thể
                  sửa từng dòng trước khi lưu.
                </p>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="label !mb-0">Món và calo bạn tự nhập</p>
                    <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-300">
                      {formatNumber(manualTotals.calories, 0)} kcal
                    </span>
                  </div>
                  {manualItems.map((item, index) => (
                    <div
                      key={index}
                      className="space-y-2 rounded-xl border border-slate-200 p-2.5 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-1.5">
                        <input
                          className="input !py-1.5 text-xs"
                          placeholder="Tên món (VD: cơm gà)"
                          value={item.name}
                          maxLength={160}
                          onChange={(e) => updateManualItem(index, 'name', e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn-ghost !p-1.5 text-rose-500"
                          aria-label="Xóa món"
                          onClick={() => removeManualItem(index)}
                        >
                          <Icon name="trash" className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <input
                        className="input !py-1.5 text-xs"
                        placeholder="Khẩu phần (VD: 1 bát, 150 g)"
                        value={item.portion}
                        maxLength={120}
                        onChange={(e) => updateManualItem(index, 'portion', e.target.value)}
                      />
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          ['calories', 'kcal'],
                          ['proteinG', 'P (g)'],
                          ['carbsG', 'C (g)'],
                          ['fatG', 'F (g)'],
                        ].map(([key, label]) => (
                          <label key={key} className="text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="mb-0.5 block font-semibold">{label}</span>
                            <input
                              type="number"
                              inputMode="decimal"
                              min="0"
                              step="0.1"
                              className="input !px-2 !py-1.5 text-xs"
                              placeholder="0"
                              value={item[key]}
                              onChange={(e) => updateManualItem(index, key, e.target.value)}
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
                    onClick={() => setManualItems((prev) => [...prev, EMPTY_MANUAL_ITEM()])}
                  >
                    <Icon name="plus" className="h-3.5 w-3.5" />
                    Thêm món
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-slate-50 p-2 text-center text-[11px] dark:bg-white/[0.04]">
                  <span>
                    P <b>{formatNumber(manualTotals.proteinG, 0)}</b> g
                  </span>
                  <span>
                    C <b>{formatNumber(manualTotals.carbsG, 0)}</b> g
                  </span>
                  <span>
                    F <b>{formatNumber(manualTotals.fatG, 0)}</b> g
                  </span>
                </div>

                <Field label="Mô tả / ghi chú (tùy chọn)">
                  <input
                    className="input"
                    placeholder="Ăn ngoài, có sốt, ước lượng..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={1000}
                  />
                </Field>

                <button
                  type="button"
                  className="btn-primary w-full"
                  disabled={
                    saveMeal.isPending ||
                    !manualItems.some((item) => item.name.trim() && item.calories !== '')
                  }
                  onClick={() => saveMeal.mutate({ list: manualItems, source: 'manual' })}
                >
                  {saveMeal.isPending ? (
                    <Spinner className="h-4 w-4 text-white" />
                  ) : (
                    <Icon name="check" className="h-4 w-4" />
                  )}
                  {saveMeal.isPending ? 'Đang lưu...' : 'Lưu bữa ăn'}
                </button>
                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  Không gọi AI. Nhập calo bạn đã biết; P/C/F có thể để 0 nếu chỉ cần calo.
                </p>
              </>
            )}
          </div>
        </Panel>

        <div className="order-2 space-y-4 lg:order-1">
          <Panel
            title="Tổng hôm nay"
            note={`${formatDateKey(date, true)} · ${summaryQuery.data?.meals || 0} bữa · mục tiêu ${GOAL_LABELS[goal]}${
              planTargetToday ? ` · theo plan “${activePlan.name}”` : ''
            }`}
            actions={
              planTargetToday ? (
                <Badge tone="pine">
                  {formatNumber(planTargetToday.calories, 0)} kcal · P
                  {formatNumber(planTargetToday.proteinG, 0)}
                </Badge>
              ) : (
                target && (
                  <Badge tone="pine">
                    {formatNumber(target.min, 0)}–{formatNumber(target.max, 0)} kcal
                  </Badge>
                )
              )
            }
          >
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line dark:border-white/[0.08] dark:bg-white/[0.08] lg:grid-cols-4">
              <div className="bg-surface p-3 dark:bg-[#151b18]">
                <Progress
                  label="Calo"
                  value={totals.calories}
                  max={progress?.calories || 0}
                  unit="kcal"
                  info="Năng lượng ăn vào trong ngày (kcal). Mục tiêu lấy từ plan đang áp dụng, nếu không có thì từ TDEE và mục tiêu cân nặng."
                />
              </div>
              <div className="bg-surface p-3 dark:bg-[#151b18]">
                <Progress
                  label="Protein"
                  value={totals.proteinG}
                  max={progress?.protein || 0}
                  unit="g"
                  info="Chất đạm (gam). Mục tiêu tham khảo 1,6–2,2 g/kg cân nặng/ngày, ưu tiên đủ đạm khi giảm mỡ."
                />
              </div>
              <div className="bg-surface p-3 dark:bg-[#151b18]">
                <Progress
                  label="Carb"
                  value={totals.carbsG}
                  max={0}
                  unit="g"
                  info="Carbohydrat (tinh bột/đường) – nguồn năng lượng chính cho tập luyện."
                />
              </div>
              <div className="bg-surface p-3 dark:bg-[#151b18]">
                <Progress
                  label="Fat"
                  value={totals.fatG}
                  max={0}
                  unit="g"
                  info="Chất béo – cần cho hormone và hấp thu vitamin; nên ≥0,6 g/kg/ngày."
                />
              </div>
            </div>
          </Panel>

          <Panel
            title="Bữa ăn trong ngày"
            note={`${meals.length} bữa · ${formatDateKey(date, true)}`}
            flush
          >
            {meals.length ? (
              <ul className="divide-y divide-line dark:divide-white/[0.07]">
                {meals.map((meal) => (
                  <li key={meal._id} className="px-4 py-3.5 sm:px-5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge>
                            {MEAL_TYPES.find((t) => t.value === meal.mealType)?.label || 'Bữa ăn'}
                          </Badge>
                          <Badge tone={meal.source === 'manual' ? 'neutral' : 'pine'}>
                            {meal.source === 'manual'
                              ? 'Tự nhập'
                              : `AI · ${CONFIDENCE_LABEL[meal.analysis?.confidence] || 'tin cậy thấp'}`}
                          </Badge>
                          <span className="num text-[11px] text-slate-500 dark:text-slate-400">
                            {formatNumber(meal.analysis?.totals?.calories, 0)} kcal
                          </span>
                        </div>
                        {meal.description && (
                          <p className="mt-1.5 text-[13px] font-medium text-slate-800 dark:text-slate-100">
                            {meal.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          className="btn-ghost btn-sm"
                          onClick={() => {
                            const value = window.prompt('Sửa ghi chú bữa ăn', meal.notes || '');
                            if (value !== null)
                              edit.mutate({ id: meal._id, payload: { notes: value } });
                          }}
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          className="btn-ghost btn-sm text-vermilion-600 dark:text-vermilion-300"
                          aria-label="Xóa bữa ăn"
                          onClick={() => {
                            if (window.confirm('Xóa bữa ăn này?')) remove.mutate(meal._id);
                          }}
                        >
                          <Icon name="trash" className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-2.5 flex flex-col gap-3 sm:flex-row">
                      {meal.image?.filename && (
                        <img
                          src={mealPhotoUrl(meal._id)}
                          alt={meal.description || 'Bữa ăn'}
                          loading="lazy"
                          className="h-24 w-full rounded-md border border-line object-cover sm:w-32 dark:border-white/10"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="divide-y divide-line/70 dark:divide-white/[0.05]">
                          {(meal.analysis?.items || []).map((item, index) => (
                            <div
                              key={`${item.name}-${index}`}
                              className="flex items-baseline justify-between gap-3 py-1 text-[12px]"
                            >
                              <span className="min-w-0 truncate text-slate-700 dark:text-slate-300">
                                {item.name}
                                {item.portion ? (
                                  <span className="text-slate-500 dark:text-slate-400"> · {item.portion}</span>
                                ) : null}
                              </span>
                              <span className="num shrink-0 text-[11px] text-slate-500 dark:text-slate-400">
                                {formatNumber(item.calories, 0)} kcal · P
                                {formatNumber(item.proteinG, 0)} C{formatNumber(item.carbsG, 0)} F
                                {formatNumber(item.fatG, 0)}
                              </span>
                            </div>
                          ))}
                        </div>
                        {meal.analysis?.assumptions?.length > 0 && (
                          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                            Giả định: {meal.analysis.assumptions.join('; ')}
                          </p>
                        )}
                        {meal.notes && (
                          <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">
                            {meal.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon="utensils"
                title="Chưa có bữa ăn nào trong ngày"
                note="Dùng form bên cạnh để ghi bữa đầu tiên bằng ảnh, bằng tên món + khối lượng, hoặc tự nhập calo."
              />
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
