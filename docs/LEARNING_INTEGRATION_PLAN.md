# PT Brain — Plan: gắn Học tập vào toàn bộ vòng lặp sử dụng app

> Trạng thái: **đã triển khai Phase 0–4 + Phase 5 (test/QA), đang tiếp tục thu thập phản hồi**.  
> Ngày: 21/11/2026.  
> Vấn đề người dùng nêu: app và phần học đang tách rời; học xong không thấy liên kết với việc lập giáo án, ăn uống, theo dõi cơ thể hay tra cứu 3D.

---

## 1. Hiện trạng — vì sao vẫn thấy tách rời

Đã có nhiều “mảnh” nhưng liên kết chỉ đi **một chiều** và dừng ở mức “mở sang trang khác”:

| Mảnh hiện có | Thực tế | Khoảng trống |
| --- | --- | --- |
| 71 bài giáo trình (`shared/curriculum/lessons`) | Có `related.muscles/exercises/calculators/conditions` | Chỉ bài học → app; không có app → bài học |
| `LessonPage` `RelatedRow` | Link cơ 3D, mở thư viện bài tập, mở máy tính, tooltip bệnh nền | Bài tập link chung chung, không mở đúng bài; điều kiện chỉ là tooltip |
| `Dashboard` | Card “Tiếp tục học” | Không cá nhân hóa theo buổi tập/cân nặng/mục tiêu gần đây |
| `/learn` | 5 tab: Giáo trình, Từ điển, Flashcard, Quiz, Sổ tay | Không có “học theo ngữ cảnh” hay “việc học hôm nay” |
| Quiz AI | Chỉ sinh từ bài nghiên cứu đã tóm tắt | Không nối với bài giáo trình, lỗi sai, hay dữ liệu tập luyện |
| Flashcard SM-2 | Người dùng tự tạo | Không tự đề xuất từ bài đã học / lỗi quiz / thuật ngữ cơ |
| Human Atlas 3D | Có metadata cơ, xương, mô liên kết + chat AI | Không có “học sâu hơn” hay quiz theo cấu trúc đang chọn |
| Training / Nutrition / Body / Calculators / Research | Có dữ liệu và hành động thật | Không hiện bài học đúng lúc, không quay lại kiểm chứng sau khi áp dụng |
| `CurriculumProgress` | `reading/completed`, `quizBest`, `quizAttempts` | Không có mastery, hành động đã áp dụng, ngữ cảnh phát sinh |

**Kết luận:** thiếu 3 thứ:
1. **App → học**: tại điểm ra quyết định (lập giáo án, ăn, log tập, xem 3D) không có gợi ý bài học đúng ngữ cảnh.
2. **Học → làm**: bài học không có hành động áp dụng thật (prefill dữ liệu, mở đúng công cụ).
3. **Vòng quay lại**: sau khi áp dụng không có phản hồi “bạn đã áp dụng bài nào, kết quả ra sao”.

---

## 2. Nguyên tắc thiết kế

1. **Học tại điểm cần** (learning at point of need): 1 thẻ nhỏ, không chặn workflow; mở drawer 3 phút, có link bài đầy đủ.
2. **Một hành động, không mười lời khuyên**: mỗi bài có đúng 1 CTA áp dụng chính (mở calculator, tạo giáo án, log cân nặng, tạo flashcard…).
3. **Đóng vòng lặp**: `Học → Áp dụng → Đo lại → Ôn tập`; lưu “applied action” để dashboard tuần sau hiển thị.
4. **Cá nhân hóa bằng dữ liệu có sẵn**: mục tiêu, kinh nghiệm, bệnh nền, nhóm cơ đang xem, bài tập gần nhất, kết quả quiz.
5. **Không spam**: tối đa 1 gợi ý học/surface/lần; dismiss 7 ngày; ưu tiên bài chưa đọc.
6. **Không phụ thuộc AI để gợi ý**: recommendation chạy bằng rule + metadata; AI chỉ dùng để giải thích/quiz khi người dùng chủ động.

---

## 3. Kiến trúc đề xuất

### 3.1. Metadata bài học v2

Thêm vào mỗi lesson (có thể generate từ file hiện tại, không sửa tay 71 bài):

```js
// shared/curriculum/lessons/nutr-2-1.js
contexts: [
  { surface: 'nutrition.mealplan', match: { goals: ['cut', 'lean_bulk'] }, weight: 3 },
  { surface: 'training.planner', match: { experience: ['beginner'] }, weight: 2 },
  { surface: 'calculator.macro', weight: 3 },
],
actions: [
  { type: 'open_calculator', key: 'macro', label: 'Tính macro của tôi' },
],
keyTakeaways: [
  '1,6–2,2 g protein/kg/ngày là khoảng hợp lý cho người tập kháng lực.',
  'Chia 3–5 bữa, mỗi bữa 0,3–0,4 g/kg giúp duy trì MPS.',
],
microQuiz: [/* 1–2 câu, dùng lại quiz hiện có */],
concepts: ['protein', 'mps', 'energy-balance'],
```

Bổ sung `related.exercises` phải là **slug bài tập thật** (hiện có vài slug text), validate bằng seed exercise.

### 3.2. Backend

**Model `CurriculumProgress` bổ sung:**
```js
mastery: Number,            // 0–100, cập nhật từ quiz + apply
lastViewedAt: Date,
completedAt: Date,
appliedActions: [{ actionType, context, at, payload }],
dismissedUntil: Date,
```
**Model mới `LearningEvent`** (analytics, TTL 180 ngày):
```js
{ userId, type: 'view' | 'quiz' | 'apply' | 'dismiss' | 'recommend_click',
  lessonSlug, surface, contextKey, metadata, createdAt }
```

**API mới:**
- `GET /api/learning/recommendations?surface=training.planner&context=goal:cut&limit=3`
  - chấm điểm: explicit `contexts` (weight) + cùng nhóm cơ/bệnh nền + chưa đọc + gần đây + độ khớp mục tiêu.
  - trả `{ lesson: {slug,title,minutes,keyTakeaways,action}, reason, mastery, progress }`.
- `GET /api/learning/next` — “học hôm nay” cho Dashboard: 1 bài tiếp tục + 1 micro-lesson theo hoạt động 7 ngày.
- `POST /api/learning/lessons/:slug/apply` — ghi `appliedActions`, +mastery, trả gợi ý bước tiếp.
- `GET /api/learning/map` — graph `lesson ↔ muscle ↔ exercise ↔ calculator ↔ condition` (dùng cho tìm kiếm/command palette).
- `POST /api/learning/events` — batch event (optional, có thể gọi trong `apply`/`view`).
- `GET /api/curriculum/lessons/:slug?context=...` — trả kèm `appliedActions`, `recommendedNext`.

**Tận dụng `lessonCoach` sẵn có** cho chat theo bài; thêm `context` (surface + selected structure) vào prompt.

### 3.3. Frontend dùng chung

Tạo `client/src/learning/`:
- `useLearningRecommendations({surface, context})` — React Query, stale 5 phút.
- `<ContextLessonCard surface context />` — thẻ 1 dòng + nút “Học 3 phút” / “Bỏ qua”.
- `<LessonDrawer slug from returnTo />` — đọc nhanh `keyTakeaways`, microQuiz, CTA áp dụng; không rời trang.
- `<ApplyActionButton action lesson />` — mở đúng công cụ với prefill; ghi `apply`.
- `<MasteryRing value />`, `<NextLessonCard />`.
- `learningLinks.js` — hàm map context → query string an toàn, allowlist `returnTo` (chặn open redirect).

### 3.4. Tích hợp từng surface

| Surface / file | Kích hoạt | Bài gợi ý | Hành động quay lại |
| --- | --- | --- | --- |
| **Dashboard** (`Dashboard.jsx`) | Mục tiêu, bệnh nền, hoạt động 7 ngày | “Học hôm nay” 1 bài + “Tiếp tục” | Áp dụng ngay (log cân nặng / mở giáo án) |
| **Training Planner** (`PlannerPage.jsx`, `AiPlanModal.jsx`) | Trước khi tạo giáo án; sau khi có split/volume | volume/RIR, split, an toàn theo bệnh nền | “Áp dụng vào giáo án” prefill số set/RIR |
| **Workout Log** (`WorkoutPage.jsx`) | Chọn bài có deadlift/squat/overhead; buổi tập xong | hinge/cột sống, vai, kỹ thuật | Ghi cue vào note buổi tập; mở bài đúng cơ |
| **Nutrition** (`NutritionPage.jsx`, meal plan) | Tạo meal plan / xem macro | năng lượng, protein, nước | Mở calculator với số liệu đã nhập |
| **Body Assessment** (`BodyAssessmentPage.jsx`) | Có kết quả % mỡ/ảnh | đo lường, thành phần cơ thể | Log lại cân nặng/số đo |
| **Human Atlas 3D** (`HumanAtlasExplorer.jsx`, `MusclePage.jsx`) | Chọn cơ/xương/mô liên kết | bài giải phẫu đúng nhóm/cấu trúc | Tạo flashcard từ thuật ngữ; quiz 3 câu |
| **Calculators** (`Calculators.jsx`) | Xem kết quả 1RM/TDEE/macro | công thức & giả định | “Giải thích kết quả” mở drawer |
| **Research Reader** (`ReaderPage.jsx`) | Tóm tắt xong | bài nền tảng cùng chủ đề | Tạo flashcard/quiz từ bài + lesson |
| **Learn home** (`CurriculumPage.jsx`) | Mở trang | “Lộ trình của tôi” theo mục tiêu/bệnh nền/lịch sử | “Ôn tập hôm nay” (SM-2 + câu sai) |
| **Global search / command palette** | Ctrl/⌘+K | Tìm bài, cơ, bài tập, calculator, điều kiện | Mở đúng ngữ cảnh |

### 3.5. Cơ chế đóng vòng lặp

1. **Sau bài học**: 1 CTA áp dụng; bấm → mở công cụ với prefill; khi hoàn tất → toast “Đã áp dụng bài X” + `mastery +10`.
2. **Sau hành động app**: toast nhỏ “Buổi tập này dùng hinge — ôn 3 phút?” (chỉ 1 lần/ngày).
3. **Quiz sai** → tự tạo flashcard từ thuật ngữ/câu sai, đến hạn SM-2.
4. **Weekly review**: Dashboard card “Tuần này bạn học gì → áp dụng gì → kết quả nào” (dữ liệu từ LearningEvent + progress).
5. **AI**: sau câu trả lời muscle/lesson chat, gợi ý “Học sâu hơn: <lesson>” và “Tạo quiz 3 câu”.

---

## 4. Lộ trình triển khai

| Phase | Nội dung | Thời lượng | Nghiệm thu |
| --- | --- | --- | --- |
| **0 — Chuẩn hóa nội dung** | Script audit 71 bài; thêm `contexts`, `actions`, `keyTakeaways`, `microQuiz`, `concepts`; sửa `related.exercises` thành slug thật; zod schema validate trong CI | 2 ngày | 100% bài pass schema; 0 slug bài tập sai |
| **1 — Backend** | Mở rộng `CurriculumProgress`, `LearningEvent`; recommendation engine rule-based; API `/learning/*`; test unit + API | 3 ngày | 15 test mới; p95 < 150 ms; không tăng AI quota |
| **2 — Shared UI + Learn home** | `ContextLessonCard`, `LessonDrawer`, `ApplyActionButton`, `MasteryRing`; “Lộ trình của tôi” + “Ôn tập hôm nay” | 3 ngày | Drawer mở < 300 ms; mobile 390 px không tràn |
| **3 — Tích hợp 6 surface** | Dashboard, Training (planner + workout), Nutrition, Body Assessment, Atlas 3D, Calculators | 5 ngày | Mỗi surface có 1 gợi ý đúng ngữ cảnh; dismiss hoạt động |
| **4 — Đóng vòng lặp** | Apply action prefill; quiz sai → flashcard; weekly review; AI gợi ý bài | 3 ngày | ≥ 1 action ghi nhận/bài; weekly review có dữ liệu thật |
| **5 — Đo lường & QA** | Event dashboards, A/B copy, accessibility, Playwright smoke | 2 ngày | Lighthouse a11y ≥ 95; E2E pass |

Tổng: **~18 ngày làm việc** (có thể cắt Phase 4 nếu cần ra bản đầu).

---

## 5. Chỉ số đo thành công

- **Adoption**: ≥ 40% người dùng tuần thấy ít nhất 1 contextual lesson.
- **Conversion**: ≥ 25% lượt xem lesson từ app bấm ít nhất 1 apply action.
- **Learning outcome**: ≥ 30% người mới hoàn thành 3 bài trong 7 ngày; điểm quiz trung bình tăng sau 2 lần làm.
- **Retention**: người có ≥ 1 apply action quay lại tuần sau cao hơn nhóm không có (mục tiêu +10 điểm %).
- **Không làm gián đoạn**: tỉ lệ bỏ dở form ở surface tích hợp tăng < 5%.
- **Chất lượng gợi ý**: tỉ lệ dismiss < 30%; click-through > 8%.

---

## 6. Rủi ro & cách giảm

1. **Metadata lệch nội dung**: schema zod + CI audit + review khi sửa bài.
2. **Gợi ý quá nhiều gây phiền**: cap 1/surface/ngày, dismiss 7 ngày, ưu tiên bài chưa đọc.
3. **Deep-link phức tạp**: chỉ dùng `returnTo` trong allowlist nội bộ; lưu state form vào query hoặc sessionStorage có version.
4. **AI quota/chi phí**: recommendation không dùng AI; AI chỉ khi người dùng bấm “giải thích/quiz”.
5. **Dữ liệu sức khỏe trong learning events**: không gửi lên AI; lưu server-side, TTL 180 ngày; cho phép xóa khi xóa tài khoản.
6. **Nội dung quá dài trong drawer**: chỉ hiển thị `keyTakeaways` + 1 microQuiz; bài đầy đủ mở trang riêng.

---

## 7. Việc làm ngay sau khi duyệt (Phase 0 checklist)

- [x] Tạo `shared/learning/contexts.js` (map surface + muscle group + condition → lesson slug).
- [x] Script `server/scripts/audit-curriculum.mjs`: đọc 71 lesson, in bài thiếu `keyTakeaways`/`actions`, slug exercise sai.
- [x] Chốt copy UI: “Học 3 phút”, “Áp dụng vào…”, “Ôn lại”, “Bỏ qua 7 ngày”.
- [x] Chọn 5 bài flagship để làm mẫu end-to-end: `anat-2-7` (đùi), `phys-6-1` (volume), `nutr-2-1` (protein), `rehab-2-1` (đau lưng), `case-1-1` (quy trình ca).
- [x] Tạo test API recommendation + apply trước khi làm UI.

---

## 8. Đã triển khai (21/11/2026)

- **Phase 0**: `shared/learning/contexts.js` phủ 71 bài; mỗi bài có `contexts`, `actions`, `keyTakeaways`, `microQuiz`, `concepts`; audit script `npm --prefix server run audit:curriculum` báo 0 lỗi; validate trong `validateCurriculumLessons`.
- **Phase 1**: `CurriculumProgress` thêm `mastery`, `lastViewedAt`, `appliedActions`; model `LearningEvent` TTL 180 ngày; service recommendation rule-based; API `/api/learning/recommendations`, `/next`, `/summary`, `/lessons/:slug/apply`, `/dismiss`, `/track`; 9 test integration.
- **Phase 2**: `client/src/learning/*` gồm hooks, `ContextLessonCard`, `LessonDrawer`, `ApplyActionButton`, `MasteryRing`, `LearningTodayCard`; Dashboard có “Học hôm nay”; Giáo trình có “Lộ trình của tôi” + “Ôn tập hôm nay”.
- **Phase 3**: thẻ học theo ngữ cảnh đã gắn vào Dashboard, Giáo án, Log buổi tập, Dinh dưỡng, AI thể trạng, Máy tính, Đọc nghiên cứu và panel 3D.
- **Phase 4**: apply action mở đúng công cụ + ghi mastery/event; quiz < 100% có nút tạo flashcard ôn tập; Dashboard hiển thị bài đã áp dụng trong tuần; 3D detail panel có “Học sâu hơn”.
- **Phase 5**: 327/327 test pass, lint 0 lỗi, build pass, `validate:atlas-anatomy` 0 missing; smoke UI đăng ký → Dashboard card → Learn drawer → apply action → Atlas 3D → các surface card.
- **Còn lại**: event dashboard cho admin, A/B copy, Playwright E2E tự động (hiện smoke bằng browser).

