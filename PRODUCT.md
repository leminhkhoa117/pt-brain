# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

PT / huấn luyện viên đang hành nghề hoặc tự huấn luyện, và học viên của họ. PT mở app khi cần tra cứu bằng chứng, tính chỉ số, soạn giáo án và thực đơn; học viên đăng nhập để xem plan, log bữa ăn / buổi tập và theo dõi tiến độ. PT thường làm việc trên desktop; học viên log trên điện thoại tại phòng gym.

## Product Purpose

Một nơi duy nhất cho huấn luyện dựa trên bằng chứng: tìm và tóm tắt nghiên cứu thật, tính chỉ số cơ thể, lên giáo án và thực đơn, rồi log lại để thấy tiến độ. Thành công là PT trả lời được câu hỏi chuyên môn bằng nguồn thật và ra plan nhanh, còn học viên log đều và hiểu mình đang đi đâu.

## Positioning

Kết hợp research có nguồn (PubMed, Europe PMC, OpenAlex), calculator lâm sàng và plan generator trong cùng một công cụ tiếng Việt dành cho PT — điều một app gym hoặc một app ghi chú đơn lẻ không làm được. AI chỉ chạy ở backend, giữ nguyên số liệu và trích dẫn.

## Operating Context

PT dùng desktop khi đọc nghiên cứu, soạn giáo án, đánh giá plan; dùng điện thoại khi đứng lớp hoặc log nhanh. Học viên dùng điện thoại là chính. Thuật ngữ chuyên ngành được giữ song ngữ Việt–Anh (1RM, RIR, TDEE, FFMI). Dữ liệu cơ thể là dữ liệu nhạy cảm. Mọi chỉ số chỉ mang tính ước lượng và không thay thế bác sĩ.

## Capabilities and Constraints

- React 18 + Vite + Tailwind CSS; Express + MongoDB; TanStack Query; Recharts; Three.js cho Human Atlas.
- Research: tìm PubMed / Europe PMC / OpenAlex, tải PDF, tóm tắt song song có trích dẫn.
- Calculators: 1RM, BMR, TDEE, macro, Navy body fat, LBM, FFMI, BMI, HR zones, volume, MA7.
- Training: wizard giáo án, thư viện 105 bài tập, log buổi tập, progressive overload, deload, đánh giá volume theo 59 nhóm cơ.
- Nutrition: meal plan 7 ngày do AI hoặc tự tạo, log bữa ăn bằng ảnh / text, đánh giá plan so với nhu cầu.
- Learning: từ điển, flashcard SM-2, quiz, sổ tay.
- PWA, dark mode, tiếng Việt là ngôn ngữ giao diện chính.
- Không thay đổi API, schema dữ liệu hay hành vi nghiệp vụ trong đợt redesign giao diện này.

## Brand Commitments

- Tên **PT Brain** và logo người chạy trong quỹ đạo nguyên tử trên vòng tròn navy là tài sản đã xác nhận, phải giữ.
- Giọng điệu: điềm tĩnh, chính xác, dựa trên bằng chứng; không hype, không hứa hẹn y tế, không gamification.
- Giao diện tiếng Việt; giữ thuật ngữ chuyên ngành khi cần.
- Dark mode là lựa chọn bắt buộc, không phải tính năng phụ.

## Evidence on Hand

- Tích hợp research thật trong `server/src/services/research/` và `server/src/services/ai/`.
- 147 unit test; 105 bài tập; atlas 59 cơ với 2.234 mesh.
- Calculator và ngưỡng dinh dưỡng nằm trong `shared/calculators/` và `shared/config/nutrition.js`.
- README mô tả đầy đủ tính năng và luồng chạy; không có testimonial, benchmark hay khách hàng thật để trưng dụng.

## Product Principles

1. **Bằng chứng trước, ý kiến sau.** Mọi con số và khuyến nghị phải chỉ ra nguồn hoặc giả định.
2. **Log trong vài giây, review trong vài phút.** Việc nhập liệu nhanh hơn việc trình bày.
3. **Một màn hình, một việc.** Không trộn research, plan và log vào cùng một màn hình.
4. **Điềm tĩnh và chính xác.** Không gamification, không màu mè tranh sự chú ý với dữ liệu.
5. **Người mới hiểu, PT không bị chậm.** Thuật ngữ có chú thích, nhưng thao tác chuyên nghiệp không bị giấu sau wizard.

## Accessibility & Inclusion

Mục tiêu WCAG AA: body text tương phản ≥ 4.5:1, focus-visible rõ, điều khiển dùng được bằng bàn phím, tôn trọng `prefers-reduced-motion`, không dùng màu làm tín hiệu duy nhất.
