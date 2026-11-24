import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Gửi email đặt lại mật khẩu qua Resend HTTP API (không cần thêm dependency).
 * Nếu chưa cấu hình RESEND_API_KEY, link được log ở server để quản trị viên
 * vẫn lấy được trong môi trường nội bộ. Không bao giờ trả token cho client ở
 * production.
 */
export async function sendPasswordResetEmail({ to, name, resetUrl }) {
  if (!env.RESEND_API_KEY) {
    // Không log token/link ở production: log server có thể bị thu thập bởi
    // dịch vụ hosting. Dev/test log link để còn test được.
    logger.warn(
      env.NODE_ENV === 'production' ? { to } : { to, resetUrl },
      'Chưa cấu hình RESEND_API_KEY — không gửi được email đặt lại mật khẩu',
    );
    return { delivered: false };
  }

  const safeName = String(name || 'bạn').slice(0, 80);
  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.6;color:#1e293b">
      <h2 style="margin:0 0 12px">Đặt lại mật khẩu PT Brain</h2>
      <p>Chào ${escapeHtml(safeName)},</p>
      <p>Ai đó (có thể là bạn) đã yêu cầu đặt lại mật khẩu cho tài khoản PT Brain gắn với email này.</p>
      <p><a href="${escapeHtml(resetUrl)}" style="display:inline-block;padding:10px 18px;border-radius:8px;background:#0f5132;color:#fff;text-decoration:none;font-weight:600">Đặt lại mật khẩu</a></p>
      <p>Link hết hạn sau ${env.PASSWORD_RESET_TTL_MINUTES} phút và chỉ dùng được một lần.</p>
      <p>Nếu bạn không yêu cầu, hãy bỏ qua email này. Mật khẩu hiện tại không thay đổi.</p>
      <p style="color:#64748b;font-size:12px">PT Brain · Không trả lời email này.</p>
    </div>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: env.MAIL_FROM,
      to: [to],
      subject: 'Đặt lại mật khẩu PT Brain',
      html,
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    logger.error({ status: response.status, detail: detail.slice(0, 500) }, 'Gửi email đặt lại mật khẩu thất bại');
    return { delivered: false };
  }
  return { delivered: true };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
