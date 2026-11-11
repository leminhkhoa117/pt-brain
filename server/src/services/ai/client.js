import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';

const USER_AGENT = `PTBrain/0.2 (research-reader; mailto:${env.CONTACT_EMAIL})`;

async function post(body, sessionId, timeoutMs = env.AI_TIMEOUT_MS) {
  let response;
  try {
    response = await fetch(`${env.AI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.AI_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': USER_AGENT,
        'x-opencode-session': sessionId || 'ptbrain-reader',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    throw new ApiError(504, 'AI_TIMEOUT', `AI không phản hồi kịp: ${error.message}`);
  }

  const raw = await response.text();
  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    json = null;
  }

  if (!response.ok) {
    const message =
      json?.error?.message || json?.message || `AI trả lỗi HTTP ${response.status}`;
    const error = new ApiError(502, 'AI_ERROR', message, {
      status: response.status,
      body: raw.slice(0, 500),
    });
    error.upstreamStatus = response.status;
    throw error;
  }

  const choice = json?.choices?.[0];
  const text = choice?.message?.content;
  if (typeof text !== 'string' || !text.trim()) {
    const finish = choice?.finish_reason || 'unknown';
    throw new ApiError(
      502,
      'AI_EMPTY',
      `AI trả về nội dung rỗng (finish_reason: ${finish})`,
      { usage: json?.usage, finishReason: finish },
    );
  }

  return {
    text,
    model: json.model || env.AI_MODEL,
    finishReason: choice?.finish_reason || '',
    usage: {
      input: json.usage?.prompt_tokens ?? 0,
      output: json.usage?.completion_tokens ?? 0,
      cost: json.usage?.cost ?? json.usage?.opencode?.list_cost ?? 0,
    },
  };
}

/**
 * Gọi model qua API OpenAI-compatible của OpenCode Go.
 * json=true sẽ yêu cầu JSON mode; nếu model không hỗ trợ thì tự thử lại không JSON mode.
 */
export async function chatCompletion({
  messages,
  temperature = 0.2,
  maxTokens = 6000,
  json = false,
  sessionId,
  model,
  reasoningEffort,
  timeoutMs,
}) {
  if (!env.AI_API_KEY) {
    throw new ApiError(
      503,
      'AI_NOT_CONFIGURED',
      'Chưa cấu hình AI_API_KEY. Thêm key vào .env rồi khởi động lại server.',
    );
  }

  const body = {
    model: model || env.AI_MODEL,
    messages,
    temperature,
    max_tokens: maxTokens,
  };
  if (json) body.response_format = { type: 'json_object' };
  if (reasoningEffort) body.reasoning_effort = reasoningEffort;

  try {
    return await post(body, sessionId, timeoutMs);
  } catch (error) {
    const unsupportedReasoning =
      reasoningEffort &&
      error.upstreamStatus === 400 &&
      /reasoning|unknown|unsupported|invalid/i.test(error.message);
    if (unsupportedReasoning) {
      delete body.reasoning_effort;
      return post(body, sessionId, timeoutMs);
    }
    const unsupportedJsonMode =
      json &&
      error.upstreamStatus === 400 &&
      /response_format|json[_ ]?mode|not support/i.test(error.message);
    if (!unsupportedJsonMode) throw error;
    delete body.response_format;
    return post(body, sessionId, timeoutMs);
  }
}

/** Gọi model vision với ảnh (buffer + mime), trả về JSON nếu json=true. */
export async function visionCompletion({
  system,
  text,
  images = [],
  model = env.AI_VISION_MODEL,
  maxTokens = 4000,
  json = true,
  sessionId,
}) {
  const content = [{ type: 'text', text }];
  for (const image of images) {
    content.push({
      type: 'image_url',
      image_url: {
        url: `data:${image.mime || 'image/jpeg'};base64,${image.buffer.toString('base64')}`,
      },
    });
  }
  return chatCompletion({
    messages: [
      { role: 'system', content: system },
      { role: 'user', content },
    ],
    model,
    temperature: 0.1,
    maxTokens,
    json,
    sessionId,
  });
}

/** Bóc JSON khỏi câu trả lời (kể cả khi model bọc trong ```json). */
export function parseJsonLoose(text = '') {
  let value = String(text).replace(/^\uFEFF/, '').trim();
  value = value.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  const start = value.indexOf('{');
  const end = value.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Không tìm thấy JSON trong câu trả lời');
  }
  return JSON.parse(value.slice(start, end + 1));
}
