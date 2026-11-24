import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthShell from '../components/AuthShell.jsx';
import GoogleAuthButton from '../components/GoogleAuthButton.jsx';
import { Alert, Field, Spinner } from '../components/ui.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { registerSchema } from '../lib/schemas.js';
import { fetchAuthProviders } from '../api/auth.js';
import { getErrorMessage } from '../api/client.js';
import { passwordStrength } from '@shared/security/password.js';

const STRENGTH_TONES = [
  'bg-slate-200 dark:bg-white/10',
  'bg-vermilion-500',
  'bg-ochre-500',
  'bg-brand-500',
  'bg-pine-600',
];

function PasswordStrength({ value, context }) {
  const { score, label } = passwordStrength(value, context);
  return (
    <div className="mt-1.5">
      <div className="flex gap-1" aria-hidden="true">
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className={`h-1 flex-1 rounded-full ${index < score ? STRENGTH_TONES[score] : 'bg-slate-200 dark:bg-white/10'}`}
          />
        ))}
      </div>
      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Độ mạnh: {label}</p>
    </div>
  );
}

export default function Register() {
  const { register: signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({ resolver: zodResolver(registerSchema) });

  const providersQuery = useQuery({
    queryKey: ['auth-providers'],
    queryFn: fetchAuthProviders,
    staleTime: 5 * 60_000,
    retry: 0,
  });
  const googleEnabled = Boolean(providersQuery.data?.google);
  const email = watch('email');
  const name = watch('name');
  const password = watch('password');

  useEffect(() => {
    if (!loading && user) navigate('/dashboard', { replace: true });
  }, [user, loading, navigate]);

  const onSubmit = async (values) => {
    try {
      const { confirmPassword: _confirm, ...payload } = values;
      await signUp(payload);
      navigate('/settings', { replace: true });
    } catch (error) {
      setError('root', { message: getErrorMessage(error, 'Đăng ký thất bại') });
    }
  };

  return (
    <AuthShell
      title="Tạo tài khoản"
      subtitle="Bắt đầu lưu dữ liệu cơ thể và kết quả tính toán của bạn."
      footer={
        <>
          Đã có tài khoản?{' '}
          <Link className="font-semibold text-brand-600 hover:underline dark:text-brand-400" to="/login">
            Đăng nhập
          </Link>
        </>
      }
    >
      <div className="space-y-4">
        {errors.root?.message && <Alert tone="danger">{errors.root.message}</Alert>}

        {googleEnabled && (
          <>
            <GoogleAuthButton label="Đăng ký bằng Google" />
            <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
              <span className="h-px flex-1 bg-line dark:bg-white/10" />
              hoặc
              <span className="h-px flex-1 bg-line dark:bg-white/10" />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field label="Họ tên" error={errors.name?.message}>
            <input className="input" autoComplete="name" placeholder="Nguyễn Văn A" {...register('name')} />
          </Field>

          <Field label="Email" error={errors.email?.message}>
            <input
              className="input"
              type="email"
              autoComplete="email"
              placeholder="ban@email.com"
              {...register('email')}
            />
          </Field>

          <Field
            label="Mật khẩu"
            hint="Tối thiểu 10 ký tự, có chữ cái và chữ số. Không dùng lại mật khẩu ở nơi khác."
            error={errors.password?.message}
          >
            <div className="relative">
              <input
                className="input pr-16"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                {...register('password')}
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
            <PasswordStrength value={password} context={{ email, name }} />
          </Field>

          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? <Spinner className="h-4 w-4 text-white" /> : null}
            Tạo tài khoản
          </button>

          <p className="text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Dữ liệu cơ thể là dữ liệu nhạy cảm. Mật khẩu được băm bằng bcrypt, phiên đăng nhập nằm trong
            cookie httpOnly và bạn có thể xóa toàn bộ dữ liệu bất cứ lúc nào.
          </p>
        </form>
      </div>
    </AuthShell>
  );
}
