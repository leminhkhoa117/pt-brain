import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthShell from '../components/AuthShell.jsx';
import GoogleAuthButton from '../components/GoogleAuthButton.jsx';
import { Alert, Field, Spinner } from '../components/ui.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { loginSchema } from '../lib/schemas.js';
import { fetchAuthProviders } from '../api/auth.js';
import { getErrorMessage } from '../api/client.js';

const OAUTH_ERRORS = {
  denied: 'Bạn đã huỷ đăng nhập Google.',
  invalid_state: 'Phiên đăng nhập Google không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.',
  GOOGLE_NOT_CONFIGURED: 'Đăng nhập Google chưa được cấu hình trên máy chủ.',
  GOOGLE_EMAIL_UNVERIFIED: 'Email Google chưa được xác minh nên không thể đăng nhập.',
  GOOGLE_TOKEN_FAILED: 'Google không xác nhận được phiên đăng nhập. Vui lòng thử lại.',
  GOOGLE_PROFILE_FAILED: 'Không đọc được thông tin tài khoản Google. Vui lòng thử lại.',
  failed: 'Đăng nhập Google thất bại. Vui lòng thử lại hoặc dùng email/mật khẩu.',
};

export default function Login() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { remember: true } });

  const providersQuery = useQuery({
    queryKey: ['auth-providers'],
    queryFn: fetchAuthProviders,
    staleTime: 5 * 60_000,
    retry: 0,
  });
  const googleEnabled = Boolean(providersQuery.data?.google);

  const oauthError = searchParams.get('oauth') === 'error' ? searchParams.get('reason') : '';
  const justReset = searchParams.get('reset') === '1';

  useEffect(() => {
    if (!loading && user) navigate('/dashboard', { replace: true });
  }, [user, loading, navigate]);

  const onSubmit = async (values) => {
    try {
      await login({ ...values, remember });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setError('root', { message: getErrorMessage(error, 'Đăng nhập thất bại') });
    }
  };

  return (
    <AuthShell
      title="Đăng nhập"
      subtitle="Tiếp tục theo dõi cơ thể và xây dựng kiến thức nền tảng của bạn."
      footer={
        <>
          Chưa có tài khoản?{' '}
          <Link className="font-semibold text-brand-600 hover:underline dark:text-brand-400" to="/register">
            Đăng ký miễn phí
          </Link>
        </>
      }
    >
      <div className="space-y-4">
        {justReset && <Alert tone="success">Mật khẩu đã được đặt lại. Hãy đăng nhập bằng mật khẩu mới.</Alert>}
        {oauthError && <Alert tone="danger">{OAUTH_ERRORS[oauthError] || OAUTH_ERRORS.failed}</Alert>}
        {errors.root?.message && <Alert tone="danger">{errors.root.message}</Alert>}

        {googleEnabled && (
          <>
            <GoogleAuthButton remember={remember} />
            <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
              <span className="h-px flex-1 bg-line dark:bg-white/10" />
              hoặc
              <span className="h-px flex-1 bg-line dark:bg-white/10" />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field label="Email" error={errors.email?.message}>
            <input
              className="input"
              type="email"
              autoComplete="email"
              placeholder="ban@email.com"
              {...register('email')}
            />
          </Field>

          <Field label="Mật khẩu" error={errors.password?.message}>
            <div className="relative">
              <input
                className="input pr-16"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
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
          </Field>

          <div className="-mt-1 flex flex-wrap items-center justify-between gap-2">
            <label className="flex cursor-pointer select-none items-center gap-2 text-[12.5px] text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="h-4 w-4 rounded border-line accent-pine-700 dark:border-white/20"
              />
              Ghi nhớ đăng nhập
            </label>
            <Link
              to="/forgot-password"
              className="text-[12.5px] font-semibold text-brand-600 hover:underline dark:text-brand-400"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? <Spinner className="h-4 w-4 text-white" /> : null}
            Đăng nhập
          </button>
          <p className="text-center text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            Bỏ chọn “Ghi nhớ đăng nhập” nếu dùng máy chung: phiên sẽ kết thúc khi đóng trình duyệt.
          </p>
        </form>
      </div>
    </AuthShell>
  );
}
