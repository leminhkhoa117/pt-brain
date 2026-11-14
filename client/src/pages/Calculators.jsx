import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Card, EmptyState, Field, Icon, InfoTip, PageHeader, Segmented, Spinner } from '../components/ui.jsx';
import { useDialog } from '../components/DialogProvider.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { fetchSummary, saveMetric } from '../api/metrics.js';
import { clearCalcHistory, deleteCalcHistory, fetchCalcHistory, runCalc } from '../api/calc.js';
import { getErrorMessage } from '../api/client.js';
import {
  bmi,
  bmrMifflinStJeor,
  calorieTarget,
  estimateOneRepMax,
  ffmi,
  hrZones,
  leanBodyMass,
  macroSplit,
  navyBodyFat,
  percent1RMTable,
  tdeeFromBmr,
} from '@shared/calculators/index.js';
import { ACTIVITY_LABELS, GOAL_LABELS, formatNumber } from '../lib/format.js';
import { computeAge, todayKey } from '../lib/date.js';

const TABS = [
  { value: '1rm', label: '1RM & tạ tập' },
  { value: 'calories', label: 'Calo & macro' },
  { value: 'body', label: 'Thành phần cơ thể' },
  { value: 'hr', label: 'Nhịp tim' },
];

const HISTORY_FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'one-rep-max', label: '1RM' },
  { value: 'macro', label: 'Calo & macro' },
];

const HISTORY_TYPE_LABELS = {
  'one-rep-max': '1RM',
  macro: 'Macro',
};

const formatHistoryDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

function describeHistoryItem(item) {
  const input = item.inputs || {};
  const output = item.outputs || {};

  if (item.type === 'one-rep-max') {
    return {
      label: HISTORY_TYPE_LABELS[item.type],
      title: `${formatNumber(input.weightKg, 1)} kg × ${formatNumber(input.reps, 0)} reps → 1RM trung bình ${formatNumber(output.average, 1)} kg`,
      detail: `Epley ${formatNumber(output.epley, 1)} kg · Brzycki ${formatNumber(output.brzycki, 1)} kg${
        output.reliable === false ? ' · reps cao, độ chính xác giảm' : ''
      }`,
    };
  }

  if (item.type === 'macro') {
    return {
      label: HISTORY_TYPE_LABELS[item.type],
      title: `${formatNumber(input.calories, 0)} kcal · P ${formatNumber(output.proteinG, 0)} g · F ${formatNumber(output.fatG, 0)} g · C ${formatNumber(output.carbG, 0)} g`,
      detail: `${formatNumber(input.weightKg, 1)} kg · protein ${formatNumber(input.proteinPerKg, 2)} g/kg · fat ${formatNumber(input.fatPerKg, 2)} g/kg${
        output.feasible === false ? ' · calo thấp hơn mức tối thiểu' : ''
      }`,
    };
  }

  return {
    label: HISTORY_TYPE_LABELS[item.type] || item.type || 'Khác',
    title: 'Kết quả đã lưu',
    detail: '',
  };
}

const num = (v) => (v === '' || v == null ? undefined : Number(v));

function NumberField({ label, value, onChange, hint, error, ...props }) {
  return (
    <Field label={label} hint={hint} error={error}>
      <input
        className="input"
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      />
    </Field>
  );
}

export default function Calculators() {
  const dialog = useDialog();
  const { user, age: authAge } = useAuth();
  const queryClient = useQueryClient();
  const profile = user?.profile || {};
  const [tab, setTab] = useState('1rm');
  const [notice, setNotice] = useState(null);

  const { data: summary } = useQuery({
    queryKey: ['summary', 90],
    queryFn: () => fetchSummary(90),
  });
  const latest = summary?.latest;

  const historyQuery = useQuery({
    queryKey: ['calc-history'],
    queryFn: fetchCalcHistory,
  });
  const history = historyQuery.data?.history || [];
  const [historyFilter, setHistoryFilter] = useState('all');

  const [common, setCommon] = useState({
    sex: profile.sex || 'male',
    heightCm: profile.heightCm ?? '',
    weightKg: latest?.weightKg ?? profile.weightKg ?? '',
    age: authAge ?? (profile.birthDate ? computeAge(profile.birthDate) : ''),
    activityLevel: profile.activityLevel || 'moderate',
    goal: profile.goal || 'maintain',
  });

  useEffect(() => {
    const fallbackWeight = latest?.weightKg ?? profile.weightKg;
    if (!fallbackWeight) return;
    setCommon((prev) => (prev.weightKg === '' ? { ...prev, weightKg: fallbackWeight } : prev));
  }, [latest?.weightKg, profile.weightKg]);

  const set = (key) => (e) => {
    const { value } = e.target;
    setCommon((prev) => ({ ...prev, [key]: value }));
  };

  const saveHistory = useMutation({
    mutationFn: ({ type, input }) => runCalc(type, input, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calc-history'] });
      setNotice({ tone: 'success', text: 'Đã lưu kết quả vào lịch sử tính toán.' });
    },
    onError: (error) => setNotice({ tone: 'danger', text: getErrorMessage(error) }),
  });

  const deleteHistory = useMutation({
    mutationFn: (id) => deleteCalcHistory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calc-history'] });
      setNotice({ tone: 'success', text: 'Đã xóa một bản ghi lịch sử.' });
    },
    onError: (error) => setNotice({ tone: 'danger', text: getErrorMessage(error) }),
  });

  const clearHistory = useMutation({
    mutationFn: clearCalcHistory,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['calc-history'] });
      setNotice({
        tone: 'success',
        text: `Đã xóa ${formatNumber(data?.deleted || 0, 0)} bản ghi lịch sử.`,
      });
    },
    onError: (error) => setNotice({ tone: 'danger', text: getErrorMessage(error) }),
  });

  const saveBody = useMutation({
    mutationFn: (payload) => saveMetric(todayKey(), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      queryClient.invalidateQueries({ queryKey: ['metric'] });
      setNotice({ tone: 'success', text: 'Đã lưu số đo vào hôm nay và cập nhật chỉ số.' });
    },
    onError: (error) => setNotice({ tone: 'danger', text: getErrorMessage(error) }),
  });

  const weight = num(common.weightKg);
  const height = num(common.heightCm);
  const age = num(common.age);

  return (
    <div>
      <PageHeader
        title="Máy tính chỉ số"
        subtitle="Tính tức thì ngay trên máy bạn. Các con số chỉ là ước lượng, không thay thế tư vấn y tế."
        actions={
          history.length ? (
            <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              Đã lưu {history.length} kết quả
            </span>
          ) : null
        }
      />

      {notice && (
        <Alert tone={notice.tone} className="mb-4">
          {notice.text}
        </Alert>
      )}

      <Card className="mb-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="Giới tính">
            <select className="select" value={common.sex} onChange={set('sex')}>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
            </select>
          </Field>
          <NumberField
            label="Chiều cao (cm)"
            value={common.heightCm}
            onChange={(value) => setCommon((prev) => ({ ...prev, heightCm: value }))}
            min="100"
            max="250"
            placeholder="175"
          />
          <NumberField
            label="Cân nặng (kg)"
            value={common.weightKg}
            onChange={(value) => setCommon((prev) => ({ ...prev, weightKg: value }))}
            min="20"
            max="400"
            step="0.1"
            placeholder="72.5"
          />
          <NumberField
            label="Tuổi"
            value={common.age}
            onChange={(value) => setCommon((prev) => ({ ...prev, age: value }))}
            min="14"
            max="100"
            placeholder="28"
          />
          <Field label="Mức vận động">
            <select className="select" value={common.activityLevel} onChange={set('activityLevel')}>
              {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Thông tin được lấy từ lần cân gần nhất hoặc hồ sơ của bạn. Thay đổi ở đây chỉ dùng để tính
          nhanh, không ghi đè hồ sơ.
        </p>
      </Card>

      <div className="mb-4 overflow-x-auto">
        <Segmented options={TABS} value={tab} onChange={setTab} />
      </div>

      {tab === '1rm' && (
        <OneRepMax
          defaultWeight={common.weightKg}
          onSave={(payload) => saveHistory.mutate({ type: 'one-rep-max', input: payload })}
          isSaving={saveHistory.isPending}
        />
      )}

      {tab === 'calories' && (
        <Calories
          common={common}
          weight={weight}
          height={height}
          age={age}
          onGoalChange={(goal) => setCommon((prev) => ({ ...prev, goal }))}
          onSave={(input) => saveHistory.mutate({ type: 'macro', input })}
          isSaving={saveHistory.isPending}
        />
      )}

      {tab === 'body' && (
        <BodyComposition
          common={common}
          weight={weight}
          height={height}
          onSave={(payload) => saveBody.mutate(payload)}
          isSaving={saveBody.isPending}
        />
      )}

      {tab === 'hr' && <HeartRate age={age} />}

      <CalculationHistory
        history={history}
        loading={historyQuery.isLoading}
        filter={historyFilter}
        onFilterChange={setHistoryFilter}
        onDelete={(id) => deleteHistory.mutate(id)}
        deletingId={deleteHistory.isPending ? deleteHistory.variables : null}
        onClear={() => {
          dialog
            .confirm({
              title: 'Xóa lịch sử tính toán',
              message: 'Xóa toàn bộ lịch sử tính toán? Hành động không thể hoàn tác.',
              confirmLabel: 'Xóa tất cả',
            })
            .then((ok) => {
              if (ok) clearHistory.mutate();
            });
        }}
        clearing={clearHistory.isPending}
      />
    </div>
  );
}

/* --------------------------- Lịch sử tính toán --------------------------- */

function CalculationHistory({
  history,
  loading,
  filter,
  onFilterChange,
  onDelete,
  deletingId,
  onClear,
  clearing,
}) {
  const filtered = filter === 'all' ? history : history.filter((item) => item.type === filter);
  const filters = HISTORY_FILTERS.map((option) => ({
    ...option,
    label: option.value === 'all' ? `${option.label} (${history.length})` : option.label,
  }));

  return (
    <Card className="mt-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Lịch sử tính toán
          </h2>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Các kết quả bạn đã bấm “Lưu vào lịch sử”. Lưu theo tài khoản, tối đa 50 bản ghi gần nhất.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {loading && <Spinner className="h-4 w-4" />}
          {history.length > 0 && (
            <button
              type="button"
              className="btn-ghost !px-2.5 !py-1.5 text-xs text-slate-500 hover:text-rose-500 dark:text-slate-400"
              onClick={onClear}
              disabled={clearing}
            >
              {clearing ? 'Đang xóa...' : 'Xóa tất cả'}
            </button>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <div className="mt-3 overflow-x-auto">
          <Segmented options={filters} value={filter} onChange={onFilterChange} />
        </div>
      )}

      {loading ? (
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Đang tải lịch sử...</p>
      ) : !history.length ? (
        <EmptyState
          icon="calculator"
          title="Chưa có lịch sử"
          note="Bấm “Lưu vào lịch sử” ở máy tính 1RM hoặc Calo & macro để lưu kết quả vào đây."
          className="mt-3"
        />
      ) : !filtered.length ? (
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Không có bản ghi nào trong nhóm này.
        </p>
      ) : (
        <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.map((item) => {
            const description = describeHistoryItem(item);
            return (
              <div
                key={item._id}
                className="flex flex-wrap items-start justify-between gap-3 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {description.label}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {formatHistoryDate(item.date)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold leading-snug text-slate-800 dark:text-slate-100">
                    {description.title}
                  </p>
                  {description.detail && (
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {description.detail}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  className="btn-ghost !px-2 !py-1.5 text-slate-400 hover:text-rose-500"
                  onClick={() => onDelete(item._id)}
                  disabled={deletingId === item._id}
                  aria-label="Xóa bản ghi lịch sử"
                  title="Xóa bản ghi này"
                >
                  {deletingId === item._id ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <Icon name="trash" className="h-4 w-4" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

/* ------------------------------- 1RM ------------------------------- */

function OneRepMax({ defaultWeight, onSave, isSaving }) {
  const [weight, setWeight] = useState(defaultWeight || '');
  const [reps, setReps] = useState('5');

  useEffect(() => {
    setWeight((prev) => (prev === '' && defaultWeight ? defaultWeight : prev));
  }, [defaultWeight]);

  const result = useMemo(() => {
    if (!weight || !reps) return null;
    try {
      return estimateOneRepMax({ weightKg: Number(weight), reps: Number(reps) });
    } catch (error) {
      return { error: error.message };
    }
  }, [weight, reps]);

  const table = result?.average ? percent1RMTable(result.average) : [];

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <h2 className="flex items-center gap-1 text-base font-semibold text-slate-900 dark:text-white">
          Ước tính 1RM
          <InfoTip label="1RM (one-rep max)">
            Mức tạ nặng nhất bạn có thể nâng đúng 1 lần cho một bài tập. Nhập một set đã tập thật
            (tạ × số rep), hệ thống ước tính 1RM mà không cần thử tạ tối đa.
          </InfoTip>
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Nhập một set thực tế. Công thức chính xác nhất khi số rep từ 1-10.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <NumberField
            label="Mức tạ (kg)"
            value={weight}
            onChange={setWeight}
            step="0.5"
            min="1"
            placeholder="100"
          />
          <NumberField
            label="Số rep"
            value={reps}
            onChange={setReps}
            step="1"
            min="1"
            max="30"
            placeholder="5"
          />
        </div>

        {result?.error && (
          <Alert tone="warning" className="mt-4">
            {result.error}
          </Alert>
        )}
        {result?.warning && (
          <Alert tone="warning" className="mt-4">
            {result.warning}
          </Alert>
        )}

        {result && !result.error && (
          <>
            <div className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-md border border-line bg-line dark:border-white/[0.08] dark:bg-white/[0.08]">
              {[
                [
                  'Epley',
                  result.epley,
                  'w × (1 + rep/30)',
                  'Ước tính 1RM bằng công thức Epley. Phổ biến và ổn định ở khoảng 1–10 rep; thường cho kết quả cao hơn Brzycki khi dưới 10 rep.',
                ],
                [
                  'Brzycki',
                  result.brzycki,
                  'w × 36 / (37 − rep)',
                  'Ước tính 1RM bằng công thức Brzycki. Thường sát hơn ở set 3–6 rep; thường cho kết quả thấp hơn Epley khi dưới 10 rep.',
                ],
                [
                  'Trung bình',
                  result.average,
                  'trung bình 2 công thức',
                  'Trung bình cộng Epley và Brzycki — con số tham khảo chính, giúp giảm sai lệch giữa hai công thức.',
                ],
              ].map(([label, value, formula, description]) => (
                <div key={label} className="bg-surface p-3 dark:bg-[#151b18]">
                  <p className="metric-label justify-center">
                    {label}
                    <InfoTip label={`${label} 1RM`}>
                      {description} Công thức: {formula}, với w = mức tạ (kg), rep = số lần lặp.
                    </InfoTip>
                  </p>
                  <p className="mt-1 text-center font-mono text-[22px] font-medium leading-none tracking-[-0.03em] tabular-nums text-slate-900 dark:text-white">
                    {formatNumber(value, 1)}
                    <span className="ml-0.5 font-sans text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      kg
                    </span>
                  </p>
                  <p className="mt-1 text-center font-mono text-[11px] leading-tight text-slate-500 dark:text-slate-400">
                    {formula}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              <strong className="text-slate-700 dark:text-slate-200">
                Epley và Brzycki là hai cách ước tính 1RM từ một set đã tập.
              </strong>{' '}
              Epley dùng <span className="font-mono">w × (1 + rep/30)</span>; Brzycki dùng{' '}
              <span className="font-mono">w × 36 / (37 − rep)</span>. Chênh lệch giữa hai số là bình
              thường; app lấy trung bình để tham khảo. Đây không phải phép đo trực tiếp; sai số tăng
              khi số rep &gt; 10 hoặc form thay đổi.
            </p>
            <button
              type="button"
              className="btn-secondary mt-4 w-full"
              disabled={isSaving}
              onClick={() => onSave({ weightKg: Number(weight), reps: Number(reps) })}
            >
              <Icon name="check" className="h-4 w-4" />
              Lưu vào lịch sử
            </button>
          </>
        )}
      </Card>

      <Card className="lg:col-span-3">
        <h2 className="flex items-center gap-1 font-display text-[17px] font-semibold text-slate-900 dark:text-white">
          Bảng %1RM
          <InfoTip label="%1RM">
            Phần trăm của mức tạ tối đa 1RM. Ví dụ 80% 1RM là mức tạ thường dùng cho set 8 rep.
          </InfoTip>
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Số rep và RIR gợi ý chỉ mang tính tham khảo, tùy bài tập và trình độ.
        </p>
        <div className="mt-3 max-h-[420px] overflow-auto rounded-md border border-line dark:border-white/[0.08]">
          <table className="table-clinical min-w-full">
            <thead className="sticky top-0 z-10 bg-surface dark:bg-[#151b18]">
              <tr>
                <th className="px-3 py-2">%1RM</th>
                <th className="px-3 py-2">Mức tạ</th>
                <th className="px-3 py-2">
                  <span className="inline-flex items-center gap-1">
                    Rep gợi ý
                    <InfoTip label="Rep gợi ý">
                      Số lần lặp thường đạt được ở mức %1RM tương ứng với người tập trung cấp.
                    </InfoTip>
                  </span>
                </th>
                <th className="px-3 py-2">
                  <span className="inline-flex items-center gap-1">
                    RIR
                    <InfoTip label="RIR (Reps In Reserve)">
                      Số rep còn dư trước khi thất bại. RIR 2 nghĩa là bạn còn có thể làm thêm
                      khoảng 2 rep nữa. RIR càng nhỏ càng gần thất bại.
                    </InfoTip>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {table.map((row) => (
                <tr key={row.percent}>
                  <td className="num px-3 py-2 font-medium text-slate-800 dark:text-slate-100">
                    {row.percent}%
                  </td>
                  <td className="num px-3 py-2">{formatNumber(row.weightKg, 1)} kg</td>
                  <td className="num px-3 py-2">{row.reps}</td>
                  <td className="num px-3 py-2">{row.rir}</td>
                </tr>
              ))}
              {!table.length && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-slate-500 dark:text-slate-400">
                    Nhập tạ và số rep hợp lệ để xem bảng.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ----------------------------- Calories ---------------------------- */

function Calories({ common, weight, height, age, onGoalChange, onSave, isSaving }) {
  const [proteinPerKg, setProteinPerKg] = useState(1.8);
  const [fatPerKg, setFatPerKg] = useState(0.8);

  const calc = useMemo(() => {
    if (!weight || !height || !age) return null;
    try {
      const bmr = bmrMifflinStJeor({ sex: common.sex, weightKg: weight, heightCm: height, age });
      const tdee = tdeeFromBmr(bmr, common.activityLevel);
      const target = calorieTarget(tdee, common.goal);
      const macros = macroSplit({
        weightKg: weight,
        calories: target.recommended,
        proteinPerKg,
        fatPerKg,
      });
      return { bmr, tdee, target, macros };
    } catch (error) {
      return { error: error.message };
    }
  }, [weight, height, age, common.sex, common.activityLevel, common.goal, proteinPerKg, fatPerKg]);

  const macroKcal = calc?.macros
    ? {
        protein: calc.macros.proteinG * 4,
        fat: calc.macros.fatG * 9,
        carb: calc.macros.carbG * 4,
      }
    : null;
  const totalKcal = macroKcal ? macroKcal.protein + macroKcal.fat + macroKcal.carb || 1 : 1;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Nhu cầu năng lượng
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          BMR theo Mifflin-St Jeor, TDEE nhân hệ số vận động, mục tiêu calo theo mục tiêu bạn chọn.
        </p>

        <div className="mt-4">
          <Field label="Mục tiêu">
            <select
              className="select"
              value={common.goal}
              onChange={(e) => onGoalChange(e.target.value)}
            >
              {Object.entries(GOAL_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {!calc && (
          <Alert tone="info" className="mt-4">
            Cần chiều cao, cân nặng và tuổi để tính. Kiểm tra lại thông tin phía trên.
          </Alert>
        )}

        {calc?.error && (
          <Alert tone="warning" className="mt-4">
            {calc.error}
          </Alert>
        )}

        {calc && !calc.error && (
          <>
            <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line dark:border-white/[0.08] dark:bg-white/[0.08]">
              <div className="bg-surface p-3.5 dark:bg-[#151b18]">
                <p className="metric-label">
                  BMR
                  <InfoTip label="BMR (Basal Metabolic Rate)">
                    Năng lượng cơ thể dùng khi nghỉ hoàn toàn trong 24 giờ, tính theo Mifflin-St
                    Jeor từ giới tính, cân nặng, chiều cao và tuổi.
                  </InfoTip>
                </p>
                <p className="mt-1.5 font-mono text-[24px] font-medium leading-none tracking-[-0.03em] tabular-nums text-slate-900 dark:text-white">
                  {formatNumber(calc.bmr, 0)}{' '}
                  <span className="font-sans text-xs font-medium text-slate-500 dark:text-slate-400">kcal</span>
                </p>
              </div>
              <div className="border-t-2 border-t-pine-600 bg-surface p-3.5 dark:border-t-pine-400 dark:bg-[#151b18]">
                <p className="metric-label text-pine-700 dark:text-pine-300">
                  TDEE
                  <InfoTip label="TDEE (Total Daily Energy Expenditure)">
                    Tổng năng lượng tiêu hao mỗi ngày = BMR × hệ số vận động. Đây là mức calo để giữ
                    cân, trước khi cộng/trừ theo mục tiêu.
                  </InfoTip>
                </p>
                <p className="mt-1.5 font-mono text-[24px] font-medium leading-none tracking-[-0.03em] tabular-nums text-pine-700 dark:text-pine-300">
                  {formatNumber(calc.tdee, 0)} <span className="font-sans text-xs font-medium">kcal</span>
                </p>
              </div>
            </div>

            <div className="mt-3 rounded-md border border-line bg-paper-2/50 p-3.5 dark:border-white/[0.08] dark:bg-white/[0.02]">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                Calo mục tiêu ({GOAL_LABELS[common.goal]})
              </p>
              <p className="mt-1 font-mono text-[22px] font-medium tabular-nums text-slate-900 dark:text-white">
                {formatNumber(calc.target.min, 0)} – {formatNumber(calc.target.max, 0)}{' '}
                <span className="font-sans text-xs font-normal text-slate-500">kcal/ngày</span>
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Gợi ý giữa khoảng: <span className="num font-medium text-slate-700 dark:text-slate-200">{formatNumber(calc.target.recommended, 0)} kcal/ngày</span>
              </p>
            </div>
          </>
        )}
      </Card>

      <Card>
        <h2 className="font-display text-[17px] font-semibold text-slate-900 dark:text-white">Chia macro</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Protein 1.6-2.2 g/kg, chất béo tối thiểu 0.6-1 g/kg, phần còn lại là carb. “g/kg” = gam
          trên mỗi kg cân nặng cơ thể.
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-200">Protein</span>
              <span className="num font-semibold text-brand-600 dark:text-brand-300">
                {proteinPerKg} g/kg
              </span>
            </div>
            <input
              type="range"
              min="1.6"
              max="2.2"
              step="0.1"
              value={proteinPerKg}
              onChange={(e) => setProteinPerKg(Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand-600 dark:bg-slate-700"
            />
          </div>
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-200">Chất béo</span>
              <span className="num font-semibold text-brand-600 dark:text-brand-300">
                {fatPerKg} g/kg
              </span>
            </div>
            <input
              type="range"
              min="0.6"
              max="1"
              step="0.05"
              value={fatPerKg}
              onChange={(e) => setFatPerKg(Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand-600 dark:bg-slate-700"
            />
          </div>
        </div>

        {calc?.macros && (
          <>
            <div className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-md border border-line bg-line text-center dark:border-white/[0.08] dark:bg-white/[0.08]">
              {[
                ['Protein', calc.macros.proteinG, 'g'],
                ['Chất béo', calc.macros.fatG, 'g'],
                ['Carb', calc.macros.carbG, 'g'],
              ].map(([label, value, unit]) => (
                <div key={label} className="bg-surface p-3 dark:bg-[#151b18]">
                  <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                    {label}
                  </p>
                  <p className="mt-1 font-mono text-[22px] font-medium tabular-nums text-slate-900 dark:text-white">
                    {formatNumber(value, 0)}
                    <span className="ml-0.5 font-sans text-xs font-medium text-slate-500 dark:text-slate-400">{unit}</span>
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <span
                className="bg-brand-500"
                style={{ width: `${(macroKcal.protein / totalKcal) * 100}%` }}
              />
              <span
                className="bg-amber-400"
                style={{ width: `${(macroKcal.fat / totalKcal) * 100}%` }}
              />
              <span
                className="bg-sky-400"
                style={{ width: `${(macroKcal.carb / totalKcal) * 100}%` }}
              />
            </div>

            {calc.macros.note && (
              <Alert tone="warning" className="mt-3">
                {calc.macros.note}
              </Alert>
            )}

            <button
              type="button"
              className="btn-secondary mt-4 w-full"
              disabled={isSaving}
              onClick={() =>
                onSave({
                  weightKg: weight,
                  calories: calc.target.recommended,
                  proteinPerKg,
                  fatPerKg,
                })
              }
            >
              <Icon name="check" className="h-4 w-4" />
              Lưu macro vào lịch sử
            </button>
          </>
        )}
      </Card>
    </div>
  );
}

/* --------------------------- Body composition ---------------------- */

function BodyComposition({ common, weight, height, onSave, isSaving }) {
  const [neck, setNeck] = useState('');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');
  const [manualFat, setManualFat] = useState('');

  const result = useMemo(() => {
    if (!weight || !height) return { error: 'Cần chiều cao và cân nặng.' };
    const bmiValue = bmi(weight, height);
    const output = { bmi: bmiValue };
    if (!neck || !waist) {
      return { ...output, note: 'Nhập vòng cổ và vòng bụng để tính % mỡ US Navy.' };
    }
    try {
      const bodyFatNavy = navyBodyFat({
        sex: common.sex,
        heightCm: height,
        neckCm: Number(neck),
        waistCm: Number(waist),
        hipCm: common.sex === 'female' ? Number(hip) || undefined : undefined,
      });
      const lbm = leanBodyMass(weight, manualFat ? Number(manualFat) : bodyFatNavy);
      const ffmiValue = ffmi(lbm, height);
      return { ...output, bodyFatNavy, lbm, ...ffmiValue };
    } catch (error) {
      return { ...output, error: error.message };
    }
  }, [common.sex, weight, height, neck, waist, hip, manualFat]);

  const canSave = weight && (neck || waist || hip);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Số đo</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Đo lúc sáng, cùng điều kiện. Nữ cần thêm vòng mông cho công thức US Navy.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <NumberField
            label="Vòng cổ (cm)"
            value={neck}
            onChange={setNeck}
            step="0.1"
            min="15"
            max="100"
            placeholder="38"
          />
          <NumberField
            label="Vòng bụng (cm)"
            value={waist}
            onChange={setWaist}
            step="0.1"
            min="20"
            max="250"
            placeholder="82"
          />
          <NumberField
            label="Vòng mông (cm)"
            value={hip}
            onChange={setHip}
            step="0.1"
            min="30"
            max="250"
            placeholder="95"
            hint={common.sex === 'male' ? 'Chỉ cần cho nữ' : undefined}
          />
          <NumberField
            label="% mỡ nhập tay (tùy chọn)"
            value={manualFat}
            onChange={setManualFat}
            step="0.1"
            min="1"
            max="70"
            placeholder="18"
            hint="Nếu có, dùng để tính LBM/FFMI"
          />
        </div>
        <button
          type="button"
          className="btn-primary mt-4 w-full"
          disabled={!canSave || isSaving}
          onClick={() => {
            const measurements = {};
            if (neck) measurements.neckCm = Number(neck);
            if (waist) measurements.waistCm = Number(waist);
            if (hip) measurements.hipCm = Number(hip);
            onSave({
              weightKg: Number(weight),
              measurements,
              bodyFatPct: manualFat ? Number(manualFat) : null,
            });
          }}
        >
          <Icon name="check" className="h-4 w-4" />
          Lưu số đo vào hôm nay
        </button>
        {!weight && (
          <p className="mt-2 text-xs text-rose-500">Cần cân nặng ở phần thông tin chung.</p>
        )}
      </Card>

      <Card>
        <h2 className="font-display text-[17px] font-semibold text-slate-900 dark:text-white">Kết quả</h2>
        {result?.error ? (
          <Alert tone="warning" className="mt-3">
            {result.error}
          </Alert>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line dark:border-white/[0.08] dark:bg-white/[0.08]">
            {[
              [
                'BMI',
                result.bmi?.bmi,
                '',
                result.bmi?.category,
                'Chỉ số khối cơ thể = cân nặng (kg) / chiều cao² (m). Không phân biệt cơ với mỡ.',
              ],
              [
                '% mỡ (Navy)',
                result.bodyFatNavy,
                '%',
                null,
                'Ước tính phần trăm mỡ bằng công thức US Navy từ vòng cổ, bụng (và mông với nữ). Sai số khoảng 3-4% so với DEXA.',
              ],
              [
                'Khối lượng nạc',
                result.lbm,
                'kg',
                null,
                'LBM (lean body mass): cân nặng trừ khối mỡ — gồm cơ, xương, nước và nội tạng.',
              ],
              [
                'FFMI',
                result.ffmi,
                '',
                null,
                'Fat-Free Mass Index = khối lượng nạc (kg) / chiều cao² (m). Chỉ số khối cơ, không phụ thuộc cân nặng mỡ.',
              ],
              [
                'FFMI chuẩn hóa',
                result.normalized,
                '',
                null,
                'FFMI hiệu chỉnh về chiều cao 1,8 m để so sánh giữa người có chiều cao khác nhau.',
              ],
            ]
              .filter(([, value]) => value !== undefined)
              .map(([label, value, unit, hint, info]) => (
                <div key={label} className="bg-surface p-3.5 dark:bg-[#151b18]">
                  <p className="metric-label">
                    {label}
                    <InfoTip label={label}>{info}</InfoTip>
                  </p>
                  <p className="mt-1.5 font-mono text-[22px] font-medium leading-none tracking-[-0.03em] tabular-nums text-slate-900 dark:text-white">
                    {formatNumber(value, 1)}
                    {unit && (
                      <span className="ml-0.5 font-sans text-xs font-medium text-slate-500 dark:text-slate-400">{unit}</span>
                    )}
                  </p>
                  {hint && <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{hint}</p>}
                </div>
              ))}
          </div>
        )}
        {result?.note && (
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{result.note}</p>
        )}
        <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          BMI không phân biệt cơ và mỡ. % mỡ US Navy có sai số khoảng 3-4% so với DEXA, phù hợp để
          theo dõi xu hướng hơn là con số tuyệt đối.
        </p>
      </Card>
    </div>
  );
}

/* ------------------------------ HR zones --------------------------- */

function HeartRate({ age }) {
  const [maxHr, setMaxHr] = useState('');
  const [restingHr, setRestingHr] = useState('');
  const [useManual, setUseManual] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const result = useMemo(() => {
    try {
      return hrZones({
        age: useManual ? undefined : Number(age) || undefined,
        maxHr: useManual ? Number(maxHr) || undefined : undefined,
        restingHr: Number(restingHr) || undefined,
      });
    } catch (error) {
      return { error: error.message };
    }
  }, [age, maxHr, restingHr, useManual]);

  const zoneColors = ['bg-sky-400', 'bg-emerald-400', 'bg-lime-400', 'bg-amber-400', 'bg-rose-500'];

  return (
    <Card>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
            Vùng nhịp tim
            <button
              type="button"
              onClick={() => setShowHelp((value) => !value)}
              aria-expanded={showHelp}
              aria-controls="heart-rate-help"
              aria-label="Hướng dẫn sử dụng vùng nhịp tim"
              title="Hướng dẫn sử dụng"
              className="grid h-6 w-6 place-items-center rounded-full border border-slate-300 text-xs font-bold text-slate-600 transition hover:border-brand-400 hover:text-brand-700 dark:border-slate-600 dark:text-slate-300 dark:hover:border-brand-600 dark:hover:text-brand-300"
            >
              ?
            </button>
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Mặc định dùng Tanaka (208 − 0.7 × tuổi). Có nhịp tim nghỉ sẽ dùng Karvonen.
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <input
            type="checkbox"
            checked={useManual}
            onChange={(e) => setUseManual(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          Nhập nhịp tim tối đa thủ công
        </label>
      </div>

      {showHelp && (
        <div
          id="heart-rate-help"
          className="mt-3 rounded-lg border border-brand-200 bg-brand-50/60 p-3 text-xs leading-relaxed text-slate-700 dark:border-brand-900 dark:bg-brand-950/30 dark:text-slate-200"
        >
          <p className="font-semibold text-brand-800 dark:text-brand-200">
            Phần này dùng để làm gì?
          </p>
          <p className="mt-1">
            Tính 5 vùng nhịp tim cho cardio, chạy bộ, đạp xe hoặc HIIT. Mỗi vùng là một khoảng bpm
            để chọn cường độ phù hợp.
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-4">
            <li>
              Nhập ngày sinh trong Cài đặt để app tự tính tuổi, hoặc tick “Nhập nhịp tim tối đa thủ
              công” nếu bạn đã đo HRmax.
            </li>
            <li>
              Đo nhịp tim nghỉ lúc mới thức dậy và nhập vào ô bên dưới — không bắt buộc, nhưng giúp
              vùng chính xác hơn.
            </li>
            <li>
              Chọn vùng theo mục tiêu: Z2 cho nền aerobic, Z3 tempo, Z4 interval, Z5 nước rút/HIIT
              ngắn.
            </li>
          </ol>
          <p className="mt-2">
            <strong>Công thức:</strong> Tanaka cho HRmax = 208 − 0,7 × tuổi. Nếu có nhịp nghỉ,
            Karvonen dùng nhịp dự trữ: (HRmax − HR nghỉ) × % + HR nghỉ.
          </p>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Đây là ước lượng. Thuốc, bệnh tim mạch hoặc thiết bị đo không chính xác có thể làm kết
            quả lệch; hỏi bác sĩ nếu có bệnh nền.
          </p>
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {useManual ? (
          <NumberField
            label="Nhịp tim tối đa (bpm)"
            value={maxHr}
            onChange={setMaxHr}
            min="100"
            max="230"
          />
        ) : (
          <Field label="Tuổi" hint={age ? 'Đang dùng tuổi từ hồ sơ' : 'Chưa có tuổi trong hồ sơ'}>
            <input className="input bg-slate-50 dark:bg-slate-800" value={age || ''} readOnly />
          </Field>
        )}
        <NumberField
          label="Nhịp tim nghỉ (tùy chọn)"
          value={restingHr}
          onChange={setRestingHr}
          min="30"
          max="120"
          hint="Đo lúc mới thức dậy"
        />
      </div>

      {result?.error ? (
        <Alert tone="warning" className="mt-4">
          {result.error}
        </Alert>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              Nhịp tim tối đa: {result.maxHr} bpm
            </span>
            <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              Phương pháp: {result.method}
            </span>
            <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              Công thức: {result.formula}
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {result.zones?.map((zone, index) => (
              <div
                key={zone.zone}
                className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800"
              >
                <span className={`h-8 w-1.5 rounded-full ${zoneColors[index]}`} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Vùng {zone.zone} · {zone.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{zone.percent} nhịp tim dự trữ / tối đa</p>
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  {zone.minBpm}–{zone.maxBpm}{' '}
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">bpm</span>
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
