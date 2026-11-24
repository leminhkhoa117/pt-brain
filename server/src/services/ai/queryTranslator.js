import { z } from 'zod';
import { chatCompletion, parseJsonLoose } from './client.js';
import { ApiError } from '../../utils/ApiError.js';

const conceptSchema = z.object({
  label: z.string().min(2).max(80),
  terms: z.array(z.string().min(2).max(120)).min(1).max(10),
});

const MAX_QUERY_LENGTH = 220;

/** Cắt truy vấn AI quá dài mà vẫn giữ cú pháp Boolean cân bằng. */
export function clampQuery(query = '') {
  let value = String(query || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (value.length <= MAX_QUERY_LENGTH) return value;

  value = value.slice(0, MAX_QUERY_LENGTH);
  const lastSpace = value.lastIndexOf(' ');
  if (lastSpace > 100) value = value.slice(0, lastSpace);
  value = value.replace(/\s+(AND|OR|NOT)\s*$/i, '').trim();

  // Bỏ dấu ngoặc kép/parenthesis đang mở dở ở cuối.
  if ((value.match(/"/g) || []).length % 2) {
    value = value.slice(0, value.lastIndexOf('"')).trim();
  }
  value = value.replace(/[\s(]+$/g, '').trim();

  const open = (value.match(/\(/g) || []).length;
  const close = (value.match(/\)/g) || []).length;
  if (open > close) value += ')'.repeat(open - close);
  return value;
}

const translationSchema = z.object({
  queries: z.array(z.string().min(3)).min(1).max(4),
  concepts: z.array(conceptSchema).max(6).default([]),
  mesh: z.array(z.string()).default([]),
});

const SYSTEM = `Bạn là chuyên gia tìm kiếm tài liệu y sinh. Chuyển câu hỏi tiếng Việt của huấn luyện viên thành truy vấn học thuật bằng tiếng Anh.

YÊU CẦU:
- Trả về 3-5 "concepts" theo thứ tự quan trọng. Concept ĐẦU TIÊN là chủ đề/can thiệp chính, dùng để quyết định bài có liên quan hay không.
- Mỗi concept gồm: "label" ngắn bằng tiếng Việt; "terms" là 3-8 từ/cụm từ tiếng Anh đồng nghĩa, gồm thuật ngữ chuẩn, viết tắt và MeSH nếu có. Không dùng từ quá chung như "study", "effect", "review".
- Trả về 3-4 "queries". Mỗi truy vấn nên ghép 2 concept quan trọng nhất bằng AND, dùng ngoặc kép cho cụm từ và OR cho từ đồng nghĩa. Mỗi truy vấn tối đa 200 ký tự; mỗi nhóm OR tối đa 3 từ đồng nghĩa, không nhồi quá nhiều.
- Ít nhất 1 truy vấn tổng quan (systematic review/meta-analysis) và 1 truy vấn cơ chế/hiệu suất cụ thể.
- Chỉ thêm population (người khỏe mạnh, athlete, bệnh nhân...) khi câu hỏi nêu rõ; không tự thêm bệnh lý.
- Nếu chủ đề là hô hấp, concept chính cần bao gồm cả các kỹ thuật cụ thể đáng tìm (ví dụ breathing technique/pattern, Valsalva maneuver, bracing, intra-abdominal pressure, diaphragmatic breathing, nasal breathing, respiratory muscle training). Nếu câu hỏi nêu một kỹ thuật cụ thể, ưu tiên kỹ thuật đó thay vì liệt kê tất cả.
- Không thêm bài báo cụ thể, không bịa tên nghiên cứu.
- Trả về CHỈ JSON: {"queries":["..."],"concepts":[{"label":"...","terms":["..."]}],"mesh":["..."]}`;

export async function translateQuestion(question) {
  const response = await chatCompletion({
    messages: [
      { role: 'system', content: SYSTEM },
      {
        role: 'user',
        content: `Câu hỏi: ${question}\n\nTrả về 3-4 truy vấn tiếng Anh và 3-5 concept.`,
      },
    ],
    json: true,
    temperature: 0.2,
    maxTokens: 2000,
    reasoningEffort: 'low',
  });

  try {
    const parsed = translationSchema.parse(parseJsonLoose(response.text));
    const queries = parsed.queries
      .map((query) => clampQuery(query))
      .filter((query) => query.length >= 3);
    if (!queries.length) {
      throw new Error('Không có truy vấn hợp lệ sau khi chuẩn hóa');
    }
    return { ...parsed, queries, usage: response.usage, model: response.model };
  } catch (error) {
    throw new ApiError(
      502,
      'QUERY_TRANSLATION_FAILED',
      `Không tạo được truy vấn tìm kiếm: ${error.message}`,
    );
  }
}
