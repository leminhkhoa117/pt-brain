import { afterEach, describe, expect, it, vi } from 'vitest';

process.env.AI_API_KEY = 'test-key';
process.env.AI_BASE_URL = 'https://fake-ai.local/v1';

const { chatCompletionStream } = await import('../src/services/ai/client.js');

function sseResponse(chunks) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
  return new Response(stream, {
    status: 200,
    headers: { 'content-type': 'text/event-stream' },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('chatCompletionStream', () => {
  it('ghép các delta SSE thành câu trả lời đầy đủ', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        sseResponse([
          'data: {"model":"test-model","choices":[{"delta":{"content":"Xin "}}]}\n\n',
          'data: {"choices":[{"delta":{"content":"chào"}}]}\n\n',
          'data: {"choices":[{"delta":{},"finish_reason":"stop"}],"usage":{"prompt_tokens":10,"completion_tokens":4}}\n\n',
          'data: [DONE]\n\n',
        ]),
      ),
    );

    const deltas = [];
    const result = await chatCompletionStream({
      messages: [{ role: 'user', content: 'hi' }],
      onDelta: (text) => deltas.push(text),
    });

    expect(deltas).toEqual(['Xin ', 'chào']);
    expect(result.text).toBe('Xin chào');
    expect(result.model).toBe('test-model');
    expect(result.usage).toEqual({ input: 10, output: 4, cost: 0 });
  });

  it('fallback khi endpoint trả JSON thay vì SSE', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            model: 'json-model',
            choices: [{ message: { content: 'Trả lời một cục' } }],
            usage: { prompt_tokens: 3, completion_tokens: 5 },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      ),
    );

    const result = await chatCompletionStream({
      messages: [{ role: 'user', content: 'hi' }],
    });

    expect(result.text).toBe('Trả lời một cục');
    expect(result.usage).toEqual({ input: 3, output: 5, cost: 0 });
  });
});
