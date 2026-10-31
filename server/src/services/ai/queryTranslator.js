import { z } from 'zod';
import { chatCompletion, parseJsonLoose } from './client.js';
import { ApiError } from '../../utils/ApiError.js';

const translationSchema = z.object({
  queries: z.array(z.string().min(3).max(220)).min(1).max(4),
  mesh: z.array(z.string()).default([]),
});

const SYSTEM = `Bạn là chuyên gia tìm kiếm tài liệu y sinh. Chuyển câu hỏi tiếng Việt của huấn luyện viên thành 2-4 truy vấn tìm kiếm học thuật bằng tiếng Anh.

YÊU CẦU:
- Mỗi truy vấn là cụm từ khóa học thuật, ngắn gọn, dùng thuật ngữ chuẩn (ví dụ: "resistance training volume hypertrophy", "protein intake muscle mass meta-analysis").
- Có thể dùng toán tử Boolean (AND, OR) và MeSH nếu hữu ích.
- Bao phủ các cách diễn đạt khác nhau của cùng câu hỏi, không lặp lại.
- Không thêm bài báo cụ thể, không bịa tên nghiên cứu.
- Trả về CHỈ JSON: {"queries":["..."],"mesh":["..."]}`;

export async function translateQuestion(question) {
  const response = await chatCompletion({
    messages: [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: `Câu hỏi: ${question}\n\nTrả về 2-4 truy vấn tiếng Anh.` },
    ],
    json: true,
    temperature: 0.3,
    maxTokens: 800,
  });

  try {
    const parsed = translationSchema.parse(parseJsonLoose(response.text));
    return { ...parsed, usage: response.usage, model: response.model };
  } catch (error) {
    throw new ApiError(
      502,
      'QUERY_TRANSLATION_FAILED',
      `Không tạo được truy vấn tìm kiếm: ${error.message}`,
    );
  }
}
