# PT Brain

Web app giúp người đang học/làm PT gom 4 việc vào một chỗ: tìm nghiên cứu khoa học, tóm tắt bài báo sang tiếng Việt, tính chỉ số tập luyện, theo dõi cơ thể và lên giáo án.

> Trạng thái hiện tại: **Giai đoạn 0 + Giai đoạn 1 hoàn thành** (nền tảng, auth, máy tính chỉ số, theo dõi cơ thể theo ngày, dashboard).
> Giai đoạn 2 (Research Reader) chưa bắt đầu.

## Tech stack

| Lớp | Công nghệ |
| --- | --- |
| Frontend | React 18 + Vite, React Router, TanStack Query, Tailwind CSS, Recharts, react-hook-form + zod |
| Backend | Node.js 20+, Express, Mongoose, zod, JWT + bcrypt, helmet, express-rate-limit, pino |
| Database | MongoDB 7 (local hoặc Atlas) |
| Test | Vitest (43 unit test cho công thức + cảnh báo + tiện ích ngày) |
| Tooling | ESLint 9 (flat config), Prettier |
| Deploy | Docker Compose cho dev, sau này Render/Railway/Vercel + MongoDB Atlas |

## Chạy nhanh (local)

Yêu cầu: Node.js >= 20, MongoDB đang chạy (dịch vụ local hoặc Atlas).

```bash
# 1. Cài dependencies
npm install
npm run install:all

# 2. Tạo file env
cp .env.example .env      # Windows: Copy-Item .env.example .env
#    -> đổi JWT_ACCESS_SECRET / JWT_REFRESH_SECRET thành chuỗi ngẫu nhiên >= 16 ký tự

# 3. Chạy server (http://localhost:4000)
npm run dev:server

# 4. Chạy client (http://localhost:5173) - mở terminal khác
npm run dev:client
```

Mặc định `MONGO_URI=mongodb://127.0.0.1:27017/pt-brain`. Nếu dùng Atlas, sửa trong `.env`.

Mở http://localhost:5173, bấm **Đăng ký**, sau đó vào **Cài đặt** nhập giới tính / ngày sinh / chiều cao để các chỉ số (BMR, TDEE, % mỡ, FFMI) hoạt động.

### Chạy bằng Docker (không bắt buộc)

```bash
docker compose up --build
# client: http://localhost:5173 | api: http://localhost:4000/api | mongo: 27017
```

Máy phát triển hiện tại **chưa cài Docker** nên cấu hình compose chưa được chạy thử; luồng local ở trên đã được kiểm chứng.

## Lệnh

```bash
npm run test        # 43 unit test (Vitest)
npm run lint        # ESLint toàn repo
npm run build       # build production client -> client/dist
npm run format      # Prettier
```

## Cấu trúc

```
pt-brain/
├─ shared/                     # Dùng chung server + client, không phụ thuộc framework
│  ├─ calculators/index.js     # Hàm thuần: 1RM, BMR, TDEE, macro, Navy, LBM, FFMI, BMI, HR zones, tonnage, MA7
│  ├─ analytics/warnings.js    # Cảnh báo theo quy tắc (không dùng AI)
│  └─ config/nutrition.js      # Hệ số/ngưỡng có thể chỉnh (activity, cut/bulk, protein, volume)
├─ server/
│  ├─ src/config/              # env (zod), kết nối Mongo
│  ├─ src/models/              # User, BodyLog, CalcHistory, Exercise, Program, WorkoutSession,
│  │                           # Paper, Summary, Term, Flashcard, Note
│  ├─ src/middleware/          # auth, errorHandler, rateLimit, validate
│  ├─ src/services/            # authService, metricsService, calculators/registry
│  ├─ src/routes/              # auth, me, metrics, calc
│  └─ tests/                   # Vitest: công thức, cảnh báo, date utils
├─ client/
│  └─ src/
│     ├─ pages/                # Dashboard, BodyLog, Calculators, Settings, Login, Register
│     ├─ components/           # Layout, AuthShell, ui, WeightChart, Heatmap, ErrorBoundary
│     ├─ hooks/                # useAuth, useTheme (dark mode)
│     ├─ api/                  # axios + interceptor refresh token
│     └─ lib/                  # format, date, zod schemas
├─ docker-compose.yml
├─ .env.example
└─ eslint.config.js
```

## Đã hoàn thành (Giai đoạn 0 + 1)

### Giai đoạn 0 — Khởi tạo
- Repo client/server/shared, Vite React, ESLint + Prettier, `.env.example`.
- `docker-compose.yml`: Mongo + server + client, healthcheck, volume.
- Model MongoDB đầy đủ theo plan (kể cả các model cho giai đoạn sau).

### Giai đoạn 1 — Auth + Máy tính + Theo dõi theo ngày
- **Auth**: đăng ký / đăng nhập / đăng xuất / refresh. JWT nằm trong cookie `httpOnly`, refresh token xoay vòng và lưu hash (SHA-256) trong DB. Mọi route dữ liệu lọc theo `userId`.
- **Hồ sơ**: giới tính, ngày sinh, chiều cao, mức vận động, mục tiêu, kinh nghiệm, đơn vị. Dữ liệu tự điền vào máy tính.
- **Máy tính** (tính tức thì ở client bằng `shared/calculators`, có API tương ứng):
  - 1RM Epley + Brzycki + trung bình, cảnh báo khi reps > 10, bảng %1RM kèm rep/RIR gợi ý.
  - BMR Mifflin-St Jeor, TDEE (5 mức vận động), calo mục tiêu (cut −10…20%, lean bulk +5…10%, bulk +10…20%), macro (protein 1.6–2.2 g/kg, fat 0.6–1 g/kg).
  - % mỡ US Navy, LBM, FFMI + FFMI chuẩn hóa, BMI kèm phân loại.
  - Vùng nhịp tim Tanaka / Karvonen (5 vùng).
  - Tonnage, số set theo nhóm cơ, volume tuần so với ngưỡng 10–20 set.
  - "Lưu vào hôm nay" (số đo) và "Lưu lịch sử" (CalcHistory).
- **Body Check**: một bản ghi/ngày (`userId + dateKey` unique), nhập lại cùng ngày là cập nhật. Cân nặng bắt buộc; số đo, % mỡ tay, nhịp tim nghỉ, giấc ngủ, bước, calo, protein, ghi chú, checklist tư thế.
- **Computed snapshot**: mỗi BodyLog lưu `bmi, bodyFatNavy, leanMassKg, ffmi, ffmiNormalized, bmr, tdee` tại thời điểm nhập để biểu đồ không đổi khi công thức cập nhật.
- **Dashboard**: cân nặng hiện tại, MA7, tốc độ đổi cân %/tuần, % mỡ, biểu đồ 90 ngày, heatmap 8 tuần, cảnh báo theo quy tắc (tăng/giảm quá nhanh, thiếu protein, thiếu dữ liệu, ngủ ít), nhập nhanh cân nặng.
- **CSV**: xuất toàn bộ BodyLog (UTF-8 BOM để Excel đọc đúng tiếng Việt).
- **Bảo mật**: bcrypt cost 12, helmet, CORS credentials, rate limit (auth 30/15 phút, calc 120/phút, chung 600/15 phút), log không ghi header/cookie, xóa vĩnh viễn tài khoản + toàn bộ dữ liệu.
- **UI**: tiếng Việt, responsive (sidebar desktop + bottom nav mobile), dark mode có lưu lựa chọn, ErrorBoundary.

## Kết quả kiểm chứng

- `npm run test`: **43/43 pass** (31 công thức, 7 cảnh báo, 5 date utils), gồm ca biên và đầu vào sai.
- `npm run build`: build thành công; bundle tách `react` / `charts` / `query` (charts ~407 kB, tổng gzip ~246 kB).
- E2E API đã chạy thật với MongoDB local:
  - đăng ký → nhận 2 cookie `HttpOnly; SameSite=Lax`;
  - cập nhật hồ sơ (175 cm, 30 tuổi) → BMR 1.681, TDEE 2.606, Navy 16,2%;
  - ghi 14 ngày → `logs=14`, ghi lại cùng ngày **không tạo trùng** (`same id=true`);
  - summary trả MA7, `ratePct=0.81`, cảnh báo tăng cân nhanh;
  - `POST /calc/one-rep-max` 100 kg × 5 → Epley 116,7 / Brzycki 112,5 / TB 114,6;
  - CSV có BOM `EF BB BF` và tiếng Việt đúng;
  - logout → `/api/me` trả 401; login + refresh hoạt động.
- UI đã kiểm tra bằng trình duyệt thật: đăng nhập, dashboard có dữ liệu + biểu đồ, body log prefill/ lưu thành công (TDEE cập nhật), cả 4 tab máy tính, cài đặt hồ sơ; không có lỗi console sau khi sửa lỗi event/state.

## API hiện có

```
GET    /api/health

POST   /api/auth/register | /login | /refresh | /logout
GET    /api/me              PATCH /api/me         DELETE /api/me

POST   /api/calc/:type?save=true
GET    /api/calc/history
# type: one-rep-max, percent-1rm, bmr, tdee, calories, macro, navy-body-fat,
#       lbm, ffmi, bmi, hr-zones, tonnage, volume, one-rep-max-formulas

GET    /api/metrics?from=&to=&days=
GET    /api/metrics/summary?days=90
GET    /api/metrics/export.csv
GET    /api/metrics/:date
PUT    /api/metrics/:date
```

Mọi response thành công: `{ "data": ... }`. Lỗi: `{ "error": { "code", "message", "details?" } }`.

## Công thức & nguồn

| Chỉ số | Công thức |
| --- | --- |
| 1RM | Epley `w×(1+reps/30)`, Brzycki `w×36/(37−reps)` |
| BMR | Mifflin-St Jeor (nam +5, nữ −161) |
| TDEE | BMR × 1.2 / 1.375 / 1.55 / 1.725 / 1.9 |
| Calo mục tiêu | cut −10…20%, lean bulk +5…10%, maintain 0, bulk +10…20% |
| Macro | Protein 1.6–2.2 g/kg, fat 0.6–1 g/kg, carb = phần còn lại |
| % mỡ | US Navy (cm) |
| LBM | cân nặng × (1 − %mỡ) |
| FFMI | LBM / cao(m)²; chuẩn hóa `+6.1×(1.8−cao(m))` |
| BMI | kg / m² |
| Nhịp tim | Tanaka `208−0.7×tuổi`, Karvonen khi có nhịp nghỉ |
| Tonnage | Σ weight × reps |
| Tốc độ đổi cân | % thay đổi giữa MA7 hiện tại và MA7 của 7 ngày trước |

Tất cả hệ số nằm trong `shared/config/nutrition.js`, có thể chỉnh mà không sửa logic.

## Ghi chú triển khai

- Khi deploy production: đặt `COOKIE_SECURE=true`, JWT secret thật, `CLIENT_ORIGIN` đúng domain. Nếu client và API khác domain, cần `SameSite=None` + HTTPS (hiện cấu hình `lax` phù hợp khi dùng Vite proxy cùng origin).
- Ảnh tiến độ, PWA, quản lý khách hàng, research (Giai đoạn 2–6) chưa làm.
- Bản ghi computed được snapshot tại thời điểm nhập; nếu đổi chiều cao/công thức, dữ liệu cũ không tự tính lại (đúng theo plan).
- Chưa có test API tự động (supertest); đã kiểm thử E2E thủ công. Nên bổ sung khi làm Giai đoạn 2.

## Disclaimer

Các chỉ số và gợi ý chỉ mang tính ước lượng, không thay thế bác sĩ hoặc chuyên gia dinh dưỡng. Bản tóm tắt AI (các giai đoạn sau) có thể sai, cần đối chiếu bài gốc với kết luận quan trọng.
