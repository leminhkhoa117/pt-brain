# Research Finder v4 — chỉ đề xuất OA có toàn văn, bỏ tóm tắt abstract, thay Sci-Hub bằng nguồn hợp pháp

> Ngày: 25/11/2026  
> Cập nhật triển khai: 26/11/2026  
> Trạng thái: **đã triển khai đầy đủ Phase 1–6**  
> Phạm vi: Finder, Reader, Library, pipeline lấy full text

## 1. Tóm tắt điều hành

Ba thay đổi chính:

1. **Finder chỉ trả bài open access đã xác minh và có đường đọc toàn văn thật** (PMC XML, PDF trực tiếp, hoặc HTML OA). Bài không OA bị loại ở server, không còn là tuỳ chọn bật/tắt trên UI.
2. **Bỏ toàn bộ tóm tắt/tổng hợp dựa trên abstract.** Finder không gọi AI để viết `viSummary` hay `synthesis` nữa. Reader từ chối tạo bản tóm tắt nếu chỉ có abstract; chỉ nhận toàn văn hoặc PDF người dùng tải lên.
3. **Không tích hợp Sci-Hub.** `sci-hub.reatk.com` là mirror/nhái giao diện Sci-Hub, không phải nguồn open access và phân phối PDF không có phép. Thay vào đó là chuỗi tìm PDF hợp pháp + quy trình yêu cầu bản quyền.

Kết quả kỳ vọng:

- Danh sách ngắn hơn nhưng bài nào bấm vào cũng đọc được toàn văn.
- Không còn câu kiểu “abstract không nêu” trong bản tóm tắt.
- Giảm 2 call AI mỗi lần tìm, giảm chi phí và thời gian chờ.
- Không đưa app vào rủi ro bản quyền, malware hay mirror chết domain.

## 2. Hiện trạng code

| Thành phần | Hành vi hiện tại | Vấn đề |
|---|---|---|
| `server/src/services/research/finder.js` | Tìm 4 nguồn, gộp, làm giàu OA, xếp hạng, gọi `summarizeSearchResults` + `synthesizeAnswer` | Hai call AI chỉ dựa trên abstract; không kiểm tra full text trước khi trả |
| `server/src/services/research/ranker.js` | `openAccessOnly` và `fullTextOnly` chỉ lọc khi được truyền `true` | Mặc định UI để `false` nên bài non-OA vẫn xuất hiện |
| `client/src/pages/FinderPage.jsx` | Hai checkbox “Chỉ open access” và “Chỉ bài có toàn văn/PDF”, mặc định tắt | Trái với yêu cầu “không đề xuất non-OA nữa” |
| `server/src/services/research/oaCandidates.js` | Batch OpenAlex cho tối đa 50 DOI; Unpaywall chỉ dùng khi Reader mở bài | Finder có thể không biết DOI đó thật sự OA hay chỉ có landing page |
| `server/src/services/research/fullText.js` | `hasFullText` chỉ tính PMC XML + PDF trực tiếp; landing page chỉ là `hasFullTextLink` | Đúng hướng nhưng chưa được dùng làm điều kiện bắt buộc |
| `server/src/services/research/metadata.js` | `resolveWorkByDoi` fallback `paper.abstract`; trả `basedOn: abstract_only` | Reader vẫn tạo Summary từ abstract |
| `server/src/services/research/reader.js` | `createSummaryForUser` nhận mọi `basedOn` | Không chặn abstract-only |
| `client/src/components/research/SummaryView.jsx` | Có cảnh báo “Chỉ dựa trên abstract” | Cảnh báo nhưng vẫn cho đọc/áp dụng; không giải quyết gốc |
| Sci-Hub | Không có trong code | Không nên thêm |

## 3. Định nghĩa “bài đủ điều kiện”

Open access **không đồng nghĩa** với “có PDF miễn phí”. Cần tách rõ:

| Hạng | Điều kiện | Có hiển thị mặc định? |
|---|---|---|
| A. OA + toàn văn xác minh | `is_oa=true` từ Unpaywall/OpenAlex/Europe PMC **và** có PMC XML, PDF trực tiếp, hoặc HTML OA đọc được | **Có** |
| B. OA nhưng chỉ có landing page | `is_oa=true` nhưng không có PDF/PMC, chưa chắc landing chứa toàn văn | **Không** (tránh biến thành abstract-only) |
| C. Free-to-read (bronze) | Unpaywall `oa_status=bronze`: đọc được trên publisher nhưng không có giấy phép mở | **Có, kèm nhãn “Free to read”** — cần xác nhận |
| D. Non-OA / paywall | Không có `is_oa=true` | **Không bao giờ** |
| E. Sci-Hub / mirror | PDF không có phép | **Không bao giờ** |

Quy tắc thực thi:

- `isOpenAccess` chỉ được set từ nguồn xác minh (`Europe PMC isOpenAccess=Y`, OpenAlex `open_access.is_oa`, Unpaywall `is_oa`). Không suy ra từ việc “có `pdfUrl`”.
- `hasFullText` phải là `true` sau khi đã làm giàu metadata. `hasFullTextLink` (landing) không đủ.
- Nếu metadata không chắc, đánh dấu “chưa xác minh” và loại khỏi danh sách mặc định. Không đoán.

## 4. Pipeline Finder mới

```
Câu hỏi
  -> Dịch sang truy vấn học thuật (1 call AI)
  -> Tìm nguồn có bộ lọc OA
  -> Gộp trùng
  -> Xác minh OA (OpenAlex batch + Unpaywall fallback + cache)
  -> Đánh giá full text (PMC XML / PDF / OA HTML)
  -> Chấm liên quan + xếp hạng
  -> Kiểm tra URL top 20 (tuỳ chọn, có cache)
  -> Loại bài không đủ điều kiện
  -> Trả top 8, không gọi AI tóm tắt
```

### 4.1. Lọc ngay tại nguồn

| Nguồn | Bộ lọc đề xuất | Ghi chú |
|---|---|---|
| OpenAlex | `filter=open_access.is_oa:true` | Giảm hẳn bài paywall ngay từ đầu |
| Europe PMC | `AND OPEN_ACCESS:Y` | Chỉ lấy bài OA thật; bài PMC free nhưng không OA sẽ bị loại |
| PubMed | `AND "free full text"[sb]` | Chỉ là bộ lọc khám phá; vẫn phải xác minh lại |
| Crossref | Không có cờ OA đáng tin | Giữ để khám phá DOI, sau đó Unpaywall xác minh; bài không OA sẽ bị loại |

Không hy sinh độ chính xác để giữ số lượng. Nếu một truy vấn trả về ít bài, UI giải thích và gợi ý mở năm/mức bằng chứng, không tự thêm bài non-OA.

### 4.2. Xác minh OA

Mở rộng `enrichFullTextAvailability`:

1. Batch OpenAlex theo DOI (đã có) lấy `open_access`, `best_oa_location`, toàn bộ `locations`, `ids.pmcid`.
2. Với DOI còn thiếu cờ OA hoặc thiếu PDF, gọi Unpaywall theo DOI (tối đa 30 DOI, concurrency 5, timeout ngắn).
3. Lưu kết quả vào cache `OaVerification` (xem 7.2) để lần tìm sau không gọi lại.
4. Chỉ coi là ứng viên khi `is_oa=true` và có ít nhất một đường đọc toàn văn.

Nếu Unpaywall lỗi hoặc hết quota: bài đó bị coi là “chưa xác minh” và bị loại, không fallback sang abstract.

### 4.3. Kiểm tra full text trước khi trả

`assessFullText` đã phân biệt PMC/PDF/landing/abstract. Bổ sung:

- `oa_html` cho landing page OA (Europe PMC/PMC, MDPI, Frontiers, BMJ OA, Springer OA, Wiley OA, Taylor & Francis OA...) khi HTML có cấu trúc toàn văn (Methods/Results/Discussion) chứ không chỉ abstract. *Đã bật trong Phase 5: chỉ nhận sau khi probe xác minh HTML ≥ 5.000 ký tự, có Discussion hoặc cấu trúc toàn văn rõ ràng, và không có dấu hiệu paywall.*
- Với PDF: kiểm tra magic bytes `%PDF` và kích thước tối thiểu (ví dụ > 20 KB) trước khi coi là đọc được.
- Với HTML: yêu cầu text >= 5.000 ký tự và có ít nhất 2 mục toàn văn; trang chỉ có abstract bị loại.

Tuỳ chọn “probe” (khuyến nghị cho production):

- Chỉ probe tối đa 20 ứng viên sau khi xếp hạng, trước khi cắt top 8.
- `HEAD` hoặc `GET Range: bytes=0-65535`, timeout 3 giây, concurrency 5.
- Cache theo `doi + url` trong 7 ngày.
- Probe lỗi => loại khỏi danh sách hoặc hạ xuống nhóm “chưa xác minh”, không hiển thị như bài đọc được.

### 4.4. Xếp hạng

- Bỏ trọng số `openAccess` khỏi `scoreResult` vì mọi bài đều OA; trọng số này không còn tác dụng phân biệt.
- Giữ liên quan chủ đề, mức bằng chứng, độ mới, trích dẫn.
- Có thể thêm điểm nhỏ cho “có PDF trực tiếp” so với “chỉ PMC XML” để ưu tiên bài dễ đọc, nhưng không cần thiết.

### 4.5. Response contract

`POST /api/research/search`:

- Bỏ `results[].viSummary`.
- Bỏ `synthesis` (hoặc trả chuỗi rỗng để tương thích client cũ, nhưng UI mới không hiển thị).
- Thêm:
  ```json
  {
    "policy": "oa_fulltext",
    "access": {
      "isOa": true,
      "oaStatus": "gold",
      "license": "cc-by",
      "fullTextSource": "pdf",
      "pdfUrl": "https://...",
      "landingUrl": "https://...",
      "verifiedAt": "2026-11-25T..."
    },
    "dropped": { "notOa": 12, "noFullText": 7 }
  }
  ```
- `filters` trả về `openAccessOnly: true`, `fullTextOnly: true` để lịch sử tìm kiếm cũ hiển thị đúng.
- Giữ `abstract` gốc để người dùng sàng lọc; đây không phải bản tóm tắt AI.

## 5. Bỏ tóm tắt abstract

### 5.1. Finder

- Xoá import và lời gọi `summarizeSearchResults`, `synthesizeAnswer` trong `finder.js`.
- Xoá stage “AI đang viết mô tả và tổng hợp bằng chứng” trong `FinderPage`.
- Xoá card “Tổng hợp tiếng Việt” và phần `viSummary` trên card kết quả.
- Giữ abstract gốc trong khối thu gọn, đổi nhãn thành “Abstract gốc (chỉ để sàng lọc)”.
- AI quota của Finder chỉ còn 1 call dịch truy vấn; cập nhật text “AI hôm nay” nếu cần.

### 5.2. Reader

- `createSummaryForUser` kiểm tra `resolved.basedOn === 'fulltext'`; nếu không, trả:
  ```json
  {
    "code": "FULLTEXT_REQUIRED",
    "message": "Bài này không có toàn văn OA đọc được. Hệ thống không tóm tắt từ abstract.",
    "details": { "doi": "...", "title": "...", "publisherUrl": "..." }
  }
  ```
- Chặn trước khi tạo Summary và trước khi trừ quota summarize.
- `retrySummaryForUser`: nếu Summary cũ có `basedOn=abstract_only`, trả 422 và hướng dẫn tải PDF/link OA; không chạy lại.
- `resolveWorkByDoi` / `resolveWorkByPmid`: vẫn có thể trả metadata để hiển thị lỗi, nhưng không trả `text=abstract` như một nguồn tóm tắt hợp lệ. Cách gọn nhất: sau khi hết candidate full text, ném `FULLTEXT_REQUIRED` kèm metadata.
- `resolveWorkByUrl`: chỉ nhận PDF, hoặc HTML có tín hiệu toàn văn rõ; trang abstract/paywall bị từ chối.
- Nhập text tay: yêu cầu >= 5.000 ký tự và người dùng xác nhận “đây là toàn văn”; dưới ngưỡng trả `FULLTEXT_REQUIRED`.

### 5.3. Bản tóm tắt cũ

Không xoá dữ liệu người dùng tự động.

- Library và SummaryView giữ badge “Abstract” nhưng đổi thành “Bản cũ — chỉ abstract”.
- Banner trong Reader: “Bản này được tạo trước khi áp dụng chính sách toàn văn. Không thể tạo lại từ abstract; hãy mở PDF/link OA hoặc tải PDF.”
- Thêm tuỳ chọn “Xoá tất cả bản chỉ abstract” trong Library (có xác nhận), hoặc API `DELETE /api/summaries?basedOn=abstract_only`.
- Không cho “Áp dụng vào plan” với bản abstract-only; hiện đã có cơ chế `needsReview`, nhưng cần chặn cả trường hợp đã review.

### 5.4. Tổng hợp toàn văn (tuỳ chọn giai đoạn sau)

Nếu vẫn cần câu trả lời tổng hợp:

- Chỉ chạy khi người dùng bấm “Tổng hợp các bài đã tóm tắt”.
- Dùng nội dung từ các Summary `basedOn=fulltext` đã có, không đọc abstract.
- Ghi rõ “Tổng hợp từ toàn văn của N bài đã tóm tắt”, trích dẫn `[n]`.
- Không chạy tự động trong mỗi lần tìm.

## 6. Sci-Hub: kết luận và phương án thay thế

### 6.1. Kết quả kiểm tra

- `https://sci-hub.reatk.com/` hiển thị đúng giao diện Sci-Hub, danh sách mirror và số liệu kho bài.
- Đây **không phải** nguồn open access. Sci-Hub phân phối PDF có bản quyền mà không có phép của nhà xuất bản/tác giả.
- Domain `reatk.com` không nằm trong danh sách mirror mà chính trang đó liệt kê; đây là mirror/nhái, có thể đổi chủ, chèn quảng cáo, phishing hoặc phát tán PDF độc hại.
- Kể cả mirror “chính thức” cũng bị tranh chấp pháp lý và thường xuyên bị chặn/đổi domain.

### 6.2. Vì sao không tích hợp

1. **Pháp lý:** tự động tải/phân phối PDF không có phép là hành vi xâm phạm bản quyền; có thể bị yêu cầu gỡ, chặn domain, hoặc chịu trách nhiệm.
2. **Bảo mật:** PDF từ mirror không kiểm chứng được; có thể chứa mã độc, link phishing, hoặc lừa nhập thông tin.
3. **Ổn định:** domain biến mất liên tục; scraper sẽ hỏng và tạo SSRF/redirect risk.
4. **Chất lượng:** không có metadata/license tin cậy; không thể xác minh phiên bản, retraction, hay quyền sử dụng.
5. **Uy tín:** app y tế/sức khoẻ dùng nguồn lậu là rủi ro lớn với người dùng và đối tác.

**Quyết định:** không thêm Sci-Hub vào code, không gọi network tới domain này, không đưa link tải trực tiếp.

### 6.3. Chuỗi tìm PDF hợp pháp thay thế

Thứ tự ưu tiên (tái sử dụng phần lớn code hiện có):

1. **Europe PMC / PMC** — `fullTextXML` cho bài OA có PMCID.
2. **OpenAlex** — `best_oa_location` + toàn bộ `locations` (PDF trước, landing sau).
3. **Unpaywall** — `best_oa_location`, `oa_locations`, `oa_status`, `license`.
4. **Semantic Scholar** — `openAccessPdf` (nguồn cuối, rate limit thấp).
5. **Preprint servers** — arXiv, bioRxiv, medRxiv, ChemRxiv theo DOI/tiền tố.
6. **Repository** — CORE/BASE/DOAJ nếu cấu hình API key; tìm bản tác giả (green OA).
7. **Publisher OA** — nếu Unpaywall báo gold/hybrid/diamond.
8. **Yêu cầu hợp pháp** — thư viện/ILL, email tác giả, ResearchGate/Google Scholar “all versions”.

### 6.4. UX khi không tìm được PDF

Trong Finder/Reader, thay vì im lặng hoặc fallback abstract:

- Nút **“Tìm bản PDF hợp pháp”**: chạy lại chuỗi trên và hiển thị danh sách ứng viên kèm nhãn nguồn, license, lần kiểm tra cuối.
- Nút **“Nhờ tác giả gửi bản”**: mở `mailto:` với mẫu thư có tiêu đề, DOI, tên tác giả; người dùng chỉ cần bấm gửi.
- Nút **“Mở trang nhà xuất bản”**: link DOI/landing để dùng quyền truy cập của trường/thư viện.
- Nút **“Tải PDF của tôi”**: upload PDF hợp pháp đã có; Reader xử lý như `user_pdf`.
- Ghi rõ: “Không tìm thấy bản OA. Hệ thống không tải từ Sci-Hub.”

Mẫu thư:

```
Tiêu đề: Request for full-text copy: <title>

Kính gửi <author>,

Tôi đang nghiên cứu về <topic> và rất quan tâm đến bài:
<title>, <journal>, <year>, DOI: <doi>.

Nếu thuận tiện, anh/chị có thể gửi cho tôi bản PDF của bài báo?
Tôi sẽ sử dụng cho mục đích nghiên cứu cá nhân và trích dẫn đầy đủ.

Trân trọng,
<name>
```

## 7. Thay đổi kỹ thuật

### 7.1. File chính

| File | Thay đổi |
|---|---|
| `server/src/services/research/finder.js` | Bỏ 2 call AI; luôn truyền policy OA+fulltext; trả `access`, `dropped` |
| `server/src/services/research/ranker.js` | Thêm bộ lọc eligibility; bỏ trọng số OA; test lại |
| `server/src/services/research/oaCandidates.js` | Thêm Unpaywall fallback, cache, license, `oa_html` |
| `server/src/services/research/fullText.js` | Thêm `oa_html`; kiểm tra chặt HTML/PDF |
| `server/src/services/research/metadata.js` | Không fallback abstract cho Reader; ném `FULLTEXT_REQUIRED` kèm metadata |
| `server/src/services/research/reader.js` | Chặn `abstract_only` ở create/retry; nhập text >= 5.000 |
| `server/src/validation/research.js` | Giữ field cũ để tương thích nhưng server ép `true`; thêm policy |
| `server/src/controllers/summaryController.js` | Trả lỗi `FULLTEXT_REQUIRED` có cấu trúc; thêm API fulltext candidates |
| `server/src/models/OaVerification.js` | Mới: cache xác minh OA/probe |
| `client/src/pages/FinderPage.jsx` | Bỏ checkbox OA/fulltext; bỏ synthesis/viSummary; thêm badge + nút PDF |
| `client/src/components/research/SummaryView.jsx` | Banner bản cũ; chặn áp dụng; nút tìm PDF hợp pháp |
| `client/src/pages/LibraryPage.jsx` | Badge “Bản cũ — chỉ abstract”; bulk delete tuỳ chọn |
| `docs/*` | Cập nhật tài liệu pipeline và QA |

### 7.2. Cache `OaVerification`

```js
{
  doi: String,            // lowercase, unique
  isOa: Boolean,
  oaStatus: String,       // gold | hybrid | green | bronze | diamond | closed
  license: String,
  pdfUrl: String,
  landingUrl: String,
  pmcid: String,
  fullTextSource: String, // pmc_xml | pdf | oa_html | none
  probe: { ok: Boolean, contentType: String, checkedAt: Date },
  verifiedAt: Date,
  expiresAt: Date         // TTL index
}
```

TTL:

- Kết quả dương: 7 ngày.
- Kết quả âm: 24 giờ (để bài mới lên OA vẫn được phát hiện).
- Probe lỗi: 6 giờ.

### 7.3. API mới

`GET /api/research/fulltext?doi=...`

Trả về:

```json
{
  "doi": "...",
  "isOa": true,
  "oaStatus": "green",
  "license": "cc-by-nc",
  "candidates": [
    { "source": "europepmc", "kind": "pmc_xml", "url": "...", "label": "Toàn văn PMC" },
    { "source": "unpaywall", "kind": "pdf", "url": "...", "label": "PDF từ repository" }
  ],
  "checkedAt": "..."
}
```

Dùng cho nút “Tìm bản PDF hợp pháp” và cho màn hình lỗi của Reader. Không trả hay gọi Sci-Hub.

### 7.4. UI Finder

- Bỏ 2 checkbox; thay bằng khối chính sách:
  > “Chỉ hiển thị bài open access có toàn văn đọc được. Bài không OA hoặc chỉ có abstract bị loại.”
- Nút tìm đổi thành “Tìm bài OA”.
- Card kết quả:
  - Badge `OA · gold` / `Free to read · bronze` / `Bản tác giả · green`.
  - Badge `Toàn văn PMC` hoặc `PDF OA`.
  - Nút `Đọc toàn văn & tóm tắt` (chỉ bật khi đủ điều kiện).
  - Link `PDF`, `PMC`, `DOI`.
  - Abstract gốc thu gọn.
- Empty state:
  - “Không có bài OA+toàn văn khớp bộ lọc.”
  - Gợi ý mở năm/mức bằng chứng, đổi từ khoá, tìm preprint, nhờ tác giả, tải PDF.

### 7.5. UI Reader

- Nếu `FULLTEXT_REQUIRED`: hiển thị card lỗi thân thiện, không phải màn hình trắng.
- Nút “Tìm bản PDF hợp pháp” mở danh sách candidate.
- Nút “Nhờ tác giả” copy/mở mailto.
- Nút “Tải PDF của tôi”.
- Với Summary cũ `abstract_only`: banner và khoá áp dụng.

### 7.6. API tổng hợp toàn văn

`POST /api/research/synthesize`

```json
{
  "question": "Có mâu thuẫn nào về volume tập và hypertrophy không?",
  "summaryIds": ["<summaryId fulltext>", "<summaryId fulltext>"]
}
```

- Chỉ nhận Summary `status=ready`, `basedOn=fulltext`, thuộc user hiện tại.
- Tối đa 8 bản; trả `answer` có trích dẫn `[n]`, `papers`, `usage`, `quota`.
- Không nhận abstract-only; nếu không có bản fulltext nào trả `NO_FULLTEXT_SUMMARIES`.

### 7.7. Dọn bản abstract cũ

`DELETE /api/summaries/abstract-only`

- Xoá toàn bộ Summary `basedOn=abstract_only` của user.
- Giữ nguyên Summary fulltext; trả `{ deleted }`.
- UI Thư viện có nút “Dọn bản abstract” kèm xác nhận.

## 8. Test và tiêu chí nghiệm thu

### 8.1. Unit

- `rankResults` loại bài `isOpenAccess=false`.
- `rankResults` loại bài OA nhưng chỉ có landing/abstract.
- `assessFullText` nhận PMC, PDF, `oa_html`; từ chối landing/abstract.
- `resolveWorkByDoi` với bài non-OA ném `FULLTEXT_REQUIRED`, không trả abstract.
- `createSummaryForUser` với `basedOn=abstract_only` trả 422 trước khi tạo Summary.
- `retrySummaryForUser` với bản abstract-only trả 422.
- Finder response không còn `viSummary`, `synthesis`; có `access`, `dropped`, `policy`.

### 8.2. API integration

Mock OpenAlex/Unpaywall/Europe PMC:

- Bài A: OA + PDF => có trong kết quả.
- Bài B: OA + PMCID => có trong kết quả.
- Bài C: non-OA => không có.
- Bài D: OA nhưng chỉ landing => không có.
- Bài E: bronze + PDF => có, nhãn “Free to read”.
- Assert số call AI của Finder chỉ còn 1 (dịch truy vấn).

### 8.3. Bộ dữ liệu kiểm tra

Dùng lại `server/tests/fixtures/research-corpus/` và thêm:

- Schoenfeld 2019 (PMC OA) — kỳ vọng pass.
- Ralston 2017 (Springer OA) — pass.
- Morton 2018 (BJSM OA) — pass.
- Schoenfeld 2017 (non-OA) — không xuất hiện.
- Suchomel 2018 (non-OA) — không xuất hiện.
- Một bài chỉ có abstract — không xuất hiện.

### 8.4. Tiêu chí nghiệm thu

- 20 truy vấn mẫu: **0 bài non-OA** trong kết quả.
- 100% kết quả có `pdfUrl` hoặc PMCID/`oa_html`.
- Bấm “Đọc toàn văn & tóm tắt” trên 20 kết quả ngẫu nhiên: >= 90% mở được toàn văn (không fallback abstract).
- Không còn `viSummary`/`synthesis` trong response mới.
- Reader trả `FULLTEXT_REQUIRED` rõ ràng cho bài non-OA.
- Không có request nào tới `sci-hub.*` trong log/network.
- Toàn bộ test cũ pass sau khi cập nhật test kỳ vọng.

## 9. Lộ trình triển khai

| Giai đoạn | Nội dung | Ước lượng |
|---|---|---|
| 0. Chốt quyết định | Bronze OA, bỏ synthesis, xử lý bản cũ, có probe hay không | 0,5 ngày |
| 1. Backend Finder | OA filters, Unpaywall fallback, eligibility, bỏ 2 call AI, cache | 1,5–2 ngày |
| 2. Backend Reader | `FULLTEXT_REQUIRED`, chặn abstract-only, API fulltext candidates | 1 ngày |
| 3. UI | Finder, Reader, Library, empty state, nút hợp pháp | 1,5–2 ngày |
| 4. Test & QA | Unit/API/E2E, corpus 20 truy vấn, đo tỉ lệ mở được | 1–1,5 ngày |
| 5. Probe | HEAD/Range, cache, giảm false positive, nhận `oa_html` | **đã làm** |
| 6. Tổng hợp toàn văn | Chỉ chạy theo yêu cầu, dùng Summary fulltext | **đã làm** |

Tổng bắt buộc: khoảng **5–7 ngày làm việc**. Đã ship toàn bộ Phase 1–6; probe và synthesis hoàn thành ngày 26/11/2026.

## 10. Rủi ro và cách giảm

| Rủi ro | Ảnh hưởng | Giảm thiểu |
|---|---|---|
| Recall giảm mạnh vì lọc OA | Người dùng thấy ít bài | Lọc OA tại nguồn + Unpaywall + preprint/repository; empty state gợi ý; không hạ chuẩn |
| Metadata OA sai | Card báo PDF nhưng mở không được | Probe top 20 + cache; Reader xác minh lại; báo lỗi rõ |
| Unpaywall rate limit | Thiếu xác minh | Cache, chỉ gọi DOI chưa rõ, concurrency thấp, timeout ngắn |
| Bài bronze không có license mở | Lưu full text có thể sai | Chỉ lưu cho người dùng, không chia sẻ; hiển thị nhãn; hoặc loại bronze nếu chọn strict |
| Bản cũ abstract-only | Người dùng vẫn đọc | Badge, banner, khoá áp dụng, bulk delete |
| Sci-Hub bị yêu cầu thêm lại | Rủi ro pháp lý | Giữ quyết định “không tích hợp”; tài liệu hoá lý do |
| AI summary bị xoá làm thiếu câu trả lời | UX hụt | Thêm “Tổng hợp từ toàn văn” theo yêu cầu ở giai đoạn 6 |

## 11. Quyết định cần xác nhận

1. **Bronze OA**: có hiển thị bài `bronze` (free-to-read, không license mở) không?  
   *Đề xuất: có, kèm nhãn “Free to read”, vì mục tiêu là đọc được toàn văn.*
2. **Bỏ hoàn toàn tổng hợp ở Finder**: có cần giữ một câu trả lời tổng hợp không?  
   *Đề xuất: bỏ; chỉ thêm tổng hợp từ toàn văn khi người dùng bấm, ở giai đoạn sau.*
3. **Bản tóm tắt abstract cũ**: giữ để đọc hay xoá hàng loạt?  
   *Đề xuất: giữ + badge “Bản cũ — chỉ abstract”, thêm nút xoá có xác nhận; không tự xoá.*
4. **Probe URL**: có chấp nhận thêm 2–5 giây mỗi tìm để đảm bảo PDF mở được không?  
   *Đề xuất: có, nhưng chỉ probe top 20 và cache 7 ngày.*
5. **Sci-Hub**: xác nhận chỉ dùng nguồn hợp pháp.  
   *Đề xuất: không tích hợp Sci-Hub dưới bất kỳ hình thức tự động nào.*

## 12. Trạng thái triển khai (26/11/2026)

Đã làm:

- Finder ép `openAccessOnly + fullTextOnly` ở server, không phụ thuộc checkbox client.
- Lọc OA ngay tại OpenAlex, Europe PMC, PubMed; Crossref chỉ còn vai trò khám phá.
- Thêm `accessPolicy.js`: xác minh OA, eligibility, đếm bài bị loại.
- `enrichFullTextAvailability`: batch OpenAlex + Unpaywall fallback + cache `OaVerification` (7 ngày/24 giờ).
- Bỏ 2 call AI `summarizeSearchResults` / `synthesizeAnswer` khỏi Finder; response không còn `viSummary`, `synthesis` rỗng.
- Reader chặn abstract-only bằng `FULLTEXT_REQUIRED`; text tay phải >= 5.000 ký tự; URL HTML phải >= 5.000 ký tự.
- Chặn `retry`, `review`, `apply-to-plan` với Summary cũ `abstract_only`.
- Thêm `GET /api/research/fulltext?doi=...` trả các nguồn PDF/PMC hợp pháp.
- UI Finder: bỏ checkbox, thêm badge OA/Free-to-read, nút PDF/PMC, bỏ card tổng hợp abstract.
- UI Reader: card `FullTextHelp` với tìm PDF hợp pháp, mở publisher, mailto tác giả, tải PDF.
- UI Library/SummaryView: badge “Chỉ abstract”, khoá áp dụng, ẩn tạo lại.
- Test: thêm `researchAccess.test.js`, `finderAccess.test.js`, `probe.test.js`, `probeFetch.test.js`, `synthesize.test.js`; cập nhật `resumeJob.test.js`. Toàn bộ 384 test pass, lint/build pass.
- **Phase 5**: thêm `probe.js` + `probeUrl` trong `http.js`; probe top 20, cache 6 giờ; nhận `oa_html` nếu HTML ≥ 5.000 ký tự và có ít nhất 2 mục Methods/Results/Discussion, loại trang paywall/abstract.
- **Phase 6**: thêm `POST /api/research/synthesize` và card **Tổng hợp từ toàn văn** trong Thư viện; chỉ dùng Summary `basedOn=fulltext`, tối đa 8 bản, có trích dẫn `[n]`.
- **Dọn dữ liệu**: thêm `DELETE /api/summaries/abstract-only` và nút “Dọn bản abstract” trong Thư viện; chỉ xoá `abstract_only`, giữ fulltext.
- Cập nhật quota AI thêm kind `synthesize`, hiển thị trong Cài đặt.

Không còn hạng mục bắt buộc nào trong kế hoạch này.

## 13. Kết luận

Phương án tốt nhất không phải là “thêm Sci-Hub để có nhiều PDF”, mà là:

- **Lọc đúng ngay từ đầu**: chỉ bài OA đã xác minh + có toàn văn.
- **Không tóm tắt abstract**: Reader chỉ tóm tắt khi có toàn văn.
- **Tìm PDF hợp pháp**: PMC, Unpaywall, OpenAlex, repository, preprint, thư viện, tác giả.
- **Nói thật với người dùng** khi không có bản OA, thay vì đưa một bản tóm tắt vô nghĩa hoặc một PDF lậu.
