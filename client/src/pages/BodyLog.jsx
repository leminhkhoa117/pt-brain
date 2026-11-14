import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Card, Icon, InfoTip, LoadingBlock, PageHeader } from '../components/ui.jsx';
import { useDialog } from '../components/DialogProvider.jsx';
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
  const dialog = useDialog();
  const queryClient = useQueryClient();
  const [date, setDate] = useState(todayKey());
  const [form, setForm] = useState(emptyForm);
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
            <a href={exportPdfUrl()} className="btn-secondary" title="Tải báo cáo PDF">
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
            <p className="-mt-2 mb-4 text-xs text-slate-500 dark:text-slate-400">{formatLongDate(date)}</p>

            {isLoading ? (
              <LoadingBlock label="Đang tải bản ghi..." />
            ) : (
              <form onSubmit={onSubmit} className="space-y-6" noValidate>
                <section className="border-t border-line pt-5 dark:border-white/[0.08]">
                  <h3 className="mb-3 font-display text-[17px] font-semibold text-slate-900 dark:text-slate-100">
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

                <section className="border-t border-line pt-5 dark:border-white/[0.08]">
                  <h3 className="mb-1 font-display text-[17px] font-semibold text-slate-900 dark:text-slate-100">
                    Số đo (cm)
                  </h3>
                  <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
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

                <section className="border-t border-line pt-5 dark:border-white/[0.08]">
                  <h3 className="mb-3 font-display text-[17px] font-semibold text-slate-900 dark:text-slate-100">
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
            <h3 className="font-display text-[16px] font-semibold text-slate-900 dark:text-slate-100">
              Chỉ số đã tính
            </h3>
            {computed && Object.keys(computed).length ? (
              <dl className="mt-2 divide-y divide-line dark:divide-white/[0.07]">
                {[
                  [
                    'BMI',
                    computed.bmi,
                    '',
                    'Chỉ số khối cơ thể = cân nặng / chiều cao². Không phân biệt cơ và mỡ.',
                  ],
                  [
                    '% mỡ (Navy)',
                    computed.bodyFatNavy,
                    '%',
                    'Ước tính % mỡ bằng công thức US Navy từ vòng cổ, bụng (và mông với nữ).',
                  ],
                  [
                    'Khối lượng nạc',
                    computed.leanMassKg,
                    'kg',
                    'LBM – cân nặng trừ khối mỡ: cơ, xương, nước và nội tạng.',
                  ],
                  [
                    'FFMI',
                    computed.ffmi,
                    '',
                    'Fat-Free Mass Index – chỉ số khối cơ, không phụ thuộc mỡ.',
                  ],
                  [
                    'FFMI chuẩn hóa',
                    computed.ffmiNormalized,
                    '',
                    'FFMI hiệu chỉnh về chiều cao 1,8 m để so sánh giữa các chiều cao.',
                  ],
                  [
                    'BMR',
                    computed.bmr,
                    'kcal',
                    'Năng lượng cơ thể tiêu hao khi nghỉ hoàn toàn trong 24 giờ (Mifflin-St Jeor).',
                  ],
                  [
                    'TDEE',
                    computed.tdee,
                    'kcal',
                    'Tổng năng lượng tiêu hao/ngày = BMR × hệ số vận động.',
                  ],
                ]
                  .filter(([, value]) => value !== undefined && value !== null)
                  .map(([label, value, unit, info]) => (
                    <div key={label} className="flex items-center justify-between gap-2 py-2">
                      <dt className="flex items-center gap-1 text-[12.5px] text-slate-500 dark:text-slate-400">
                        {label}
                        <InfoTip label={label}>{info}</InfoTip>
                      </dt>
                      <dd className="num text-[13px] font-medium text-slate-900 dark:text-slate-100">
                        {formatNumber(value, label === 'BMR' || label === 'TDEE' ? 0 : 1)}
                        {unit && (
                          <span className="ml-1 font-sans text-[11px] font-normal text-slate-500 dark:text-slate-400">
                            {unit}
                          </span>
                        )}
                      </dd>
                    </div>
                  ))}
              </dl>
            ) : (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Lưu số đo (cần chiều cao trong hồ sơ) để xem BMI, % mỡ, LBM, FFMI và TDEE.
              </p>
            )}
          </Card>

          <Card>
            <h3 className="font-display text-[16px] font-semibold text-slate-900 dark:text-slate-100">
              Ảnh tiến độ
            </h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Ảnh chỉ bạn xem (yêu cầu đăng nhập). Hãy lưu cân nặng trước khi thêm ảnh.
            </p>

            <div className="mt-3 space-y-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-line bg-paper-2/60 px-3 py-2.5 text-[12px] text-slate-500 transition-colors hover:border-pine-600 dark:border-white/15 dark:bg-white/[0.03] dark:text-slate-400">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-line bg-surface text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                  <Icon name="upload" className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-slate-700 dark:text-slate-200">
                    {photoFile ? photoFile.name : 'Chọn ảnh JPG / PNG / WebP'}
                  </span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                    Tối đa 8 MB · ảnh chỉ bạn xem
                  </span>
                </span>
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
                  className="sr-only"
                />
              </label>
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
              {!log && <p className="text-[11px] text-amber-600">Chưa có bản ghi ngày này.</p>}
              {photoError && <p className="text-xs text-rose-500">{photoError}</p>}
            </div>

            {log?.photos?.length ? (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {log.photos.map((photo) => (
                  <div key={photo.filename} className="group relative">
                    <a href={metricPhotoUrl(photo.filename)} target="_blank" rel="noreferrer">
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
                        dialog
                          .confirm({
                            title: 'Xóa ảnh tiến độ',
                            message: 'Xóa ảnh này? Hành động không thể hoàn tác.',
                            confirmLabel: 'Xóa ảnh',
                          })
                          .then((ok) => {
                            if (ok) removePhoto.mutate(photo.filename);
                          });
                      }}
                      aria-label="Xóa ảnh"
                    >
                      <Icon name="close" className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Chưa có ảnh.</p>
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
                <p className="py-3 text-sm text-slate-500 dark:text-slate-400">Chưa có bản ghi nào.</p>
              )}
            </div>
            {recentLogs.length > 10 && (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Hiển thị 10 bản ghi mới nhất.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
