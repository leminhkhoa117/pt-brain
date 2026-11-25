# Research Reader — vì sao có bài open access nhưng chỉ tóm tắt abstract

> Ngày: 25/11/2026  
> Ví dụ: `https://www.biorxiv.org/content/10.64898/2026.10.24.761369v1`

## 1. Triệu chứng

- Bài có PDF/full text open access.
- Reader vẫn trả `basedOn: abstract_only` / `sourceKind: abstract`.
- AI chỉ tóm tắt abstract dù PDF tồn tại.

## 2. Nguyên nhân đã tìm ra

### 2.1. Link bioRxiv có hậu tố version

`parseIdentifier` lấy nguyên DOI gồm `v1`:

```
10.64898/2026.10.24.761369v1
```

DOI thật không có `v1`, nên Crossref/OpenAlex/Europe PMC trả 404 và reader không mở được bài.

**Sửa:** `normalizeDoi` bỏ `vN` cho DOI `10.64898/...` (bioRxiv) và `10.1101/...` (bioRxiv/medRxiv cũ). `parseIdentifier` nhờ đó trả DOI sạch.

### 2.2. Cloudflare chặn Node fetch nhưng cho curl

bioRxiv trả `429` cho request từ Node/undici (TLS fingerprint), trong khi cùng URL tải được bằng `curl` với browser UA. Vì vậy:

- `resolveWorkByDoi` thử HTML/PDF bằng `fetchBuffer` → 429.
- `fetchFirstReadablePdf` thử PDF → 429.
- Hết candidate → fallback `paper.abstract`.

**Sửa:**

- Thêm `server/src/utils/curlFetch.js`: fallback `curl` cho host `biorxiv.org`/`medrxiv.org` khi Node trả 403/429.
- `pdfFetch.downloadPdf` dùng fallback này.
- `resolveWorkByDoi` đưa `paper.pdfUrl` lên đầu danh sách candidate, trước OpenAlex/Unpaywall.
- Giới hạn an toàn: chỉ host preprint, chỉ https, giới hạn redirect/time/dung lượng, kiểm tra SSRF ở URL đầu và URL cuối.

### 2.3. Landing page bị nhận nhầm là full text

Nếu chỉ tải trang landing (abstract + metadata) và text > 800 ký tự, code cũ có thể đánh dấu `open_access_fulltext` dù chỉ có abstract.

**Sửa:** khi đã biết `paper.pdfUrl`, HTML landing phải ≥ 5000 ký tự mới được nhận là full text; ưu tiên PDF. Với bài bioRxiv, PDF là nguồn đúng.

## 3. Kết quả kiểm tra

Trước khi sửa:

```
resolveWorkByUrl -> 404 PAPER_NOT_FOUND
resolveWorkByDoi(clean) -> basedOn: abstract_only, textLen: 1589
```

Sau khi sửa:

```
resolveWorkByUrl -> basedOn: fulltext, sourceKind: open_access_fulltext, textLen: 92951
resolveWorkByDoi(clean) -> fulltext, 92951 ký tự
resolveWorkByDoi(with v1) -> fulltext, 92951 ký tự
```

Test: `identifier.test.js` (6 test) + full suite 358 pass.

## 4. Lưu ý vận hành

- Fallback full text bioRxiv/medRxiv cần **curl** trên máy chủ. Nếu host không có curl, reader vẫn fallback abstract như trước (không crash).
- Chỉ dùng curl cho host preprint; không mở rộng cho mọi URL để giữ bề mặt SSRF nhỏ.
- Nếu Cloudflare đổi hành vi hoặc curl cũng bị chặn, cần thêm proxy/reader service có kiểm soát.
