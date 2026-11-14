# Quyết định thiết kế — Research Summary Pipeline v3

Trạng thái: **đề xuất, chờ người dùng xác nhận**. Cập nhật ngày 2026-11-12.

| # | Vấn đề | Đề xuất | Lý do | Trạng thái |
|---|---|---|---|---|
| 1 | Gửi thẳng PDF cho model | Giữ parser pdfjs hiểu bố cục cột; chỉ thêm PDF-input nếu provider hỗ trợ `input_file` | API hiện tại là OpenAI-compatible chat completions, chưa có file-input ổn định | Chờ xác nhận |
| 2 | DOI hoa/thường | Hiển thị đúng chữ hoa như checklist (`10.1519/JSC...`) | Người dùng xác nhận muốn đúng chữ hoa | **Đã chốt: có** |
| 3 | Năm công bố | Ưu tiên `published-print`, fallback `issued`/`published-online` | Khớp năm trên bìa tạp chí; tránh online-first lệch 1 năm | **Đã chốt** |
| 4 | Verification fail sau 2 vòng | Vẫn lưu, gắn `needsReview`, khoá "Áp dụng vào plan" cho đến khi người dùng bấm "Đã đối chiếu PDF gốc" | Không chặn đọc/export, nhưng không để dữ liệu chưa kiểm vào giáo án | **Đã chốt** |
| 5 | Chi phí AI | Chấp nhận 2–4 call/bài; nâng quota riêng cho summarize | Pipeline 3 bước + tối đa 2 vòng sửa | Chờ xác nhận |
| 6 | GROBID cho PDF phức tạp | Không thêm | Người dùng xác nhận không cần microservice riêng; giữ parser pdfjs | **Đã chốt: không** |
| 7 | Cache | Cache key gồm `promptVersion`; summary cũ hiển thị "Bản cũ" | Tránh trả summary v2 như v3 | **Đã triển khai** |
| 8 | Lưu facts | Lưu `Summary.facts` để audit/retry; không trả qua API list/get | Cần đối chiếu nhưng không muốn payload nặng | **Đã triển khai** |
| 9 | Retry | Dùng lại `facts` nếu `promptVersion` khớp | Giảm chi phí, tránh trích lại | **Đã triển khai** |
| 10 | Quote audit | Kiểm tra `quote` có trong toàn văn; chỉ cảnh báo, không chặn | Phát hiện facts bịa/paraphrase | **Đã triển khai** |
| 11 | Facts trong export | Thêm phụ lục audit vào Markdown/PDF | Người dùng xác nhận cần đối chiếu | **Đã triển khai** |
| 12 | DOI hiển thị | Upper mã publisher (`JSC`) như checklist | Người dùng xác nhận | **Đã triển khai** |

## Trạng thái corpus (cập nhật)

| Bài | Loại | Nguồn | Kết quả |
|---|---|---|---|
| García-López 2010 | Acute crossover | PDF | 39/39 PASS |
| Steves 2016 | Observational | PDF | 27/27 PASS |
| Schoenfeld 2019 | RCT | OA (PMC) | 24/24 PASS |
| Ralston 2017 | Meta-analysis | OA (Springer) | 23/23 PASS; verification passed sau 2 vòng |
| Morton 2018 | SR/MA | OA (BJSM) | 23/23 PASS; verification passed 1 vòng |
| Schoenfeld 2017 | SR/MA | không OA | bỏ qua |
| Suchomel 2018 | Narrative review | không OA | bỏ qua |

## Việc còn chờ quyết định

- Nâng quota `summarize` bao nhiêu bài/ngày? (hiện `AI_DAILY_LIMIT_PER_USER=30` cho mọi loại call)
- Có cần chặn hoàn toàn summary `verification.passed=false` thay vì chỉ khoá apply không? (đề xuất: không)
- Có cần hiển thị DOI đúng chữ hoa ở mọi nơi (Library, Finder) hay chỉ Reader/export? (đề xuất: mọi nơi)
- Có cần đưa `facts` vào API `getOne` khi người dùng bật chế độ audit không? (đề xuất: chỉ export)
- Có cần chạy browser QA với summary thật trong Mongo không? (đề xuất: có, trước khi rollout)

