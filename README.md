# PT Brain

Web app cho người đang học/làm PT: tìm nghiên cứu khoa học, tóm tắt bài báo sang tiếng Việt, tính chỉ số, theo dõi cơ thể, lên giáo án và ôn tập kiến thức — trong một nơi.

> **Trạng thái: hoàn thành Giai đoạn 0 → 6.**
> Đã có thư viện bài đã phân tích, tóm tắt bất đồng bộ, ảnh tiến độ, xuất PDF, PWA, quản lý khách hàng và cấu hình deploy production.

## Tech stack

| Lớp | Công nghệ |
| --- | --- |
| Frontend | React 18 + Vite, React Router, TanStack Query, Tailwind CSS, Recharts, react-hook-form + zod |
| Backend | Node.js 20+, Express, Mongoose, zod, JWT + bcrypt, multer, pdf-parse, pdfkit, cheerio, helmet, express-rate-limit, pino |
| Database | MongoDB 7 (local hoặc Atlas) |
| AI | OpenCode Go – API OpenAI-compatible, model `deepseek-v4.1-flash` (key chỉ ở backend) |
| Nguồn nghiên cứu | PubMed E-utilities, Europe PMC, OpenAlex, Unpaywall, Crossref, DOI resolver |
| Test | Vitest – 114 unit test |
| Tooling | ESLint 9 (flat config), Prettier, Docker Compose |

## Chạy nhanh

Yêu cầu: Node.js >= 20, MongoDB đang chạy (local hoặc Atlas).

```bash
npm install
npm run install:all

cp .env.example .env         # Windows: Copy-Item .env.example .env
# sửa JWT secret, AI_API_KEY, CONTACT_EMAIL trong .env

npm run dev:server           # API  -> http://localhost:4000
npm run dev:client           # Web  -> http://localhost:5173
```

Mặc định `MONGO_URI=mongodb://127.0.0.1:27017/pt-brain`.

Mở http://localhost:5173 → **Đăng ký** → vào **Cài đặt** nhập giới tính, ngày sinh, chiều cao. Sau đó:

- **Giáo án** → wizard tạo giáo án → **Log buổi tập**.
- **Nghiên cứu** → dán DOI/PDF hoặc hỏi bằng tiếng Việt.
- **Học tập** → từ điển, flashcard, sổ tay.

### Cấu hình AI (OpenCode Go)

```env
AI_PROVIDER=opencode-go
AI_BASE_URL=https://opencode.ai/inference/go/openai/v1
AI_API_KEY=oc_sk_...              # chỉ nằm trong .env, không commit
AI_MODEL=deepseek-v4.1-flash
AI_TIMEOUT_MS=180000
AI_DAILY_LIMIT_PER_USER=30
CONTACT_EMAIL=you@example.com     # Crossref/Unpaywall polite pool
PDF_MAX_MB=20
```

Key không có tiền tố `VITE_` nên Vite không đưa vào bundle frontend.

### Docker (chưa chạy thử trên máy này)

```bash
docker compose up --build
# client :5173 | api :4000 | mongo :27017
```

Máy phát triển hiện tại chưa cài Docker; cấu hình đã sẵn nhưng luồng local mới là luồng đã kiểm chứng.

Triển khai production (Render + MongoDB Atlas, `SERVE_CLIENT=true`): xem [`docs/DEPLOY.md`](docs/DEPLOY.md).

## Lệnh

```bash
npm run test        # 114 unit test
npm run lint        # ESLint toàn repo
npm run build       # build production client
npm run format      # Prettier
```

## Cấu trúc

```
pt-brain/
├─ shared/                       # Dùng chung server + client
│  ├─ calculators/               # 1RM, BMR, TDEE, macro, Navy, LBM, FFMI, BMI, HR zones, volume, MA7
│  ├─ analytics/warnings.js      # Cảnh báo theo quy tắc
│  ├─ training/planner.js        # Split, prescription, progressive overload, deload
│  ├─ learning/sm2.js            # SM-2 flashcard
│  └─ config/nutrition.js        # Hệ số/ngưỡng chỉnh được
├─ server/
│  ├─ src/models/                # User, BodyLog, CalcHistory, Exercise, Program, WorkoutSession,
│  │                             # Paper, Summary, Term, Flashcard, Note, AiUsage
│  ├─ src/services/
│  │  ├─ research/               # metadata, pdf, reader, pubmed, europepmc, openalex, ranker, finder
│  │  ├─ ai/                     # client, quota, summarizer, finderSummarizer, planAdvisor
│  │  └─ training/               # exerciseService, programService, workoutService
│  ├─ src/routes/                # auth, me, metrics, calc, summaries, papers, research,
│  │                             # exercises, programs, workouts, terms, notes, flashcards
│  └─ tests/                     # 9 file test
├─ client/src/
│  ├─ pages/                     # Dashboard, BodyLog, Calculators, Research(+Reader/Finder),
│  │                             # Training(+Planner/Workout), Learn(+Glossary/Flashcards/Notes), Settings
│  ├─ components/                # Layout, UI, charts, research components
│  └─ lib/                       # format, date, zod schemas
├─ docker-compose.yml
└─ .env.example
```

## Tính năng theo giai đoạn

### Giai đoạn 0–1 — Nền tảng
- Auth JWT httpOnly + refresh token xoay vòng; bcrypt; zod; rate limit; log không ghi cookie; xóa tài khoản.
- Hồ sơ, 14 máy tính chỉ số, BodyLog 1 bản ghi/ngày, dashboard biểu đồ + MA7 + heatmap + cảnh báo, CSV UTF-8.
- Computed snapshot cho từng ngày để biểu đồ không đổi khi công thức thay đổi.

### Giai đoạn 2 — Research Reader
- Input: DOI/link PubMed–PMC–doi.org, PDF ≤ 20 MB, hoặc văn bản/abstract.
- Ingest: Europe PMC full text XML → PDF OA → abstract; Crossref/Unpaywall fallback; chống SSRF, giới hạn dung lượng, timeout.
- Tóm tắt theo schema JSON cố định, validate zod, retry 1 lần, cache theo DOI/hash file, giới hạn quota AI/ngày.
- Bài dài: trích dữ kiện theo từng đoạn rồi tổng hợp để không mất số liệu.
- UI chia đôi (tóm tắt | bài gốc), tìm trong bài, hỏi đáp trên bài, lưu thuật ngữ, ghi chú, xuất Markdown.
- Nhãn rõ **“chỉ dựa trên abstract”** khi không có toàn văn; mọi số liệu yêu cầu giữ nguyên.

### Giai đoạn 3 — Research Finder
- Câu hỏi tiếng Việt → 2–4 truy vấn tiếng Anh (sửa/xóa/thêm được).
- Gọi song song PubMed, Europe PMC, OpenAlex; gộp, loại trùng DOI/PMID/title.
- **Xếp hạng bằng code** theo mức bằng chứng + độ mới + trích dẫn + open access.
- Lọc năm, mức bằng chứng, open access.
- AI viết 2–3 dòng/kết quả từ abstract và tổng hợp có trích dẫn `[1]`, `[2]`; nêu mâu thuẫn/chưa rõ.
- Lưu bài vào thư viện, mở Reader với DOI đã chọn.

### Giai đoạn 4 — Planner + Workout Log
- Thư viện 42 bài tập (seed idempotent), tên Việt + Anh, nhóm cơ, dụng cụ.
- Wizard giáo án theo quy tắc trong code: full body / upper–lower / PPL, số set/rep/RIR/rest theo mục tiêu và trình độ.
- Volume theo nhóm cơ mỗi tuần, thanh so với mục tiêu 10–20 set, cảnh báo thiếu/quá nhiều.
- Log buổi tập: tạ, rep, RIR, so sánh buổi trước, tonnage, set/nhóm cơ, 1RM ước tính.
- Gợi ý progressive overload: đạt cận trên + đúng RIR → tăng tạ; chưa đạt → giữ tạ, thêm rep.
- Nhắc deload theo chu kỳ; biểu đồ 1RM theo thời gian.

### Giai đoạn 5 — Học tập & áp dụng vào plan
- Từ điển cá nhân: thêm/sửa/xóa, tạo flashcard từ thuật ngữ.
- Flashcard SM-2: thẻ đến hạn, đánh giá 5 mức, interval/ease tự cập nhật.
- Sổ tay ghi chú: tìm kiếm toàn văn, sửa/xóa, tag.
- **Áp dụng vào plan**: AI đọc kết luận bài nghiên cứu + giáo án hiện tại, đề xuất thay đổi sets/RIR/rep range **có bảng trước → sau**; người dùng duyệt mới ghi vào giáo án.

### Giai đoạn 6 — Hoàn thiện
- **Thư viện nghiên cứu**: mọi bài đã phân tích được lưu tự động; ghim (★), tag, tìm kiếm theo tiêu đề/DOI/tóm tắt, mở lại, xuất Markdown/PDF.
- **Tóm tắt bất đồng bộ**: `POST /summaries` trả `202` kèm job nền; lưu `status/progress`, client polling và hiển thị “Đang đọc đoạn 2/4...”. PDF dài không còn bị timeout HTTP.
- **Ảnh tiến độ**: upload JPEG/PNG/WebP ≤ 8 MB, kiểm tra magic bytes; ảnh lưu ngoài public và chỉ phục vụ qua route có auth + kiểm tra quyền sở hữu; xóa được.
- **Xuất PDF**: bản tóm tắt và báo cáo BodyLog, dùng font Noto Sans đóng gói sẵn (hiển thị tiếng Việt đúng).
- **PWA**: manifest, icon 192/512, service worker cache app shell; cài lên điện thoại; chỉ đăng ký SW ở production.
- **Quản lý khách hàng**: CRUD khách, mục tiêu, trình độ, trạng thái, giáo án đang áp dụng, check-in, ghi chú.
- **Production**: server phục vụ `client/dist` khi `SERVE_CLIENT=true`; kèm `render.yaml` và `docs/DEPLOY.md`.

## API chính

```
GET    /api/health

POST   /api/auth/register | /login | /refresh | /logout
GET    /api/me        PATCH /api/me        DELETE /api/me

POST   /api/calc/:type?save=true          GET /api/calc/history
GET    /api/metrics?from=&to=&days=       GET /api/metrics/summary
GET    /api/metrics/export.csv            GET /api/metrics/export.pdf
GET/PUT /api/metrics/:date
POST   /api/metrics/:date/photos          # multipart ảnh tiến độ
GET    /api/metrics/photos/:filename      DELETE /api/metrics/:date/photos/:filename

POST   /api/summaries (JSON | multipart PDF)   GET /api/summaries
GET    /api/summaries/:id                      DELETE /api/summaries/:id
PATCH  /api/summaries/:id                      # ghim (isFavorite) + tags
POST   /api/summaries/:id/ask
POST   /api/summaries/:id/apply-to-plan
GET    /api/summaries/:id/export.md            GET /api/summaries/:id/export.pdf

POST   /api/research/search
GET    /api/papers        POST /api/papers        GET/DELETE /api/papers/:id
GET    /api/clients       POST /api/clients       GET/PATCH/DELETE /api/clients/:id
GET    /api/terms         POST /api/terms         PATCH/DELETE /api/terms/:id
GET    /api/notes         POST /api/notes         PATCH/DELETE /api/notes/:id
GET    /api/flashcards?due=true               POST /api/flashcards
PATCH  /api/flashcards/:id  DELETE /api/flashcards/:id  POST /api/flashcards/:id/review

GET    /api/exercises
GET    /api/programs      POST /api/programs      POST /api/programs/suggest
GET    /api/programs/:id  PATCH/DELETE /api/programs/:id
GET    /api/programs/:id/volume
GET    /api/programs/:id/suggestions?dayName=
POST   /api/programs/:id/apply-changes

GET    /api/workouts      POST /api/workouts      GET/PATCH/DELETE /api/workouts/:id
GET    /api/workouts/progression/:exercise
```

Thành công: `{ "data": ... }`. Lỗi: `{ "error": { code, message, details? } }`.

## Kiểm chứng

- `npm run test`: **114/114 pass** — công thức, cảnh báo, text/HTML/XML, SSRF, schema tóm tắt, ranker, progression, SM-2, PDF, client validation, apply changes.
- `npm run lint`: 0 lỗi.
- `npm run build`: thành công; tách chunk react/charts/query.
- E2E với MongoDB + AI thật:
  - Reader DOI meta-analysis: 201 trong ~65s, nhãn abstract-only, số liệu `P = 0.002`, `ES 0.023`, cache lần 2 trong **2s** cùng ID.
  - Reader fulltext OA: `sourceKind=open_access_fulltext`, 7.7k ký tự, mức 4, 4 kết quả chính.
  - **PDF có sẵn `000441029.pdf`**: `POST /summaries` trả **202 sau 0s**, job nền 226s với tiến trình `Đang đọc đoạn 1/4 → 4/4 → tổng hợp`; kết quả `ready`, toàn văn 53.902 ký tự, tiêu đề AI “Leg Power Predicts Cognitive Ageing in Twins”, 8 kết quả chính, mức bằng chứng 3.
  - Finder: 28s, 3 truy vấn, 53 kết quả thô → 14 bài sau gộp → 8 kết quả, tổng hợp có trích dẫn.
  - Planner: 42 bài seed, giáo án 4 buổi = 73 set/tuần, volume đúng theo phép cộng tay.
  - Log 3 buổi → gợi ý tăng tạ 42.5 / 52.5 / 62.5 kg; 1RM progression đúng.
  - Apply-to-plan: 11s, 4 thay đổi trước→sau, áp dụng thành công.
  - SM-2: thẻ mới quality 5 → interval 1 ngày, ease 2.6.
  - **Phase 6**: ghim thư viện + tag, PDF tóm tắt 47.8 KB, PDF BodyLog 19.1 KB, upload/fetch/xóa ảnh tiến độ, CRUD khách hàng + check-in, manifest/SW/icon PWA đều 200.
  - Production: chạy `SERVE_CLIENT=true` trên cổng 4100 → `/` trả HTML có manifest và asset, `/api/health` OK.
- UI đã kiểm tra bằng trình duyệt thật: Dashboard, BodyLog (ảnh + PDF), 4 tab máy tính, Reader (kể cả màn hình đang xử lý + polling), Finder, Thư viện, Planner, Workout, Glossary, Flashcards, Clients, modal Apply-to-plan; không có lỗi console.

## Giới hạn đã biết

- **PDF scan không có OCR**: file không có lớp text trả lỗi rõ ràng, cần bản PDF có text hoặc dán nội dung.
- PDF được **trích text** (không gửi nguyên file cho model như phương án Anthropic trong plan gốc), nên bảng/hình phức tạp có thể mất cấu trúc.
- Chưa có quiz trắc nghiệm do AI tạo (phần còn lại của mục 6.6).
- Đã chạy **3 bài thật** (meta-analysis, fulltext OA, PDF quan sát) + Finder; chưa đủ bộ 5 bài acceptance của plan.
- Chưa có test API tự động (supertest); E2E hiện chạy tay.
- Docker Compose chưa được chạy thử trên máy này (đã test chế độ production-serving trực tiếp).
- Job tóm tắt chạy trong RAM của process; nếu server restart giữa chừng, bài có thể kẹt `processing` (chưa có retry tự động).
- Ảnh tiến độ lưu trên đĩa local; Render free sẽ mất ảnh sau redeploy — cần S3/Cloudinary cho production thật.
- “Khách hàng” là CRM một chiều (PT quản lý hồ sơ), chưa phải tài khoản đăng nhập riêng cho khách.
- PWA đã test manifest/SW/asset và build production, chưa cài thử trên điện thoại thật.
- Apply-to-plan có thể trả về 0 thay đổi — hành vi an toàn khi bằng chứng yếu.

## Bảo mật & bản quyền

- JWT trong cookie `httpOnly`, refresh token lưu hash, xoay vòng; mọi query lọc `userId`.
- API key AI chỉ ở backend; log không ghi header/cookie.
- Toàn văn chỉ lưu khi là **open access** hoặc **PDF người dùng tự tải**; bài paywall chỉ lưu abstract.
- Chỉ số và gợi ý mang tính ước lượng, không thay thế bác sĩ/chuyên gia dinh dưỡng. Bản tóm tắt AI có thể sai — cần đối chiếu bài gốc với kết luận quan trọng.
