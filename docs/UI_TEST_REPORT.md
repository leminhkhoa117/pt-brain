# PT Brain — Báo cáo test giao diện

> Ngày: 2026-11-11  
> Môi trường: production build (`client/dist`) do Express phục vụ tại `http://127.0.0.1:4100`, MongoDB local, database tạm `pt-brain-ui-test`.  
> Trình duyệt: Chrome desktop + viewport mobile 390×844.

## Phạm vi đã test

| Khu vực | Luồng đã kiểm tra | Kết quả |
| --- | --- | --- |
| Đăng ký / đăng nhập | Đăng ký, redirect Settings, đăng xuất, đăng nhập lại, refresh token sau khi access token hết hạn | OK |
| Hồ sơ | Lưu giới tính, ngày sinh, chiều cao, cân nặng, mục tiêu, kinh nghiệm, bệnh nền | OK |
| Dashboard | Hiển thị dữ liệu, ghi nhanh cân nặng, MA7, BMI/% mỡ, heatmap, gợi ý việc cần làm | OK |
| Máy tính | 1RM (Epley/Brzycki), lưu lịch sử, Calo & macro, thành phần cơ thể, vùng nhịp tim | OK |
| BodyLog | Load bản ghi hôm nay, lưu cân nặng + số đo + nhịp tim/giấc ngủ, tính % mỡ Navy, FFMI | OK |
| Dinh dưỡng | Chuyển tab, nhập tay món “Phở bò”, lưu bữa, tổng calo/P/C/F cập nhật | OK |
| Giáo án | Tạo nhanh bằng quy tắc với bodyweight-only, preview, cảnh báo slot trống, lưu giáo án, volume; thêm cardio vào ngày Chủ nhật và xem lại trong plan | OK |
| Log buổi tập | Chọn giáo án/ngày, log 12 set bodyweight với tạ trống/0, lưu, xem lịch sử | OK |
| Log cardio | Chạy bộ 3 km/15 phút → 219 kcal (ước tính MET/pace); bơi 40 phút nhập tay 321 kcal; xem tổng calo và chi tiết trong lịch sử | OK |
| Thư viện bài tập | 110 bài, lọc theo nhóm cơ/dụng cụ | OK |
| Thư viện nghiên cứu | 45 bản ghi seed, tải 40 → “Tải thêm” → 45, search “Bài 44” → 1, favorite filter, thêm/xóa tag | OK |
| Reader | Mở bài từ thư viện, xem tóm tắt, bài gốc, ghi chú, chat panel | OK |
| Học tập | Thêm thuật ngữ, tạo flashcard, ôn SM-2, tạo ghi chú | OK |
| Cơ bắp 3D | Trang `/muscles`, canvas Three.js, danh sách 15 hệ cơ quan, tìm kiếm | OK |
| Cài đặt | AI usage card, dark mode, xuất CSV, xóa tài khoản | OK |
| Mobile | Bottom nav, menu drawer, dashboard responsive ở 390×844 | OK |
| PWA | Service worker đăng ký, cache `ptbrain-v5` | OK |
| 404 | Route không tồn tại redirect về `/` | OK |

## Lỗi phát hiện và đã sửa ngay

1. **CSP chặn script dark mode inline**  
   Helmet mặc định `script-src 'self'`; script trong `index.html` bị block.  
   → Chuyển sang `client/public/theme-init.js`, thêm vào app shell, bump cache PWA.

2. **Search thư viện trả sai kết quả**  
   `keepPreviousData` kết hợp `useInfiniteQuery` giữ lại trang cuối của query cũ; tìm “Bài 44” vẫn hiện 5 card cũ.  
   → Bỏ `placeholderData`; query mới thay toàn bộ pages. Đã test lại: 1 kết quả đúng.

3. **Không log được bài bodyweight**  
   Client bắt buộc `weightKg > 0`, nên set kéo xà/hít đất không được tính.  
   → Gắn `equipment` vào suggestions, cho phép tạ trống/0 với bài bodyweight, thêm gợi ý “có thể để tạ trống hoặc 0”. Có API test lưu set tạ 0.

4. **Giáo án bodyweight-only bị trống slot mà không giải thích**  
   → Trả `missingSlots` và hiển thị cảnh báo rõ trong preview/cautions.

5. **Dấu chấm lặp trong giả định bữa ăn**  
   `... từ ảnh..` → bỏ dấu chấm thừa.

6. **ErrorBoundary giữ trạng thái lỗi khi đổi route**  
   → Key theo `location.pathname`, tự reset khi chuyển trang.

## Ghi chú khi test

- Các lỗi console `Unchecked runtime.lastError: Could not establish connection...` đến từ extension của trình duyệt, không phải app.
- `/api/me` trả 401 một lần đầu là bình thường khi access token hết hạn; interceptor gọi `/api/auth/refresh` và phiên tiếp tục.
- Tonnage của buổi bodyweight-only là `0 kg` (đúng theo định nghĩa tonnage = tạ × rep); có thể cải thiện hiển thị “0 kg + tổng rep” trong tương lai.
- Không chạy các luồng tốn quota AI (tóm tắt bài mới, phân tích ảnh, AI meal plan, quiz) để tránh tiêu quota trong lúc test giao diện.
- Tài khoản test đã được xóa qua UI; database test đã được kiểm tra sạch (`users`, `summaries`, `bodyLogs`, `workouts` đều 0) và sẽ được drop.

## Kết quả cuối

```bash
npm run test     # 183/183 pass
npm run lint     # 0 lỗi
npm run build    # thành công
```
