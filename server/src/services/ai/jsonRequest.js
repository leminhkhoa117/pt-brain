import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import { parseJsonLoose, chatCompletion } from './client.js';

export function schemaError(error) {
  if (error?.issues) {
    return error.issues
      .slice(0, 8)
      .map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
      .join('; ');
  }
  return error?.message || 'JSON không hợp lệ';
}

/**
 * Gọi model ở JSON mode, validate bằng zod, tự thử lại khi JSON hỏng.
 * Dùng chung cho bước trích facts, viết bài và sửa bài.
 */
export async function requestJson({
  messages,
  schema,
  maxTokens = 6000,
  retries = 1,
  temperature = 0.1,
  timeoutMs,
  sessionId,
  onProgress,
}) {
  let current = messages;
  const usage = { input: 0, output: 0, cost: 0 };
  let model = env.AI_MODEL;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    if (onProgress && attempt === 0) onProgress('AI đang phân tích...');
    let response;
    try {
      response = await chatCompletion({
        messages: current,
        json: true,
        maxTokens,
        temperature,
        timeoutMs,
        sessionId,
      });
    } catch (error) {
      const retryable = ['AI_EMPTY', 'AI_TIMEOUT'].includes(error.code);
      if (attempt < retries && retryable) {
        current = [
          ...current,
          {
            role: 'user',
            content:
              'Lần trước model trả về nội dung rỗng. Hãy trả lại CHỈ JSON hợp lệ, ngắn gọn hơn và đúng schema.',
          },
        ];
        continue;
      }
      throw error;
    }
    usage.input += response.usage.input;
    usage.output += response.usage.output;
    usage.cost += response.usage.cost;
    model = response.model;

    try {
      const parsed = parseJsonLoose(response.text);
      const data = schema.parse(parsed);
      return { data, usage, model };
    } catch (error) {
      if (attempt === retries) {
        throw new ApiError(
          502,
          'AI_INVALID_OUTPUT',
          `AI trả về JSON không đúng schema: ${schemaError(error)}`,
        );
      }
      current = [
        ...current,
        { role: 'assistant', content: response.text.slice(0, 6000) },
        {
          role: 'user',
          content: `Output trên chưa hợp lệ (${schemaError(error)}). Hãy trả lại CHỈ JSON đúng schema, không thêm chữ nào khác. Nếu output bị cắt do quá dài, hãy viết ngắn hơn (ít kết quả/glossary hơn) nhưng giữ đủ field.`,
        },
      ];
    }
  }
  throw new ApiError(502, 'AI_INVALID_OUTPUT', 'Không nhận được JSON hợp lệ từ AI');
}
