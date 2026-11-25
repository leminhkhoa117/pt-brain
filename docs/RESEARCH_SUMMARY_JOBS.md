# Research Summary Jobs — vì sao job kẹt "Đang xử lý" và cách phục hồi

> Ngày: 25/11/2026  
> Ca thực tế: summary `6b06b863438a78d79df984bb` (PDF 6 trang, 31.824 ký tự)

## 1. Triệu chứng

- Tải PDF lên, AI tóm tắt gần 10 phút vẫn "Đang xử lý...".
- DB ghi `status: processing`, `progress: "Đang trích dữ kiện đoạn 1/1..."`.
- Sau khi lock hết hạn, item vẫn kẹt vĩnh viễn, không có lỗi để bấm "Thử lại".

## 2. Chuỗi nguyên nhân

1. **Server restart giữa lúc job đang chạy.** Job tóm tắt chạy trong RAM; `node --watch`
   restart process làm job biến mất nhưng document vẫn `processing`.
2. **Lock mồ côi còn hạn.** `SummaryJobLock` có TTL 7 phút. Process mới khởi động,
   `resumeInterruptedSummaries()` thấy lock cũ còn hạn nên `continue` — bỏ qua job,
   không chạy lại cũng không đánh dấu lỗi.
3. **Không có cơ chế dọn khi đọc danh sách.** `failIfStale` chỉ chạy ở `getSummary`,
   `retry`, `create`. Library chỉ gọi `list`, mà `list` không kiểm tra stale.
4. **Library không poll.** Item `processing` không bao giờ được refetch, nên kể cả
   job đã chết UI vẫn hiển thị "Đang xử lý".
5. **Timeout quá dài (nguyên nhân phụ).** Fact extraction dùng timeout 6 phút ×
   `retries: 1`, không có timeout tổng cho cả pipeline → một job có thể chạy 20+ phút.

## 3. Cách sửa

### Khởi động lại an toàn

- `clearAllSummaryLocks()` xóa mọi lock còn lại trước khi resume. Job chạy trong RAM
  nên sau restart không có process nào thực sự giữ lock.
- Giả định app chạy **single-instance**. Nếu scale nhiều instance phải thay bằng lock
  có owner + heartbeat.

### Heartbeat và stale

- Trong `runSummaryJob`, heartbeat mỗi **30 giây**:
  - refresh `expiresAt` của lock;
  - cập nhật `updatedAt` của Summary.
- Ngưỡng stale giảm còn **3 phút** không có heartbeat.
- `expireStaleSummariesForUser(userId)` chạy ở `summaryController.list`: job quá hạn
  được đánh dấu `failed` kèm thông báo "Bấm Thử lại", lock được giải phóng.
- Job đang chạy thật không bị đánh dấu nhầm vì heartbeat luôn làm mới `updatedAt`.

### Chặn thời gian chạy

- Timeout mỗi lần trích facts: **3 phút** (trước là 6 phút), vẫn giữ 1 lần retry.
- Timeout tổng cho toàn pipeline: **15 phút**. Quá hạn → `failed` với lỗi rõ ràng,
  không treo "processing".

### Client

- `LibraryPage` dùng `refetchInterval` 5 giây khi còn item `processing`, tự dừng khi
  tất cả đã `ready`/`failed`.

## 4. Kiểm chứng

Ca thật sau khi restart với bản sửa:

```
10:49:34  Đã khôi phục job tóm tắt sau khởi động lại (count: 1)
10:49:41  restart lần cuối, resume lại job
10:52:41  vẫn processing, lock + updatedAt được heartbeat làm mới
10:55:41  progress chuyển "AI đang phân tích..." (đã xong facts, sang bước viết)
11:01:37  status: ready
          model: deepseek-v4.1-flash
          basedOn: fulltext, sourceKind: user_pdf
          tldr + 6 mainResults đã lưu
```

Tổng thời gian chạy lại: **~12 phút**, nằm trong ngưỡng 15 phút.

Test tự động:

- `resumeJob.test.js` thêm 2 ca:
  - resume thành công dù còn lock mồ côi còn hạn;
  - sweep đánh dấu job quá hạn heartbeat là `failed`, không đụng job đang chạy.
- Toàn bộ server: **360 test pass**, lint sạch, client build OK.

## 5. Hành vi người dùng thấy

- Job bình thường: Library tự cập nhật, không cần F5.
- Job bị gián đoạn: sau tối đa ~3 phút item chuyển lỗi kèm nút "Thử lại".
- Job chạy quá 15 phút: fail rõ ràng thay vì treo vô hạn.
- Nếu AI thực sự chậm hơn ngưỡng, có thể tăng `SUMMARY_JOB_TIMEOUT_MS` trong
  `server/src/services/research/reader.js`, nhưng phải giữ heartbeat tương ứng.
