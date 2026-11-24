# PT Brain — Audit bảo mật & nâng cấp xác thực

> Ngày thực hiện: 21/11/2026  
> Phạm vi: `server/src` (Express + MongoDB), `client/src` (React), cấu hình cookie/JWT, luồng đăng nhập và dữ liệu người dùng.  
> Trạng thái: **đã triển khai + test tự động**.

---

## 1. Tóm tắt kết quả

Đã bổ sung:

| Hạng mục | Trạng thái | Ghi chú |
| --- | --- | --- |
| Đăng nhập Google (OAuth 2.0 + PKCE) | ✅ | `GET /api/auth/google/start`, `GET /api/auth/google/callback`; liên kết tài khoản theo email đã xác minh |
| Nút “Ghi nhớ đăng nhập” | ✅ | Cookie phiên khi tắt, cookie 30 ngày khi bật |
| Đổi / đặt mật khẩu | ✅ | `POST /api/me/password`; tài khoản Google-only đặt mật khẩu lần đầu |
| Quên / đặt lại mật khẩu | ✅ | Token một lần, hash SHA-256, hết hạn 30 phút, gửi qua Resend (tùy chọn) |
| Quản lý phiên thiết bị | ✅ | Liệt kê, thu hồi từng phiên, đăng xuất thiết bị khác |
| Thu hồi access token ngay | ✅ | Kiểm tra session + `authVersion` mỗi request |
| Chống dò mật khẩu | ✅ | Khóa tạm 15 phút sau 5 lần sai + rate limit theo IP/email |
| Chống CSRF | ✅ | SameSite=Lax + kiểm tra `Origin` / `Sec-Fetch-Site` + header `X-Requested-With` |
| Chính sách mật khẩu | ✅ | ≥ 10 ký tự, có chữ + số, chặn mật khẩu phổ biến/tên/email |
| Cookie an toàn | ✅ | `httpOnly`, `Secure` bắt buộc ở production, `SameSite=Lax`, path `/` |
| CSP / security headers | ✅ | Helmet + CSP cho avatar Google và ảnh blob |
| JWT | ✅ | Chỉ nhận `HS256`, secret production bắt buộc đổi, access token 15 phút |
| Xóa tài khoản | ✅ | Xóa DB + ảnh/PDF, xóa toàn bộ `Session`; yêu cầu mật khẩu xác nhận nếu tài khoản có mật khẩu |

Test tự động: **327/327 pass**, gồm 9 test bảo mật mới (`server/tests/authSecurity.test.js`), 9 test learning API (`server/tests/learningApi.test.js`) và 6 test anatomy/AI context (`server/tests/anatomy.test.js`).

---

## 2. Lỗ hổng / thiếu sót đã phát hiện & cách xử lý

### P0 — Đã sửa trong đợt này

1. **Không có chức năng đổi mật khẩu / đặt lại mật khẩu**
   - Trước: người dùng quên mật khẩu là mất tài khoản; tài khoản Google không thể đặt mật khẩu.
   - Sau: `POST /api/me/password` (có mật khẩu hiện tại), `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`.
   - Đổi mật khẩu thu hồi mọi phiên khác ngay; đặt lại mật khẩu xóa toàn bộ phiên.

2. **Access token vẫn dùng được sau khi logout / đổi mật khẩu**
   - Trước: `requireAuth` chỉ verify JWT, không kiểm tra session; logout chỉ xóa refresh token. Access token sống tới 15 phút.
   - Sau: access token mang `sid` + `ver`; `requireAuth` đọc `Session` (indexed) mỗi request, kiểm tra hết hạn và `authVersion`. Logout, đổi mật khẩu, thu hồi phiên có hiệu lực tức thì.
   - Đánh đổi: thêm 1 indexed lookup/request — chấp nhận được với dữ liệu sức khỏe nhạy cảm.

3. **Không có chống dò mật khẩu theo tài khoản**
   - Trước: chỉ có rate limit 30 request/15 phút theo IP.
   - Sau: khóa tài khoản 15 phút sau 5 lần sai, cộng rate limit 10 lần/15 phút theo cặp IP + hash(email). Thông báo luôn generic để không lộ email tồn tại; so sánh bcrypt giả cho email không tồn tại để giảm lộ qua timing.

4. **Chính sách mật khẩu quá yếu**
   - Trước: chỉ `min(8)`.
   - Sau: ≥ 10 ký tự, có chữ cái + chữ số, chặn danh sách mật khẩu phổ biến, không chứa phần local của email hoặc họ tên. Dùng chung client/server (`shared/security/password.js`).

5. **Thiếu lớp chống CSRF**
   - Trước: chỉ dựa vào `SameSite=Lax`.
   - Sau: middleware `csrfGuard` chặn mọi POST/PATCH/PUT/DELETE có `Origin` lạ hoặc `Sec-Fetch-Site: cross-site`; client axios gửi `X-Requested-With: XMLHttpRequest`.

6. **Cookie không được đảm bảo Secure ở production**
   - Trước: phụ thuộc `COOKIE_SECURE` trong env.
   - Sau: `NODE_ENV=production` luôn bật `Secure`, kể cả khi quên cấu hình.

7. **Không có “Ghi nhớ đăng nhập” thực sự**
   - Trước: refresh cookie luôn 30 ngày.
   - Sau: `remember=false` → cookie phiên (mất khi đóng trình duyệt), refresh token 24 giờ; `remember=true` → cookie 30 ngày. Session lưu cờ `remember` để các lần refresh giữ đúng hành vi.

8. **Không có đăng nhập Google**
   - Sau: OAuth 2.0 Authorization Code + PKCE (S256), state chống CSRF, chỉ liên kết theo email khi Google trả `email_verified=true`, không lưu token Google. Tài khoản email/mật khẩu hiện có được liên kết thêm Google.

9. **Không có danh sách / thu hồi phiên**
   - Sau: `GET /api/me/sessions`, `DELETE /api/me/sessions/:id`, `DELETE /api/me/sessions`. UI hiển thị thiết bị, IP, lần hoạt động cuối, cờ phiên tạm.

10. **Session fixation / token reuse**
    - Mỗi lần đăng nhập tạo session mới; refresh token xoay vòng có cửa sổ ân hạn 2 phút cho 2 tab/PWA; phát hiện dùng lại token cũ sau cửa sổ sẽ thu hồi đúng session đó.

11. **Xóa tài khoản chưa re-auth**
    - Trước: chỉ cần session là xóa được toàn bộ dữ liệu.
    - Sau: tài khoản có mật khẩu phải gửi kèm mật khẩu hiện tại trong `DELETE /me`; UI yêu cầu nhập mật khẩu xác nhận. Tài khoản Google-only vẫn xóa bằng session (chưa có OAuth re-auth).

### P1 — Còn tồn tại, cần xử lý tiếp

| ID | Vấn đề | Ảnh hưởng | Hướng xử lý |
| --- | --- | --- | --- |
| S1 | `zod 3.25.x` có advisory memory exhaustion | Runtime; giảm nhẹ nhờ body limit 2 MB và schema max | Nâng zod 4.6.7+; viết lại các `invalid_type_error`/`errorMap` theo API mới; chạy toàn bộ test |
| S2 | `react-router 6.27` có advisory open-redirect | Client; chỉ khai thác khi điều hướng URL do kẻ tấn công kiểm soát | Nâng React Router 7.18.6+; kiểm tra toàn bộ route/link |
| S3 | `vitest`/`vite`/`tinypool` có advisory critical/high | Chỉ dev tooling, không nằm trong runtime production | Nâng Vitest/Vite sau khi S1/S2; chạy lại test/build |
| S4 | Rate limit lưu trong RAM | Không chia sẻ khi scale nhiều instance | Dùng Redis store (`rate-limit-redis`) khi có nhiều instance |
| S5 | Tài khoản email/mật khẩu chưa xác minh email | Email giả có thể đăng ký; không ảnh hưởng đăng nhập Google | Thêm luồng verify email trước khi dùng tính năng nhạy cảm (hoặc chỉ cho Google verified) |
| S6 | Chưa có 2FA / passkey | Tài khoản bị lộ mật khẩu vẫn đăng nhập được | Thêm TOTP/WebAuthn; ưu tiên passkey |
| S7 | Xóa tài khoản chỉ cần session, chưa re-auth | Session bị chiếm có thể xóa dữ liệu | Đã yêu cầu mật khẩu cho tài khoản có mật khẩu; còn lại OAuth re-auth cho tài khoản Google-only |
| S8 | Chưa có audit log bảo mật riêng | Khó điều tra sự cố | Ghi event login/password/Google/session revoke vào collection TTL, không chứa token |
| S9 | Không có email xác nhận thay đổi mật khẩu | Người dùng không biết nếu bị đổi trộm | Gửi email “mật khẩu đã được thay đổi” khi có Resend |
| S10 | SSRF còn khe DNS rebinding giữa lookup và fetch | Chỉ ảnh hưởng endpoint research tải URL ngoài | Pin IP bằng undici Agent/custom lookup; giữ kiểm tra redirect (đã có từ audit trước) |
| S11 | `trust proxy` cố định 1 | Nếu deploy không qua proxy, IP có thể bị giả | Đặt theo môi trường (`TRUST_PROXY`), chỉ bật khi thực sự sau proxy |
| S12 | Chưa có re-auth cho đổi mật khẩu | Session bị chiếm có thể đổi mật khẩu nếu biết mật khẩu cũ | Đã yêu cầu mật khẩu hiện tại — đủ cho luồng hiện tại; cân nhắc OAuth re-auth cho tài khoản Google-only |

---

## 3. Cấu hình Google OAuth

1. Vào [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Tạo **OAuth client ID → Web application**.
3. Authorized redirect URI:
   - Local: `http://localhost:5173/api/auth/google/callback`
   - Production: `https://<domain>/api/auth/google/callback`
4. Điền `.env`:
   ```env
   GOOGLE_CLIENT_ID=...apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=...
   # Để trống nếu redirect URI đúng chuẩn <CLIENT_ORIGIN>/api/auth/google/callback
   GOOGLE_REDIRECT_URI=
   ```
5. Khởi động lại server. `GET /api/auth/providers` trả `{ google: true }`; nút Google xuất hiện ở Login/Register.
6. Nếu chưa cấu hình, nút được ẩn và API trả `503 GOOGLE_NOT_CONFIGURED` — không làm hỏng luồng email/mật khẩu.

Lưu ý: callback phải đi qua **cùng origin với client** (Vite proxy `/api` hoặc domain production) để cookie httpOnly được set đúng chỗ.

---

## 4. Cấu hình email đặt lại mật khẩu

```env
RESEND_API_KEY=re_...
MAIL_FROM="PT Brain <no-reply@your-domain>"
APP_PUBLIC_URL=https://your-domain
PASSWORD_RESET_TTL_MINUTES=30
```

- Chưa có `RESEND_API_KEY`: link reset chỉ được log ở server; ở `NODE_ENV=development/test` API trả thêm `devResetUrl` để test. **Production không bao giờ trả token ra response.**
- Link reset dùng một lần, lưu hash SHA-256, hết hạn 30 phút.

---

## 5. Checklist trước khi deploy production

- [ ] `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` ngẫu nhiên ≥ 32 ký tự, không dùng giá trị mẫu.
- [ ] `NODE_ENV=production` (cookie tự bật `Secure`).
- [ ] HTTPS ở reverse proxy; `CLIENT_ORIGIN` đúng domain, không có dấu `/` cuối.
- [ ] `APP_PUBLIC_URL` đúng domain (link reset email).
- [ ] `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` là loại Web client; redirect URI khớp tuyệt đối.
- [ ] `RESEND_API_KEY` + `MAIL_FROM` đã cấu hình; gửi thử một email reset.
- [ ] MongoDB Atlas: user riêng, quyền tối thiểu, IP allowlist; không dùng user admin.
- [ ] Kiểm tra `GET /api/auth/providers` trả `google: true`.
- [ ] Đăng nhập → đổi mật khẩu → kiểm tra thiết bị khác bị đăng xuất.
- [ ] Đăng xuất → access token cũ trả 401 (đã có test).
- [ ] Chạy `npm test`, `npm run lint`, `npm run build`, `npm audit`.

---

## 6. Kết quả kiểm chứng

```bash
npm --prefix server test     # 327/327 pass
npm run lint                 # 0 lỗi (sau khi xóa file tạm)
npm --prefix client build    # build pass
npm --prefix client run validate:atlas-anatomy  # 315 concept, 0 missing
```

`npm audit` (21/11/2026):

- Server: 2 critical, 2 high, 3 moderate — critical/high chủ yếu là `vitest`/`vite`/`tinypool` (dev-only); `zod` là runtime high.
- Client: 1 high (`vite`, dev-only), 3 moderate (`react-router`, `react-router-dom`, `esbuild`).

Không phát hiện lỗi XSS trực tiếp: React escape mặc định, `MarkdownText` không bật HTML thô, không có `dangerouslySetInnerHTML`/`eval` trong client. Các controller dùng `userId` trong filter (không có IDOR rõ ràng); upload ảnh kiểm tra magic bytes + regex tên file; endpoint tải nguồn ngoài đã có chặn SSRF và giới hạn dung lượng từ audit trước.
