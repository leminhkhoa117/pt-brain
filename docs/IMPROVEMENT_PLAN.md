# PT Brain — Kế hoạch cải thiện

> Ngày audit: 2026-11-11 · Phạm vi: `pt-brain/` (React + Express + MongoDB)  
> Công cụ: graphify (`.opencode/skills/graphify`, `graphify-out/`), đọc source, `npm test`, `npm run lint`, `npm run build`, `npm audit`.

## 1. Tình trạng hiện tại

| Hạng mục | Kết quả |
| --- | --- |
| Test | **185/185 pass** (22 file, Vitest; đã có API integration với MongoDB thật) |
| ESLint | 0 lỗi |
| Production build | Thành công; entry chính giảm từ ~786 KB xuống ~94 KB sau khi lazy-load route |
| Bảo mật dependency | 1 high (`zod < 4.6.6`), 2 moderate (`react-router < 7.18.5`) — cần lộ trình nâng cấp |
| Kiến trúc | Không có import cycle; 1.450 node, 62 community trong graphify |
| Điểm yếu lớn nhất | Thiếu test API/E2E, job nền chạy trong RAM, file upload lưu đĩa local, một số luồng chưa có khóa chống chạy trùng |

## 2. Đã sửa trong đợt audit này

Các lỗi dưới đây đã được fix trực tiếp, có test hoặc kiểm tra build/lint đi kèm.

| # | Lỗi | File | Cách xử lý |
| --- | --- | --- | --- |
| 1 | Xóa tài khoản không xóa ảnh tiến độ, ảnh bữa ăn, ảnh thể trạng và PDF gốc trên đĩa — rò rỉ dữ liệu riêng tư | `server/src/services/authService.js`, `server/src/services/userFiles.js` | Thu thập tên file/hash trước khi xóa document; xóa file sau khi xóa DB; PDF chỉ xóa khi không còn Summary nào khác tham chiếu hash |
| 2 | Xóa Paper không xóa PDF gốc đã lưu | `server/src/controllers/paperController.js` | Gom `pdfHash` của các Summary liên quan và gọi `removeOrphanPdfs()` |
| 3 | Thư viện báo sai tổng số bài/đã ghim khi có >100 bản ghi | `server/src/controllers/summaryController.js` | Dùng `countDocuments` song song thay vì đếm mảng bị giới hạn 100 |
| 4 | Biểu đồ progression lấy 200 buổi **cũ nhất** khi lịch sử dài | `server/src/services/training/workoutService.js` | Sort giảm dần, limit 200, rồi `reverse()` để trả về 200 buổi mới nhất theo thứ tự thời gian |
| 5 | Gợi ý giáo án bỏ qua dụng cụ người dùng chọn (fallback sang barbell/machine) | `server/src/services/training/programService.js` | Không fallback ngoài danh sách dụng cụ; slot không có bài phù hợp sẽ bỏ trống |
| 6 | Bài bodyweight đạt rep vẫn bị gợi ý tăng 2,5 kg | `shared/training/planner.js` | Trả `action: add_reps`, gợi ý thêm rep/biến thể khó hơn thay vì tăng tạ |
| 7 | `programs/:id/evaluate` và `suggest-ai` không có rate limit burst | `server/src/routes/programs.js` | Thêm `aiLimiter` cho cả hai endpoint |
| 8 | Lỗi 500 trả message nội bộ (đường dẫn file, lỗi Mongo…) ra client | `server/src/middleware/errorHandler.js` | Chỉ giữ message nghiệp vụ của `ApiError`; lỗi không xác định trả thông báo chung, log đầy đủ ở server |
| 9 | `body-assessments/:id/photos/:filename` thiếu kiểm tra tên file | `server/src/controllers/bodyAssessmentController.js` | Validate regex + kiểm tra quyền sở hữu trước khi `sendFile` |
| 10 | Ngày sinh tương lai/quá nhỏ được chấp nhận, sau đó làm hỏng luồng tính BMR/BodyLog | `server/src/validation/auth.js`, `client/src/lib/schemas.js`, `server/src/services/metricsService.js` | Validate tuổi 14–100 ở cả client/server; bọc tính BMR/TDEE trong try/catch để không chặn lưu cân nặng |
| 11 | Tải nguồn ngoài (PDF/HTML) đọc toàn bộ body vào RAM trước khi kiểm tra dung lượng | `server/src/utils/http.js` | Đọc stream có giới hạn, dừng ngay khi vượt `maxBytes`; thêm giới hạn 2 MB cho `fetchJson`; chặn thêm IPv6 NAT64/6to4 và URL có userinfo |
| 12 | Trang Dashboard tải luôn Three.js/Recharts/Markdown của mọi trang | `client/src/App.jsx` | `React.lazy()` theo route + Suspense; entry chính giảm ~88% |
| 13 | Tỉ lệ upper/lower bị méo vì core/calves bị tính là “lower” | `server/src/services/training/programMetrics.js` | Chỉ tính `quads/hamstrings/glutes/calves` vào lower; core không kéo lệch điểm cân bằng |
| 14 | Tài liệu ghi sai số test (147/155) | `README.md` | Cập nhật số test thực tế |
| 15 | Không có test API tự động | `server/tests/api.test.js` | Thêm 11 test integration bằng supertest + MongoDB thật: health, auth, refresh, AI usage, metrics, workout bodyweight, query validation, program equipment, thư viện >100 bản ghi, tag, xóa tài khoản dọn file, khóa job atomic |
| 16 | Restart giữa job làm mất job tóm tắt | `server/src/services/research/reader.js`, `server/src/index.js` | Tự resume tối đa 5 job `processing` từ `sourceText`; job thiếu nguồn/vượt giới hạn đánh dấu failed; khóa TTL theo `(userId, cacheKey)` chống trùng |
| 17 | Health check không phản ánh Mongo; CI chưa có | `server/src/routes/index.js`, `.github/workflows/ci.yml` | `/api/health` ping Mongo và trả 503 khi DB chết; thêm GitHub Actions lint/test/build/audit + Dependabot |
| 18 | Thư viện tìm kiếm/lọc trên client nên chỉ thấy 100 bản ghi đầu | `server/src/controllers/summaryController.js`, `client/src/pages/LibraryPage.jsx` | Server-side search theo title/DOI/tldr/tag, filter favorite/tag, `limit`/`offset` + `page.hasMore`; UI dùng `useDeferredValue` + `useInfiniteQuery` với nút “Tải thêm” |
| 19 | Đổi tài khoản/phiên hết hạn vẫn giữ cache React Query của user trước | `client/src/api/client.js`, `client/src/hooks/useAuth.jsx` | Dispatch `pt-auth-expired`, clear toàn bộ query cache khi login/logout/xóa tài khoản để tránh lộ dữ liệu trên thiết bị dùng chung |
| 20 | Docker build dùng `npm install`, thiếu healthcheck và `.dockerignore` | `server/Dockerfile`, `client/Dockerfile`, `docker-compose.yml`, `.dockerignore` | Chuyển `npm ci`, healthcheck gọi `/api/health`, loại node_modules/uploads khỏi build context |
| 21 | Chat bài dài bỏ qua câu hỏi khi chọn ngữ cảnh | `server/src/services/ai/retrieval.js` | Chấm điểm chunk theo từ khóa + số liệu trong câu hỏi, cộng ưu tiên Results/Discussion, vẫn giữ mẫu đều toàn bài; thêm test |
| 22 | Thư viện chỉ tải 100 kết quả, không xem tiếp được | `client/src/pages/LibraryPage.jsx` | `useInfiniteQuery` + nút “Tải thêm” 40 kết quả/trang, giữ search/filter server-side |
| 23 | Người dùng không thấy đã dùng bao nhiêu lượt/chi phí AI | `server/src/controllers/meController.js`, `client/src/pages/Settings.jsx` | Thêm `GET /me/ai-usage`; card trong Cài đặt hiển thị từng loại, token và cost hôm nay |
| 24 | UI thư viện chỉ hiển thị tag, không thêm/xóa được dù API đã hỗ trợ | `client/src/pages/LibraryPage.jsx` | Thêm nút “+ tag”, bấm tag để xóa; nối vào `PATCH /summaries/:id`, có test API |
| 25 | CSP của helmet chặn inline script khởi tạo dark mode | `client/index.html`, `client/public/theme-init.js`, `client/public/sw.js` | Chuyển sang script ngoài, thêm vào app shell và bump cache PWA |
| 26 | Search thư viện hiển thị sai/không cập nhật do `keepPreviousData` với `useInfiniteQuery` | `client/src/pages/LibraryPage.jsx` | Bỏ placeholder data; query mới thay toàn bộ pages, đã test tìm “Bài 44” trả đúng 1 kết quả |
| 27 | Không log được set bodyweight vì client bắt buộc `weightKg > 0` | `client/src/pages/training/WorkoutPage.jsx`, `server/src/services/training/workoutService.js` | Gắn `equipment` vào suggestions, cho phép tạ trống/0 với bài bodyweight, thêm gợi ý UI và API test |
| 28 | Giáo án bodyweight-only bị trống slot nhưng không giải thích | `server/src/services/training/programService.js`, `server/src/services/ai/planCoach.js` | Trả `missingSlots`, cảnh báo rõ trong preview/cautions |
| 29 | Chuỗi giả định bữa ăn bị lặp dấu chấm | `client/src/pages/NutritionPage.jsx` | Bỏ dấu chấm thừa trong JSX |
| 30 | Chưa log được cardio ngoài gym, chưa theo dõi calo vận động và chưa đưa cardio vào giáo án | `shared/training/cardio.js`, `server/src/models/WorkoutSession.js`, `server/src/models/Program.js`, `client/src/pages/training/*` | Thêm log cardio (chạy/bơi/đạp xe...), ước tính MET + pace, cho nhập calo thủ công, tổng calo trong lịch sử, cardio trong editor giáo án và log nhanh từ plan |
| 31 | Tài khoản mới vào thẳng dashboard, không có trang giới thiệu/hướng dẫn | `client/src/pages/Welcome.jsx`, `server/src/models/User.js`, `server/src/routes/me.js`, `client/src/App.jsx`, `client/src/components/Layout.jsx` | Thêm `/welcome` với 3 section, minh hoạ SVG + mũi tên; tài khoản mới bị redirect vào welcome đến khi bấm “Bắt đầu theo dõi”; tài khoản cũ vào thẳng dashboard và vẫn có link “Giới thiệu” trên nav |
| 32 | Toàn bộ xác nhận/nhập liệu dùng `window.confirm/prompt` native, lệch giao diện | `client/src/components/DialogProvider.jsx` + 10 file gọi | Thêm `useDialog()` với confirm/prompt/alert dạng modal; hỗ trợ Esc/Hủy, focus input, nút nguy hiểm đỏ; thay toàn bộ lời gọi native |
| 33 | Chat bài báo trả lời một cục, bố cục Reader đặt chat dưới bài gốc | `server/src/services/ai/client.js`, `paperSummarizer.js`, `server/src/controllers/summaryController.js`, `client/src/api/summaries.js`, `AskPanel.jsx`, `ReaderPage.jsx` | Thêm SSE stream (`ask/stream`) + `chatCompletionStream`; chat hiển thị dần; đổi layout thành tóm tắt + chat song song trên, bài gốc/dịch/ghi chú dưới |

### Kiểm chứng sau khi sửa

```bash
npm run test     # 185/185 pass
npm run lint     # 0 lỗi
npm run build    # thành công, entry ~94 KB
```

> Test API dùng MongoDB local (`mongodb://127.0.0.1:27017`) và tạo database tạm theo PID/timestamp, tự drop sau khi chạy. CI cần service MongoDB hoặc `mongodb-memory-server`.
>
> Đã test trực tiếp giao diện production trên Chrome desktop + mobile 390×844. Chi tiết luồng test, lỗi phát hiện và cách sửa: [`docs/UI_TEST_REPORT.md`](UI_TEST_REPORT.md).

## 3. Lỗi và rủi ro còn tồn đọng

### P0 — Nên xử lý trong 1–2 tuần

| ID | Vấn đề | Ảnh hưởng | Hướng xử lý | Ước lượng |
| --- | --- | --- | --- | --- |
| P0-1 | E2E vẫn chạy tay; API test mới phủ auth/metrics/program/library/xóa tài khoản, chưa phủ AI/job nền | Regression ở job tóm tắt, upload, quota AI khó bắt | Bổ sung Playwright smoke test + test job nền với queue giả; thêm test upload/meal plan | 3–5 ngày |
| P0-2 | Job tóm tắt chạy trong RAM; đã resume tối đa 5 job khi restart nhưng chưa có queue phân tán/backoff | Nếu chạy nhiều instance vẫn có thể resume trùng; job vượt giới hạn phải bấm “Thử lại” | Hàng đợi bền (BullMQ + Redis hoặc Agenda + Mongo), job idempotent, lưu `jobId`, retry có backoff | 3–4 ngày |
| P0-4 | Ảnh/PDF lưu đĩa local; Render free mất file sau redeploy | Mất ảnh tiến độ, ảnh bữa ăn, PDF gốc | Chuyển sang S3/Cloudinary/R2; giữ interface `saveImageFile` để đổi backend; presigned URL hoặc route auth | 2–3 ngày |
| P0-5 | `zod 3.25.76` có lỗ hổng memory exhaustion; `react-router 6` có open-redirect | Rủi ro bảo mật / lỗi hiếm | Lên kế hoạch nâng zod 4 và react-router 7; chạy codemod, test toàn bộ schema/routing; tạm thời giữ giới hạn body 2 MB và validate chặt | 3–5 ngày |
| P0-6 | Rate limit lưu trong RAM, không chia sẻ giữa nhiều instance | Scale ngang sẽ vượt quota/rate limit | Dùng Redis store (`rate-limit-redis`) khi có nhiều instance | 1 ngày |

### P1 — Nên xử lý trong 1–2 tháng

| ID | Vấn đề | Hướng xử lý |
| --- | --- | --- |
| P1-1 | Đã có search/filter server-side + infinite query (“Tải thêm” 40 kết quả/trang); còn dùng offset nên có thể trùng/sót nếu dữ liệu thay đổi giữa các trang | Chuyển sang cursor pagination (createdAt + _id) và cân nhắc Atlas Search/vector index khi dữ liệu lớn |
| P1-2 | Chưa có OCR PDF scan | Tích hợp OCR (Tesseract/pdfjs + OCRmyPDF) hoặc hướng dẫn người dùng upload bản có text; báo lỗi rõ như hiện tại |
| P1-3 | Chọn ngữ cảnh đã ưu tiên từ khóa/số liệu trong câu hỏi (lexical), nhưng chưa có embedding/RAG thật | Chunk + embedding (Mongo Atlas Vector Search hoặc pgvector/Qdrant); retrieve top-k theo câu hỏi; giữ trích dẫn số liệu |
| P1-4 | Chưa có refresh token rotation test và session list | Test rotate/reuse detection; thêm “đăng xuất mọi thiết bị”, lưu `sessionId`, thiết bị/UA |
| P1-5 | PWA cache-first cho asset, cache version cố định, không dọn cache cũ | Dùng Workbox, `revision` theo build, chiến lược `stale-while-revalidate` cho asset có hash; test offline trên điện thoại thật |
| P1-6 | Đã có GitHub Actions lint/test/build/audit + build Docker image + Dependabot; chưa có E2E Playwright | Thêm smoke test Playwright cho login → dashboard → tạo giáo án/meal plan |
| P1-7 | `/api/health` đã ping Mongo và có `/api/health/live`; còn thiếu version/git SHA, kiểm tra AI và alerting khi 503 | Thêm version/build SHA, metric uptime, cảnh báo khi health fail |
| P1-8 | Thiếu validation query ở một số endpoint (`/meals?date`, `/workouts?from/to`) | Dùng zod `validateQuery`; trả 400 thay vì im lặng trả rỗng |
| P1-9 | AI plan/meal plan có thể fallback khi lỗi cấu hình, UI đôi khi khó phân biệt | Chuẩn hóa `source: ai/fallback`, hiển thị badge rõ; log lý do fallback có mã lỗi |
| P1-10 | Đã hiển thị lượt dùng/token/chi phí AI theo ngày trong Cài đặt; chưa có cảnh báo >80% quota và breakdown theo model | Thêm cảnh báo quota, biểu đồ 7 ngày, log `usage` theo model |
| P1-11 | SSRF còn khe DNS rebinding giữa lúc `dns.lookup` và lúc `fetch` | Pin IP bằng undici `Agent`/custom `lookup`, hoặc dùng thư viện SSRF; giữ kiểm tra ở từng redirect |
| P1-12 | Nội dung paper/abstract có thể chứa prompt injection | Tách rõ vùng “dữ liệu không tin cậy” trong prompt, thêm kiểm tra output (không làm theo chỉ dẫn trong bài), test adversarial |

### P2 — Cải thiện trải nghiệm và chất lượng

- **Tìm kiếm nghiên cứu**: lưu lịch sử server-side thay vì `localStorage`, đồng bộ giữa thiết bị; thêm “bộ lọc đã lưu”.
- **Giáo án**: lịch tuần/tháng, kéo-thả ngày tập, lịch sử phiên bản giáo án, so sánh trước/sau khi AI sửa.
- **Buổi tập**: chế độ offline/PWA, nhập nhanh set trước đó, rest timer, ghi chú kỹ thuật, đính kèm video.
- **Dinh dưỡng**: barcode scanner, cơ sở dữ liệu món Việt, khẩu phần quen thuộc (bát/tách), mục tiêu nước.
- **Human Atlas**: lazy-load theo hệ cơ quan (đã có), thêm quiz giải phẫu, deep-link `?muscle=biceps-brachii`, chế độ so sánh trái/phải.
- **Học tập**: spaced repetition thông báo đẩy, import/export Anki, quiz từ note.
- **Dashboard**: widget “việc hôm nay”, streak, cảnh báo quên log, tóm tắt tuần bằng email.
- **Accessibility**: audit WCAG AA, focus ring, keyboard cho atlas/modal, `aria-live` cho trạng thái job.
- **i18n**: tách chuỗi UI, chuẩn bị tiếng Anh nếu mở rộng.

## 4. Ý tưởng tạo khác biệt

1. **Trợ lý “hôm nay tập gì?”** — kết hợp giáo án, buổi tập gần nhất, đau/chấn thương và thời gian còn lại để đề xuất buổi tập 20–45 phút, có nút “bắt đầu log”.
2. **So sánh bằng chứng theo chủ đề** — thay vì chỉ tóm tắt từng bài, cho phép chọn 3–10 bài và tạo bảng so sánh thiết kế/cỡ mẫu/kết quả/mâu thuẫn.
3. **Audit giáo án bằng ảnh video** — người dùng upload video set, AI/pose estimation đếm rep, kiểm tra biên độ và cảnh báo form (ghi rõ là ước lượng).
4. **Coach mode** — PT tạo “client”, giao giáo án, xem tuân thủ và báo cáo; đây là hướng thương mại rõ ràng (model `Client` cũ đã bị xóa, có thể thiết kế lại).
5. **Bản đồ tiến bộ theo cơ** — ghép volume, 1RM, ảnh tiến độ và atlas 3D để thấy nhóm cơ nào đang được tập nhiều/ít.
6. **Chế độ “bằng chứng yếu”** — với bài abstract-only hoặc AI confidence thấp, hiển thị banner và chặn “áp dụng vào giáo án” nếu không có toàn văn.
7. **Chia sẻ báo cáo** — xuất PDF/HTML có watermark, link chia sẻ có thời hạn cho khách hàng.
8. **Mẫu giáo án cộng đồng** — thư viện template công khai, sao chép vào tài khoản, đánh giá.

## 5. Lộ trình đề xuất

### Tuần 1–2 (ổn định)
- P0-1 test API + smoke E2E.
- P0-3 khóa job trùng.
- P1-6 CI GitHub Actions.
- P1-7 health check Mongo.
- Sửa các validation query P1-8.

### Tuần 3–6 (độ bền & dữ liệu)
- P0-2 job queue bền.
- P0-4 object storage.
- P0-5 nâng cấp zod/react-router.
- P0-6 Redis rate limit khi scale.
- P1-1 phân trang/tìm kiếm thư viện.

### Tháng 2–3 (sản phẩm)
- P1-3 RAG cho chat bài báo.
- P1-4 quản lý phiên.
- P1-5 PWA/offline.
- Một trong các ý tưởng mục 4 (ưu tiên “hôm nay tập gì?” hoặc coach mode).

## 6. Tiêu chí nghiệm thu

- CI xanh trên mọi PR: lint + 100% unit test + API test + build.
- Không còn file upload mồ côi sau khi xóa user/paper/summary (có test).
- Tạo cùng DOI 2 lần đồng thời chỉ tạo 1 job và trừ 1 quota.
- Restart server giữa job: job tự resume hoặc fail có kiểm soát, không kẹt `processing`.
- Trang Dashboard LCP < 2,5 s trên 4G; không tải Three.js khi vào Dashboard.
- `npm audit --omit=dev` = 0 high/critical.
- Mọi endpoint AI có rate limit + quota + log chi phí.

## 7. Rủi ro cần theo dõi

- Nâng zod 4 / react-router 7 là breaking change; cần làm trên branch riêng, có test.
- Object storage và queue làm tăng độ phức tạp vận hành; nên giữ fallback local cho dev.
- AI quota/chi phí có thể tăng khi thêm RAG; cần đo trước/sau.
- Nội dung y tế: mọi tính năng mới phải giữ disclaimer và không thay thế bác sĩ/chuyên gia.
- Dữ liệu sức khỏe là dữ liệu nhạy cảm: cần chính sách xóa, export, log truy cập.
