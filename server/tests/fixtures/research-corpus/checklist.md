# Checklist cố định — kiểm tra bản tóm tắt nghiên cứu

Dùng cho mọi bài trong `manifest.json`. Đánh dấu PASS/FAIL và ghi bằng chứng (số trang/trích đoạn) vào cột cuối.

## A. Thẻ thông tin bài

- [ ] **Tên bài đầy đủ**, không phải mã file (`JSC201360`, `indd`, `GER441029`...).
- [ ] **Tác giả** đầy đủ (hoặc đúng số tác giả bài nêu).
- [ ] **Tạp chí, năm, tập(số), trang** đúng.
- [ ] **DOI** đúng định dạng `10.xxxx/...`; hiển thị đúng chữ hoa như checklist (ví dụ `10.1519/JSC...`); không ghi "DOI không nêu" nếu Crossref tra được.
- [ ] **Không dùng tên file làm tiêu đề.**

## B. Kết luận và mục tương đương

- [ ] **Kết luận tác giả có nội dung**, không phải "Không nêu trong bài".
- [ ] Nếu bài không có heading `Conclusion`, đã lấy từ `In summary` / `Conclusions` / đoạn cuối Discussion.
- [ ] **Ứng dụng tác giả** lấy từ `Practical Applications` / `Implications for practice` (nếu có).
- [ ] **Hạn chế tác giả** lấy từ `Limitations` / `Strengths and limitations` (nếu có).

## C. Lợi ích, tài trợ, xung đột

- [ ] Đã quét `Acknowledgments`, `Funding`, `Disclosure`, `Conflict of interest`, chú thích hình/bảng, footnote.
- [ ] Nếu có `patent pending` / `patent` / thiết bị "novel"/"inexpensive" / thiết bị do công ty cấp → có **cờ đỏ** trong mục Lợi ích & tài trợ.
- [ ] Không ghi "Không nêu trong bài" khi thật ra có dấu hiệu trong chú thích hình.

## D. Cấu trúc trang mới

- [ ] **30 giây** có đúng 3 dòng + câu "Dùng được cho PT chưa?".
- [ ] **Vì sao làm nghiên cứu** giải thích được vấn đề và giả thuyết.
- [ ] **Cơ chế can thiệp** 3-5 bước + sơ đồ/chỗ sơ đồ; giải thích được vì sao tạ đứng yên lúc đầu (nếu can thiệp nối tiếp).
- [ ] **Kết quả** theo khuôn: Dữ kiện → Nghĩa là gì trong phòng tập → Mức chắc chắn.
- [ ] **Tác giả diễn giải** tách khỏi kết quả đo.
- [ ] **Hạn chế** tách "tác giả nêu" và "AI nhận thấy".
- [ ] **Áp dụng cho PT** đủ 4 nhóm: Có cơ sở / Chỉ là giả thuyết / Chưa nên áp dụng / Bài không trả lời.
- [ ] **3 câu tự kiểm tra** có đáp án.
- [ ] Thuật ngữ khó có giải thích **tại chỗ** (tooltip/ghi chú), không chỉ ở cuối trang.

## E. Trung thực và nhãn

- [ ] Mỗi nhận định có nhãn **[Dữ kiện] / [Tác giả diễn giải] / [Nhận xét của AI]**.
- [ ] Giả thuyết chưa đo ghi rõ **"chưa được đo"**.
- [ ] p>0.05 viết **"không phát hiện khác biệt"**, không viết "không có khác biệt" / "người tập không cảm thấy khó hơn".
- [ ] Nêu rõ đại lượng đo ở đâu (ví dụ encoder gắn vào quả tạ, không phải tay/thanh cầm).
- [ ] Nêu đây là nghiên cứu **cấp tính** (nếu đúng), không suy ra thích nghi dài hạn.
- [ ] Kết quả nhóm là trung bình: có nhắc SD/dao động giữa từng người.
- [ ] Không có câu "đủ để PT lập kế hoạch số lần/set" mà không kèm cảnh báo.
- [ ] Nếu `verification.passed=false`: có badge "Cần đối chiếu", khoá "Áp dụng vào plan" cho đến khi bấm "Đã đối chiếu PDF gốc", vẫn cho đọc/export.

## F. Mức bằng chứng 3 trục

- [ ] **Thiết kế** — cao/vừa/thấp + lý do.
- [ ] **Độ chắc chắn** — cỡ mẫu, thiên lệch, độ chính xác đo, ước lượng 1RM, mù, tính cỡ mẫu, CI + lý do.
- [ ] **Liên quan trực tiếp tới câu hỏi của PT** — cao/vừa/thấp + lý do.
- [ ] Không dùng "Mức bằng chứng 2/5" mà không có tiêu chí.

## G. Số liệu và lặp ý

- [ ] Mọi con số/p/d trong bản viết khớp JSON dữ kiện.
- [ ] Trích nguyên văn trong facts khớp toàn văn (quote audit); nếu không, đã có cảnh báo.
- [ ] Không bỏ sót số liệu chính (kể cả ICC/reliability, các mốc 10%/50%/80%).
- [ ] Mỗi ý/số chỉ xuất hiện **một lần** trong trang (ưu tiên đặt trong "Số liệu gốc").
- [ ] Không có "KTC 95%" nếu bài không báo CI.
- [ ] Nếu bài nói "lần lặp có tỷ lệ tăng tốc cao nhất là lần đầu", không viết thành "lần lặp nhanh nhất".

## H. Kết quả tự kiểm tra của pipeline

| Bài | Tên bài | Kết luận có | Số liệu khớp | Cờ đỏ lợi ích | Lặp ý | Nhãn | Ghi chú |
|---|---|---|---|---|---|---|---|
| García-López 2010 | PASS | PASS | PASS — 12.4/10.9, 12.3%, p<0.01, d=0.65, 7.9/8.2, 0.157/0.161, 18.6%, 10/50/80%, ICC>0.91 | PASS — patent pending + mới/ít tốn kém | PASS | PASS | 39/39; verification passed, 1 vòng sửa |
| Steves 2016 | PASS | PASS | PASS — 0.174/0.002, 0.362/0.005 | PASS — funding Wellcome/NIHR; không thấy COI | PASS | PASS | 27/27; quan sát, relevance thấp |
| Schoenfeld 2019 | PASS | PASS | PASS — 24/24 generic; p-value 0.02 không bị coi là lặp | PASS — không thấy cờ đỏ | PASS | PASS | RCT 3 nhánh; verification passed sau 2 vòng |
| Schoenfeld 2017 | SKIP | - | - | - | - | - | Không có PDF/OA (Unpaywall is_oa=false) |
| Ralston 2017 | PASS | PASS | PASS — 23/23 generic | PASS — không có tài trợ/COI | PASS | PASS | Meta-analysis; verification passed sau 2 vòng |
| Morton 2018 | PASS | PASS | PASS — 23/23 generic | PASS — không thấy cờ đỏ | PASS | PASS | SR/MA; verification passed 1 vòng; 3 quote audit cảnh báo do dấu "..." |
| Suchomel 2018 | SKIP | — | — | — | — | — | Không có PDF/OA (Unpaywall is_oa=false) |

## Cách chạy

```bash
# 1. Chạy pipeline trên PDF mẫu (có AI key trong .env)
cd server
node tests/fixtures/research-corpus/run-sample.mjs

# 2. Chạy kiểm tra tự động trên golden output
npx vitest run tests/researchSummary.test.js

# 3. Với bài khác: tải PDF hợp pháp, đặt vào thư mục riêng, chạy run-sample với đường dẫn PDF.
```

**Lưu ý:** Không đưa PDF có bản quyền vào repo. Chỉ lưu metadata, DOI và kết quả kiểm tra.
