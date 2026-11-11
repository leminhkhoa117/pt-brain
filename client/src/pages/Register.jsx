import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthShell from '../components/AuthShell.jsx';
import { Alert, Field, Spinner } from '../components/ui.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { registerSchema } from '../lib/schemas.js';
import { getErrorMessage } from '../api/client.js';

export default function Register() {
  const { register: signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({ resolver: zodResolver(registerSchema) });

  useEffect(() => {
    if (!loading && user) navigate('/', { replace: true });
  }, [user, loading, navigate]);

  const onSubmit = async (values) => {
    try {
      await signUp(values);
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {errors.root?.message && <Alert tone="danger">{errors.root.message}</Alert>}

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

        <Field label="Mật khẩu" hint="Tối thiểu 8 ký tự" error={errors.password?.message}>
          <input
            className="input"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            {...register('password')}
          />
        </Field>

        <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? <Spinner className="h-4 w-4 text-white" /> : null}
          Tạo tài khoản
        </button>

        <p className="text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Dữ liệu cơ thể là dữ liệu nhạy cảm. Mật khẩu được mã hóa bằng bcrypt và bạn có thể xóa toàn bộ
          dữ liệu bất cứ lúc nào.
        </p>
      </form>
    </AuthShell>
  );
}
