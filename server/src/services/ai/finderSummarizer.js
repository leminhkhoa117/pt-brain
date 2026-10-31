import { z } from 'zod';
import { chatCompletion, parseJsonLoose } from './client.js';
import { truncateText } from '../../utils/text.js';
import { ApiError } from '../../utils/ApiError.js';

const itemSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.coerce.number().int().min(1),
        summary: z.string().min(1),
      }),
    )
    .default([]),
});

/** Viết 2-3 dòng tiếng Việt cho từng kết quả, chỉ dựa trên abstract thật. */
export async function summarizeSearchResults(question, results) {
  const payload = results.map((r, index) => ({
    id: index + 1,
    title: r.title,
    journal: r.journal || '',
    year: r.year || '',
    abstract: truncateText(r.abstract || '', 1200),
  }));

  const system = `Bạn viết mô tả ngắn cho kết quả tìm kiếm nghiên cứu, bằng tiếng Việt.
- Mỗi mô tả 2-3 dòng, chỉ dùng abstract được cung cấp.
- Nêu thiết kế, cỡ mẫu và kết quả chính kèm số liệu nếu có.
- Không bịa bài báo, không thêm kiến thức ngoài.
- Nếu abstract không đủ thông tin, ghi rõ "Abstract không nêu".
- Không dùng dấu ngoặc kép chưa escape trong JSON.
- Trả về CHỈ JSON: {"items":[{"id":1,"summary":"..."}]}`;

  let messages = [
    { role: 'system', content: system },
    {
      role: 'user',
      content: `Câu hỏi của người dùng: ${question}\n\nDanh sách bài:\n${JSON.stringify(payload)}`,
    },
  ];
  const usage = { input: 0, output: 0, cost: 0 };
  let model = '';

  for (let attempt = 0; attempt <= 1; attempt += 1) {
    const response = await chatCompletion({
      messages,
      json: true,
      temperature: 0.2,
      maxTokens: 6000,
    });
    usage.input += response.usage.input;
    usage.output += response.usage.output;
    usage.cost += response.usage.cost;
    model = response.model;

    try {
      const parsed = itemSchema.parse(parseJsonLoose(response.text));
      const map = new Map(parsed.items.map((item) => [item.id, item.summary]));
      return {
        summaries: results.map((_, index) => map.get(index + 1) || ''),
        usage,
        model,
      };
    } catch (error) {
      if (attempt === 1) {
        throw new ApiError(
          502,
          'AI_INVALID_OUTPUT',
          `Không đọc được mô tả kết quả: ${error.message}`,
        );
      }
      messages = [
        ...messages,
        { role: 'assistant', content: response.text.slice(0, 8000) },
        {
          role: 'user',
          content: `JSON trên lỗi (${error.message}). Hãy trả lại CHỈ JSON hợp lệ, đủ ${results.length} phần tử, không thêm chữ ngoài JSON.`,
        },
      ];
    }
  }

  throw new ApiError(502, 'AI_INVALID_OUTPUT', 'Không nhận được mô tả kết quả hợp lệ');
}

/** Tổng hợp câu trả lời có trích dẫn số thứ tự, nêu mâu thuẫn/chưa rõ. */
export async function synthesizeAnswer(question, results) {
  const payload = results.map((r, index) => ({
    id: index + 1,
    title: r.title,
    year: r.year || '',
    evidenceLevel: r.evidenceLevel,
    abstract: truncateText(r.abstract || '', 1800),
  }));

  const response = await chatCompletion({
    messages: [
      {
        role: 'system',
        content: `Bạn tổng hợp bằng chứng khoa học để trả lời câu hỏi của huấn luyện viên, bằng tiếng Việt.
- CHỈ dùng thông tin trong danh sách bài được cung cấp.
- Trích dẫn bằng số thứ tự trong ngoặc vuông, ví dụ [1], [2].
- Nêu rõ chỗ các bài mâu thuẫn, chỗ bằng chứng còn yếu hoặc chưa rõ.
- Không đưa ra bài báo không có trong danh sách.
- Không đưa lời khuyên y tế cá nhân.
- Trả lời 4-8 câu hoặc gạch đầu dòng, kết thúc bằng 1 câu về mức độ chắc chắn.
- Nếu danh sách quá ít hoặc không liên quan, nói rõ.`,
      },
      {
        role: 'user',
        content: `CÂU HỎI: ${question}\n\nDANH SÁCH BÀI:\n${JSON.stringify(payload)}`,
      },
    ],
    temperature: 0.2,
    maxTokens: 2000,
  });

  return { answer: response.text.trim(), usage: response.usage, model: response.model };
}
