import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Card, Field, Icon, PageHeader, Spinner } from '../components/ui.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { useTheme } from '../hooks/useTheme.jsx';
import { profileSchema } from '../lib/schemas.js';
import { getErrorMessage } from '../api/client.js';
import { fetchAiUsage } from '../api/auth.js';
import { ACTIVITY_LABELS, EXPERIENCE_LABELS, GOAL_LABELS } from '../lib/format.js';
import { HEALTH_CONDITIONS } from '@shared/health/conditions.js';

const AI_KIND_LABELS = [
  ['summarize', 'Tóm tắt'],
  ['ask', 'Hỏi đáp'],
  ['search', 'Tìm nghiên cứu'],
  ['translate', 'Dịch bài'],
  ['apply', 'Giáo án AI'],
  ['quiz', 'Quiz'],
  ['vision', 'Phân tích ảnh'],
  ['mealplan', 'Meal plan'],
  ['muscle', 'Chat cơ bắp'],
];

export default function Settings() {
  const { user, saveProfile, removeAccount, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [conditions, setConditions] = useState(user?.profile?.healthConditions || []);
  const [conditionNotes, setConditionNotes] = useState(user?.profile?.conditionNotes || '');
  const aiUsageQuery = useQuery({
    queryKey: ['ai-usage'],
    queryFn: fetchAiUsage,
    staleTime: 30_000,
  });
  const aiUsage = aiUsageQuery.data;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      sex: user?.profile?.sex || '',
      birthDate: user?.profile?.birthDate ? String(user.profile.birthDate).slice(0, 10) : '',
      heightCm: user?.profile?.heightCm ?? '',
      weightKg: user?.profile?.weightKg ?? '',
      activityLevel: user?.profile?.activityLevel || 'moderate',
      goal: user?.profile?.goal || 'maintain',
      experience: user?.profile?.experience || 'beginner',
    },
  });

  useEffect(() => {
    if (!user) return;
    setConditions(user.profile?.healthConditions || []);
    setConditionNotes(user.profile?.conditionNotes || '');
    reset({
      name: user.name || '',
      sex: user.profile?.sex || '',
      birthDate: user.profile?.birthDate ? String(user.profile.birthDate).slice(0, 10) : '',
      heightCm: user.profile?.heightCm ?? '',
      weightKg: user.profile?.weightKg ?? '',
      activityLevel: user.profile?.activityLevel || 'moderate',
      goal: user.profile?.goal || 'maintain',
      experience: user.profile?.experience || 'beginner',
    });
  }, [user, reset]);

  const onSubmit = async (values) => {
    setNotice(null);
    try {
      await saveProfile({
        name: values.name,
        profile: {
          sex: values.sex || undefined,
          birthDate: values.birthDate || undefined,
          heightCm: values.heightCm,
          weightKg: values.weightKg,
          activityLevel: values.activityLevel,
          goal: values.goal,
          experience: values.experience,
          healthConditions: conditions,
          conditionNotes: conditionNotes.trim(),
        },
      });
      setNotice({ tone: 'success', text: 'Đã lưu hồ sơ. Các máy tính sẽ dùng thông tin mới.' });
    } catch (error) {
      setNotice({ tone: 'danger', text: getErrorMessage(error) });
    }
  };

  const toggleCondition = (key) =>
    setConditions((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );

  const onDelete = async () => {
    if (confirmText.trim().toUpperCase() !== 'XOA') return;
    setDeleting(true);
    try {
      await removeAccount();
      navigate('/register', { replace: true });
    } catch (error) {
      setNotice({ tone: 'danger', text: getErrorMessage(error) });
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Cài đặt" subtitle="Hồ sơ là nguồn dữ liệu cho mọi phép tính trong app." />

      {notice && (
        <Alert tone={notice.tone} className="mb-4">
          {notice.text}
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Hồ sơ cá nhân</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Giới tính, ngày sinh, chiều cao và cân nặng được dùng để tính BMR, TDEE, % mỡ và FFMI.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4" noValidate>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Họ tên" error={errors.name?.message}>
                <input className="input" placeholder="Nguyễn Văn A" {...register('name')} />
              </Field>
              <Field label="Email">
                <input className="input bg-slate-50 dark:bg-slate-800" value={user?.email || ''} readOnly />
              </Field>
              <Field label="Giới tính" error={errors.sex?.message}>
                <select className="select" {...register('sex')}>
                  <option value="">Chưa chọn</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </Field>
              <Field label="Ngày sinh" error={errors.birthDate?.message}>
                <input className="input" type="date" {...register('birthDate')} />
              </Field>
              <Field label="Chiều cao (cm)" error={errors.heightCm?.message}>
                <input
                  className="input"
                  type="number"
                  inputMode="decimal"
                  min="100"
                  max="250"
                  placeholder="175"
                  {...register('heightCm')}
                />
              </Field>
              <Field
                label="Cân nặng (kg)"
                hint="Dùng làm mặc định khi chưa có lần cân nào trong Theo dõi cơ thể."
                error={errors.weightKg?.message}
              >
                <input
                  className="input"
                  type="number"
                  inputMode="decimal"
                  min="20"
                  max="400"
                  step="0.1"
                  placeholder="72.5"
                  {...register('weightKg')}
                />
              </Field>
              <Field label="Kinh nghiệm" error={errors.experience?.message}>
                <select className="select" {...register('experience')}>
                  {Object.entries(EXPERIENCE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Mức vận động" error={errors.activityLevel?.message}>
                <select className="select" {...register('activityLevel')}>
                  {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Mục tiêu" error={errors.goal?.message}>
                <select className="select" {...register('goal')}>
                  {Object.entries(GOAL_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="rounded-lg border border-slate-200 p-3.5 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Tình trạng sức khỏe
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Giúp AI lập giáo án tránh bài không phù hợp. Không thay thế tư vấn y tế.
                  </p>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {conditions.length ? `${conditions.length} mục đã chọn` : 'Không có'}
                </span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {HEALTH_CONDITIONS.map((item) => {
                  const active = conditions.includes(item.key);
                  return (
                    <button
                      key={item.key}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleCondition(item.key)}
                      className={`inline-flex h-7 items-center gap-1 rounded-md border px-2 text-[11px] font-medium transition-colors ${
                        active
                          ? 'border-ochre-300 bg-ochre-50 text-ochre-800 dark:border-ochre-700 dark:bg-ochre-900/30 dark:text-ochre-200'
                          : 'border-line text-slate-600 hover:border-line-strong dark:border-white/10 dark:text-slate-400 dark:hover:border-white/20'
                      }`}
                    >
                      {item.vi}
                    </button>
                  );
                })}
              </div>
              <label className="mt-2.5 block">
                <span className="label">Ghi chú sức khỏe cho AI</span>
                <textarea
                  className="input min-h-[70px]"
                  maxLength={1000}
                  placeholder="VD: thoát vị L4-L5, đang đau nhẹ khi cúi; bác sĩ cho tập nhẹ..."
                  value={conditionNotes}
                  onChange={(e) => setConditionNotes(e.target.value)}
                />
              </label>
            </div>

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting && <Spinner className="h-4 w-4 text-white" />}
              Lưu hồ sơ
            </button>
          </form>
        </Card>

        <div className="space-y-4">
          <Card>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Giao diện</h2>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Chế độ tối</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Phù hợp khi dùng trong phòng gym.</p>
              </div>
              <button
                type="button"
                onClick={toggle}
                role="switch"
                aria-checked={isDark}
                className={`relative h-7 w-12 rounded-full transition ${
                  isDark ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                    isDark ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </Card>

          <Card>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Trợ lý AI</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Model: <span className="font-semibold">DeepSeek V4.1</span> · Vision:{' '}
              <span className="font-semibold">Gemini</span>
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Dùng cho tóm tắt bài báo, tìm nghiên cứu, phân tích ảnh, quiz, meal plan và giáo án.
            </p>

            {aiUsageQuery.isLoading ? (
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Spinner className="h-4 w-4" /> Đang tải lượt dùng...
              </div>
            ) : aiUsage ? (
              <div className="mt-3 rounded-lg border border-slate-200 p-2.5 dark:border-slate-800">
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                  {AI_KIND_LABELS.map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between gap-2">
                      <span className="text-slate-500 dark:text-slate-400">{label}</span>
                      <span className="font-mono text-slate-700 dark:text-slate-200">
                        {aiUsage[key] || 0}/{aiUsage.limit}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 border-t border-slate-100 pt-2 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  Token: {(aiUsage.tokensIn + aiUsage.tokensOut).toLocaleString('vi-VN')} · Chi phí
                  hôm nay: ${Number(aiUsage.costUsd || 0).toFixed(4)}
                </p>
                <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                  Mỗi loại có quota riêng, làm mới theo ngày (UTC+7).
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => aiUsageQuery.refetch()}
                className="btn-ghost mt-2 !px-2 !py-1 text-xs"
              >
                Không tải được lượt dùng — thử lại
              </button>
            )}
          </Card>

          <Card>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Dữ liệu của bạn</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Xuất toàn bộ BodyLog ra CSV. Dữ liệu cơ thể là dữ liệu nhạy cảm, chỉ bạn truy cập được.
            </p>
            <a
              href={`${import.meta.env.VITE_API_BASE || '/api'}/metrics/export.csv`}
              className="btn-secondary mt-3 w-full"
            >
              <Icon name="download" className="h-4 w-4" />
              Xuất CSV
            </a>
            <button type="button" onClick={logout} className="btn-ghost mt-2 w-full">
              <Icon name="logout" className="h-4 w-4" />
              Đăng xuất
            </button>
          </Card>
        </div>
      </div>

      <Card className="mt-4 border-rose-200 dark:border-rose-900/60">
        <h2 className="text-base font-semibold text-rose-600 dark:text-rose-400">Xóa tài khoản</h2>
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Hành động này xóa vĩnh viễn tài khoản cùng toàn bộ dữ liệu cơ thể, lịch sử tính toán và nội dung
          đã lưu. Không thể hoàn tác. Nhập <span className="font-bold">XOA</span> để xác nhận.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            className="input max-w-[200px]"
            placeholder="Nhập XOA"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
          <button
            type="button"
            className="btn bg-rose-600 text-white hover:bg-rose-700"
            disabled={confirmText.trim().toUpperCase() !== 'XOA' || deleting}
            onClick={onDelete}
          >
            {deleting ? 'Đang xóa...' : 'Xóa vĩnh viễn tài khoản'}
          </button>
        </div>
      </Card>

      <p className="mt-6 text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        PT Brain · Chỉ số và gợi ý chỉ mang tính ước lượng, không thay thế bác sĩ hoặc chuyên gia dinh dưỡng.
        Bản tóm tắt AI (giai đoạn sau) có thể sai, cần đối chiếu bài gốc với kết luận quan trọng.
      </p>
    </div>
  );
}
