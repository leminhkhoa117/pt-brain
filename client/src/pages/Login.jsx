import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthShell from '../components/AuthShell.jsx';
import { Alert, Field, Spinner } from '../components/ui.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { loginSchema } from '../lib/schemas.js';
import { getErrorMessage } from '../api/client.js';

export default function Login() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (!loading && user) navigate('/', { replace: true });
  }, [user, loading, navigate]);

  const onSubmit = async (values) => {
    try {
      await login(values);
      navigate('/', { replace: true });
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {errors.root?.message && <Alert tone="danger">{errors.root.message}</Alert>}

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
          <input
            className="input"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...register('password')}
          />
        </Field>

        <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? <Spinner className="h-4 w-4 text-white" /> : null}
          Đăng nhập
        </button>
      </form>
    </AuthShell>
  );
}
