import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Card, Field, Icon, LoadingBlock, Stat } from '../components/ui.jsx';
import BrandLogo from '../components/BrandLogo.jsx';
import WeightChart from '../components/WeightChart.jsx';
import Heatmap from '../components/Heatmap.jsx';
import { fetchSummary, saveMetric } from '../api/metrics.js';
import { getErrorMessage } from '../api/client.js';
import { useAuth } from '../hooks/useAuth.jsx';
import { calorieTarget } from '@shared/calculators/index.js';
import { formatLongDate, todayKey } from '../lib/date.js';
import { formatNumber, formatSigned, GOAL_LABELS } from '../lib/format.js';

export default function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [weight, setWeight] = useState('');
  const [notice, setNotice] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['summary', 90],
    queryFn: () => fetchSummary(90),
  });

  const quickSave = useMutation({
    mutationFn: (body) => saveMetric(todayKey(), body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      queryClient.invalidateQueries({ queryKey: ['metric'] });
      setWeight('');
      setNotice({ tone: 'success', text: 'Đã lưu cân nặng hôm nay.' });
    },
    onError: (err) => setNotice({ tone: 'danger', text: getErrorMessage(err) }),
  });

  if (isLoading) return <LoadingBlock />;

  if (error) {
    return <Alert tone="danger" title="Không tải được dữ liệu">{getErrorMessage(error)}</Alert>;
  }

  const latest = data?.latest;
  const previous = data?.previous;
  const trend = data?.trend || [];
  const rate = data?.rate;
  const warnings = data?.warnings || [];
  const goal = data?.profile?.goal || user?.profile?.goal || 'maintain';
  const tdee = latest?.computed?.tdee;
  const targets = tdee ? calorieTarget(tdee, goal) : null;
  const bodyFat = latest?.computed?.bodyFatNavy ?? latest?.bodyFatPct;
  const delta =
    latest && previous ? Number(latest.weightKg) - Number(previous.weightKg) : null;
  const profileMissing =
    !user?.profile?.heightCm || !user?.profile?.sex || !user?.profile?.birthDate;
  const hour = new Date().getHours();
  const greeting = hour < 11 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  const onQuickSave = (e) => {
    e.preventDefault();
    setNotice(null);
    const value = Number(weight);
    if (!value || value < 20 || value > 400) {
      setNotice({ tone: 'danger', text: 'Cân nặng phải trong khoảng 20-400 kg.' });
      return;
    }
    quickSave.mutate({ weightKg: value });
  };

  return (
    <div>
      <section className="relative mb-5 overflow-hidden rounded-3xl border border-white/10 bg-[#071416] p-6 text-white shadow-[0_40px_90px_-45px_rgba(4,47,46,0.9)] sm:p-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-16 -top-24 h-80 w-80 rounded-full bg-brand-500/25 blur-[90px]" />
          <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-teal-400/10 blur-[80px]" />
          <div className="surface-grid absolute inset-0 opacity-[0.12]" />
          <div className="absolute -right-12 -top-16 rotate-12 opacity-25">
            <BrandLogo size={300} />
          </div>
        </div>

        <div className="relative max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-200/80">
            {greeting} · {formatLongDate(todayKey())}
          </p>
          <h1 className="mt-2 text-[1.9rem] font-extrabold leading-[1.15] tracking-[-0.03em] sm:text-[2.35rem]">
            Mỗi buổi tập là một
            <span className="bg-gradient-to-r from-brand-300 via-teal-200 to-emerald-200 bg-clip-text text-transparent">
              {' '}
              thí nghiệm nhỏ.
            </span>
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300/80">
            {data?.count
              ? `Bạn đã ghi ${data.count} ngày dữ liệu. Theo dõi xu hướng, không phải dao động từng ngày.`
              : 'Bắt đầu bằng một con số hôm nay: cân nặng, số đo hoặc một buổi tập.'}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[11px] font-semibold text-slate-200">
              <Icon name="target" className="h-3.5 w-3.5 text-brand-300" />
              {GOAL_LABELS[goal] || 'Duy trì'}
            </span>
            {latest && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[11px] font-semibold text-slate-200">
                <Icon name="scale" className="h-3.5 w-3.5 text-brand-300" />
                {formatNumber(latest.weightKg, 1)} kg
              </span>
            )}
            {tdee && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[11px] font-semibold text-slate-200">
                <Icon name="flame" className="h-3.5 w-3.5 text-brand-300" />
                TDEE {formatNumber(tdee, 0)} kcal
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Link
              to="/body-log"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-brand-900 shadow-lg transition hover:bg-brand-50"
            >
              <Icon name="plus" className="h-4 w-4" />
              Nhập số đo hôm nay
            </Link>
            <Link
              to="/training?tab=workout"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/[0.14]"
            >
              <Icon name="dumbbell" className="h-4 w-4" />
              Log buổi tập
            </Link>
            <Link
              to="/research"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/[0.14]"
            >
              <Icon name="book" className="h-4 w-4" />
              Đọc nghiên cứu
            </Link>
          </div>
        </div>
      </section>

      {profileMissing && (
        <Alert tone="warning" title="Hoàn thiện hồ sơ để tính chỉ số chính xác" className="mb-4">
          Cần giới tính, ngày sinh và chiều cao để tính BMR, TDEE, % mỡ và FFMI.{' '}
          <Link to="/settings" className="font-semibold underline">
            Cập nhật hồ sơ
          </Link>
        </Alert>
      )}

      {warnings.length > 0 && (
        <div className="mb-4 space-y-2">
          {warnings.map((w) => (
            <Alert key={w.code} tone={w.severity === 'danger' ? 'danger' : w.severity === 'warning' ? 'warning' : 'info'}>
              {w.message}
            </Alert>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Cân nặng hiện tại"
          value={latest ? formatNumber(latest.weightKg, 1) : '—'}
          unit={latest ? 'kg' : ''}
          hint={
            delta === null
              ? 'Chưa có dữ liệu hôm trước'
              : `So với lần nhập trước: ${formatSigned(delta, 1, ' kg')}`
          }
          icon="scale"
        />
        <Stat
          label="Trung bình 7 ngày"
          value={trend.length ? formatNumber(trend.at(-1).ma7, 1) : '—'}
          unit={trend.length ? 'kg' : ''}
          hint="Làm mượt biến động cân nặng hằng ngày"
          icon="activity"
        />
        <Stat
          label="Tốc độ đổi cân"
          value={rate ? formatNumber(rate.weeklyRatePct, 2) : '—'}
          unit={rate ? '%/tuần' : ''}
          tone={
            rate && Math.abs(rate.weeklyRatePct) > 1
              ? 'warning'
              : rate
                ? 'brand'
                : 'default'
          }
          hint={
            rate
              ? `TB 7 ngày: ${formatNumber(rate.recentAvg, 1)} kg · trước đó ${formatNumber(rate.previousAvg, 1)} kg`
              : 'Cần thêm dữ liệu (tối thiểu 2 tuần)'
          }
          icon="flame"
        />
        <Stat
          label="% mỡ cơ thể"
          value={bodyFat ? formatNumber(bodyFat, 1) : '—'}
          unit={bodyFat ? '%' : ''}
          hint={
            bodyFat
              ? latest?.computed?.bodyFatNavy
                ? 'Tính bằng công thức US Navy'
                : 'Số bạn nhập tay'
              : 'Nhập số đo cổ / bụng để tính'
          }
          icon="target"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Xu hướng cân nặng
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Đường liền là cân nặng, đường nét đứt là trung bình trượt 7 ngày.
              </p>
            </div>
            <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              90 ngày
            </span>
          </div>
          <WeightChart data={trend} />
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Nhập nhanh hôm nay</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Chỉ cân nặng là bắt buộc. Các số đo khác nhập ở trang Theo dõi cơ thể.
          </p>
          <form onSubmit={onQuickSave} className="mt-4 space-y-3">
            <Field label="Cân nặng (kg)">
              <input
                className="input text-lg font-semibold"
                type="number"
                inputMode="decimal"
                step="0.1"
                min="20"
                max="400"
                placeholder={latest ? String(latest.weightKg) : '72.5'}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </Field>
            <button type="submit" className="btn-primary w-full" disabled={quickSave.isPending}>
              {quickSave.isPending ? 'Đang lưu...' : 'Lưu cân nặng'}
            </button>
          </form>

          {notice && (
            <Alert tone={notice.tone} className="mt-3">
              {notice.text}
            </Alert>
          )}

          <div className="mt-5 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Mục tiêu hiện tại</p>
            <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
              {GOAL_LABELS[goal] || 'Duy trì'}
            </p>
            {tdee ? (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                TDEE ước tính {formatNumber(tdee, 0)} kcal · mục tiêu{' '}
                {formatNumber(targets.min, 0)}–{formatNumber(targets.max, 0)} kcal/ngày
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Cần hồ sơ đầy đủ để ước tính TDEE.
              </p>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Lịch nhập liệu</h2>
            <span className="text-xs text-slate-400">{data?.count || 0} ngày đã lưu</span>
          </div>
          <Heatmap logs={trend} />
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Gợi ý bước tiếp theo</h2>
          <ul className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex gap-3">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                1
              </span>
              Nhập cân nặng mỗi sáng sau khi thức dậy, cùng điều kiện để giảm nhiễu.
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                2
              </span>
              Đo vòng bụng / cổ 1-2 lần mỗi tuần để theo dõi % mỡ và FFMI.
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                3
              </span>
              Dùng máy tính TDEE để chốt calo mục tiêu và macro trước khi lên giáo án.
            </li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/calculators" className="btn-secondary">
              Máy tính chỉ số
              <Icon name="arrowRight" className="h-4 w-4" />
            </Link>
            <a href={`${import.meta.env.VITE_API_BASE || '/api'}/metrics/export.csv`} className="btn-ghost">
              <Icon name="download" className="h-4 w-4" />
              Xuất CSV
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
