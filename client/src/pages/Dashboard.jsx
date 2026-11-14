import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Badge, Field, Icon, LoadingBlock, Panel, PageHeader, Stat } from '../components/ui.jsx';
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
    return (
      <Alert tone="danger" title="Không tải được dữ liệu">
        {getErrorMessage(error)}
      </Alert>
    );
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
  const delta = latest && previous ? Number(latest.weightKg) - Number(previous.weightKg) : null;
  const profileMissing = !user?.profile?.heightCm || !user?.profile?.sex || !user?.profile?.birthDate;

  const onQuickSave = (e) => {
    e.preventDefault();
    setNotice(null);
    const value = Number(weight);
    if (!value || value < 20 || value > 400) {
      setNotice({ tone: 'danger', text: 'Cân nặng phải trong khoảng 20–400 kg.' });
      return;
    }
    quickSave.mutate({ weightKg: value });
  };

  return (
    <div>
      <PageHeader
        title="Hôm nay"
        subtitle={
          data?.count
            ? `Bạn đã ghi ${data.count} ngày dữ liệu. Đọc xu hướng, không đọc dao động từng ngày.`
            : 'Bắt đầu bằng một con số hôm nay: cân nặng, số đo hoặc một buổi tập.'
        }
        meta={
          <>
            <span>{formatLongDate(todayKey())}</span>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span>Mục tiêu: {GOAL_LABELS[goal] || 'Duy trì'}</span>
          </>
        }
        actions={
          <>
            <Link to="/body-log" className="btn-primary">
              <Icon name="plus" className="h-3.5 w-3.5" />
              Ghi số đo
            </Link>
            <Link to="/training?tab=workout" className="btn-secondary">
              <Icon name="dumbbell" className="h-3.5 w-3.5" />
              Log buổi tập
            </Link>
          </>
        }
      />

      {profileMissing && (
        <div className="mb-4">
          <Alert tone="warning" title="Hồ sơ chưa đủ để tính chỉ số">
            Cần giới tính, ngày sinh và chiều cao để tính BMR, TDEE, % mỡ và FFMI.{' '}
            <Link to="/settings" className="link">
              Cập nhật hồ sơ
            </Link>
          </Alert>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mb-4 space-y-1.5">
          {warnings.map((w) => (
            <Alert
              key={w.code}
              tone={w.severity === 'danger' ? 'danger' : w.severity === 'warning' ? 'warning' : 'info'}
            >
              {w.message}
            </Alert>
          ))}
        </div>
      )}

      {/* Signature: ruled measurement strip */}
      <section className="panel overflow-hidden p-0" aria-label="Chỉ số mới nhất">
        <div className="grid grid-cols-2 gap-px bg-line dark:bg-white/[0.08] lg:grid-cols-4">
          <div className="border-t-2 border-t-pine-600 bg-surface dark:border-t-pine-400 dark:bg-[#151b18]">
            <Stat
              label="Cân nặng"
              value={latest ? formatNumber(latest.weightKg, 1) : '—'}
              unit={latest ? 'kg' : ''}
              info="Cân nặng của bản ghi mới nhất trong Theo dõi cơ thể. Nên cân cùng thời điểm mỗi ngày để giảm nhiễu."
              hint={
                delta === null
                  ? 'Chưa có dữ liệu hôm trước'
                  : `So với lần nhập trước: ${formatSigned(delta, 1, ' kg')}`
              }
              icon="scale"
            />
          </div>
          <div className="bg-surface dark:bg-[#151b18]">
            <Stat
              label="TB 7 ngày"
              value={trend.length ? formatNumber(trend.at(-1).ma7, 1) : '—'}
              unit={trend.length ? 'kg' : ''}
              info="MA7 – trung bình trượt 7 ngày của cân nặng. Đường này làm mượt dao động nước, muối và thời điểm cân để thấy xu hướng thật."
              hint="Đã làm mượt biến động hằng ngày"
              icon="activity"
            />
          </div>
          <div className="bg-surface dark:bg-[#151b18]">
            <Stat
              label="Tốc độ đổi"
              value={rate ? formatNumber(rate.weeklyRatePct, 2) : '—'}
              unit={rate ? '%/tuần' : ''}
              info="Phần trăm thay đổi cân nặng mỗi tuần, tính từ trung bình 7 ngày gần nhất so với 7 ngày trước đó. Tăng/giảm 0,25–1%/tuần thường là mức hợp lý."
              tone={rate && Math.abs(rate.weeklyRatePct) > 1 ? 'warning' : rate ? 'brand' : 'default'}
              hint={
                rate
                  ? `TB 7 ngày ${formatNumber(rate.recentAvg, 1)} kg · trước đó ${formatNumber(rate.previousAvg, 1)} kg`
                  : 'Cần tối thiểu 2 tuần dữ liệu'
              }
              icon="flame"
            />
          </div>
          <div className="bg-surface dark:bg-[#151b18]">
            <Stat
              label="% mỡ cơ thể"
              value={bodyFat ? formatNumber(bodyFat, 1) : '—'}
              unit={bodyFat ? '%' : ''}
              info="Tỷ lệ khối lượng mỡ trên tổng cân nặng. Ước tính bằng công thức US Navy từ số đo cổ/bụng (và mông với nữ), hoặc số bạn tự nhập."
              hint={
                bodyFat
                  ? latest?.computed?.bodyFatNavy
                    ? 'US Navy · từ số đo cổ / bụng'
                    : 'Số bạn nhập tay'
                  : 'Nhập số đo cổ / bụng để tính'
              }
              icon="target"
            />
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          title="Xu hướng cân nặng"
          note="Đường liền là cân nặng; đường nét đứt là trung bình trượt 7 ngày."
          actions={<Badge>90 ngày</Badge>}
        >
          <WeightChart data={trend} height={280} />
        </Panel>

        <div className="space-y-4">
          <Panel title="Ghi nhanh" note="Chỉ cân nặng là bắt buộc. Số đo khác nằm ở trang Theo dõi cơ thể.">
            <form onSubmit={onQuickSave}>
              <Field label="Cân nặng hôm nay (kg)">
                <div className="flex gap-2">
                  <input
                    className="input num text-[15px]"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    min="20"
                    max="400"
                    placeholder={latest ? String(latest.weightKg) : '72.5'}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                  <button type="submit" className="btn-primary" disabled={quickSave.isPending}>
                    {quickSave.isPending ? 'Đang lưu…' : 'Lưu'}
                  </button>
                </div>
              </Field>
            </form>
            {notice && (
              <Alert tone={notice.tone} className="mt-3">
                {notice.text}
              </Alert>
            )}
          </Panel>

          <Panel title="Mục tiêu hiện tại" flush>
            <dl className="divide-y divide-line text-[12.5px] dark:divide-white/[0.07]">
              <div className="flex items-baseline justify-between gap-4 px-4 py-2.5 sm:px-5">
                <dt className="text-slate-500 dark:text-slate-400">Mục tiêu</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-100">
                  {GOAL_LABELS[goal] || 'Duy trì'}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 px-4 py-2.5 sm:px-5">
                <dt className="text-slate-500 dark:text-slate-400">TDEE ước tính</dt>
                <dd className="num text-slate-900 dark:text-slate-100">
                  {tdee ? `${formatNumber(tdee, 0)} kcal` : '—'}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 px-4 py-2.5 sm:px-5">
                <dt className="text-slate-500 dark:text-slate-400">Calo mục tiêu</dt>
                <dd className="num text-slate-900 dark:text-slate-100">
                  {targets ? `${formatNumber(targets.min, 0)}–${formatNumber(targets.max, 0)}` : '—'}
                </dd>
              </div>
            </dl>
          </Panel>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel
          title="Lịch nhập liệu"
          note={`${data?.count || 0} ngày đã lưu trong 8 tuần gần nhất`}
          actions={
            <Link to="/body-log" className="btn-ghost btn-sm">
              Mở nhật ký
              <Icon name="arrowRight" className="h-3.5 w-3.5" />
            </Link>
          }
        >
          <Heatmap logs={trend} />
        </Panel>

        <Panel title="Việc nên làm tiếp" note="Theo thứ tự ưu tiên cho tuần này." flush>
          <ol className="divide-y divide-line dark:divide-white/[0.07]">
            {[
              {
                text: 'Cân mỗi sáng sau khi thức dậy, cùng điều kiện để giảm nhiễu.',
                to: '/body-log',
                action: 'Ghi cân nặng',
              },
              {
                text: 'Đo vòng bụng / cổ 1–2 lần mỗi tuần để theo dõi % mỡ và FFMI.',
                to: '/body-log',
                action: 'Nhập số đo',
              },
              {
                text: 'Chốt calo mục tiêu và macro trước khi lên giáo án.',
                to: '/calculators',
                action: 'Máy tính TDEE',
              },
            ].map((step, index) => (
              <li
                key={step.text}
                className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-paper-2/40 sm:px-5 dark:hover:bg-white/[0.015]"
              >
                <span className="mt-0.5 rounded bg-paper-2 px-1.5 py-0.5 font-mono text-[10.5px] tabular-nums text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className="min-w-0 flex-1 text-[12.5px] leading-relaxed text-slate-600 dark:text-slate-300">
                  {step.text}
                </p>
                <Link
                  to={step.to}
                  className="shrink-0 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-pine-700 hover:underline dark:text-pine-300"
                >
                  {step.action} →
                </Link>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-2 border-t border-line px-4 py-3 dark:border-white/[0.07] sm:px-5">
            <Link to="/calculators" className="btn-secondary btn-sm">
              Máy tính chỉ số
            </Link>
            <Link to="/muscles" className="btn-ghost btn-sm">
              <Icon name="target" className="h-3.5 w-3.5" />
              Cơ bắp 3D
            </Link>
            <a
              href={`${import.meta.env.VITE_API_BASE || '/api'}/metrics/export.csv`}
              className="btn-ghost btn-sm"
            >
              <Icon name="download" className="h-3.5 w-3.5" />
              Xuất CSV
            </a>
          </div>
        </Panel>
      </div>
    </div>
  );
}
