# UI QA — Research Reader (2026-11-12)

Môi trường: Chrome qua browser MCP, server `localhost:4000`, client `127.0.0.1:5173`, Mongo `pt-brain`.

## Dữ liệu seed

- User: `ui-test@example.com`
- Summary 1: bản verified (`needsReview=false`)
- Summary 2: bản `needsReview=true` để test khoá áp dụng

## Kết quả

| Hạng mục | Kết quả |
|---|---|
| Đăng nhập | PASS |
| Danh sách “Bài đã lưu” hiện `3 trục` thay `Mức x/5` | PASS |
| Bản `needsReview` có badge “Cần đối chiếu” | PASS |
| Cảnh báo đầu trang + nút “Tôi đã đối chiếu PDF gốc” | PASS |
| “Áp dụng vào plan” bị khoá trước khi đối chiếu | PASS |
| Bấm đối chiếu → warning biến mất, nút áp dụng mở | PASS |
| DOI hiển thị `10.1519/JSC.0b013e3181e3482f` | PASS |
| 3 trục bằng chứng (Thiết kế/Độ chắc chắn/Liên quan) | PASS |
| Đủ 9 mục cấu trúc trang | PASS |
| Tooltip thuật ngữ (`abbr[title]`) | 20 tooltip |
| Sơ đồ cơ chế nối tiếp | PASS |
| Markdown export có phụ lục facts + DOI hoa + JSON | PASS |
| PDF export có phụ lục facts, magic bytes `%PDF` | PASS (60.731 bytes) |
| Dark mode | PASS (theme đang dark) |
| Mobile 390px (dashboard + Reader) | PASS — `scrollWidth 375`, không tràn ngang |
| Lighthouse accessibility | 0.91 (lần cuối); đã thêm aria-label cho nút icon, chờ audit lại |
| Lighthouse best-practices | 1.00 |

## Lỗi còn lại

- Lighthouse: `color-contrast` và `link-in-text-block` (link DOI chỉ dựa vào màu). Đã thêm underline cho link DOI và aria-label cho nút icon; cần audit lại. Các text slate nhạt còn lại nên chỉnh nếu cần.
- Mobile 390px: dashboard + Reader `/research` (mở qua link SPA) không tràn ngang (`scrollWidth 375`), có 3 trục và 20 tooltip; PASS. Không dùng `page.goto('/research')` trực tiếp vì Vite/service worker abort khi full reload.
