import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthShell from '../components/AuthShell.jsx';
import { Alert, Field, Spinner } from '../components/ui.jsx';
import { forgotPasswordSchema } from '../lib/schemas.js';
import { forgotPasswordRequest } from '../api/auth.js';
import { getErrorMessage } from '../api/client.js';

export default function ForgotPassword() {
  const [result, setResult] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (values) => {
    try {
      const data = await forgotPasswordRequest(values);
      setResult(data);
    } catch (error) {
      setError('root', { message: getErrorMessage(error, 'Không gửi được yêu cầu') });
    }
  };

  return (
    <AuthShell
      title="Quên mật khẩu"
      subtitle="Nhập email đã đăng ký. Nếu tài khoản tồn tại, chúng tôi sẽ gửi link đặt lại mật khẩu."
      footer={
        <>
          Nhớ mật khẩu rồi?{' '}
          <Link className="font-semibold text-brand-600 hover:underline dark:text-brand-400" to="/login">
            Đăng nhập
          </Link>
        </>
      }
    >
      {result ? (
        <div className="space-y-4">
          <Alert tone="success">
            Nếu email này có tài khoản, link đặt lại mật khẩu đã được gửi. Link hết hạn sau 30 phút.
          </Alert>
          {result.devResetUrl && (
            <Alert tone="info" title="Môi trường phát triển">
              Chưa cấu hình email nên đây là link đặt lại trực tiếp:{' '}
              <a className="font-semibold underline" href={result.devResetUrl}>
                mở link đặt lại mật khẩu
              </a>
            </Alert>
          )}
          <Link to="/login" className="btn-secondary w-full">
            Quay lại đăng nhập
          </Link>
        </div>
      ) : (
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
          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? <Spinner className="h-4 w-4 text-white" /> : null}
            Gửi link đặt lại
          </button>
        </form>
      )}
    </AuthShell>
  );
}
