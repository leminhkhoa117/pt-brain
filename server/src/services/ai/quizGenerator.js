import { z } from 'zod';
import { chatCompletion, parseJsonLoose } from './client.js';
import { ApiError } from '../../utils/ApiError.js';
import { truncateText } from '../../utils/text.js';

export const quizSchema = z.object({
  title: z.string().default('Quiz ôn tập'),
  questions: z
    .array(
      z.object({
        question: z.string().min(1),
        options: z.array(z.string().min(1)).length(4),
        correctIndex: z.coerce.number().int().min(0).max(3),
        explanation: z.string().default(''),
      }),
    )
    .min(3)
    .max(10),
});

/** Tạo quiz trắc nghiệm từ nội dung một bản tóm tắt đã lưu. */
export async function generateQuiz({ content, count = 5, title = '' }) {
  const context = truncateText(
    JSON.stringify({
      title,
      tldr: content.tldr,
      studyType: content.studyType,
      participants: content.participants,
      design: content.design,
      mainResults: content.mainResults,
      authorsConclusion: content.authorsConclusion,
      limitations: content.limitations,
      practicalTakeaways: content.practicalTakeaways,
      glossary: content.glossary,
    }),
    14000,
  );

  const system = `Bạn tạo quiz trắc nghiệm tiếng Việt để huấn luyện viên tự kiểm tra mức hiểu một bài nghiên cứu.
- CHỈ dùng thông tin trong bản tóm tắt được cung cấp.
- Tạo đúng ${count} câu, mỗi câu có đúng 4 lựa chọn, chỉ 1 đáp án đúng.
- Câu hỏi tập trung vào số liệu, thiết kế, kết quả và ứng dụng thực tế; tránh câu hỏi mẹo.
- Giải thích ngắn gọn vì sao đáp án đúng (1-2 câu), dựa trên tóm tắt.
- Không đưa lời khuyên y tế cá nhân.
- Trả về CHỈ JSON:
{"title":"...","questions":[{"question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}]}`;

  let messages = [
    { role: 'system', content: system },
    { role: 'user', content: `BẢN TÓM TẮT:\n${context}` },
  ];
  const usage = { input: 0, output: 0, cost: 0 };
  let model = '';

  for (let attempt = 0; attempt <= 1; attempt += 1) {
    let response;
    try {
      response = await chatCompletion({
        messages,
        json: true,
        maxTokens: 6000,
        temperature: 0.3,
      });
    } catch (error) {
      if (attempt === 0 && ['AI_EMPTY', 'AI_TIMEOUT'].includes(error.code)) {
        continue;
      }
      throw error;
    }
    usage.input += response.usage.input;
    usage.output += response.usage.output;
    usage.cost += response.usage.cost;
    model = response.model;

    try {
      const parsed = quizSchema.parse(parseJsonLoose(response.text));
      return { quiz: parsed, usage, model };
    } catch (error) {
      if (attempt === 1) {
        throw new ApiError(502, 'AI_INVALID_OUTPUT', `Quiz trả về không hợp lệ: ${error.message}`);
      }
      messages = [
        ...messages,
        { role: 'assistant', content: response.text.slice(0, 6000) },
        {
          role: 'user',
          content: `JSON trên lỗi (${error.message}). Trả lại CHỈ JSON đúng dạng, đủ ${count} câu, 4 lựa chọn mỗi câu.`,
        },
      ];
    }
  }
  throw new ApiError(502, 'AI_INVALID_OUTPUT', 'Không tạo được quiz hợp lệ');
}
