import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

process.env.AI_API_KEY = 'test-key';

const originalFetch = global.fetch;
let fetchMock;

beforeAll(() => {
  global.fetch = vi.fn();
  fetchMock = global.fetch;
});

beforeEach(() => {
  fetchMock.mockReset();
});

afterAll(() => {
  global.fetch = originalFetch;
});

const jsonResponse = (body) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });

const sseResponse = (body) =>
  new Response(body, {
    status: 200,
    headers: { 'content-type': 'text/event-stream' },
  });

describe('chatCompletionStream fallback', () => {
  it('fallback sang non-stream khi SSE rỗng vì finish_reason=length', async () => {
    fetchMock
      .mockResolvedValueOnce(
        sseResponse('data: {"choices":[{"delta":{},"finish_reason":"length"}]}\n\n'),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          choices: [{ message: { content: 'Câu trả lời fallback' }, finish_reason: 'stop' }],
          usage: { prompt_tokens: 10, completion_tokens: 5 },
        }),
      );

    const { chatCompletionStream } = await import('../src/services/ai/client.js');
    const deltas = [];
    const result = await chatCompletionStream({
      messages: [{ role: 'user', content: 'test' }],
      onDelta: (text) => deltas.push(text),
    });

    expect(result.text).toBe('Câu trả lời fallback');
    expect(result.fallback).toBe(true);
    expect(deltas).toEqual(['Câu trả lời fallback']);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('fallback khi endpoint trả JSON thường nhưng content rỗng + length', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          choices: [{ message: { content: '' }, finish_reason: 'length' }],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          choices: [{ message: { content: 'Fallback JSON' }, finish_reason: 'stop' }],
        }),
      );

    const { chatCompletionStream } = await import('../src/services/ai/client.js');
    const result = await chatCompletionStream({
      messages: [{ role: 'user', content: 'test' }],
    });

    expect(result.text).toBe('Fallback JSON');
    expect(result.fallback).toBe(true);
  });
});
