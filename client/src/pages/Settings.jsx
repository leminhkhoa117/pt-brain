import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Card, Field, Icon, PageHeader, Spinner } from '../components/ui.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { useTheme } from '../hooks/useTheme.jsx';
import { profileSchema } from '../lib/schemas.js';
import { getErrorMessage } from '../api/client.js';
import { ACTIVITY_LABELS, EXPERIENCE_LABELS, GOAL_LABELS } from '../lib/format.js';

export default function Settings() {
  const { user, saveProfile, removeAccount, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

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
      activityLevel: user?.profile?.activityLevel || 'moderate',
      goal: user?.profile?.goal || 'maintain',
      experience: user?.profile?.experience || 'beginner',
    },
  });

  useEffect(() => {
    if (!user) return;
    reset({
      name: user.name || '',
      sex: user.profile?.sex || '',
      birthDate: user.profile?.birthDate ? String(user.profile.birthDate).slice(0, 10) : '',
      heightCm: user.profile?.heightCm ?? '',
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
          activityLevel: values.activityLevel,
          goal: values.goal,
          experience: values.experience,
        },
      });
      setNotice({ tone: 'success', text: 'Đã lưu hồ sơ. Các máy tính sẽ dùng thông tin mới.' });
    } catch (error) {
      setNotice({ tone: 'danger', text: getErrorMessage(error) });
    }
  };

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
            Giới tính, ngày sinh và chiều cao được dùng để tính BMR, TDEE, % mỡ và FFMI.
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
                <select className="input" {...register('sex')}>
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
              <Field label="Kinh nghiệm" error={errors.experience?.message}>
                <select className="input" {...register('experience')}>
                  {Object.entries(EXPERIENCE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Mức vận động" error={errors.activityLevel?.message}>
                <select className="input" {...register('activityLevel')}>
                  {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Mục tiêu" error={errors.goal?.message}>
                <select className="input" {...register('goal')}>
                  {Object.entries(GOAL_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
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
                <p className="text-xs text-slate-400">Phù hợp khi dùng trong phòng gym.</p>
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

      <p className="mt-6 text-center text-xs leading-relaxed text-slate-400">
        PT Brain · Chỉ số và gợi ý chỉ mang tính ước lượng, không thay thế bác sĩ hoặc chuyên gia dinh dưỡng.
        Bản tóm tắt AI (giai đoạn sau) có thể sai, cần đối chiếu bài gốc với kết luận quan trọng.
      </p>
    </div>
  );
}
