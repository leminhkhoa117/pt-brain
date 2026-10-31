import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Card, Field, Icon, PageHeader, Segmented } from '../components/ui.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { fetchSummary, saveMetric } from '../api/metrics.js';
import { runCalc } from '../api/calc.js';
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

  const [common, setCommon] = useState({
    sex: profile.sex || 'male',
    heightCm: profile.heightCm ?? '',
    weightKg: latest?.weightKg ?? '',
    age: authAge ?? (profile.birthDate ? computeAge(profile.birthDate) : ''),
    activityLevel: profile.activityLevel || 'moderate',
    goal: profile.goal || 'maintain',
  });

  useEffect(() => {
    if (!latest?.weightKg) return;
    setCommon((prev) => (prev.weightKg === '' ? { ...prev, weightKg: latest.weightKg } : prev));
  }, [latest?.weightKg]);

  const set = (key) => (e) => {
    const { value } = e.target;
    setCommon((prev) => ({ ...prev, [key]: value }));
  };

  const saveHistory = useMutation({
    mutationFn: ({ type, input }) => runCalc(type, input, true),
    onSuccess: () => setNotice({ tone: 'success', text: 'Đã lưu kết quả vào lịch sử tính toán.' }),
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
      />

      {notice && (
        <Alert tone={notice.tone} className="mb-4">
          {notice.text}
        </Alert>
      )}

      <Card className="mb-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="Giới tính">
            <select className="input" value={common.sex} onChange={set('sex')}>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
            </select>
          </Field>
          <NumberField label="Chiều cao (cm)" value={common.heightCm} onChange={set('heightCm')} min="100" max="250" placeholder="175" />
          <NumberField label="Cân nặng (kg)" value={common.weightKg} onChange={set('weightKg')} min="20" max="400" step="0.1" placeholder="72.5" />
          <NumberField label="Tuổi" value={common.age} onChange={set('age')} min="14" max="100" placeholder="28" />
          <Field label="Mức vận động">
            <select className="input" value={common.activityLevel} onChange={set('activityLevel')}>
              {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Thông tin được lấy từ hồ sơ của bạn. Thay đổi ở đây chỉ dùng để tính nhanh, không ghi đè hồ sơ.
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
    </div>
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
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Ước tính 1RM</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Nhập một set thực tế. Công thức chính xác nhất khi số rep từ 1-10.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <NumberField label="Mức tạ (kg)" value={weight} onChange={setWeight} step="0.5" min="1" placeholder="100" />
          <NumberField label="Số rep" value={reps} onChange={setReps} step="1" min="1" max="30" placeholder="5" />
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

        {!result?.error && (
          <>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                ['Epley', result.epley],
                ['Brzycki', result.brzycki],
                ['Trung bình', result.average],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                  <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                    {formatNumber(value, 1)}
                    <span className="ml-0.5 text-xs font-medium text-slate-400">kg</span>
                  </p>
                </div>
              ))}
            </div>
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
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Bảng %1RM</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Số rep và RIR gợi ý chỉ mang tính tham khảo, tùy bài tập và trình độ.
        </p>
        <div className="mt-3 max-h-[420px] overflow-auto rounded-xl border border-slate-100 dark:border-slate-800">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400 dark:bg-slate-800">
              <tr>
                <th className="px-3 py-2">%1RM</th>
                <th className="px-3 py-2">Mức tạ</th>
                <th className="px-3 py-2">Rep gợi ý</th>
                <th className="px-3 py-2">RIR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {table.map((row) => (
                <tr key={row.percent} className="text-slate-600 dark:text-slate-300">
                  <td className="px-3 py-2 font-semibold text-slate-800 dark:text-slate-100">{row.percent}%</td>
                  <td className="px-3 py-2">{formatNumber(row.weightKg, 1)} kg</td>
                  <td className="px-3 py-2">{row.reps}</td>
                  <td className="px-3 py-2">{row.rir}</td>
                </tr>
              ))}
              {!table.length && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-slate-400">
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
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Nhu cầu năng lượng</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          BMR theo Mifflin-St Jeor, TDEE nhân hệ số vận động, mục tiêu calo theo mục tiêu bạn chọn.
        </p>

        <div className="mt-4">
          <Field label="Mục tiêu">
            <select className="input" value={common.goal} onChange={(e) => onGoalChange(e.target.value)}>
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
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">BMR</p>
                <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                  {formatNumber(calc.bmr, 0)} <span className="text-xs font-medium text-slate-400">kcal</span>
                </p>
              </div>
              <div className="rounded-xl bg-brand-50 p-3 dark:bg-brand-950/50">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">TDEE</p>
                <p className="mt-1 text-xl font-bold text-brand-700 dark:text-brand-200">
                  {formatNumber(calc.tdee, 0)} <span className="text-xs font-medium">kcal</span>
                </p>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Calo mục tiêu ({GOAL_LABELS[common.goal]})
              </p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                {formatNumber(calc.target.min, 0)} – {formatNumber(calc.target.max, 0)} kcal/ngày
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Gợi ý giữa khoảng: {formatNumber(calc.target.recommended, 0)} kcal/ngày
              </p>
            </div>
          </>
        )}
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Chia macro</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Protein 1.6-2.2 g/kg, chất béo tối thiểu 0.6-1 g/kg, phần còn lại là carb.
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-200">Protein</span>
              <span className="font-semibold text-brand-600 dark:text-brand-300">{proteinPerKg} g/kg</span>
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
              <span className="font-semibold text-brand-600 dark:text-brand-300">{fatPerKg} g/kg</span>
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
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              {[
                ['Protein', calc.macros.proteinG, 'g'],
                ['Chất béo', calc.macros.fatG, 'g'],
                ['Carb', calc.macros.carbG, 'g'],
              ].map(([label, value, unit]) => (
                <div key={label} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                  <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                    {formatNumber(value, 0)}
                    <span className="ml-0.5 text-xs font-medium text-slate-400">{unit}</span>
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <span className="bg-brand-500" style={{ width: `${(macroKcal.protein / totalKcal) * 100}%` }} />
              <span className="bg-amber-400" style={{ width: `${(macroKcal.fat / totalKcal) * 100}%` }} />
              <span className="bg-sky-400" style={{ width: `${(macroKcal.carb / totalKcal) * 100}%` }} />
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
          <NumberField label="Vòng cổ (cm)" value={neck} onChange={setNeck} step="0.1" min="15" max="100" placeholder="38" />
          <NumberField label="Vòng bụng (cm)" value={waist} onChange={setWaist} step="0.1" min="20" max="250" placeholder="82" />
          <NumberField label="Vòng mông (cm)" value={hip} onChange={setHip} step="0.1" min="30" max="250" placeholder="95" hint={common.sex === 'male' ? 'Chỉ cần cho nữ' : undefined} />
          <NumberField label="% mỡ nhập tay (tùy chọn)" value={manualFat} onChange={setManualFat} step="0.1" min="1" max="70" placeholder="18" hint="Nếu có, dùng để tính LBM/FFMI" />
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
        {!weight && <p className="mt-2 text-xs text-rose-500">Cần cân nặng ở phần thông tin chung.</p>}
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Kết quả</h2>
        {result?.error ? (
          <Alert tone="warning" className="mt-3">
            {result.error}
          </Alert>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              ['BMI', result.bmi?.bmi, '', result.bmi?.category],
              ['% mỡ (Navy)', result.bodyFatNavy, '%', null],
              ['Khối lượng nạc', result.lbm, 'kg', null],
              ['FFMI', result.ffmi, '', null],
              ['FFMI chuẩn hóa', result.normalized, '', null],
            ]
              .filter(([, value]) => value !== undefined)
              .map(([label, value, unit, hint]) => (
                <div key={label} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                  <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                    {formatNumber(value, 1)}
                    {unit && <span className="ml-0.5 text-xs font-medium text-slate-400">{unit}</span>}
                  </p>
                  {hint && <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p>}
                </div>
              ))}
          </div>
        )}
        {result?.note && <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{result.note}</p>}
        <p className="mt-4 text-xs leading-relaxed text-slate-400">
          BMI không phân biệt cơ và mỡ. % mỡ US Navy có sai số khoảng 3-4% so với DEXA, phù hợp để theo dõi
          xu hướng hơn là con số tuyệt đối.
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
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Vùng nhịp tim</h2>
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

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {useManual ? (
          <NumberField label="Nhịp tim tối đa (bpm)" value={maxHr} onChange={setMaxHr} min="100" max="230" />
        ) : (
          <Field label="Tuổi" hint={age ? 'Đang dùng tuổi từ hồ sơ' : 'Chưa có tuổi trong hồ sơ'}>
            <input className="input bg-slate-50 dark:bg-slate-800" value={age || ''} readOnly />
          </Field>
        )}
        <NumberField label="Nhịp tim nghỉ (tùy chọn)" value={restingHr} onChange={setRestingHr} min="30" max="120" hint="Đo lúc mới thức dậy" />
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
              <div key={zone.zone} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                <span className={`h-8 w-1.5 rounded-full ${zoneColors[index]}`} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Vùng {zone.zone} · {zone.name}
                  </p>
                  <p className="text-xs text-slate-400">{zone.percent} nhịp tim dự trữ / tối đa</p>
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  {zone.minBpm}–{zone.maxBpm} <span className="text-xs font-medium text-slate-400">bpm</span>
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
