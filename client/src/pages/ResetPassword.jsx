import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthShell from '../components/AuthShell.jsx';
import { Alert, Field, Spinner } from '../components/ui.jsx';
import { resetPasswordSchema } from '../lib/schemas.js';
import { resetPasswordRequest } from '../api/auth.js';
import { getErrorMessage } from '../api/client.js';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = async (values) => {
    try {
      await resetPasswordRequest({ token, newPassword: values.newPassword });
      navigate('/login?reset=1', { replace: true });
    } catch (error) {
      setError('root', { message: getErrorMessage(error, 'Đặt lại mật khẩu thất bại') });
    }
  };

  return (
    <AuthShell
      title="Đặt lại mật khẩu"
      subtitle="Chọn mật khẩu mới cho tài khoản của bạn. Tất cả thiết bị khác sẽ bị đăng xuất."
      footer={
        <>
          <Link className="font-semibold text-brand-600 hover:underline dark:text-brand-400" to="/login">
            Quay lại đăng nhập
          </Link>
        </>
      }
    >
      {!token ? (
        <Alert tone="danger">
          Link đặt lại mật khẩu không hợp lệ. Hãy{' '}
          <Link className="font-semibold underline" to="/forgot-password">
            yêu cầu link mới
          </Link>
          .
        </Alert>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {errors.root?.message && <Alert tone="danger">{errors.root.message}</Alert>}
          <Field
            label="Mật khẩu mới"
            hint="Tối thiểu 10 ký tự, có chữ cái và chữ số."
            error={errors.newPassword?.message}
          >
            <div className="relative">
              <input
                className="input pr-16"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                {...register('newPassword')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute inset-y-0 right-0 px-3 text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
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
              placeholder="••••••••"
              {...register('confirmPassword')}
            />
          </Field>
          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? <Spinner className="h-4 w-4 text-white" /> : null}
            Đặt lại mật khẩu
          </button>
        </form>
      )}
    </AuthShell>
  );
}
