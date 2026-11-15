import { api } from './client.js';

/**
 * Đọc SSE dạng `event: delta|done|error` + `data: JSON` và trả về payload cuối.
 * Dùng fetch vì axios không đọc được body stream trong browser.
 */
export async function streamSseJson(path, { method = 'POST', body, signal, onDelta } = {}) {
  const url = `${api.defaults.baseURL}${path}`;
  const request = () =>
    fetch(url, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });

  let response = await request();
  if (response.status === 401) {
    await api.post('/auth/refresh');
    response = await request();
  }
  if (!response.ok) {
    let message = `Không gửi được câu hỏi (HTTP ${response.status})`;
    try {
      const payload = await response.json();
      message = payload?.error?.message || message;
    } catch {
      // body lỗi không phải JSON
    }
    throw new Error(message);
  }
  if (!response.body) throw new Error('Trình duyệt không hỗ trợ đọc stream');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let answer = '';
  let finalPayload = null;

  const handleBlock = (block) => {
    const lines = block.split('\n');
    let event = 'message';
    const dataLines = [];
    for (const line of lines) {
      if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
    }
    if (!dataLines.length) return;
    let payload;
    try {
      payload = JSON.parse(dataLines.join('\n'));
    } catch {
      return;
    }
    if (event === 'delta' && typeof payload.text === 'string') {
      answer += payload.text;
      onDelta?.(payload.text);
    } else if (event === 'done') {
      finalPayload = payload;
      if (typeof payload.answer === 'string') answer = payload.answer;
    } else if (event === 'error') {
      throw new Error(payload.message || 'AI không trả lời được câu hỏi này');
    }
  };

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      buffer = buffer.replace(/\r\n/g, '\n');
      let boundary;
      while ((boundary = buffer.indexOf('\n\n')) !== -1) {
        handleBlock(buffer.slice(0, boundary));
        buffer = buffer.slice(boundary + 2);
      }
    }
    if (buffer.trim()) handleBlock(buffer);
  } finally {
    reader.releaseLock?.();
  }

  return { answer: finalPayload?.answer || answer, ...finalPayload };
}
