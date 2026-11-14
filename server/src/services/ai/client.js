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
 * Nếu model dùng hết token cho reasoning trước khi viết content, API trả
 * finish_reason="length" và content rỗng. Thử lại một lần với budget lớn hơn
 * thay vì báo lỗi ngay cho người dùng.
 */
export async function postWithRetry(body, sessionId, timeoutMs, postImpl = post) {
  try {
    return await postImpl(body, sessionId, timeoutMs);
  } catch (error) {
    const emptyByLength =
      error?.code === 'AI_EMPTY' && error?.details?.finishReason === 'length';
    if (!emptyByLength) throw error;

    const retryBody = {
      ...body,
      max_tokens: Math.min(16000, Math.max(9000, (body.max_tokens || 0) * 2)),
    };
    return postImpl(retryBody, sessionId, timeoutMs);
  }
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
    return await postWithRetry(body, sessionId, timeoutMs);
  } catch (error) {
    const unsupportedReasoning =
      reasoningEffort &&
      error.upstreamStatus === 400 &&
      /reasoning|unknown|unsupported|invalid/i.test(error.message);
    if (unsupportedReasoning) {
      delete body.reasoning_effort;
      return postWithRetry(body, sessionId, timeoutMs);
    }
    const unsupportedJsonMode =
      json &&
      error.upstreamStatus === 400 &&
      /response_format|json[_ ]?mode|not support/i.test(error.message);
    if (!unsupportedJsonMode) throw error;
    delete body.response_format;
    return postWithRetry(body, sessionId, timeoutMs);
  }
}

/**
 * Gọi model ở chế độ streaming, gọi onDelta(text) cho từng mảnh.
 * Trả về câu trả lời đầy đủ + usage để controller lưu quota/lịch sử.
 */
export async function chatCompletionStream({
  messages,
  temperature = 0.2,
  maxTokens = 3000,
  sessionId,
  model,
  reasoningEffort,
  timeoutMs = env.AI_TIMEOUT_MS,
  onDelta,
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
    stream: true,
  };
  if (reasoningEffort) body.reasoning_effort = reasoningEffort;

  let response;
  try {
    response = await fetch(`${env.AI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.AI_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': USER_AGENT,
        'x-opencode-session': sessionId || 'ptbrain-chat-stream',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    throw new ApiError(504, 'AI_TIMEOUT', `AI không phản hồi kịp: ${error.message}`);
  }

  if (!response.ok) {
    const raw = await response.text().catch(() => '');
    let json = null;
    try {
      json = JSON.parse(raw);
    } catch {
      // thân lỗi không phải JSON
    }
    throw new ApiError(
      502,
      'AI_ERROR',
      json?.error?.message || json?.message || `AI trả lỗi HTTP ${response.status}`,
      { status: response.status, body: raw.slice(0, 500) },
    );
  }

  const contentType = response.headers.get('content-type') || '';

  // Model reasoning có thể đốt hết max_tokens trước khi viết content. Với
  // streaming, nếu chưa có delta nào thì fallback sang non-stream với budget lớn
  // hơn thay vì trả lỗi rỗng cho UI.
  const fallbackForLength = async () => {
    const fallback = await chatCompletion({
      messages,
      temperature,
      maxTokens: Math.min(16000, Math.max(9000, maxTokens * 2)),
      sessionId,
      model,
      reasoningEffort,
      timeoutMs,
    });
    onDelta?.(fallback.text);
    return {
      text: fallback.text,
      model: fallback.model,
      usage: fallback.usage,
      finishReason: fallback.finishReason,
      fallback: true,
    };
  };

  // Một số endpoint bỏ qua stream và trả JSON đầy đủ; vẫn xử lý được.
  if (!contentType.includes('text/event-stream')) {
    const raw = await response.text();
    let json = null;
    try {
      json = JSON.parse(raw);
    } catch {
      throw new ApiError(502, 'AI_INVALID_STREAM', 'AI trả về định dạng không hỗ trợ');
    }
    const text = json?.choices?.[0]?.message?.content;
    if (typeof text !== 'string' || !text.trim()) {
      if (json?.choices?.[0]?.finish_reason === 'length') return fallbackForLength();
      throw new ApiError(502, 'AI_EMPTY', 'AI trả về nội dung rỗng');
    }
    onDelta?.(text);
    return {
      text,
      model: json.model || env.AI_MODEL,
      usage: {
        input: json.usage?.prompt_tokens ?? 0,
        output: json.usage?.completion_tokens ?? 0,
        cost: json.usage?.cost ?? json.usage?.opencode?.list_cost ?? 0,
      },
    };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';
  let usage = null;
  let resolvedModel = env.AI_MODEL;
  let finishReason = '';

  const consumeLine = (line) => {
    const trimmed = line.replace(/\r$/, '');
    if (!trimmed.startsWith('data:')) return;
    const data = trimmed.slice(5).trim();
    if (!data || data === '[DONE]') return;
    let json;
    try {
      json = JSON.parse(data);
    } catch {
      return;
    }
    if (json.usage) usage = json.usage;
    if (json.model) resolvedModel = json.model;
    const choice = json.choices?.[0];
    if (choice?.finish_reason) finishReason = choice.finish_reason;
    const delta = choice?.delta?.content ?? choice?.message?.content;
    if (typeof delta === 'string' && delta) {
      full += delta;
      onDelta?.(delta);
    }
  };

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let newline;
      while ((newline = buffer.indexOf('\n')) !== -1) {
        consumeLine(buffer.slice(0, newline));
        buffer = buffer.slice(newline + 1);
      }
    }
    if (buffer) consumeLine(buffer);
  } finally {
    reader.releaseLock?.();
  }

  if (!full.trim()) {
    if (finishReason === 'length') return fallbackForLength();
    throw new ApiError(502, 'AI_EMPTY', `AI trả về nội dung rỗng (finish_reason: ${finishReason || 'unknown'})`, {
      finishReason,
    });
  }

  return {
    text: full,
    model: resolvedModel,
    usage: {
      input: usage?.prompt_tokens ?? 0,
      output: usage?.completion_tokens ?? 0,
      cost: usage?.cost ?? usage?.opencode?.list_cost ?? 0,
    },
    finishReason,
  };
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
  if (start === -1) {
    throw new Error('Không tìm thấy JSON trong câu trả lời');
  }
  const end = value.lastIndexOf('}');
  const body = end > start ? value.slice(start, end + 1) : value.slice(start);
  try {
    return JSON.parse(body);
  } catch (error) {
    const repaired = repairTruncatedJson(body);
    if (repaired) {
      try {
        return JSON.parse(repaired);
      } catch {
        // rơi xuống lỗi gốc
      }
    }
    throw error;
  }
}

/** Cố gắng đóng JSON bị cắt cụt (model hết token giữa chừng). */
function repairTruncatedJson(body = '') {
  let text = String(body).trim();
  if (!text.startsWith('{')) return '';
  let inString = false;
  let escaped = false;
  const stack = [];

  for (const char of text) {
    if (inString) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === '{' || char === '[') stack.push(char);
    else if (char === '}' || char === ']') stack.pop();
  }

  if (inString) text += '"';
  text = text.replace(/,\s*$/, '');
  if (/:\s*$/.test(text)) text += 'null';
  while (stack.length) {
    const open = stack.pop();
    text += open === '{' ? '}' : ']';
  }
  return text;
}
