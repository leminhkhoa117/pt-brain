# Plan: Giáo trình học tập cho PT chuyên nghiệp (PT Academy)

> Trạng thái: **ĐỢT LÊN PLAN — chờ duyệt trước khi thực hiện.**
> Người soạn: agent OpenCode, ngày 19/11/2026.

## 0. Mục tiêu

Xây dựng **giáo trình học tập bài bản** dành cho PT trên PT Brain, phủ 5 mảng kiến thức
nền tảng của nghề:

1. Giải phẫu cơ, xương khớp
2. Dinh dưỡng
3. Sinh lý học vận động & sinh lý học tập luyện
4. Yếu tố thể chất
5. Phục hồi chức năng & an toàn

Yêu cầu: nội dung **chính xác, có nguồn uy tín kiểm chứng được**, viết tiếng Việt (kèm
thuật ngữ tiếng Anh), có **hình ảnh minh hoạ** đúng giấy phép, **tích hợp với tính năng
sẵn có** của app (Flashcard SM-2, Human Atlas 3D, Quiz, Research, Máy tính, Dinh dưỡng,
Health conditions) và **bổ sung tính năng mới** (Giáo trình, theo dõi tiến độ, quiz theo
bài, chat hỏi đáp theo bài).

---

## 1. Hiện trạng phần Học tập (đã khảo sát)

| Có sẵn | Chi tiết | Hạn chế |
| --- | --- | --- |
| `/learn` — 4 tab | Từ điển cá nhân, Flashcard SM-2, Quiz AI, Sổ tay | Toàn bộ là nội dung **người dùng tự tạo**; không có giáo trình nền tảng nào |
| Quiz AI | Sinh 5 câu từ bài nghiên cứu đã tóm tắt | Chỉ hoạt động trên summary; tốn quota AI |
| `/muscles` Human Atlas 3D | 2.234 mảnh BodyParts3D, 59 cơ map tên Việt–Anh, nhóm, chức năng, bài tập; chat theo cơ | Chưa được nối với bài học nào |
| Thư viện 110 bài tập | Seed idempotent theo slug, nhóm cơ, dụng cụ | Chưa nối với lý thuyết |
| Research Reader/Finder | PubMed/Europe PMC/OpenAlex; evidence base E1–E10 đã kiểm chứng | Kiến thức rời rạt theo từng bài báo |
| Health conditions | ~17 bệnh nền/chấn thương + quy tắc an toàn khi lập giáo án | Chưa có bài học giải thích cơ chế |
| 14 máy tính chỉ số | BMR/TDEE/1RM/HR zones/macro… | Chưa nối với bài học |
| Module Dinh dưỡng | Meals, meal plan 7 ngày, adherence review | Chưa có lý thuyết dinh dưỡng |

**Khoảng trống lớn nhất:** không có *curriculum* — chuỗi bài học có cấu trúc, có thứ tự,
có kiểm tra, có tiến độ. Plan này lấp khoảng trống đó.

---

## 2. Thiết kế giáo trình (outline chi tiết)

Quy ước slug: `<module>-<chương>-<bài>`. Mỗi bài ~1.200–2.000 từ + 1–4 hình + 4–6 câu
quiz + danh sách nguồn. Ước tính **~56 bài** khi hoàn thiện đầy đủ.

### Module 1 — Giải phẫu cơ, xương khớp (`anat`) — 14 bài

- **Ch 1 — Nền tảng**
  - `anat-1-1` Thuật ngữ vị trí, phương hướng, mặt phẳng & trục chuyển động
  - `anat-1-2` Cấu trúc cơ vân: sợi cơ, sarcomere, bó cơ, gân — vì sao PT cần hiểu
- **Ch 2 — Hệ cơ theo vùng** (mỗi bài: cơ chính, gốc/cắm, chức năng, bài tập tiêu biểu,
  **deep-link sang 3D Atlas + muscle chat**)
  - `anat-2-1` Cơ ngực (pectoralis major/minor, serratus anterior)
  - `anat-2-2` Cơ lưng (latissimus dorsi, trapezius, rhomboids, erector spinae)
  - `anat-2-3` Cơ vai (deltoid 3 bó, rotator cuff) — kèm chú trọng an toàn vai
  - `anat-2-4` Cơ tay trước/sau & cẳng tay (biceps, triceps, brachialis, forearm)
  - `anat-2-5` Cơ core & thân (rectus abdominis, obliques, transversus, multifidus)
  - `anat-2-6` Cơ hông & mông (glute max/med, iliopsoas, adductors)
  - `anat-2-7` Cơ đùi trước/sau (quadriceps, hamstrings)
  - `anat-2-8` Cơ cẳng chân (gastrocnemius, soleus, tibialis)
- **Ch 3 — Hệ xương**
  - `anat-3-1` Phân loại xương, hệ trục/phần phụ, các xương liên quan phòng tập
- **Ch 4 — Khớp & vận động học**
  - `anat-4-1` Loại khớp, hành động khớp (gấp/duỗi/khép/duỗi-khép/xoay), ROM
  - `anat-4-2` Khớp vai, hông, gối, khuỷu & cột sống — cấu trúc & hứng tải
- **Ch 5 — Giải phẫu chức năng**
  - `anat-5-1` Cột sống: đường cong, tư thế, cơ sở đau lưng
  - `anat-5-2` Cơ hô hấp & cơ chế thở khi tập nặng

### Module 2 — Sinh lý học vận động & tập luyện (`phys`) — 12 bài

- **Ch 1 — Cơ & kích hoạt**
  - `phys-1-1` Motor unit, loại sợi cơ I/IIa/IIx, nguyên tắc all-or-none
  - `phys-1-2` Cơ chế co cơ (sliding filament), cơn co tetanus
- **Ch 2 — Hệ năng lượng**
  - `phys-2-1` ATP & 3 hệ năng lượng (phosphagen, glycolytic, oxidative)
  - `phys-2-2` Ngưỡng lactate, OBLA & ứng dụng chọn bài/khoảng nghỉ
- **Ch 3 — Tim mạch & hô hấp**
  - `phys-3-1` Nhịp tim, cung lượng tim, huyết áp khi vận động (link máy tính HR zones)
  - `phys-3-2` VO2max, hấp thụ oxy, điều hòa nhiệt & mồ hôi
- **Ch 4 — Thích ứng khi tập luyện**
  - `phys-4-1` Tăng cơ: 3 giả thuyết cơ chế + bằng chứng (link E1–E10)
  - `phys-4-2` Thích ứng thần kinh: vì sao người mới tập tăng lực nhanh
  - `phys-4-3` Thích ứng sức bền aerobe: tim, mao mạch, mitochondria
- **Ch 5 — Mệt mỏi & phục hồi**
  - `phys-5-1` DOMS, mệt mỏi trung ương/ngoại vi, giấc ngủ
  - `phys-5-2` Hormone & overtraining (testosterone, cortisol, dấu hiệu cảnh báo)
- **Ch 6 — Bằng chứng tập luyện**
  - `phys-6-1` Volume, tần suất, RIR, nghỉ giữa set — tổng hợp evidence base E1–E10

### Module 3 — Yếu tố thể chất (`fit`) — 8 bài

- `fit-1-1` 10 yếu tố thể chất: health-related vs skill-related
- `fit-2-1` Sức mạnh, sức mạnh công suất (power), đường cong lực–tốc độ
- `fit-2-2` Sức bền cơ & khởi phát mệt
- `fit-3-1` Sức bền tim mạch: VO2max, Zone 2, ngưỡng lactate (link máy tính)
- `fit-4-1` Uốn dẻo & mobility: static, dynamic, PNF — bằng chứng & myths
- `fit-5-1` Thăng bằng, nhanh nhẹn, phối hợp — ý nghĩa với khách phổ thông & vận động viên
- `fit-6-1` Battery test tiêu chuẩn: push-up, plank, sit-and-reach, beep test, HR recovery
- `fit-6-2` Đọc kết quả assessment & chuyển thành mục tiêu giáo án

### Module 4 — Dinh dưỡng (`nutr`) — 13 bài

- `nutr-1-1` Năng lượng: kcal, BMR/TDEE, energy balance (link máy tính BMR/TDEE/macro)
- `nutr-2-1` Protein: 1,6–2,2 g/kg, leucine, phân bổ bữa (link Morton 2018)
- `nutr-2-2` Carbohydrate: glycogen, năng suất tập, loại carb
- `nutr-2-3` Chất béo: vai trò nội tiết, essentials, ratio
- `nutr-3-1` Nước & hydration: mất nước %, electrolytes, thực hành
- `nutr-3-2` Micronutrients quan trọng: vitamin D, sắt, canxi, magie
- `nutr-4-1` Ăn quanh buổi tập: pre/post, window thực tế
- `nutr-5-1` Supplement hạng A: creatine, caffeine, whey — bằng chứng ISSN
- `nutr-5-2` Supplement khác: beta-alanine, citrulline, BCAA — phân hạng bằng chứng
- `nutr-6-1` Giảm mỡ thực hành: deficit, giữ protein, giữ sức mạnh
- `nutr-6-2` Tăng cơ thực hành: surplus khiêm tốn, theo dõi trend
- `nutr-6-3` Refeed, diet break, reverse diet — khi nào dùng
- `nutr-7-1` Special populations & red flags: đái tháo đường, THA, mang thai, rối loạn ăn uống — ranh giới chuyển hướng chuyên gia (link health conditions + module Dinh dưỡng)

### Module 5 — Phục hồi chức năng & an toàn (`rehab`) — 9 bài

- `rehab-1-1` Giai đoạn lành thương & nguyên tắc PEACE & LOVE
- `rehab-1-2` Tiến trình phục hồi & return-to-play logic
- `rehab-2-1` Lưng dưới & thoát vị đĩa đệm (link health condition `herniated_disc`)
- `rehab-3-1` Vai: impingement & rotator cuff (link `shoulder_pain`)
- `rehab-4-1` Gối: patellofemoral pain (link `knee_pain`)
- `rehab-5-1` Tendinopathy: heavy slow resistance, isometrics (Achilles, elbow)
- `rehab-6-1` Khoa học về đau & red flags — khi nào gửi khách đi bác sĩ/physio
- `rehab-7-1` Phòng chấn thương: warm-up RAMP, load management (ACWR), ACWR là gì
- `rehab-7-2` Movement screen cơ bản cho buổi đầu với khách

> **Disclaimer toàn giáo trình:** nội dung giáo dục cho PT, không thay thế đào tạo
> chứng chỉ hành nghề (ACSM/NASM/NSCA) và không phải tư vấn y tế; mỗi bài có box
> "khi nào chuyển hướng khách".

---

## 3. Nguồn dữ liệu & phương pháp thu thập

### Nguyên tắc xác thực
- **Mỗi bài ≥ 2 nguồn uy tín**, mọi con số (g/kg protein, % HRmax, thời gian lành
  thương…) phải khớp giữa các nguồn; sai khác thì ghi cả hai kèm ngữ cảnh.
- Mỗi bài có mục **Nguồn tham khảo** (link + giấy phép) hiển thị ở cuối.
- Số liệu ưu tiên lấy từ review/meta-analysis mở trên PubMed Central (app đã có
  pipeline Europe PMC để kiểm chứng DOI).

### Nguồn theo tầng

| Tầng | Nguồn | Dùng để | Giấy phép |
| --- | --- | --- | --- |
| 1 — dùng & phóng tác | PubMed Central OA reviews (qua Europe PMC) | hypertrophy, protein, tendinopathy, stretch… | CC BY |
| 1 | Evidence base sẵn có E1–E10 trong repo | volume/frequency/RIR/rest/deload | đã kiểm chứng |
| 2 — trích dẫn, tự viết lại | OpenStax *Anatomy & Physiology* (**CC BY-NC-SA** — chỉ cite, không copy văn bản/ảnh) | chuẩn tham chiếu số liệu giải phẫu | cite-only |
| 2 | ACSM's Guidelines (11th ed.), NSCA Essentials, ISSN position stands, Examine.com | chuẩn tham chiếu số liệu | cite-only |
| 3 — hình ảnh | Wikimedia Commons (bản khắc Gray's Anatomy — public domain; sơ đồ CC BY) | minh hoạ | PD / CC BY — ghi công từng ảnh (ATTRIBUTION.md) |
| 3 | BodyParts3D (đã tích hợp) | ảnh 3D khối cơ/xương | CC BY 4.0 (đã có attribution) |

> **Điều chỉnh sau khi kiểm chứng (20/11/2026):** license OpenStax là **CC BY-NC-SA**
> chứ không phải CC BY như dự kiến ban đầu → toàn bộ nội dung liên quan OpenStax
> chỉ được **trích dẫn làm nguồn**, không phóng tác văn bản/hình ảnh; ảnh minh
> hoacha dùng bản khắc Gray's Anatomy (public domain) và ảnh CC BY đã kiểm tra
> qua Commons API (xem `client/public/curriculum/ATTRIBUTION.md`).
>
> **Đã kiểm chứng trực tiếp trong đợt cào dữ liệu:**
> - ISSN creatine (Kreider et al. 2017, CC BY): nạp 0,3 g/kg × 5–7 ngày, duy trì 3–5 g/ngày, monohydrate là chuẩn.
> - PEACE & LOVE (Dubois & Esculier 2020, BJSM 54(2):72-73, DOI 10.1136/bjsports-2019-101253).
> - Định nghĩa đau IASP 2020 (Raja et al., Pain 161(9):1976-82, PMC7680716 — trích nguyên văn Text Box 2).
> - Fiber types SO/FO/FG (OpenStax 10.5 — cite-only).

### Phương pháp cào cụ thể
1. Mỗi bài: `webfetch` nguồn tier 1 → trích dữ kiện → đối chiếu tier 2 → viết tiếng Việt.
2. Kiểm chứng DOI qua pipeline sẵn có khi cần (`server/src/research/`).
3. Hình: tìm trên Wikimedia Commons → tải bản phù hợp → lưu manifest attribution
   (source URL, tác giả, license) → render caption ghi công trong UI.

---

## 4. Kiến trúc kỹ thuật

### Lưu trữ nội dung
- Nội dung giáo trình là **file tĩnh có version trong repo** tại
  `shared/curriculum/` (theo pattern `shared/muscles`, seed exercise): schema zod,
  unit test được, không cần CMS/admin, upgrade = git.
- Client **không bundle** nội dung (dễ vài trăm KB): server expose API, client gọi
  như các feature khác.

```
shared/curriculum/
├─ index.js            # tree: modules → chapters → lessons (meta, không body)
├─ lessons/
│  ├─ anat-1-1.js      # { slug, title, objectives, sections[], terms[], images[],
│  │                    #   quiz[], related{}, sources[] }
│  └─ ... (~56 bài)
```

### Backend mới
- Model **`CurriculumProgress`**: `{ userId, lessonSlug, status
  (reading|completed), quizBest, quizAttempts, updatedAt }`, index unique
  `(userId, lessonSlug)` — cùng pattern filter `userId` như mọi model hiện có.
- Routes `server/src/routes/curriculum.js`:
  - `GET /api/curriculum` — tree + tiến độ từng module của user
  - `GET /api/curriculum/lessons/:slug` — nội dung đầy đủ + progress của user
  - `PUT /api/curriculum/progress/:slug` — đánh dấu đang đọc/hoàn thành
  - `POST /api/curriculum/lessons/:slug/quiz` — **chấm bằng code** (đáp án trong
    bank câu hỏi của bài), lưu quizBest
  - `POST /api/curriculum/lessons/:slug/ask` — chat AI theo bài, **reuse pattern
    muscle chat + quota riêng `curriculum`** (AiUsage có sẵn các counter theo loại)
- Progress xóa khi user xóa tài khoản (theo pattern authService hiện có).

### Frontend mới (trong `/learn`)
- Tab **"Giáo trình"** (default) — trang tổng quan 5 module: tiến độ %, số bài,
  "Tiếp tục học" (bài gần nhất đang đọc).
- **Trang bài học** (`/learn?tab=curriculum&lesson=<slug>`): 
  - mục tiêu → nội dung từng section (markdown-like render có sẵn từ Reader) → 
    hình + caption attribution → box "Áp dụng vào phòng tập" → thuật ngữ chính → 
    quiz cuối bài → nguồn tham khảo.
  - Nút **"Tạo flashcard từ thuật ngữ bài này"** (bulk → POST /flashcards hiện có).
  - **Deep-link 3D Atlas**: mỗi cơ nhắc trong bài → nút mở `/muscles` đúng cấu trúc
    (Atlas đã hỗ trợ search cấu trúc + FMA ID).
  - Liên kết chéo: bài tập liên quan (thư viện 110), máy tính liên quan
    (BMR/TDEE/HR), health condition liên quan, nghiên cứu liên quan (E1–E10).
- **Quiz cuối bài**: MCQ chọn đáp án → chấm code → giải thích từng câu → lưu best.
- **Chat hỏi đáp từng bài** (AI, streaming như muscle chat) cho câu hỏi ngoài bank.
- Dashboard: card nhỏ "Tiếp tục học" (bài gần nhất + % hoàn thành giáo trình).

### Tích hợp với tính năng sẵn có (ma trận)

| Tính năng sẵn có | Cách tích hợp |
| --- | --- |
| Human Atlas 3D + 59 cơ | Bài giải phẫu nhúng "thẻ cơ" (metadata sẵn có) + nút mở 3D đúng cơ |
| Muscle chat | Deep-link từ thẻ cơ |
| Flashcard SM-2 | Nút bulk-tạo flashcard từ terms của bài |
| Từ điển cá nhân | Terms của bài thêm được vào từ điển 1 click |
| Quiz AI (summary) | Giữ nguyên; quiz giáo trình dùng bank chấm code (không quota) |
| Research + E1–E10 | Mục "Nghiên cứu liên quan" mỗi bài → mở Reader/Finder sẵn |
| 14 máy tính | Bài dinh dưỡng/HR nhúng link tới đúng máy tính |
| Health conditions | Bài rehab nối 2 chiều với quy tắc an toàn của planner |
| Meal plans | Bài dinh dưỡng thực hành nối sang editor meal plan |
| Notes | Nút "ghi chú nhanh về bài này" (prefill tag = slug bài) |

### Tính năng mới (tóm tắt)
1. Giáo trình có cấu trúc 5 module / ~56 bài / quiz mỗi bài.
2. Theo dõi tiến độ per-user (đang đọc, hoàn thành, điểm quiz tốt nhất).
3. Quiz chấm bằng code (miễn phí, không AI) + giải thích.
4. Chat AI theo bài (quota riêng).
5. Thư viện ảnh minh hoạ có attribution.
6. "Tiếp tục học" trên dashboard.

---

## 5. Template một bài học (chuẩn biên soạn)

```js
{
  slug: 'nutr-2-1',
  module: 'nutr',
  title: 'Protein cho người tập',
  minutes: 9,                    // ước lượng thời gian đọc
  objectives: ['...', '...'],     // 3-5 mục tiêu
  sections: [                    // nội dung chính
    { heading: '...', body: '...', image: 'nutr-protein-synthesis.jpg' },
  ],
  applyBox: '...',                // Áp dụng vào phòng tập
  safetyBox: '...',               // (optional, rehab/nutrition) khi nào chuyển hướng
  terms: [ { en: 'MPS', vi: 'Tổng hợp protein cơ', def: '...' } ],
  images: [ { file: '...', caption: '...', source: '...', license: 'CC BY 4.0 — ...' } ],
  quiz: [ { q, choices[4], answer, explain } ],   // 4-6 câu
  related: { muscles: [...], exercises: [...], calculators: [...], conditions: [...], papers: [...] },
  sources: [ { label: 'Morton 2018', url: 'https://doi.org/10.1136/bjsports-2017-097608', license: 'CC BY 4.0' } ],
}
```

- Tiếng Việt là chính, thuật ngữ tiếng Anh in kèm (`Cơ nhị đầu cánh tay (biceps brachii)`).
- Mọi con số giữ nguyên đơn vị, không làm tròn tùy tiện.

---

## 6. Phân pha thực hiện & tiêu chí nghiệm thu

### Phase A — Chốt plan (bước này)
- ✅ Khảo sát hiện trạng, outline 5 module, kiến trúc, nguồn. **→ ĐÃ DUYỘT 19/11/2026.**

### Phase B — Nền tảng kỹ thuật ✅
- Schema zod `shared/curriculum` + model `CurriculumProgress` + routes + validation
  + quota `curriculum` + cleanup khi xóa tài khoản + `lessonCoach` (chat AI theo bài, SSE).
- **Nghiệm thu:** 20 test curriculum (10 unit + 10 integration) pass; `npm run test` 303/303.
- **Điều chỉnh kiến trúc khi smoke test:** `shared/` giữ thuần dữ liệu không dependency
  (quy ước repo) → schema zod tách sang `server/src/validation/curriculumLesson.js`,
  validate chạy khi routes nạp; test schema thêm vào `curriculum.test.js`.

### Phase C — Frontend ✅
- Tab Giáo trình + trang tổng quan module + trang bài học (reader + ảnh attribution +
  box áp dụng + thuật ngữ → flashcard/từ điển + quiz chấm code + quiz AI + chat SSE) +
  deep-link `/muscles?muscle=`, `/calculators?tab=`, card "Tiếp tục học" trên Dashboard.

### Phase D — Cào dữ liệu & biên soạn (đợt 1: 14 bài flagship) ✅
- **Đã kiểm chứng trực tiếp:** ISSN creatine (CC BY, fetch nguyên văn), PEACE & LOVE
  (Dubois & Esculier 2020 — DOI đúng 10.1136/bjsports-2019-101253), định nghĩa đau
  IASP 2020 (Raja et al., trích nguyên văn từ PMC7680716), fiber types OpenStax.
- 14 bài viết tiếng Việt kèm thuật ngữ Anh, box áp dụng, quiz bank chấm code, sources
  + license; cross-link 3D Atlas (59 cơ), 110 bài tập, 14 máy tính, health conditions,
  evidence base E1–E8.
- 4 ảnh PD/CC BY tải về `client/public/curriculum/images/` + ATTRIBUTION.md;
  license OpenStax (CC BY-NC-SA) phát hiện trong quá trình cào → chuyển sang cite-only.

### Phase D-đợt 2 — Hoàn thiện module Giải phẫu (11 bài mới) ✅ (20/11/2026)
- **11 bài theo đúng thứ tự outline:** anat-1-2 (sarcomere), anat-2-1 (ngực), anat-2-2
  (lưng), anat-2-4 (tay & cẳng tay), anat-2-6 (hông & mông), anat-2-7 (đùi), anat-2-8
  (cẳng chân), anat-3-1 (hệ xương), anat-4-2 (khớp chính chuyên sâu), anat-5-1 (cột
  sống & tư thế), anat-5-2 (cơ hô hấp).
- **Module Giải phẫu hoàn chỉnh: 15 bài / 166 phút đọc**; tổng giáo trình hiện 25 bài.
- **10 ảnh mới đã kiểm tra license qua Commons API** trước khi tải: Gray409/410/434/
  432color/391/349 + Forearm plate 414, Sarcomere.svg (CC BY-SA 3.0), Gastrocnemius
  (CC BY-SA 3.0), Vesalius 1543 (bộ xương) — mỗi plate được xác minh mô tả đúng vùng
  trước khi dùng (phát hiện và loại các plate sai: Gray242 là xương chậu nữ, Gray334
  là dây chằng cổ tay, Gray408 không liên quan).
- Kiểm chứng: 303/303 test · lint 0 lỗi · build pass · smoke server thật (25 bài, quiz
  6/6, ảnh + deep-link, dọn smoke user).

### Phase D-đợt 3 — Hoàn thiện module Sinh lý (9 bài mới) ✅ (20/11/2026)
- **9 bài theo đúng thứ tự outline:** phys-1-1 (motor unit & loại sợi), phys-1-2 (cơ
  chế co & tetanus), phys-2-2 (ngưỡng lactate & OBLA), phys-3-2 (VO2max, Fick & điều
  hòa nhiệt), phys-4-2 (thích ứng thần kinh), phys-4-3 (thích ứng aerobe: SV/mao mạch/
  mitochondria), phys-5-1 (DOMS & mệt mỏi trung ương/ngoại vi, ngủ), phys-5-2 (hormone
  & quá tải, deload E8), phys-6-1 (capstone tổng hợp E1–E8, ghép vào wizard/planner/
  progression của app).
- **Module Sinh lý hoàn chỉnh: 12 bài / 6 chương / 137 phút**; tổng giáo trình 34 bài.
- **2 ảnh mới đã kiểm tra license:** Gray493 (tim nhìn từ trước — verify mô tả qua API,
  sau khi loại Gray490 không mô tả) và Animal mitochondrion diagram (LadyofHats, PD).
- Kiểm chứng: 303/303 test · lint 0 · build pass · smoke server thật (34 bài, capstone
  trả 6 evidence refs, quiz 6/6, ảnh heart serve đúng).

### Phase D-đợt 4 — Hoàn thiện module Dinh dưỡng (10 bài mới) ✅ (20/11/2026)
- **10 bài theo đúng thứ tự outline:** nutr-2-2 (carb & glycogen), nutr-2-3 (chất béo),
  nutr-3-1 (nước & hydration, hyponatremia), nutr-3-2 (5 micronutrients + RED-S),
  nutr-4-1 (ăn quanh buổi, cửa sổ thật), nutr-5-2 (supplement hạng B: beta-alanine,
  citrulline; cảnh báo booster/fat burner), nutr-6-1 (giảm mỡ thực hành), nutr-6-2
  (tăng cơ thực hành — surplus khiêm tốn), nutr-6-3 (refeed/diet break/reverse diet),
  nutr-7-1 (special populations & red flags: huyết áp, đái tháo đường, mang thai,
  rối loạn ăn — deep-link tới health conditions của app).
- **Module Dinh dưỡng hoàn chỉnh: 13 bài / 7 chương / 144 phút**; tổng giáo trình 44 bài.
- Kiểm chứng: 303/303 test · lint 0 · build pass · smoke server thật (44 bài,
  nutr-7-1 trả đúng conditions hypertension+pregnancy, quiz 5/5); dọn orphan process
  giữ cổng 4000 sau smoke.

### Phase D-đợt 5 — Hoàn thiện module Phục hồi chức năng (7 bài mới) ✅ (20/11/2026)
- **7 bài theo đúng thứ tự outline:** rehab-1-2 (tiến trình theo tiêu chí & return-to-play),
  rehab-2-1 (đau lưng dưới & thoát vị — "MRI không phải bản án"), rehab-3-1 (đau vai dưới
  vòm — 3 núm điều chỉnh + 4 cửa rèn cuff), rehab-4-1 (đau quanh bánh chè theo consensus
  BJSM 2016), rehab-5-1 (tendinopathy & HSR), rehab-7-1 (RAMP + ACWR — Gabbett 2016),
  rehab-7-2 (movement screen 5 test buổi đầu + vòng re-screen).
- **Verify DOI trực tiếp qua Europe PMC trước khi trích dẫn:** Brinjikji 2015
  (10.3174/ajnr.a4173), Crossley 2016 PFP consensus Part 2 (10.1136/bjsports-2016-096268,
  CC BY), Kongsgaard 2009 HSR (10.1111/j.1600-0838.2009.00949.x), Gabbett 2016 ACWR
  (10.1136/bjsports-2015-095788, CC BY — DOI khác với phỏng đoán ban đầu, verify đã tránh
  trích nhầm).
- **Module Phục hồi hoàn chỉnh: 9 bài / 7 chương / 104 phút**; tổng giáo trình 51 bài.
- Kiểm chứng: 303/303 test · lint 0 · build pass · smoke server thật (51 bài, rehab-2-1
  trả đúng conditions low_back_pain+herniated_disc, quiz 5/5); dọn sạch process + port
  4000 sau smoke (kể cả child node).

### Phase D-đợt 6 — Hoàn thiện module Yếu tố thể chất (6 bài) ✅ (20/11/2026)
- **6 bài cuối outline:** fit-2-1 (sức mạnh & power/đường cong lực–tốc độ), fit-2-2
  (sức bền cơ), fit-3-1 (cardio & Zone 2 theo WHO 2020 — URL đã verify trực tiếp),
  fit-4-1 (uốn dẻo & mobility, đập 2 myth), fit-5-1 (thăng bằng/nhanh nhẹn/phối hợp),
  fit-6-2 (đọc assessment thành mục tiêu SMART).
- **Outline gốc 57 bài hoàn tất**: anat 15 + phys 12 + nutr 13 + fit 8 + rehab 9.

### Phase D-đợt 7 — Module mới "Ứng dụng cá nhân hoá" (7 bài, theo yêu cầu riêng) ✅ (20/11/2026)
- **Module thứ 6 `case`** — "Ứng dụng: cá nhân hoá giáo án tập + chế độ ăn cho ca cụ thể",
  thêm vào CURRICULUM_MODULES (6 module trong cây giáo trình; UI có icon riêng; test
  cập nhật 6 module).
- **Bài khung `case-1-1`**: quy trình 6 bước anamnesis → screen → số → SMART → giáo án
  + ăn → re-test, mỗi bước map công cụ app + bài nền tảng.
- **6 ca archetype** với số liệu đầy đủ (TDEE/protein/educational plan/thực đơn):
  `case-2-1` nam 32 văn phòng giảm 8 kg; `case-2-2` nữ 26 "săn chắc" sợ tạ nặng
  (recomp); `case-2-3` nam 46 tăng huyết áp (rules app: no Valsalva/1RM, RIR 2–3);
  `case-2-4` nữ 58 loãng xương (balance WHO ≥ 3 buổi/tuần + tải an toàn xương);
  `case-2-5` nam 22 hardgainer (surplus +10–12%, NEAT nghề, đếm thật 2 tuần);
  `case-2-6` nam 35 đau lưng đang physio (phối hợp ba bên + thang hinge).
- Mọi con số trong ca nội bộ nhất quán (BMR→TDEE→deficit/surplus→macro) và mọi cite
  đều là nguồn ĐÃ kiểm chứng từ các đợt trước (E1–E8, WHO 2020, Brinjikji, PEACE&LOVE,
  IASP 2020).
- Kiểm chứng: 303/303 test (10 unit curriculum + test cây 6 module) · lint 0 · build
  pass · smoke server thật: **6 module / 64 bài** — case 7 bài/85 phút, case-2-1 trả
  6 calculator deep-link, quiz 5/5; port + process dọn sạch.

### Phase E — Hoàn thiện ✅
- `npm run test` 303/303 · lint 0 lỗi · build pass (ảnh vào dist) · README + plan doc cập
  nhật · `graphify update .` đã chạy (1996 nodes / 6227 edges).
- **E2E smoke trên server dev + MongoDB thật**: toàn bộ endpoint curriculum trả đúng
  (register 201, tree/lesson/quiz/progress 200, quiz 100/100 lưu best, "Tiếp tục học"
  nhảy đúng bài kế, evidence + deep-link resolve, xóa account dọn CurriculumProgress).


---

## 7. Rủi ro & giới hạn (nêu rõ từ đầu)

1. **Số lượng nội dung lớn** (~56 bài): chấp nhận làm theo đợt; ưu tiên chất lượng &
  nguồn kiểm chứng được hơn là đổ đủ số lượng.
2. **License ảnh:** chỉ dùng PD/CC BY/CC BY-SA; mỗi ảnh có attribution; không cào ảnh
  từ site thương mại (KenHub, Muscle & Strength…).
3. **Rehab là vùng nhạy cảm:** bài rehab luôn kèm red flags và "không thay thế
  physio/bác sĩ"; bám khuyến nghị các review lớn.
4. **Quiz code-graded** nghĩa là ngân hàng câu cố định — người dùng làm lại vẫn gặp
  câu cũ (nhưng có giải thích); AI sinh quiz chỉ bật khi bạn muốn.
5. **Không thay chứng chỉ hành nghề**: hiển thị disclaimer rõ trong UI giáo trình.
6. **AI quota:** chỉ chat theo bài tốn quota (giới hạn như feature khác); không dùng
  AI để "chấm" quiz.
