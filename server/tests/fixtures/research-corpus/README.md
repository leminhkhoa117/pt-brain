# Research summary test corpus

Bộ kiểm thử cho pipeline tóm tắt nghiên cứu (3 bước: facts → viết cho PT → kiểm tra tự động).

## Thành phần

- `manifest.json` — 7 bài đa loại (RCT, systematic review + meta-analysis, meta-analysis, observational, acute crossover, narrative review) với DOI và kỳ vọng kiểm tra.
- `checklist.md` — checklist cố định dùng cho mọi bài.
- `sample-garcia-lopez-2010.json` — golden output đã chạy qua pipeline, dùng cho regression test.
- `run-sample.mjs` — chạy pipeline trên một PDF bất kỳ (cần `AI_API_KEY` trong `.env`).
- `validate-output.mjs` — kiểm tra nhanh một file summary JSON theo manifest và checklist tự động.

## Chạy

```bash
cd server

# Regression test trên golden output (không cần AI key)
npx vitest run tests/researchSummary.test.js

# Chạy lại pipeline trên PDF mẫu (cần AI key)
node tests/fixtures/research-corpus/run-sample.mjs "D:/duong-dan/paper.pdf" "JSC201360 2449..2455.pdf"
```

## Vì sao không có PDF trong repo

PDF bài báo thường có bản quyền. Chỉ lưu metadata, DOI và kết quả kiểm tra. Khi cần chạy lại, dùng PDF hợp pháp do người dùng cung cấp.

## Thêm bài mới

1. Thêm mục vào `manifest.json` với `doi`, `label`, `expected`.
2. Chạy `run-sample.mjs` với PDF.
3. Đối chiếu `checklist.md`, ghi kết quả vào bảng cuối checklist.
4. Nếu muốn regression test, lưu output vào `sample-<id>.json` và thêm test tương tự `researchSummary.test.js`.
