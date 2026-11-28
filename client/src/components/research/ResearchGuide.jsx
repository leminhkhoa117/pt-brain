export default function ResearchGuide() {
  return (
    <details className="mt-3 rounded-xl border border-slate-200 p-3 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300">
      <summary className="cursor-pointer font-semibold text-slate-700 dark:text-slate-200">
        Cách tìm nghiên cứu hiệu quả (5 bước)
      </summary>
      <ol className="mt-2 list-decimal space-y-1 pl-5">
        <li>
          <strong>Tách câu hỏi</strong> thành 2–3 khái niệm: đối tượng, can thiệp, kết quả (PICO).
        </li>
        <li>
          <strong>Dịch sang thuật ngữ tiếng Anh</strong>, thêm 2–3 từ đồng nghĩa hoặc viết tắt cho mỗi
          khái niệm.
        </li>
        <li>
          <strong>Ghép truy vấn:</strong>{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
            (&quot;từ đồng nghĩa A&quot; OR &quot;từ đồng nghĩa B&quot;) AND (&quot;C&quot; OR &quot;D&quot;)
          </code>
          .
        </li>
        <li>
          <strong>Chạy 2 lượt:</strong> một lượt rộng (systematic review/meta-analysis) và một lượt
          hẹp (RCT, cơ chế, hiệu suất cấp tính).
        </li>
        <li>
          <strong>Đọc toàn văn</strong> (PMC/PDF open access) để kiểm tra thiết kế, cỡ mẫu và
          population; lưu bài phù hợp vào thư viện. Không tóm tắt chỉ từ abstract.
        </li>
      </ol>
      <p className="mt-2">
        Muốn tổng quan nhanh, chọn mức bằng chứng 1–2 và giới hạn 10 năm gần đây. Muốn tìm kỹ thuật
        cụ thể, đừng giới hạn mức 1–2 vì nhiều nghiên cứu cơ học là narrative review hoặc RCT nhỏ.
      </p>
      <p className="mt-1">
        Ví dụ: <em>“Valsalva maneuver” AND (squat OR deadlift OR “resistance training”)</em>.
      </p>
    </details>
  );
}
