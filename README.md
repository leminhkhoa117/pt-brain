# PT Brain

Web app cho người đang học/làm PT: tìm nghiên cứu khoa học, tóm tắt bài báo sang tiếng Việt, tính chỉ số, theo dõi cơ thể, lên giáo án và **học theo giáo trình PT Academy** — trong một nơi.

> **Trạng thái: hoàn thành Giai đoạn 0 → 6.**

## Tech stack

| Lớp | Công nghệ |
| --- | --- |
| Frontend | React 18 + Vite, React Router, TanStack Query, Tailwind CSS, Recharts, react-hook-form + zod, Three.js (Human Atlas 3D) |
| Backend | Node.js 20+, Express, Mongoose, zod, JWT + bcrypt, multer, pdf-parse, pdfkit, cheerio, helmet, express-rate-limit, pino |
| Database | MongoDB 7 (local hoặc Atlas) |
| AI | OpenCode Go – API OpenAI-compatible, model `deepseek-v4.1-flash` (key chỉ ở backend) |
| Nguồn nghiên cứu | PubMed E-utilities, Europe PMC, OpenAlex, Unpaywall, Crossref, DOI resolver |
| Test | Vitest - 386 test (unit + API integration; cần MongoDB cho phần integration) |
| Tooling | ESLint 9 (flat config), Prettier, Docker Compose |

## Giao diện & logo

- Logo riêng **PT Brain**: người chạy trong quỹ đạo nguyên tử trên vòng tròn navy — ghép chủ đề vận động và khoa học.
- Asset: `client/public/logo-mark.png` (PNG, dùng cho header), `favicon.png`, icon PWA 192/512; component `BrandLogo` dùng chung nên mọi chỗ đều khớp logo.
- Hệ thống giao diện **sổ tay huấn luyện**: nền giấy lạnh, mực đậm, đường kẻ hairline, một accent pine; tiêu đề Source Serif 4, UI Be Vietnam Pro, số liệu Roboto Mono. Sidebar pine 248px trên desktop, rail 64px trên tablet, top bar + drawer + bottom nav trên mobile.
- Dark mode mặc định theo hệ thống; có nút chuyển sáng/tối. Token và quy tắc nằm trong `DESIGN.md`, bối cảnh sản phẩm trong `PRODUCT.md`.
- **Theme Studio** (`/studio`): 20 bảng màu, 5 cặp font, 4 kiểu bo góc, 31 hiệu ứng (nền / texture / con trỏ / chuyển động / hover) và 48 biến thể component. Chọn xong bấm **Áp dụng** để đổi toàn app ngay, không cần tải lại; cấu hình lưu theo trình duyệt.


## Chạy nhanh

Yêu cầu: Node.js >= 20, MongoDB đang chạy (local hoặc Atlas). Hoặc dùng Docker — xem [mục Docker](#docker).

```bash
npm install
npm run install:all

cp .env.example .env         # Windows: Copy-Item .env.example .env
# sửa JWT secret, AI_API_KEY, CONTACT_EMAIL trong .env

npm run dev:server           # API  -> http://localhost:4000
npm run dev:client           # Web  -> http://localhost:5173
```

Mặc định `MONGO_URI=mongodb://127.0.0.1:27017/pt-brain`.

Mở http://localhost:5173 → **Đăng ký** → vào **Cài đặt** nhập giới tính, ngày sinh, chiều cao, cân nặng. Sau đó:

- **Giáo án** → wizard tạo giáo án → **Log buổi tập**.
- **Nghiên cứu** → dán DOI/PDF hoặc hỏi bằng tiếng Việt.
- **Học tập** → **giáo trình PT Academy** (6 module, 73 bài, quiz, tiến độ), từ điển, flashcard, sổ tay.

### Bảo mật & đăng nhập

- **Đăng nhập Google** (OAuth 2.0 + PKCE): điền `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` trong `.env`; redirect URI `http://localhost:5173/api/auth/google/callback` (production: `https://<domain>/api/auth/google/callback`). Chưa cấu hình thì nút Google tự ẩn.
- **Ghi nhớ đăng nhập**: bật = cookie 30 ngày; tắt = cookie phiên, đóng trình duyệt là hết.
- **Đổi / đặt mật khẩu** trong Cài đặt → Bảo mật tài khoản; tài khoản Google-only có thể đặt mật khẩu lần đầu.
- **Quên mật khẩu**: token một lần, hết hạn 30 phút. Cấu hình `RESEND_API_KEY` + `MAIL_FROM` để gửi email thật; chưa cấu hình thì development trả link trực tiếp trong response.
- **Phiên thiết bị**: xem thiết bị/IP/lần hoạt động cuối, thu hồi từng phiên hoặc đăng xuất mọi thiết bị khác. Đổi mật khẩu/logout thu hồi access token ngay.
- **Chống dò mật khẩu**: khóa tạm 15 phút sau 5 lần sai + rate limit theo IP/email; mật khẩu ≥ 10 ký tự, có chữ + số.

Chi tiết audit, checklist deploy và các rủi ro còn lại: [`docs/SECURITY_AUDIT.md`](docs/SECURITY_AUDIT.md).  
Dữ liệu xương/mô liên kết cho Atlas: [`docs/ANATOMY_DATA.md`](docs/ANATOMY_DATA.md).

### Cấu hình AI (OpenCode Go)

```env
AI_PROVIDER=opencode-go
AI_BASE_URL=https://opencode.ai/inference/go/openai/v1
AI_API_KEY=oc_sk_...              # chỉ nằm trong .env, không commit
AI_MODEL=deepseek-v4.1-flash
AI_VISION_MODEL=gemini-4-argon
AI_TIMEOUT_MS=180000
AI_DAILY_LIMIT_PER_USER=30
CONTACT_EMAIL=you@example.com     # Crossref/Unpaywall polite pool
PDF_MAX_MB=20
```

Key không có tiền tố `VITE_` nên Vite không đưa vào bundle frontend.

### Docker

Đã chạy thử trên **Windows 11 Pro + Docker Desktop (WSL2)**: client, API và Mongo đều healthy. Yêu cầu Docker Engine/Docker Desktop + Docker Compose v2.

Trên Windows, nếu Docker báo **“Windows hypervisor is not running”**, mở PowerShell Admin:

```powershell
bcdedit /set hypervisorlaunchtype auto
```

rồi restart. Nếu vẫn lỗi, bật thêm thành phần hypervisor:

```powershell
dism.exe /online /enable-feature /featurename:Microsoft-Hyper-V-Hypervisor /all /norestart
```

```bash
cp .env.example .env          # Windows: Copy-Item .env.example .env
docker compose up -d --build
# client :5173 | api :4000 | mongo :27017
```

`docker compose` tự đọc `.env` để lấy `AI_API_KEY`, JWT secret...; file `.env` không được copy vào image. Trong Docker, server kết nối Mongo nội bộ qua `mongodb://mongo:27017/pt-brain`; `MONGO_URI` trong `.env` chỉ dùng khi chạy local.

Mặc định các port chỉ bind `127.0.0.1`. Muốn test điện thoại trong LAN, đổi mapping của client thành `"5173:5173"`; không mở Mongo/API ra LAN.

Kiểm tra stack:

```bash
docker compose ps
curl http://localhost:4000/api/health
# {"data":{"ok":true,"service":"pt-brain-api","db":"up",...}}
```

Lệnh thường dùng:

```bash
docker compose logs -f server   # log API
docker compose logs -f client   # log Vite
docker compose down             # dừng, giữ dữ liệu
docker compose up -d            # chạy lại
docker compose up -d --build    # build lại khi đổi package.json/Dockerfile
docker compose down -v          # XÓA volume Mongo/uploads
```

- `client/src`, `server/src` và `shared` được mount vào container nên sửa code hot-reload; đổi dependency hoặc Dockerfile mới cần build lại.
- Dữ liệu nằm trong volume `mongo_data` và `uploads_data`.
- Nếu máy đang chạy MongoDB local ở cổng 27017, tắt service trước (Windows, PowerShell Admin):

```powershell
Stop-Service MongoDB
Set-Service MongoDB -StartupType Manual
# bật lại khi cần: Set-Service MongoDB -StartupType Automatic; Start-Service MongoDB
```

- Docker Mongo là database riêng, **không tự đọc dữ liệu MongoDB local**. Migrate bằng [MongoDB Database Tools](https://www.mongodb.com/try/download/database-tools) (`mongodump`/`mongorestore`; PowerShell Admin cho lệnh service):

```powershell
# 1) dừng container Mongo, bật service local
docker compose stop mongo
Start-Service MongoDB

# 2) dump database local
mongodump --uri "mongodb://127.0.0.1:27017" --db pt-brain --out .\mongo-dump --gzip

# 3) tắt service local, bật lại container Mongo
Stop-Service MongoDB
docker compose start mongo

# 4) restore vào Docker Mongo
mongorestore --uri "mongodb://127.0.0.1:27017" --gzip --drop .\mongo-dump
```

Sau restore, chạy `docker compose start server` và kiểm tra `curl http://localhost:4000/api/health`.

#### Backup & restore

Script `scripts/backup-mongo.ps1` dump database từ container, tạo file `.sha256` và tự xóa bản cũ hơn 30 ngày:

```powershell
.\scripts\backup-mongo.ps1
# tùy chọn: -OutDir "D:\Backups\pt-brain" -KeepDays 60
```

Nên chạy hằng ngày bằng **Task Scheduler**. Định kỳ thử restore vào database tạm để chắc file backup dùng được:

```powershell
docker cp "$env:USERPROFILE\PTBrainBackups\pt-brain-<stamp>.gz" pt-brain-mongo:/tmp/restore.gz
docker exec pt-brain-mongo sh -lc 'mongorestore --archive=/tmp/restore.gz --gzip --nsFrom="pt-brain.*" --nsTo="pt-brain-restore.*"'
docker exec pt-brain-mongo mongosh --quiet --eval "db.getSiblingDB('pt-brain-restore').dropDatabase()"
```

Triển khai production (Render + MongoDB Atlas, `SERVE_CLIENT=true`): xem [`docs/DEPLOY.md`](docs/DEPLOY.md).

## Lệnh

```bash
npm run test        # 386 test (unit + API integration; cần MongoDB)
npm run test:unit   # 337 unit test, không cần MongoDB
npm run lint        # ESLint toàn repo
npm run build       # build production client
npm run format      # Prettier
npm --prefix client run validate:atlas  # kiểm tra 2.234 mesh + mapping 59 cơ
npm --prefix client run validate:atlas-anatomy  # kiểm tra 315 concept xương/mô liên kết
```

## Cấu trúc

```
pt-brain/
├─ shared/                       # Dùng chung server + client
│  ├─ calculators/               # 1RM, BMR, TDEE, macro, Navy, LBM, FFMI, BMI, HR zones, volume, MA7
│  ├─ analytics/warnings.js      # Cảnh báo theo quy tắc
│  ├─ training/planner.js        # Split, prescription, progressive overload, deload
│  ├─ learning/sm2.js            # SM-2 flashcard
│  ├─ anatomy/index.js           # Xương + mô liên kết: tên Việt, chức năng, tải tập, lưu ý
│  ├─ learning/contexts.js       # Metadata học theo ngữ cảnh + action cho 73 bài
│  ├─ security/password.js       # Chính sách mật khẩu dùng chung client/server
│  ├─ curriculum/                # Giáo trình PT Academy: schema zod + 73 bài
│  │                             # (validate khi import, quiz, nguồn kiểm chứng)
│  ├─ muscles/index.js           # 59 cơ: tên Việt – Anh, nhóm, chức năng, bài tập
│  └─ config/nutrition.js        # Hệ số/ngưỡng chỉnh được
├─ server/
│  ├─ src/models/                # User, BodyLog, CalcHistory, Exercise, Program, WorkoutSession,
│  │                             # Paper, Summary, Term, Flashcard, Note, AiUsage, Meal, MealPlan, MealPlanReview,
│  │                             # CurriculumProgress, LearningEvent, PlanEvaluation
│  ├─ src/services/
│  │  ├─ research/               # metadata, pdf, reader, pubmed, europepmc, openalex, ranker, finder
│  │  ├─ ai/                     # client, quota, summarizer, finderSummarizer, planAdvisor,
│  │  │                          # mealPlanner, mealPlanReview, muscleCoach, lessonCoach
│  │  └─ training/               # exerciseService, programService, workoutService
│  ├─ src/routes/                # auth, me, metrics, calc, summaries, papers, research, meals, meal-plans,
│  │                             # muscles, exercises, programs, workouts, terms, notes, flashcards,
│  │                             # quizzes, curriculum
│  └─ tests/                     # 49 file test (unit + API integration + auth security)
├─ client/src/
│  ├─ pages/                     # Dashboard, BodyLog, Calculators, Research(+Reader/Finder),
│  │                             # Training(+Planner/Workout), Learn(+Curriculum/Lesson/Glossary/Flashcards/Notes),
│  │                             # Nutrition, MusclePage (+atlas/*, muscles/MuscleChat), Settings
│  ├─ components/                # Layout, UI, charts, research components
│  └─ lib/                       # format, date, zod schemas
├─ client/public/models/human-atlas/  # atlas.json + 15 chunk .bin.gz (BodyParts3D)
├─ client/public/curriculum/          # ảnh minh hoạ giáo trình (PD/CC BY) + ATTRIBUTION.md
├─ docker-compose.yml
└─ .env.example
```

## Tính năng theo giai đoạn

### Giai đoạn 0–1 — Nền tảng
- Auth JWT httpOnly + refresh token xoay vòng; bcrypt; zod; rate limit; log không ghi cookie; xóa tài khoản.
- Đăng nhập Google OAuth (PKCE), “ghi nhớ đăng nhập”, đổi/đặt lại mật khẩu, quản lý phiên thiết bị, khóa tạm khi dò mật khẩu, kiểm tra Origin chống CSRF — chi tiết trong [`docs/SECURITY_AUDIT.md`](docs/SECURITY_AUDIT.md).
- Hồ sơ có giới tính, ngày sinh, chiều cao, cân nặng; 14 máy tính chỉ số, BodyLog 1 bản ghi/ngày, dashboard biểu đồ + MA7 + heatmap + cảnh báo, CSV UTF-8. Ô chiều cao/cân nặng/tuổi trong máy tính sửa được để tính nhanh, không ghi đè hồ sơ.
- **Lịch sử tính toán**: lưu kết quả 1RM và Calo & macro vào `calchistories`; xem 50 bản ghi gần nhất ngay trong trang Máy tính, lọc theo loại, xóa từng bản ghi hoặc toàn bộ.
- Computed snapshot cho từng ngày để biểu đồ không đổi khi công thức thay đổi.

### Giai đoạn 2 — Research Reader
- Input: DOI/link PubMed–PMC–doi.org, PDF ≤ 20 MB, hoặc **toàn văn dán tay** (≥ 5.000 ký tự).
- Ingest: Europe PMC full text XML → PDF OA → HTML OA ≥ 5.000 ký tự; Crossref/Unpaywall fallback; chống SSRF, giới hạn dung lượng, timeout.
- Finder probe top 20 URL trước khi trả kết quả: kiểm tra `%PDF`, PMC XML hoặc HTML có đủ mục Methods/Results/Discussion; cache probe 6 giờ.
- Không tóm tắt từ abstract: bài paywall/abstract-only trả `FULLTEXT_REQUIRED` kèm gợi ý tìm PDF hợp pháp.
- Tóm tắt theo **pipeline 3 bước**: (1) trích dữ kiện thuần JSON — mỗi trường có số trang + trích nguyên văn; (2) viết cho PT theo cấu trúc trang mới; (3) kiểm tra tự động số liệu/nhãn/lặp/mục thiếu, tự sửa tối đa 2 vòng. Validate zod, cache theo DOI/hash file **+ prompt version**, giới hạn quota AI/ngày.
- PDF hai cột được đọc theo **bố cục cột** (không lẫn chú thích hình); text có marker `[[page N]]` để trích dẫn đúng trang. Bài dài: trích dữ kiện theo từng đoạn rồi gộp để không mất số liệu.
- Metadata lấy từ **Crossref** (kể cả khi PDF không in DOI): tiêu đề, tác giả, năm, tập(số), trang, DOI; không dùng tên file làm tiêu đề.
- UI chia đôi (tóm tắt | bài gốc), tìm trong bài, xuất Markdown/PDF.
- **Bản dịch tiếng Việt**: nút "Dịch bài này" ngay dưới bài gốc; dịch toàn văn/abstract theo đoạn (tối đa 40.000 ký tự), giữ nguyên số liệu, lưu vào `Summary.translation` để không dịch lại. Có nút **Tải bản dịch** xuất file `.txt` (kèm tiêu đề và ghi chú nếu bản dịch bị giới hạn độ dài).
- **Hình & bảng**: trích nhãn + chú thích + số trang từ PDF/HTML, AI giải thích bằng tiếng Việt và nêu điểm cần chú ý. PDF tải lên được lưu ngoài public và mở đúng trang qua route có auth; bài từ link mở ở trang gốc.
- **Kết quả dễ đọc**: mỗi kết quả theo khuôn Dữ kiện → Nghĩa là gì trong phòng tập → Mức chắc chắn; nhãn [Dữ kiện]/[Tác giả diễn giải]/[Nhận xét của AI]; thuật ngữ khó có tooltip tại chỗ.
- **Mức bằng chứng 3 trục**: Thiết kế / Độ chắc chắn / Liên quan tới PT, mỗi trục cao–vừa–thấp kèm lý do; thay cho “Mức bằng chứng x/5” không tiêu chí.
- Nếu kiểm tra tự động fail sau 2 vòng: vẫn lưu để đọc/export, gắn `needsReview`, khoá “Áp dụng vào plan”; export Markdown/PDF có **phụ lục facts** để audit.
- **Chat hỏi đáp theo từng bài**: lịch sử lưu riêng trong `Summary.qa`, AI nhớ cả nội dung bài + các câu hỏi trước; bài dài được chọn đoạn thông minh (giữ đầu, Results/Discussion/Conclusion và mẫu đều phần còn lại) trước khi đưa vào ngữ cảnh. Có nút xóa lịch sử.
- Bản cũ `abstract_only` được gắn nhãn **“Chỉ abstract”**, không thể tạo lại/áp dụng; mọi số liệu yêu cầu giữ nguyên.

### Giai đoạn 3 — Research Finder
- Câu hỏi tiếng Việt → 2–4 truy vấn tiếng Anh (sửa/xóa/thêm được).
- Gọi song song PubMed, Europe PMC, OpenAlex, Crossref; gộp, loại trùng DOI/PMID/title.
- **Chỉ trả bài open access đã xác minh + có toàn văn** (PMC XML hoặc PDF trực tiếp). Bài non-OA, landing-only hoặc chỉ abstract bị loại ở server.
- **Xếp hạng bằng code** theo mức bằng chứng + độ mới + trích dẫn + liên quan.
- Lọc năm, mức bằng chứng; không có toggle tắt chính sách OA.
- Không gọi AI tóm tắt abstract: Finder chỉ dịch truy vấn, mỗi card có abstract gốc để sàng lọc và nút PDF/PMC/HTML.
- Lưu bài vào thư viện, mở Reader với DOI đã chọn; Reader chỉ tóm tắt khi có toàn văn.
- **Tổng hợp từ toàn văn**: trong Thư viện, chọn câu hỏi và tổng hợp tối đa 8 bản `basedOn=fulltext` đã tóm tắt; không dùng abstract.
- **Dọn bản abstract cũ**: nút xoá toàn bộ Summary `abstract_only` nhưng giữ bản fulltext.
- **Lịch sử tìm kiếm**: lưu 8 lần tìm gần nhất (câu hỏi, bộ lọc, truy vấn và kết quả) trong `localStorage` theo từng tài khoản; bấm “Mở lại” để xem lại danh sách mà không tốn lượt AI. Khi đang đọc một bài, nút **“← Kết quả tìm kiếm”** đưa về đúng danh sách cũ.

### Giai đoạn 4 — Planner + Workout Log
- Thư viện 110 bài tập (seed idempotent), tên Việt + Anh, nhóm cơ, dụng cụ.
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
- **Quiz AI**: 5 câu trắc nghiệm/nội dung đã tóm tắt, chấm điểm, giải thích đáp án; quota riêng.
- **Job bền hơn**: khi server khởi động lại, tối đa 5 job `processing` được khôi phục tự động từ nguồn đã lưu; job vượt quá giới hạn hoặc thiếu nguồn được đánh dấu `failed` để bấm "Thử lại". Job không cập nhật quá 6 phút cũng bị đánh dấu `failed` khi client kiểm tra lại. Khóa theo `(userId, cacheKey)` chống tạo trùng job/quota.
- **Giao diện & logo mới**: logo quả tạ + quỹ đạo electron, font Be Vietnam Pro, sidebar nhóm chức năng, hero dashboard, chat full-width, dark mode được tinh chỉnh.

### Nâng cấp sau Phase 6

- **Nav bar lên header**: bỏ sidebar, menu ngang 6 mục chính + “Thêm”, mobile có bottom nav và drawer.
- **Trang giới thiệu onboarding**: tài khoản mới được đưa qua `/welcome` trước khi vào Tổng quan; trang có mục đích, vòng lặp sử dụng, 4 bước chức năng kèm minh hoạ/mũi tên, hướng dẫn bắt đầu và nút “Bắt đầu theo dõi”. Tài khoản cũ vào thẳng dashboard nhưng luôn có link “Giới thiệu” trong nhóm Khám phá trên thanh điều hướng.
- **AI đánh giá thể trạng qua ảnh**: 1-4 ảnh (trước/nghiêng/sau), phân tích dựa trên hồ sơ + mục tiêu; trả % mỡ dạng **khoảng** + độ tin cậy, nhận xét cơ/tư thế, ưu tiên, điều chỉnh tập/dinh dưỡng; ảnh lưu riêng tư và xóa được.
- **Calo từ ảnh bữa ăn**: nhận diện món, khẩu phần, calo/macro, giả định và độ tin cậy; lưu ảnh + thông tin bữa; tổng calo/protein trong ngày so với mục tiêu.
- **Trang Buổi tập & Bài tập**: lịch sử buổi tập có chi tiết set, tonnage, xóa; thư viện 110 bài tập lọc theo cơ/dụng cụ.
- **Cardio ngoài phòng gym**: log chạy bộ, đi bộ, bơi, đạp xe, chèo thuyền, nhảy dây, yoga... với thời gian/quãng đường/cường độ; ước tính calo theo MET và pace (ví dụ chạy 3 km/15 phút ≈ 219 kcal với người 70 kg), hoặc nhập calo thủ công từ đồng hồ. Lịch sử có tổng calo vận động; editor giáo án cho phép gắn cardio vào từng ngày (ví dụ Chủ nhật chạy bộ) và log nhanh từ plan.
- **Chat streaming & bố cục Reader**: câu trả lời hỏi đáp bài báo hiện dần từng đoạn qua SSE (không còn chờ cả cục), có con trỏ stream và có thể dừng khi đổi bài. Trang Nghiên cứu đặt **tóm tắt và chat AI song song ở trên**, bài gốc + bản dịch tiếng Việt + ghi chú ở dưới.
- **Hộp thoại trong app**: thay toàn bộ `window.confirm/prompt` bằng modal đồng bộ giao diện cho xóa dữ liệu, đổi tên/tag, sửa ghi chú...; hỗ trợ Esc/Hủy, nút nguy hiểm màu đỏ và nhập liệu có validate độ dài.
- **Tự tạo giáo án**: mở form trống, thêm ngày, chọn bài qua popup thư viện (tab nhóm cơ, tìm kiếm, lọc dụng cụ), đặt set/rep/RIR/rest rồi lưu.
- **Sửa giáo án**: đổi tên/mục tiêu/deload, thêm/xóa ngày, thêm/xóa bài, chỉnh set/rep/RIR/rest; chọn bài bằng popup thay vì dropdown.
- **AI đề xuất giáo án**: dựa trên hồ sơ, dụng cụ, thời gian và evidence base; preview, có thể lưu hoặc để hệ thống fallback theo quy tắc nếu AI lỗi.
- **Chấm điểm giáo án**: điểm 0-100 + hạng, 7 subscore (volume, tần suất, cân bằng, RIR, hồi phục, đặc hiệu, tiến bộ), điểm mạnh/vấn đề/đề xuất và trích dẫn nghiên cứu.
- **Human Atlas 3D tương tác**: trang `/muscles` dùng **2.234 mảnh giải phẫu, 3.432 cấu trúc, 15 hệ cơ quan** từ BodyParts3D 4.0 (CC BY 4.0); xoay/zoom, tìm kiếm toàn bộ cấu trúc, bật/tắt từng hệ, thu nhỏ bảng hệ cơ quan, tách giải phẫu 0–100%, isolate cấu trúc và xem metadata PT Brain (tên Việt – Anh, nhóm, chức năng, bài tập) cho 59 cơ đã map qua FMA; bảng thông tin kèm mô tả chức năng/cấu trúc của hệ cơ quan tương ứng.
- **Hệ xương & mô liên kết trong Atlas**: knowledge base `shared/anatomy` phủ **315 concept xương/mô liên kết** (122 mục biên soạn + 193 sinh tên theo quy tắc; 0 missing) với tên Việt – Anh, nhóm, chức năng, ứng dụng tập luyện, lưu ý an toàn và cơ liên quan; bấm vào xương/gân/dây chằng/cân/sụn/đĩa đệm đều mở panel + nút **Hỏi AI** như cơ. Script `validate:atlas-anatomy` kiểm tra độ phủ trong CI.
- **Chat AI theo cấu trúc**: chat nằm dưới mô hình, hỏi về kỹ thuật, bài tập, set/tuần, khởi động, phục hồi của **cơ, xương hoặc mô liên kết** đang chọn; AI nhận metadata đầy đủ (chức năng, bài tập, ghi chú, tải tập, lưu ý an toàn, xương/mô liên quan) + hồ sơ người dùng (mục tiêu, bệnh nền, ghi chú sức khỏe), trả lời tiếng Việt, có bằng chứng E1–E6 và quota riêng `muscle`. Đổi cấu trúc giữa lúc chờ sẽ bỏ qua câu trả lời của cấu trúc cũ.
- **Nhập bữa ăn 2 cách**: chụp ảnh để AI ước tính, hoặc **nhập tay** từng món với kcal/P/C/F — không cần ảnh. Bữa nhập tay lưu `source=manual`, sửa lại món được, tổng ngày cập nhật ngay.
- **Meal plan 7 ngày, tối đa 3 tháng**: AI gợi ý theo hồ sơ/sở thích, hoặc người dùng **tự xây thực đơn** trong editor (7 ngày × tới 6 bữa × 12 món, chép ngày, chọn 7–90 ngày). Plan tự tạo lấy mục tiêu ngày = trung bình chính thực đơn đó và sửa lại được.
- **Đánh giá tuần thực tế vs plan**: mỗi tuần so kcal/protein theo ngày và theo bữa với thực đơn mẫu, tính điểm bám plan 0–100 bằng code (40% số ngày có log + 35% calo + 25% protein); AI viết nhận xét điều làm tốt/chỗ lệch/gợi ý, lưu lại từng tuần.
- **Chú thích chỉ số**: nút ⓘ cạnh 1RM, Epley/Brzycki, %1RM, RIR, BMR, TDEE, BMI, Navy, LBM, FFMI, MA7, tonnage, P/C/F... giải thích định nghĩa và công thức ngay trên giao diện; dưới cụm Epley/Brzycki có thêm đoạn giải thích vì sao hai công thức cho kết quả khác nhau. Phần **Nhịp tim** có nút **?** mở hướng dẫn sử dụng, công thức Tanaka/Karvonen và cách chọn 5 vùng nhịp tim.

### Giai đoạn 7 — PT Academy: giáo trình học tập cho PT

- **Giáo trình 6 module** (`/learn` → tab Giáo trình): Giải phẫu cơ xương khớp · Sinh lý vận động & tập luyện · Dinh dưỡng · Yếu tố thể chất · Phục hồi chức năng & an toàn · **Ứng dụng cá nhân hoá** — **73 bài hoàn chỉnh** (15+13+13+8+12+12), mỗi bài có mục tiêu, nội dung tiếng Việt (kèm thuật ngữ Anh), box "Áp dụng vào phòng tập", thuật ngữ, quiz chấm bằng code và **nguồn tham khảo kèm license** (đã kiểm chứng: Morton 2018, ISSN creatine, PEACE & LOVE, IASP 2020, Brinjikji 2015, Crossley 2016, Kongsgaard 2009, Gabbett 2016, WHO 2020...).
- **Nội dung là code có version** tại `shared/curriculum/lessons/*.js` (thuần dữ liệu, không dependency); schema zod + tham chiếu chéo validate ngay khi server nạp routes (slug duy nhất, ảnh khai báo đủ, `related.muscles/conditions` trỏ tới dữ liệu có thật) — 20 test chuyên trách.- **Tiến độ per-user**: model `CurriculumProgress` (đang đọc/hoàn thành, điểm quiz tốt nhất); thanh tiến độ từng module, gợi ý **"Tiếp tục học"** trong trang giáo trình và trên Dashboard.
- **Quiz kết hợp**: bank câu hỏi cố định chấm bằng **code** (miễn phí, có giải thích, lưu điểm tốt nhất) + nút **"AI tạo thêm câu hỏi"** từ nội dung bài (tốn quota `quiz` như quiz nghiên cứu).
- **Chat AI theo bài** (SSE streaming, cùng cơ chế chat cơ bắp): AI chỉ trả lời trong phạm vi nội dung bài + bằng chứng liên quan; quota riêng `curriculum`.
- **Tích hợp chéo**: thuật ngữ bài → **1-click tạo flashcard** SM-2 hoặc lưu vào từ điển cá nhân; cơ nhắc trong bài → deep-link `/muscles?muscle=` mở đúng cơ trong mô hình 3D; máy tính liên quan → deep-link `/calculators?tab=`; bệnh nền liên quan → tooltip quy tắc an toàn; nghiên cứu E1–E10 → chip DOI mở bài gốc.
- **Học theo ngữ cảnh (mới)**: mỗi bài có metadata surface + action; Dashboard có “Học hôm nay”, Giáo trình có “Lộ trình của tôi” và “Ôn tập hôm nay”; thẻ “Học 3 phút” xuất hiện ngay trong Giáo án, Log buổi tập, Dinh dưỡng, AI thể trạng, Máy tính, Đọc nghiên cứu và panel 3D; bấm áp dụng sẽ mở đúng công cụ và ghi mastery/learning event.
- **Đo vòng lặp học**: `CurriculumProgress` lưu mastery + hành động đã áp dụng; `LearningEvent` (TTL 180 ngày) lưu view/quiz/apply/dismiss; API `/api/learning/recommendations|next|summary|lessons/:slug/apply|dismiss`.
- **Kế hoạch gắn Học tập vào toàn bộ app** (app → học, học → áp dụng, đóng vòng lặp): [`docs/LEARNING_INTEGRATION_PLAN.md`](docs/LEARNING_INTEGRATION_PLAN.md).
- **Ảnh minh hoạ public domain/CC BY/CC BY-SA** (14 tệp) tải sẵn về `client/public/curriculum/images/` (bản khắc Gray's Anatomy 1918, bản đồ Vesalius 1543, sơ đồ Sarcomere CC BY-SA, minh hoạ y khoa PD-USGov) — attribution từng ảnh trong UI và trong `client/public/curriculum/ATTRIBUTION.md`; không dùng ảnh thương mại hoặc license NC/ND.

### Evidence base dùng cho AI

10 nguồn đã kiểm chứng metadata qua Europe PMC, gồm:

- Schoenfeld 2017 – volume dose-response (DOI `10.1080/02640414.2016.1210197`).
- Schoenfeld 2016 – tần suất tập (DOI `10.1007/s40279-016-0543-8`).
- Morton 2018 – protein (DOI `10.1136/bjsports-2017-097608`).
- Refalo 2023 – proximity to failure (DOI `10.1007/s40279-022-01784-y`).
- Grgic 2018 – nghỉ giữa set (DOI `10.1007/s40279-017-0788-x`).
- McLeod 2024 – umbrella review prescription (DOI `10.1016/j.jshs.2023.06.005`).
- Helms 2014 – contest prep (DOI `10.1186/1550-2783-11-20`).
- Pancar 2026 – deload (DOI `10.1038/s41598-026-40612-5`).
- AI dietary assessment review 2026 (DOI `10.3390/nu18203406`).
- Smartphone body composition 2026 (DOI `10.1371/journal.pdig.0000983`).

Điểm plan được **tính bằng code** từ metrics, AI chỉ viết nhận xét/đề xuất và bị giới hạn trích dẫn trong danh sách trên.
- **Cá nhân hoá theo sức khỏe**: hồ sơ có mục bệnh nền/chấn thương (thoát vị đĩa đệm, đau lưng/cổ/vai/gối/cổ tay, tăng huyết áp, mang thai...); AI lập giáo án sẽ loại bài chống chỉ định, thêm cảnh báo và yêu cầu bác sĩ/PT duyệt.
- **Production**: server phục vụ `client/dist` khi `SERVE_CLIENT=true`; kèm `render.yaml` và `docs/DEPLOY.md`.

## API chính

```
GET    /api/health            # ping Mongo, 503 nếu DB chết
GET    /api/health/live       # liveness không phụ thuộc DB

POST   /api/auth/register | /login | /refresh | /logout
GET    /api/me        PATCH /api/me        DELETE /api/me
POST   /api/me/welcome-seen                  GET /api/me/ai-usage

POST   /api/calc/:type?save=true          GET /api/calc/history
DELETE /api/calc/history/:id              DELETE /api/calc/history
GET    /api/metrics?from=&to=&days=       GET /api/metrics/summary
GET    /api/metrics/export.csv            GET /api/metrics/export.pdf
GET/PUT /api/metrics/:date
POST   /api/metrics/:date/photos          # multipart ảnh tiến độ
GET    /api/metrics/photos/:filename      DELETE /api/metrics/:date/photos/:filename

POST   /api/summaries (JSON | multipart PDF)   GET /api/summaries?q=&favorite=&tag=&limit=&offset=
GET    /api/summaries/:id                      DELETE /api/summaries/:id
PATCH  /api/summaries/:id                      # ghim (isFavorite) + tags
POST   /api/summaries/:id/ask
POST   /api/summaries/:id/ask/stream        # SSE: event delta / done / error
POST   /api/summaries/:id/apply-to-plan
POST   /api/summaries/:id/retry              DELETE /api/summaries/:id/chat
GET    /api/summaries/:id/export.md            GET /api/summaries/:id/export.pdf
GET    /api/summaries/:id/export-translation.txt

POST   /api/research/search
GET    /api/papers        POST /api/papers        GET/DELETE /api/papers/:id

POST   /api/body-assessments                  # multipart 1-4 ảnh
GET    /api/body-assessments                  GET/DELETE /api/body-assessments/:id
GET    /api/body-assessments/:id/photos/:filename

GET    /api/meals?date=   POST /api/meals     GET /api/meals/summary?date=
POST   /api/meals/manual                    PATCH  /api/meals/:id     DELETE /api/meals/:id   GET /api/meals/:id/photo

GET    /api/meal-plans    POST /api/meal-plans    PUT /api/meal-plans/:id   DELETE /api/meal-plans/:id
POST   /api/meal-plans/suggest-ai           POST /api/meal-plans/:id/activate
GET    /api/meal-plans/:id/reviews           GET /api/meal-plans/:id/adherence?weekStart=
POST   /api/meal-plans/:id/reviews           # nhận xét AI cho 1 tuần
GET    /api/terms         POST /api/terms         PATCH/DELETE /api/terms/:id
GET    /api/notes         POST /api/notes         PATCH/DELETE /api/notes/:id
GET    /api/flashcards?due=true               POST /api/flashcards
PATCH  /api/flashcards/:id  DELETE /api/flashcards/:id  POST /api/flashcards/:id/review
POST   /api/quizzes                            # tạo quiz từ summary

GET    /api/exercises
GET    /api/programs      POST /api/programs      POST /api/programs/suggest
POST   /api/programs/suggest-ai                 # AI đề xuất
GET    /api/programs/:id  PATCH/DELETE /api/programs/:id
GET    /api/programs/:id/volume
GET    /api/programs/:id/suggestions?dayName=
POST   /api/programs/:id/apply-changes
POST   /api/programs/:id/evaluate               # chấm điểm + đề xuất
GET    /api/programs/:id/evaluations

GET    /api/workouts?kind=      POST /api/workouts      GET/PATCH/DELETE /api/workouts/:id
GET    /api/workouts/progression/:exercise
# POST cardio: { kind:"cardio", activity, durationMin, distanceKm?, intensity?, caloriesBurned? }

POST   /api/muscles/chat                     # hỏi AI về cơ đang chọn

GET    /api/curriculum                        # cây giáo trình + tiến độ user
GET    /api/curriculum/lessons/:slug         # nội dung đầy đủ một bài
PUT    /api/curriculum/progress/:slug         # đánh dấu đang đọc / hoàn thành
POST   /api/curriculum/lessons/:slug/quiz     # nộp quiz, chấm bằng code
POST   /api/curriculum/lessons/:slug/quiz-ai  # AI tạo thêm câu hỏi (quota quiz)
POST   /api/curriculum/lessons/:slug/ask            # chat hỏi đáp theo bài
POST   /api/curriculum/lessons/:slug/ask/stream     # SSE: delta / done / error
```

Thành công: `{ "data": ... }`. Lỗi: `{ "error": { code, message, details? } }`.

## Kiểm chứng

- `npm run test`: **386/386 pass** - công thức, cảnh báo, text/HTML/XML, SSRF, schema tóm tắt, trích hình/bảng, ranker, progression, SM-2, PDF, quiz, retrieval, plan metrics/evidence, apply changes, cửa sổ tuần và điểm bám meal plan, validate chat cơ bắp, validate ước tính calo, API integration (auth, metrics, program, library, xóa tài khoản), pipeline research 3 bước + golden sample (crossover, quan sát, RCT, SR/MA, meta-analysis), **chính sách OA + fulltext (accessPolicy, Finder chỉ trả bài đủ điều kiện)**, **giáo trình PT Academy (schema 14 bài, chấm quiz, tiến độ, xóa dữ liệu theo user)**, **an toàn PDF (magic bytes + giới hạn số trang)**.
- `npm run lint`: 0 lỗi.
- `npm run build`: thành công; tách chunk react/charts/query.
- **E2E smoke giáo trình trên server dev + MongoDB thật**: register → GET cây (5 module/14 bài) →
  GET bài (5 sections + ảnh `/curriculum/images/...`) → nộp quiz đúng hết (100/100, lưu best) →
  mark completed → "Tiếp tục học" nhảy đúng bài kế tiếp → evidence/deep-link resolve đủ; smoke
  user xóa sạch sau test (kèm CurriculumProgress cleanup).
- E2E với MongoDB + AI thật:
  - Reader DOI meta-analysis: 201 trong ~65s, số liệu `P = 0.002`, `ES 0.023`, cache lần 2 trong **2s** cùng ID.
  - Reader fulltext OA: `sourceKind=open_access_fulltext`, 7.7k ký tự, mức 4, 4 kết quả chính.
  - Reader bài non-OA: trả `FULLTEXT_REQUIRED`, không tạo Summary, UI gợi ý nguồn PDF hợp pháp.
  - **PDF có sẵn `000441029.pdf`**: `POST /summaries` trả **202 sau 0s**, job nền 226s với tiến trình `Đang đọc đoạn 1/4 → 4/4 → tổng hợp`; kết quả `ready`, toàn văn 53.902 ký tự, tiêu đề AI “Leg Power Predicts Cognitive Ageing in Twins”, 8 kết quả chính, mức bằng chứng 3.
  - Finder: 28s, 3 truy vấn, 53 kết quả thô → chỉ giữ bài OA + toàn văn, tối đa 8 kết quả, không tóm tắt abstract.
  - Planner: 110 bài seed, giáo án 4 buổi = 73 set/tuần, volume đúng theo phép cộng tay.
  - Log 3 buổi → gợi ý tăng tạ 42.5 / 52.5 / 62.5 kg; 1RM progression đúng.
  - Apply-to-plan: 11s, 4 thay đổi trước→sau, áp dụng thành công.
  - SM-2: thẻ mới quality 5 → interval 1 ngày, ease 2.6.
  - **Chat theo bài**: hỏi “Kết quả chính…” → trả lời sau 4s, có trích số liệu; lịch sử lưu 1 cặp Q&A; xóa lịch sử 200; reload vẫn còn lịch sử.
  - **Quiz AI**: 7s, 5 câu × 4 lựa chọn, có giải thích; làm bài/chấm điểm trên UI.
  - **5 bài thật**: volume meta-analysis, protein meta-analysis (fulltext), frequency meta-analysis, fulltext OA case report, và PDF `000441029.pdf`.
  - **AI vision**: ảnh táo → bữa ăn 95 kcal (P 0.5 / C 25 / F 0.3), độ tin cậy thấp đúng như kỳ vọng với ảnh minh họa.
  - **Dinh dưỡng & meal plan**: `POST /meals/manual` lưu bữa 530 kcal / 50 g protein; plan tự tạo 28 ngày có mục tiêu 1.900 kcal / P142; tuần 1 log 7/7 ngày → điểm bám plan 97/100, bảng ngày và theo bữa đúng; `POST /meal-plans/:id/reviews` gọi AI thật trả nhận xét + gợi ý, lưu vào DB; `PUT` sửa plan tự tạo thành công.
  - **UI dinh dưỡng**: nhập tay “Phở bò” 450 kcal → tổng ngày 450/1.900 kcal; tạo plan 7 ngày bằng editor + chép ngày, lưu và áp dụng; mở lại “Sửa plan”, lưu thay đổi; modal đánh giá tuần hiển thị điểm, bảng ngày và nút nhận xét AI — không lỗi console.
  - **Human Atlas 3D**: `/muscles` tải `atlas.json` + 15 chunk gzip theo hệ cơ quan (~32 MB), mở đầu chỉ tải hệ cơ + xương (~15 MB); search 3.432 cấu trúc, chọn “biceps brachii” hiện metadata “Cơ nhị đầu cánh tay” + 4 bài tập; isolate, tách 0–100%, bật/tắt hệ, fullscreen, light/dark; chat nằm dưới mô hình; không lỗi console.
  - **Chat cơ bắp**: hỏi nhị đầu set/tuần → AI trả lời 11s, nêu 12–16 set, tần suất 2 lần/tuần, RIR 1–3, trích E1/E2/E4/E5, quota `muscle` tăng 1.
  - **AI thể trạng**: ảnh silhouette → từ chối đánh giá hình thể, chỉ đưa khoảng 14-19% dựa trên số liệu tự báo + caveat; đúng hành vi an toàn.
  - **AI plan**: 53s, 4 ngày, 26 bài, rationale + evidence `[E1][E2][E4][E5][E6][E8]`; **chấm điểm**: 30s, 96/A+, 5 đề xuất, trích dẫn `[E1][E5][E6][E8]`.
  - **Tự tạo giáo án**: form trống → popup 110 bài, tab nhóm cơ, tìm “squat” còn 8 bài → chọn Goblet squat → lưu 201; xóa sạch sau kiểm thử.
  - Production: chạy `SERVE_CLIENT=true` trên cổng 4100 → `/` trả HTML có manifest và asset, `/api/health` OK.

## Giới hạn đã biết

- **PDF scan không có OCR**: file không có lớp text trả lỗi rõ ràng, cần bản PDF có text hoặc dán nội dung.
- PDF được **trích text** (không gửi nguyên file cho model như phương án Anthropic trong plan gốc), nên bảng/hình phức tạp có thể mất cấu trúc.
- Chưa có test API tự động (supertest); E2E hiện chạy tay.
- Docker Compose đã chạy thử trên Windows 11 + Docker Desktop (WSL2). Dữ liệu Mongo trong Docker là volume riêng, không tự đồng bộ với MongoDB local — xem mục Docker để migrate.
- Job tóm tắt vẫn chạy trong RAM của process, chưa có queue phân tán. Khi restart, tối đa 5 job đang `processing` được resume tuần tự; job vượt giới hạn hoặc thiếu nguồn bị đánh dấu `failed` và có nút "Thử lại". Nếu chạy nhiều instance cần queue thật (BullMQ/Agenda) để tránh resume trùng.
- Ảnh tiến độ và PDF có thể lưu trên đĩa (`STORAGE_DRIVER=disk`) hoặc trong MongoDB GridFS (`STORAGE_DRIVER=mongo`). Bản deploy Render free dùng GridFS nên ảnh không mất khi restart; quota Atlas free là 512 MB.
- PWA đã test manifest/SW/asset và build production; cài trên điện thoại cần HTTPS (Render đã có sẵn).
- Apply-to-plan có thể trả về 0 thay đổi — hành vi an toàn khi bằng chứng yếu.
- Chat dùng đoạn ngữ cảnh chọn theo mục (không phải embedding/RAG đầy đủ); với bài rất dài vẫn có thể bỏ sót chi tiết nhỏ ngoài các đoạn được chọn.
- **Đánh giá thể trạng/ảnh và calo từ ảnh là ước lượng**, sai số lớn, không phải chẩn đoán y tế hay phép đo dinh dưỡng chính xác. Chất lượng phụ thuộc ánh sáng, góc chụp, khẩu phần và món hỗn hợp.
- **Đánh giá tuần chỉ đúng khi log đủ bữa**: ngày không có bữa nào bị tính là chưa log (0 điểm coverage), dù thực tế có thể bạn đã ăn. Điểm bám plan là công thức nội bộ, không phải thang đo lâm sàng.
- **Plan tự tạo** lấy mục tiêu calo/macro bằng trung bình 7 ngày của chính thực đơn bạn nhập, không tự tính lại TDEE; nếu muốn mục tiêu theo TDEE, dùng plan AI hoặc chỉnh thực đơn cho khớp.
- AI nhận xét tuần có thể fallback sang quy tắc nếu model trả JSON lỗi; UI ghi rõ nguồn “AI nhận xét” hay “Nhận xét theo quy tắc”.
- **Mô hình 3D nặng ~32 MB** (15 chunk gzip): mở trang chỉ tải hệ cơ + xương (~15 MB), các hệ khác tải khi bật; vẫn nên dùng CDN/S3 nếu lượng truy cập lớn.
- BodyParts3D chỉ có **một mô hình nam trưởng thành**, không đại diện cho nữ, trẻ em hoặc biến thể giải phẫu; đây là mô hình học tập, không dùng để chẩn đoán.
- **Chat cơ bắp** chỉ trả lời trong phạm vi giải phẫu/tập luyện của cơ đang chọn; không thay thế bác sĩ/chuyên gia, và có thể từ chối câu hỏi ngoài phạm vi.
- **Human Atlas** hiển thị tên cấu trúc theo nguồn tiếng Anh; metadata PT Brain chỉ phủ 59 cơ đã biên soạn, các cấu trúc khác dùng mô tả cấp hệ cơ quan.
- Evidence base gồm 10 nguồn chọn lọc, không phải tổng quan toàn bộ tài liệu; điểm plan là công thức nội bộ, AI chỉ giải thích/đề xuất.
- AI plan có thể trả về fallback theo quy tắc nếu model không trả JSON hợp lệ; UI hiển thị rõ nguồn.
- Ảnh thể trạng/bữa ăn dùng chung cơ chế lưu trữ với ảnh tiến độ (đĩa hoặc GridFS); production Render dùng GridFS.
- Chưa có xác thực ảnh y tế/chuyên gia; không dùng cho người có bệnh lý hoặc rối loạn ăn uống.
- **Giáo trình PT Academy hoàn tất 73 bài / 6 module** (outline gốc + các đợt bổ sung anatomy/rehab/case + deep-dive volume/plateau; mỗi bài có quiz, nguồn và box áp dụng).
- Nội dung giáo trình biên soạn từ nguồn uy tín (mỗi bài ≥ 1 nguồn kèm license, liệt kê cuối bài); giáo dục cho PT, không thay thế chứng chỉ hành nghề — disclaimer hiển thị ngay trong trang giáo trình.

## Bảo mật & bản quyền

- JWT trong cookie `httpOnly`, refresh token lưu hash, xoay vòng; mọi query lọc `userId`.
- API key AI chỉ ở backend; log không ghi header/cookie.
- Toàn văn chỉ lưu khi là **open access** hoặc **PDF người dùng tự tải**; bài paywall/abstract-only bị từ chối, không tạo Summary và không lưu nguyên văn.
- Không tích hợp Sci-Hub hoặc mirror: chỉ dùng Europe PMC/PMC, OpenAlex, Unpaywall, Semantic Scholar, preprint/repository, thư viện và bản PDF người dùng có quyền.
- Chỉ số và gợi ý mang tính ước lượng, không thay thế bác sĩ/chuyên gia dinh dưỡng. Bản tóm tắt AI có thể sai — cần đối chiếu bài gốc với kết luận quan trọng.

### Mô hình cơ bắp 3D
- Hình học: **BodyParts3D 4.0**, © The Database Center for Life Science, giấy phép **CC BY 4.0** — được phép dùng thương mại nhưng phải ghi công; attribution hiển thị ngay dưới mô hình và trong README.
- Viewer: **Three.js** (MIT), port từ kiến trúc Human Atlas; geometry được repack thành 15 chunk gzip theo hệ cơ quan để lazy-load.
- `client/public/models/human-atlas/` chứa `atlas.json` + 15 file `.bin.gz` (~32 MB); khi phát hành lại sản phẩm cần giữ attribution BodyParts3D/DBCLS.
- Metadata 59 cơ PT Brain được nối với concept Human Atlas qua **FMA ID**; 5 cơ không có hình học trong nguồn BodyParts3D 4.0: latissimus dorsi, multifidus, internal oblique, rectus abdominis, transversus abdominis.
- Nội dung mô tả cơ (tên Việt, chức năng, bài tập) do dự án biên soạn cho mục đích giáo dục, không phải mô tả lâm sàng đầy đủ.

