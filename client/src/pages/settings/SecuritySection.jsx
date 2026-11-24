import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Badge, Card, Field, Icon, Spinner } from '../../components/ui.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';
import { changePasswordSchema } from '../../lib/schemas.js';
import { getErrorMessage } from '../../api/client.js';
import { fetchSessions, revokeOtherSessions, revokeSession } from '../../api/auth.js';
import { Link } from 'react-router-dom';

function SessionRow({ session, onRevoke, busy }) {
  return (
    <li className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 py-2.5 last:border-0 dark:border-white/[0.06]">
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-1.5 text-[12.5px] font-semibold text-slate-800 dark:text-slate-100">
          {session.device || 'Thiết bị không rõ'}
          {session.current && <Badge tone="pine">Thiết bị này</Badge>}
          {!session.remember && <Badge tone="neutral">Phiên tạm</Badge>}
        </p>
        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
          {session.ip || 'IP không rõ'} · Hoạt động {new Date(session.lastUsedAt).toLocaleString('vi-VN')}
        </p>
      </div>
      {!session.current && (
        <button
          type="button"
          onClick={() => onRevoke(session.id)}
          disabled={busy}
          className="rounded-md px-2 py-1 text-[11px] font-semibold text-vermilion-600 hover:bg-vermilion-50 disabled:opacity-50 dark:text-vermilion-300 dark:hover:bg-vermilion-950/30"
        >
          Thu hồi
        </button>
      )}
    </li>
  );
}

export default function SecuritySection() {
  const { user, changePassword } = useAuth();
  const [notice, setNotice] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [revokingOthers, setRevokingOthers] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const hasPassword = Boolean(user?.hasPassword);

  const sessionsQuery = useQuery({
    queryKey: ['auth-sessions'],
    queryFn: fetchSessions,
    staleTime: 15_000,
  });
  const sessions = sessionsQuery.data?.sessions || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (values) => {
    setNotice(null);
    try {
      const result = await changePassword({
        currentPassword: hasPassword ? values.currentPassword : undefined,
        newPassword: values.newPassword,
      });
      reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setNotice({
        tone: 'success',
        text: result?.sessionsRevoked
          ? 'Đã cập nhật mật khẩu. Các thiết bị khác đã bị đăng xuất.'
          : 'Đã cập nhật mật khẩu.',
      });
      sessionsQuery.refetch();
    } catch (error) {
      setError('root', { message: getErrorMessage(error, 'Không đổi được mật khẩu') });
    }
  };

  const onRevoke = async (id) => {
    setBusyId(id);
    setNotice(null);
    try {
      await revokeSession(id);
      await sessionsQuery.refetch();
    } catch (error) {
      setNotice({ tone: 'danger', text: getErrorMessage(error) });
    } finally {
      setBusyId(null);
    }
  };

  const onRevokeOthers = async () => {
    setRevokingOthers(true);
    setNotice(null);
    try {
      const result = await revokeOtherSessions();
      setNotice({
        tone: 'success',
        text: `Đã thu hồi ${result.revoked || 0} phiên trên thiết bị khác.`,
      });
      await sessionsQuery.refetch();
    } catch (error) {
      setNotice({ tone: 'danger', text: getErrorMessage(error) });
    } finally {
      setRevokingOthers(false);
    }
  };

  const providerText = useMemo(() => {
    if (user?.googleLinked && hasPassword) return 'Google + mật khẩu';
    if (user?.googleLinked) return 'Google';
    return 'Email + mật khẩu';
  }, [hasPassword, user?.googleLinked]);

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Bảo mật tài khoản</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Phương thức đăng nhập: <span className="font-semibold">{providerText}</span>
          </p>
        </div>
        <span className="badge badge-pine">
          <Icon name="lock" className="h-3 w-3" />
          httpOnly
        </span>
      </div>

      {notice && (
        <Alert tone={notice.tone} className="mt-3">
          {notice.text}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3" noValidate>
        <p className="text-[12.5px] font-semibold text-slate-800 dark:text-slate-100">
          {hasPassword ? 'Đổi mật khẩu' : 'Đặt mật khẩu cho tài khoản Google'}
        </p>
        {errors.root?.message && <Alert tone="danger">{errors.root.message}</Alert>}
        {hasPassword && (
          <Field label="Mật khẩu hiện tại" error={errors.currentPassword?.message}>
            <input
              className="input"
              type="password"
              autoComplete="current-password"
              {...register('currentPassword')}
            />
          </Field>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Mật khẩu mới"
            hint="Tối thiểu 10 ký tự, có chữ cái và chữ số."
            error={errors.newPassword?.message}
          >
            <div className="relative">
              <input
                className="input pr-14"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...register('newPassword')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute inset-y-0 right-0 px-2.5 text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              >
                {showPassword ? 'Ẩn' : 'Hiện'}
              </button>
            </div>
          </Field>
          <Field label="Nhập lại mật khẩu mới" error={errors.confirmPassword?.message}>
            <input
              className="input"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              {...register('confirmPassword')}
            />
          </Field>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting && <Spinner className="h-4 w-4 text-white" />}
            {hasPassword ? 'Đổi mật khẩu' : 'Đặt mật khẩu'}
          </button>
          {hasPassword && (
            <Link to="/forgot-password" className="text-[12px] font-semibold text-brand-600 hover:underline dark:text-brand-400">
              Quên mật khẩu hiện tại?
            </Link>
          )}
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
          Đổi mật khẩu sẽ đăng xuất mọi thiết bị khác. Mật khẩu được băm bằng bcrypt, không lưu dạng đọc được.
        </p>
      </form>

      <div className="mt-5 border-t border-slate-200 pt-4 dark:border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[12.5px] font-semibold text-slate-800 dark:text-slate-100">Phiên đăng nhập</p>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              Mỗi thiết bị là một phiên riêng. Thu hồi ngay khi mất máy hoặc dùng máy chung.
            </p>
          </div>
          {sessions.length > 1 && (
            <button
              type="button"
              onClick={onRevokeOthers}
              disabled={revokingOthers}
              className="btn-ghost !px-2 !py-1 text-[11px]"
            >
              {revokingOthers ? 'Đang thu hồi…' : 'Đăng xuất thiết bị khác'}
            </button>
          )}
        </div>

        {sessionsQuery.isLoading ? (
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Spinner className="h-4 w-4" /> Đang tải phiên…
          </div>
        ) : sessionsQuery.isError ? (
          <button
            type="button"
            onClick={() => sessionsQuery.refetch()}
            className="mt-2 text-[12px] font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            Không tải được phiên — thử lại
          </button>
        ) : (
          <ul className="mt-2">
            {sessions.map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                onRevoke={onRevoke}
                busy={busyId === session.id}
              />
            ))}
            {!sessions.length && (
              <li className="py-2 text-[12px] text-slate-500 dark:text-slate-400">Chưa có phiên nào.</li>
            )}
          </ul>
        )}
      </div>
    </Card>
  );
}
