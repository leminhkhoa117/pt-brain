# Monitoring & vận hành

## 1. Sentry (tùy chọn)

Tích hợp Sentry ở dạng **opt-in**: để trống DSN thì không tải SDK, không gửi dữ liệu.

### Server

```env
SENTRY_DSN=https://<key>@o<org>.ingest.sentry.io/<project>
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0
```

- Chỉ capture lỗi 5xx và `unhandledRejection`/`uncaughtException`.
- Extra gửi kèm chỉ có `method`, `path` (đã bỏ query string) và `status`; không gửi body, cookie, header hay token reset/OAuth.

### Client

```env
VITE_SENTRY_DSN=https://<key>@o<org>.ingest.sentry.io/<project>
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_TRACES_SAMPLE_RATE=0
```

- SDK được tải bằng dynamic import, chỉ khi có `VITE_SENTRY_DSN`.
- `ErrorBoundary` gửi lỗi render React; lỗi runtime/unhandled do SDK bắt.
- DSN client là thông tin công khai theo thiết kế của Sentry; key bí mật nằm ở server, không đưa vào client.
- Khi bật Sentry, client tải thêm chunk SDK (~160 KB gzip) **sau khi app render**; bundle khởi động không đổi. Nếu ưu tiên tiết kiệm băng thông, có thể chỉ bật Sentry server.

### Gợi ý alert

- Error rate > 1% trong 5 phút.
- Có lỗi mới ở `server` hoặc `client`.
- Số lỗi 5xx tăng đột biến sau deploy.

## 2. Uptime

Tạo monitor HTTP GET:

```text
https://<domain>/api/health
```

Kỳ vọng HTTP 200 và JSON có:

```json
{ "data": { "ok": true, "db": "up" } }
```

- Kiểm tra mỗi 5 phút; alert khi 2 lần liên tiếp thất bại.
- Render free ngủ sau ~15 phút không truy cập. Ping liên tục giữ instance thức nhưng dùng gần hết 750 giờ/tháng; cân nhắc trước khi bật.
- Có thể thêm monitor riêng cho trang chủ `https://<domain>/`.

## 3. Log

- Server dùng pino, log ra stdout; Render giữ log theo plan.
- Không log header/cookie; URL được redact `token`/`code`/`state`.
- Docker dùng log rotation `10 MB × 3 file` cho từng container.

## 4. Backup

- Docker: chạy `scripts/backup-mongo.ps1` hằng ngày bằng Task Scheduler.
- Atlas: dùng MongoDB Database Tools (`mongodump`) theo lịch hoặc Atlas Backup nếu nâng tier.
- Định kỳ restore vào database tạm để kiểm tra file backup (xem README mục Docker).
