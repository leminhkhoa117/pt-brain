# Triển khai production

## Kiến trúc

- **Render Web Service** (Singapore, plan free) chạy Node, phục vụ luôn client đã build khi `SERVE_CLIENT=true`.
- **MongoDB Atlas M0** (free 512 MB) lưu dữ liệu và — khi `STORAGE_DRIVER=mongo` — lưu ảnh/PDF trong GridFS. Nhờ vậy Render free không làm mất ảnh sau mỗi lần restart/redeploy.
- **PWA**: manifest + service worker có sẵn trong `client/public`; cài lên điện thoại qua HTTPS của Render.

## 1. Tạo MongoDB Atlas cluster

1. Đăng nhập [cloud.mongodb.com](https://cloud.mongodb.com).
2. **Create** → chọn **M0 Free** → provider **AWS**, region **Singapore** (gần Việt Nam).
3. **Database Access** → **Add New Database User**: đặt username/password mạnh, quyền `Read and write to any database`.
4. **Network Access** → **Add IP Address** → `0.0.0.0/0` (Render free không có IP tĩnh; có thể giới hạn lại nếu nâng plan).
5. **Connect** → **Drivers** → copy connection string dạng:

   ```
   mongodb+srv://<user>:<password>@<cluster>.mongodb.net/pt-brain?retryWrites=true&w=majority
   ```

   Nếu mật khẩu có ký tự đặc biệt, hãy URL-encode (ví dụ `@` → `%40`).

> Atlas free 512 MB dùng chung cho dữ liệu + ảnh + PDF. Ảnh phía client đã được nén về tối đa 1280 px trước khi upload. Nếu upload nhiều PDF lớn, nên nâng tier hoặc chuyển sang S3/Cloudinary.

## 2. Deploy trên Render

Repo đã có `render.yaml` (Blueprint).

1. Push repo lên GitHub (nhánh `main` hoặc `master`).
2. Vào [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint** → chọn repo.
3. Render đọc `render.yaml` và hỏi các biến `sync: false`:
   - `MONGO_URI`: connection string Atlas ở trên.
   - `CLIENT_ORIGIN`: domain Render, ví dụ `https://pt-brain.onrender.com` (có thể điền sau rồi cập nhật).
   - `AI_API_KEY`: key OpenCode Go.
   - `CONTACT_EMAIL`: email của bạn (Crossref/Unpaywall).
4. Bấm **Apply** → chờ build (`npm ci` + build client).
5. Mở `https://<domain>/api/health` — phải trả `{"data":{"ok":true,...,"db":"up"}}`.
6. Mở trang chủ, đăng ký tài khoản, vào **Cài đặt** nhập hồ sơ.

> Render free sẽ ngủ sau ~15 phút không truy cập. Lần mở đầu tiên có thể chậm 30–60 giây; PWA vẫn cài được bình thường.

## 3. Cài PWA trên điện thoại

- **iPhone/iPad**: mở domain bằng **Safari** → nút Chia sẻ → **Thêm vào Màn hình chính**.
- **Android**: mở bằng **Chrome** → menu ⋮ → **Cài đặt ứng dụng** / **Thêm vào Màn hình chính**.
- Sau khi cài, app chạy toàn màn hình (standalone). Ảnh chụp từ camera có thể upload trực tiếp trong mục **Cơ thể** và **Dinh dưỡng**.

## Biến môi trường quan trọng

| Biến | Giá trị production |
| --- | --- |
| `NODE_ENV` | `production` |
| `SERVE_CLIENT` | `true` |
| `COOKIE_SECURE` | `true` |
| `STORAGE_DRIVER` | `mongo` (Render free) hoặc `disk` (VPS/Docker có ổ đĩa) |
| `MONGO_URI` | connection string Atlas |
| `CLIENT_ORIGIN` | domain HTTPS của Render |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Render tự sinh trong `render.yaml` |
| `AI_API_KEY` | key OpenCode Go (chỉ ở backend) |
| `CONTACT_EMAIL` | email liên hệ Crossref/Unpaywall |
| `PDF_MAX_MB` | `20` |

## Lưu ý production

- `COOKIE_SECURE=true` bắt buộc khi chạy HTTPS.
- Nếu tách domain client/API, đặt `CLIENT_ORIGIN` đúng domain và cấu hình cookie `SameSite=None` (code hiện dùng `lax` cho mô hình cùng domain).
- **Ảnh/PDF**: `STORAGE_DRIVER=mongo` dùng GridFS bucket `uploads`, mỗi file nằm trong namespace `images/` hoặc `papers/`. `STORAGE_DRIVER=disk` lưu ở `server/uploads` và cần ổ đĩa persistent nếu deploy cloud.
- **PDF** dùng font Noto Sans đóng gói trong `server/assets/fonts`, không phụ thuộc font hệ điều hành.
- PWA cần HTTPS (localhost cũng được). Manifest + service worker nằm trong `client/public`.
- Nếu dùng Vercel cho client riêng: build `client`, trỏ `VITE_API_BASE` tới API domain và bật CORS/`CLIENT_ORIGIN` tương ứng. Khi đó không cần `SERVE_CLIENT`.
- Sao lưu Atlas định kỳ; dữ liệu cơ thể là dữ liệu nhạy cảm. Không commit `.env`, `uploads/` hay log — `.gitignore` đã chặn các đường dẫn này.
- Khi đổi `STORAGE_DRIVER` từ `disk` sang `mongo`, file cũ trên đĩa không tự migrate; hãy upload lại hoặc viết script chuyển nếu cần.
