# PT Brain — Audit độ sâu giáo trình & kế hoạch đào sâu

> Ngày: 25/11/2026  
> Phạm vi: `shared/curriculum/lessons` (71 bài), `client/src/pages/learn`, `shared/learning`, `server/src/services/learning`  
> Phương pháp: 2 sub-agent audit read-only + đối chiếu code, không sửa nội dung trong bước audit.

## 1. Kết luận ngắn

Giáo trình hiện có **nền tảng rộng và nội dung khá tốt**: 71 bài, 34 chương, 811 phút, 378 câu quiz, 386 thuật ngữ; nhiều bài có bảng số, case study và nguồn. Điểm yếu không phải "thiếu kiến thức nền" mà là **thiếu quy tắc vận hành để ra quyết định**:

- Biết deficit 10–25%, nhưng chưa có bảng mốc 5–10% cân nặng, thời gian dự kiến và thứ tự chỉnh khi plateau.
- Biết volume 10–20 set, nhưng chưa có mô hình MEV/MAV/MRV, RPE, và cây quyết định khi 2–4 tuần không tiến bộ.
- Biết Valsalva cho 1–3 rep, nhưng thiếu danh sách chống chỉ định đầy đủ, ngưỡng huyết áp, nhịp thở cho 3–6/6–12 rep và bài bền.
- Case module là tài sản tốt nhất, nhưng phần lớn CTA vẫn chỉ mở máy tính, chưa phải bài tập ra quyết định.

**Điểm mạnh:** dinh dưỡng cơ bản, rehab red flags, 10 case lâm sàng, giải thích cơ chế.
**Điểm yếu nhất:** quy tắc "đổi gì trước, bao nhiêu, chờ bao lâu" và thực hành ra quyết định.

## 2. Inventory

| Module | Bài | Phút | Chương | Depth trung bình (1–5) |
|---|---:|---:|---:|---:|
| anat | 15 | 166 | 5 | 2.9 |
| phys | 12 | 137 | 6 | 3.5 |
| nutr | 13 | 144 | 7 | 3.6 |
| fit | 8 | 86 | 6 | 3.4 |
| rehab | 12 | 140 | 8 | 3.6 |
| case | 11 | 138 | 2 | 4.0 |
| **Tổng** | **71** | **811** | **34** | **3.5** |

Chỉ **26/71** bài có `safetyBox`. `anat-5-2` (Valsalva/thở) không có `safetyBox`.

## 3. Ma trận độ phủ 4 chủ đề ưu tiên

Thang: 0 = không có; 1 = nhắc; 2 = giải thích; 3 = có số/rule hành động.

| Bài | Giảm cân | Tăng cơ | Hít thở | Troubleshooting |
|---|---:|---:|---:|---:|
| `nutr-1-1` | 3 | 1 | 0 | 1 |
| `nutr-6-1` | 3 | 0 | 0 | 1 |
| `nutr-6-2` | 0 | 3 | 0 | 1 |
| `nutr-6-3` | 3 | 0 | 0 | 0 |
| `anat-5-2` | 0 | 0 | 3 | 0 |
| `phys-5-2` | 0 | 0 | 0 | 3 |
| `phys-6-1` | 0 | 2 | 0 | 3 |
| `case-2-1` | 3 | 1 | 0 | 3 |
| `case-2-5` | 0 | 3 | 0 | 2 |
| `case-2-3` | 1 | 0 | 3 | 0 |
| `rehab-1-2` | 0 | 0 | 0 | 1 |

## 4. 12 lỗ hổng ưu tiên

1. **Không có mô hình volume landmark/autoregulation** (MV/MEV/MAV/MRV, RPE). `phys-6-1` chỉ dừng ở 10–20 set và RIR 1–3.
2. **Định nghĩa plateau mâu thuẫn:** `nutr-1-1` chờ 3 tuần; `nutr-6-1` và `case-2-1` chờ 2 tuần.
3. **Không có mốc 5–10% cân nặng và bảng tuần/kg theo cân nặng.**
4. **Tốc độ tăng cơ mâu thuẫn:** `nutr-6-2` ghi beginner 0,5–1%/tuần; `case-2-5` dùng 0,25–0,5%/tuần cho beginner; không có nguồn.
5. **An toàn Valsalva thiếu:** mới có tăng huyết áp chưa kiểm soát, bệnh tim, mang thai; thiếu aneurysm, retinopathy/glaucoma, hernia, phẫu thuật gần, pelvic-floor; thiếu ngưỡng BP/dấu hiệu dừng.
6. **Không có framework thay bài tập** ngoài 3 "knob" vai.
7. **Adherence được mô tả, không được đo:** thiếu % buổi hoàn thành, % ngày log, bước chân, protein-target days.
8. **Refeed/diet break thiếu liều:** có thời lượng, thiếu calo/carb, tần suất tối đa, chống chỉ định.
9. **Thiếu nhịp thở bền:** không có cadence, nasal/mouth, side stitch, EIB/asthma, hyperventilation, IMT warm-up.
10. **Thiếu measurement error/MDC:** không có protocol cân/vòng bụng, noise floor, e1RM caveat.
11. **Ngưỡng chuyển hướng giảm cân chưa vận hành:** thiếu BMI <18,5; >1,5%/tuần; amenorrhea; SCOFF; gallstones; thuốc.
12. **Thiếu training-age definition và advanced programming:** chỉ có một template 8 tuần tuyến tính.

## 5. Lỗ hổng sư phạm

- **Mastery bị "click-inflated":** 40% mastery có thể đến từ click apply, không cần quiz; "Đánh dấu hoàn thành" không cần quiz.
- **Không có spaced retrieval cho lesson:** SM-2 chỉ cho flashcard; "Ôn tập hôm nay" mở lại toàn bài, không có due date.
- **"Apply" chỉ là điều hướng:** `ApplyActionButton` ghi nhận trước khi mở tab; không xác minh outcome.
- **Quiz chủ yếu recognition:** 4 lựa chọn, không có self-explanation/scenario bắt buộc; AI quiz không lưu.
- **Case module CTA lệch:** `case-2-1` mở BMR calculator; `anat-5-2` mở HR zones.
- **Thiếu search giáo trình, note theo bài, TOC/mobile entry.**

## 6. Kế hoạch đào sâu (ưu tiên)

### P0 — Sửa mâu thuẫn và bổ sung bảng số (1–2 ngày)

- `nutr-6-1`: bảng 5%/10% theo 60/80/100 kg; định nghĩa plateau thống nhất; ladder chỉnh; adherence audit.
- `nutr-6-2`: bảng tốc độ tăng theo training age + kg/tháng; sửa beginner rate; rule đổi chương trình.
- `anat-5-2`: mở rộng safety Valsalva; rule 1–3/3–6/6–12 rep; thêm `safetyBox`; nhịp thở bền.
- `phys-6-1`: thêm khung MEV/MAV/MRV tham khảo + RPE; nối sang bài mới.
- Đồng bộ `nutr-1-1` 3 tuần → 2 tuần (sau khi verify dữ liệu) và giải thích ngoại lệ.

### P1 — Bài mới (3–5 ngày)

- `phys-6-2`: **Volume landmarks & autoregulation** (MEV/MAV/MRV, RPE/RIR, cách tìm trong 4–6 tuần).
- `case-2-11`: **Không tiến bộ 2–4 tuần — cây quyết định** cho giảm mỡ, tăng cơ, sức mạnh.
- `fit-3-2`: **Nhịp thở bền & vấn đề hô hấp khi chạy/đạp** (cadence, talk test, EIB, side stitch, IMT warm-up).
- `nutr-6-4` (nếu cần): **Giảm cân 5–10%: timeline, plateau, thứ tự chỉnh** — hoặc gộp vào `nutr-6-1`.

### P2 — Practice wrapper (1–2 tuần)

- Quiz scenario + self-explanation cho các bài P0/P1.
- Wrong-answer → flashcard; review queue có due date.
- Case CTA mở planner với prefill; đánh giá bằng rubric 7 subscore.
- Lesson search + note theo bài.

## 7. Tiêu chí nghiệm thu nội dung

Một bài được coi là "đủ sâu" khi có:

1. Ít nhất một bảng số/ngưỡng có thể dùng ngay.
2. Ít nhất một ví dụ worked example với con số cụ thể.
3. Ít nhất một if-then rule cho tình huống stall/plateau/red flag.
4. Nêu rõ "chờ bao lâu" trước khi đổi biến.
5. Nêu rõ khi nào dừng/chuyển hướng.
6. Có ít nhất một câu quiz dạng quyết định (không chỉ nhớ định nghĩa).
7. Có nguồn uy tín cho các con số quan trọng.

## 8. Nguồn nội bộ đã dùng

- `shared/curriculum/lessons/*.js` — 73 bài sau khi thêm 2 bài.
- `shared/curriculum/index.js` — module/schema.
- `client/src/pages/learn/LessonPage.jsx`, `CurriculumPage.jsx`, `QuizPage.jsx`, `FlashcardsPage.jsx`.
- `shared/learning/contexts.js`, `shared/learning/sm2.js`.
- `server/src/services/learning/recommendations.js`.
- `server/src/services/training/programMetrics.js`.
- `docs/LEARNING_INTEGRATION_PLAN.md`.

## 9. Research nguồn ngoài (tóm tắt có citation)

Các con số dưới đây đã được dùng để sửa bài; nguồn đầy đủ nằm trong `sources` của từng lesson.

1. **Tốc độ giảm cân:** 0,5–1,0% cân nặng/tuần; 80 kg ≈ 0,4–0,8 kg/tuần. Mốc 5–10% thường mất **3–6 tháng** khi có chương trình. — NHS 2026; Fogarasi 2022 (DOI 10.1007/s13679-022-00470-4); Steinberg 2013 (DOI 10.1002/oby.20396).
2. **Plateau:** không có định nghĩa thống nhất; thực hành: **MA7 không giảm ≥ 3 tuần** dù đã xác minh adherence. Một tuần phẳng không phải plateau. — Burke 2011 (DOI 10.1016/j.jada.2010.10.008); Madigan 2015 (DOI 10.1186/s12966-015-0267-4).
3. **Thứ tự chỉnh:** đo/adhérence → NEAT → calo → hồi phục; giảm **200–300 kcal** hoặc thêm **2.000–3.000 bước**, không cả hai. — ACSM 2009 (DOI 10.1249/MSS.0b013e3181949333); NHS 2026.
4. **Tăng cơ:** beginner 0,25–0,5%/tuần; intermediate 0,1–0,25%/tuần; advanced 0–0,1%/tuần (scale weight). Tổng tăng gồm mỡ/nước; phần nạc nhỏ hơn. — Iraki 2019 (DOI 10.3390/sports7070154); Garthe 2011 (DOI 10.1139/h11-051); Slater 2019 (DOI 10.3389/fnut.2019.00131).
5. **Protein:** 1,6–2,2 g/kg/ngày cho tăng cơ; 2,3–3,1 g/kg LBM khi cut ở người gầy. — Morton 2018 (DOI 10.1136/bjsports-2017-097608); ISSN 2017 (DOI 10.1186/s12970-017-0177-8).
6. **Valsalva:** chỉ dùng cho **1–5 RM**, giữ **1–3 giây**; huyết áp có thể tăng rất mạnh (trung bình ~320/250 mmHg trong leg press nặng). Tránh khi huyết áp chưa đạt mục tiêu (≥140/90), bệnh tim, phình/tách động mạch chủ, Marfan/vascular EDS, thai, retinopathy/glaucoma, thoát vị, mới phẫu thuật. — MacDougall 1985 (DOI 10.1152/jappl.1985.58.3.785); Hackett 2013 (DOI 10.1519/JSC.0b013e31827de07d); Ikeda 2009 (DOI 10.1519/JSC.0b013e31818eb256).
7. **RMT/IMT:** 30 hơi, 1–2 lần/ngày, ~50–70% MIP, 4–6 tuần; cải thiện hiệu suất bền ~4–16% tùy test/nền. — Illi 2012 (DOI 10.1007/BF03262290); Romer 2002 (DOI 10.1080/026404102760000053).
8. **Volume:** mỗi set/tuần thêm ≈ +0,37% phì đại; nhóm volume cao vs thấp ≈ +3,9%; **≥10 set/nhóm/tuần**. MV/MEV/MAV/MRV là **heuristic**, không phải ngưỡng sinh lý đã validate. — Schoenfeld 2017 (DOI 10.1080/02640414.2016.1210197); ACSM 2026 (DOI 10.1249/MSS.0000000000003897).
9. **Deload:** dùng khi mệt, không theo lịch cứng; 1 tuần, volume −40–60%; một số RCT cho thấy deload đầy đủ có thể làm chậm tăng strength. — Coleman 2024 (DOI 10.7717/peerj.16777); Pancar 2026 (DOI 10.1038/s41598-026-40612-5).
10. **Đo tiến bộ:** cân 5–7 ngày/tuần, MA7; vòng bụng nhất quán mỗi 2 tuần; e1RM cùng kỹ thuật, nhiễu ~2–3%; strength 2–4 tuần, hypertrophy 8–12 tuần. — Steinberg 2013; ACSM 2026; Burke 2011.

### Không nên overclaim

- Không nói "metabolic damage"/"starvation mode"; dùng "metabolic adaptation" và nói rõ biến thiên lớn.
- Không hứa 0,5–1 kg/tuần cho mọi người; đó là khoảng mục tiêu.
- Không nói Valsalva gây stroke/aneurysm; chỉ nói "liên quan trong case report" và tránh ở nhóm nguy cơ.
- Không trình bày MV/MEV/MAV/MRV như ngưỡng sinh lý đã chứng minh.
- Không nói failure/deload là bắt buộc.

## 10. Đã triển khai trong đợt này

- **Sửa mâu thuẫn plateau:** thống nhất **3 tuần** (sau khi verify adherence) ở `nutr-1-1`, `nutr-6-1`, `case-2-1`, `case-2-11`.
- **Giảm cân:** thêm bảng mốc 5%/10% + timeline, definition/plateau ladder, đo lường, quiz/terms vào `nutr-6-1`.
- **Tăng cơ:** thêm bảng tốc độ theo training age, surplus +200–300 kcal, recomp vs surplus, plateau 3–4 tuần, timeline strength/hypertrophy vào `nutr-6-2`; sửa beginner rate.
- **Hít thở:** mở rộng Valsalva 1–5 RM, chống chỉ định/ngưỡng BP, bảng nhịp thở theo rep range, nhịp thở bền + RMT, thêm `safetyBox` và quiz vào `anat-5-2`.
- **Refeed/diet break:** thêm bảng liều/chống chỉ định; sửa claim "break tăng tốc giảm mỡ" thành công cụ adherence; cập nhật glycogen 2–3 g nước vào `nutr-6-3`.
- **Bài mới `phys-6-2`:** volume landmarks, RPE/RIR, cách tìm MEV/MAV/MRV, deload.
- **Bài mới `case-2-11`:** cây quyết định không tiến bộ 2–4 tuần với 3 ca cụ thể.
- **Đồng bộ phụ:** protein range `nutr-2-1`, deload wording `phys-4-1`, waist/MA7 protocol `fit-6-1`, red flags `nutr-7-1`, BP threshold `case-2-3`, comment module 5→6.

## 11. P2 practice wrapper — đã triển khai

- **Search giáo trình:** tìm theo tên bài, mục tiêu, thuật ngữ (Anh/Việt), chương, module; accent-insensitive (gõ “Valsalva” ra `anat-5-2`).
- **Ôn tập mở thẳng quiz:** link “Ôn tập hôm nay” và reviewDue mở chế độ **quiz-only** (`focus=quiz`) thay vì đọc lại cả bài; có nút “Về bài đầy đủ”.
- **Sai câu → flashcard thật:** tạo card từ chính câu sai, front = câu hỏi, back = đáp án đúng + giải thích; xử lý trùng 409.
- **Completion honest:** nút “Đánh dấu hoàn thành” chỉ xuất hiện sau khi đã làm quiz; trước đó là “Làm quiz để hoàn thành” và cuộn tới quiz.
- **Quiz deep-link:** `#quiz` + review mode; giữ điểm/best score và invalidate cache sau khi nộp.

## 12. Việc còn lại (chưa làm)

- Spaced review có `nextReviewAt`/due date cho từng lesson (hiện vẫn dùng quizBest < 80).
- Quiz scenario/self-explanation bắt buộc + lưu theo objective.
- Case CTA prefill planner + chấm bằng rubric 7 subscore.
- Note theo bài; mobile Learn entry.
- Có thể thêm `fit-3-2` nếu muốn tách riêng nhịp thở bền khỏi bài anatomy.
