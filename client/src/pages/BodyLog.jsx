import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Card, Icon, LoadingBlock, PageHeader } from '../components/ui.jsx';
import { Link } from 'react-router-dom';
import {
  deleteMetricPhoto,
  exportPdfUrl,
  fetchMetricByDate,
  fetchMetrics,
  metricPhotoUrl,
  saveMetric,
  uploadMetricPhoto,
} from '../api/metrics.js';
import { getErrorMessage } from '../api/client.js';
import { bodyLogSchema } from '../lib/schemas.js';
import { formatDateKey, formatLongDate, todayKey } from '../lib/date.js';
import { formatNumber } from '../lib/format.js';

const MEASUREMENTS = [
  { key: 'waistCm', label: 'Vòng bụng (cm)' },
  { key: 'neckCm', label: 'Vòng cổ (cm)' },
  { key: 'hipCm', label: 'Vòng mông (cm)' },
  { key: 'chestCm', label: 'Vòng ngực (cm)' },
  { key: 'armCm', label: 'Vòng tay (cm)' },
  { key: 'thighCm', label: 'Vòng đùi (cm)' },
];

const LIFESTYLE = [
  { key: 'restingHr', label: 'Nhịp tim nghỉ (bpm)', step: '1' },
  { key: 'sleepHours', label: 'Giấc ngủ (giờ)', step: '0.5' },
  { key: 'steps', label: 'Số bước', step: '100' },
  { key: 'calories', label: 'Calo nạp (kcal)', step: '10' },
  { key: 'proteinG', label: 'Protein (g)', step: '1' },
];

const CHECKLIST = [
  { key: 'stand_posture', label: 'Đứng thẳng: tai - vai - hông - mắt cá thẳng hàng' },
  { key: 'squat_depth', label: 'Squat đạt độ sâu (đùi dưới song song)' },
  { key: 'shoulder_mobility', label: 'Vai gập quá đầu không đau / không nhô vai' },
  { key: 'hip_mobility', label: 'Hông gập đủ sâu khi squat / hip hinge' },
  { key: 'knee_tracking', label: 'Gối đi theo hướng mũi chân khi squat' },
];

const emptyForm = {
  weightKg: '',
  waistCm: '',
  neckCm: '',
  hipCm: '',
  chestCm: '',
  armCm: '',
  thighCm: '',
  bodyFatPct: '',
  restingHr: '',
  sleepHours: '',
  steps: '',
  calories: '',
  proteinG: '',
  notes: '',
};

function toForm(log) {
  if (!log) return { ...emptyForm };
  const form = { ...emptyForm, weightKg: log.weightKg ?? '' };
  for (const { key } of MEASUREMENTS) {
    form[key] = log.measurements?.[key] ?? '';
  }
  for (const { key } of LIFESTYLE) {
    form[key] = log[key] ?? '';
  }
  form.bodyFatPct = log.bodyFatPct ?? '';
  form.notes = log.notes ?? '';
  return form;
}

function NumField({ label, error, ...props }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" type="number" inputMode="decimal" {...props} />
      {error && <p className="mt-1 text-xs font-medium text-rose-500">{error}</p>}
    </div>
  );
}

export default function BodyLog() {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(todayKey());
  const [form, setForm] = useState(emptyForm);
  const [posture, setPosture] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoNote, setPhotoNote] = useState('');
  const [photoError, setPhotoError] = useState(null);
  const photoInputRef = useRef(null);

  const { data: log, isLoading } = useQuery({
    queryKey: ['metric', date],
    enabled: Boolean(date),
    queryFn: async () => {
      try {
        const data = await fetchMetricByDate(date);
        return data.log;
      } catch (error) {
        if (error.response?.status === 404) return null;
        throw error;
      }
    },
  });

  const { data: recent } = useQuery({
    queryKey: ['metrics', 'recent'],
    queryFn: () => fetchMetrics({ days: 30 }),
  });

  useEffect(() => {
    setForm(toForm(log));
    const next = {};
    for (const item of log?.posture || []) {
      if (item.ok !== undefined) next[item.key] = Boolean(item.ok);
    }
    setPosture(next);
    setFieldErrors({});
  }, [log?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setNotice(null);
    setFieldErrors({});
  }, [date]);

  const save = useMutation({
    mutationFn: (payload) => saveMetric(date, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      queryClient.setQueryData(['metric', date], data.log);
      setNotice({ tone: 'success', text: 'Đã lưu dữ liệu cho ngày này.' });
    },
    onError: (error) => setNotice({ tone: 'danger', text: getErrorMessage(error) }),
  });

  const uploadPhoto = useMutation({
    mutationFn: ({ file, note }) => uploadMetricPhoto(date, file, note),
    onSuccess: (data) => {
      queryClient.setQueryData(['metric', date], data.log);
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      setPhotoFile(null);
      setPhotoNote('');
      setPhotoError(null);
      if (photoInputRef.current) photoInputRef.current.value = '';
    },
    onError: (error) => setPhotoError(getErrorMessage(error)),
  });

  const removePhoto = useMutation({
    mutationFn: (filename) => deleteMetricPhoto(date, filename),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metric', date] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
    onError: (error) => setPhotoError(getErrorMessage(error)),
  });

  const computed =
    (save.data?.log?.dateKey === date ? save.data.log.computed : null) || log?.computed || {};

  const recentLogs = recent?.logs || [];

  const setValue = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    setNotice(null);

    const raw = { ...form };
    const parsed = bodyLogSchema.safeParse(raw);
    if (!parsed.success) {
      const errors = {};
      for (const issue of parsed.error.issues) {
        errors[issue.path[0]] = issue.message;
      }
      setFieldErrors(errors);
      setNotice({ tone: 'danger', text: 'Vui lòng kiểm tra lại các trường được đánh dấu.' });
      return;
    }
    setFieldErrors({});

    const values = parsed.data;
    const payload = {
      weightKg: values.weightKg,
      measurements: {},
      bodyFatPct: values.bodyFatPct ?? null,
      restingHr: values.restingHr ?? null,
      sleepHours: values.sleepHours ?? null,
      steps: values.steps ?? null,
      calories: values.calories ?? null,
      proteinG: values.proteinG ?? null,
      notes: values.notes || '',
      posture: CHECKLIST.filter((item) => posture[item.key] !== undefined).map((item) => ({
        key: item.key,
        label: item.label,
        ok: Boolean(posture[item.key]),
      })),
    };
    for (const { key } of MEASUREMENTS) {
      if (values[key] !== undefined) payload.measurements[key] = values[key];
    }

    save.mutate(payload);
  };

  return (
    <div>
      <PageHeader
        title="Theo dõi cơ thể"
        subtitle="Mỗi ngày một bản ghi. Nhập lại cùng ngày sẽ cập nhật, không tạo trùng."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/body-assessment" className="btn-secondary">
              <Icon name="target" className="h-4 w-4" />
              AI thể trạng
            </Link>
            <a
              href={exportPdfUrl()}
              className="btn-secondary"
              title="Tải báo cáo PDF"
            >
              <Icon name="download" className="h-4 w-4" />
              PDF
            </a>
            <a
              href={`${import.meta.env.VITE_API_BASE || '/api'}/metrics/export.csv`}
              className="btn-secondary"
            >
              <Icon name="download" className="h-4 w-4" />
              CSV
            </a>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <label className="label">Ngày ghi</label>
                <input
                  type="date"
                  className="input max-w-[200px]"
                  value={date}
                  max={todayKey()}
                  onChange={(e) => setDate(e.target.value || todayKey())}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setDate(todayKey())}
                  disabled={date === todayKey()}
                >
                  Hôm nay
                </button>
              </div>
            </div>
            <p className="-mt-2 mb-4 text-xs text-slate-400">{formatLongDate(date)}</p>

            {isLoading ? (
              <LoadingBlock label="Đang tải bản ghi..." />
            ) : (
              <form onSubmit={onSubmit} className="space-y-6" noValidate>
                <section>
                  <h3 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Chỉ số chính
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <NumField
                      label="Cân nặng (kg) *"
                      step="0.1"
                      min="20"
                      max="400"
                      placeholder="72.5"
                      value={form.weightKg}
                      onChange={setValue('weightKg')}
                      error={fieldErrors.weightKg}
                    />
                    <NumField
                      label="% mỡ nhập tay (nếu có)"
                      step="0.1"
                      min="1"
                      max="70"
                      placeholder="18.5"
                      value={form.bodyFatPct}
                      onChange={setValue('bodyFatPct')}
                      error={fieldErrors.bodyFatPct}
                    />
                  </div>
                </section>

                <section>
                  <h3 className="mb-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Số đo (cm)
                  </h3>
                  <p className="mb-3 text-xs text-slate-400">
                    Cần vòng cổ + vòng bụng (nữ thêm vòng mông) để tính % mỡ US Navy.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {MEASUREMENTS.map(({ key, label }) => (
                      <NumField
                        key={key}
                        label={label}
                        step="0.1"
                        value={form[key]}
                        onChange={setValue(key)}
                        error={fieldErrors[key]}
                      />
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Lối sống &amp; dinh dưỡng
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {LIFESTYLE.map(({ key, label, step }) => (
                      <NumField
                        key={key}
                        label={label}
                        step={step}
                        min="0"
                        value={form[key]}
                        onChange={setValue(key)}
                        error={fieldErrors[key]}
                      />
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="mb-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Checklist tư thế &amp; tầm vận động
                  </h3>
                  <p className="mb-3 text-xs text-slate-400">Tích nếu đạt. Bỏ trống nếu chưa đánh giá.</p>
                  <div className="space-y-2">
                    {CHECKLIST.map((item) => (
                      <label
                        key={item.key}
                        className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-sm transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                      >
                        <input
                          type="checkbox"
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                          checked={posture[item.key] ?? false}
                          onChange={(e) => {
                            const { checked } = e.target;
                            setPosture((prev) => ({ ...prev, [item.key]: checked }));
                          }}
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </section>

                <section>
                  <label className="label">Ghi chú</label>
                  <textarea
                    className="input min-h-[90px]"
                    placeholder="Cảm giác, mức năng lượng, chấn thương nhỏ, bữa ăn đáng chú ý..."
                    value={form.notes}
                    onChange={setValue('notes')}
                  />
                </section>

                {notice && <Alert tone={notice.tone}>{notice.text}</Alert>}

                <div className="flex flex-wrap items-center gap-2">
                  <button type="submit" className="btn-primary" disabled={save.isPending}>
                    {save.isPending ? 'Đang lưu...' : 'Lưu ngày này'}
                  </button>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => {
                      setForm(toForm(log));
                      setPosture({});
                      setFieldErrors({});
                      setNotice(null);
                    }}
                  >
                    Hoàn tác
                  </button>
                </div>
              </form>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <h3 className="card-title">Chỉ số đã tính</h3>
            {computed && Object.keys(computed).length ? (
              <dl className="mt-3 space-y-2.5 text-sm">
                {[
                  ['BMI', computed.bmi, ''],
                  ['% mỡ (Navy)', computed.bodyFatNavy, '%'],
                  ['Khối lượng nạc', computed.leanMassKg, 'kg'],
                  ['FFMI', computed.ffmi, ''],
                  ['FFMI chuẩn hóa', computed.ffmiNormalized, ''],
                  ['BMR', computed.bmr, 'kcal'],
                  ['TDEE', computed.tdee, 'kcal'],
                ]
                  .filter(([, value]) => value !== undefined && value !== null)
                  .map(([label, value, unit]) => (
                    <div key={label} className="flex items-center justify-between gap-2">
                      <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
                      <dd className="font-semibold text-slate-800 dark:text-slate-100">
                        {formatNumber(value, label === 'BMR' || label === 'TDEE' ? 0 : 1)}
                        {unit && <span className="ml-1 text-xs font-normal text-slate-400">{unit}</span>}
                      </dd>
                    </div>
                  ))}
              </dl>
            ) : (
              <p className="mt-3 text-sm text-slate-400">
                Lưu số đo (cần chiều cao trong hồ sơ) để xem BMI, % mỡ, LBM, FFMI và TDEE.
              </p>
            )}
          </Card>

          <Card>
            <h3 className="card-title">Ảnh tiến độ</h3>
            <p className="mt-2 text-xs text-slate-400">
              Ảnh chỉ bạn xem (yêu cầu đăng nhập). Hãy lưu cân nặng trước khi thêm ảnh.
            </p>

            <div className="mt-3 space-y-2">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const selected = e.target.files?.[0] || null;
                  if (selected && selected.size > 8 * 1024 * 1024) {
                    setPhotoError('Ảnh tối đa 8 MB.');
                    setPhotoFile(null);
                    return;
                  }
                  setPhotoError(null);
                  setPhotoFile(selected);
                }}
                className="block w-full text-xs text-slate-500 file:mr-2 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-700 dark:file:bg-brand-950 dark:file:text-brand-300"
              />
              <input
                className="input !py-1.5 text-xs"
                placeholder="Ghi chú ảnh (tùy chọn)"
                value={photoNote}
                onChange={(e) => setPhotoNote(e.target.value)}
                maxLength={300}
              />
              <button
                type="button"
                className="btn-secondary w-full text-xs"
                disabled={!photoFile || !log || uploadPhoto.isPending}
                onClick={() => uploadPhoto.mutate({ file: photoFile, note: photoNote })}
              >
                {uploadPhoto.isPending ? 'Đang tải ảnh...' : 'Tải ảnh lên'}
              </button>
              {!log && (
                <p className="text-[11px] text-amber-600">Chưa có bản ghi ngày này.</p>
              )}
              {photoError && <p className="text-xs text-rose-500">{photoError}</p>}
            </div>

            {log?.photos?.length ? (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {log.photos.map((photo) => (
                  <div key={photo.filename} className="group relative">
                    <a
                      href={metricPhotoUrl(photo.filename)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src={metricPhotoUrl(photo.filename)}
                        alt={photo.note || 'Ảnh tiến độ'}
                        loading="lazy"
                        className="h-24 w-full rounded-lg border border-slate-200 object-cover dark:border-slate-700"
                      />
                    </a>
                    <button
                      type="button"
                      className="absolute right-1 top-1 rounded-full bg-slate-950/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
                      onClick={() => {
                        if (window.confirm('Xóa ảnh này?')) removePhoto.mutate(photo.filename);
                      }}
                      aria-label="Xóa ảnh"
                    >
                      <Icon name="close" className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-400">Chưa có ảnh.</p>
            )}
          </Card>

          <Card>
            <h3 className="card-title">30 ngày gần nhất</h3>
            <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800">
              {recentLogs.length ? (
                recentLogs
                  .slice()
                  .reverse()
                  .slice(0, 10)
                  .map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => setDate(item.dateKey)}
                      className="flex w-full items-center justify-between gap-2 py-2.5 text-left text-sm transition hover:text-brand-600 dark:hover:text-brand-400"
                    >
                      <span className="text-slate-500 dark:text-slate-400">
                        {formatDateKey(item.dateKey, true)}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-100">
                        {formatNumber(item.weightKg, 1)} kg
                      </span>
                    </button>
                  ))
              ) : (
                <p className="py-3 text-sm text-slate-400">Chưa có bản ghi nào.</p>
              )}
            </div>
            {recentLogs.length > 10 && (
              <p className="mt-2 text-xs text-slate-400">Hiển thị 10 bản ghi mới nhất.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
