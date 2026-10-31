# Triển khai production

## Cách nhanh: Render + MongoDB Atlas

Repo đã có `render.yaml` (Blueprint). Server phục vụ luôn client đã build khi `SERVE_CLIENT=true`.

1. Tạo cluster **MongoDB Atlas** (free tier), lấy connection string dạng
   `mongodb+srv://user:pass@cluster.mongodb.net/pt-brain`.
2. Trên Render → **New → Blueprint** → chọn repo này.
3. Điền các biến cần nhập:
   - `MONGO_URI`: connection string Atlas.
   - `CLIENT_ORIGIN`: domain Render, ví dụ `https://pt-brain.onrender.com`.
   - `AI_API_KEY`: key OpenCode Go.
   - `CONTACT_EMAIL`: email của bạn (Crossref/Unpaywall).
4. Deploy. Build sẽ chạy `npm --prefix client run build`; server đọc `client/dist`.
5. Kiểm tra `https://<domain>/api/health` và mở trang chủ.

## Lưu ý production

- `COOKIE_SECURE=true` bắt buộc khi chạy HTTPS.
- Nếu tách domain client/API, đặt `CLIENT_ORIGIN` đúng domain và cấu hình
  cookie `SameSite=None` (hiện code dùng `lax` cho mô hình cùng domain).
- **Ảnh tiến độ** lưu ở `server/uploads/photos` trên đĩa. Render free dùng
  filesystem tạm — ảnh sẽ mất sau redeploy. Production thật nên chuyển sang
  S3/Cloudinary và đổi `PHOTO_DIR` trong `metricsController.js`.
- **PDF** dùng font Noto Sans đóng gói trong `server/assets/fonts`, không phụ
  thuộc font hệ điều hành.
- PWA cần HTTPS (localhost cũng được). Manifest + service worker nằm trong
  `client/public`.
- Nếu dùng Vercel cho client riêng: build `client`, trỏ `VITE_API_BASE` tới API
  domain và bật CORS/`CLIENT_ORIGIN` tương ứng. Khi đó không cần `SERVE_CLIENT`.
- Sao lưu Atlas định kỳ; dữ liệu cơ thể là dữ liệu nhạy cảm.
