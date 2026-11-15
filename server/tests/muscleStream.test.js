import { afterEach, describe, expect, it, vi } from 'vitest';

process.env.AI_API_KEY = 'test-key';
process.env.AI_BASE_URL = 'https://fake-ai.local/v1';

const { answerMuscleQuestionStream, buildMuscleMessages } =
  await import('../src/services/ai/muscleCoach.js');

const muscle = {
  slug: 'pectoralis-major',
  vi: 'cơ ngực lớn',
  en: 'pectoralis major',
  group: 'Ngực',
};

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

describe('muscle coach stream', () => {
  it('gộp lịch sử hội thoại vào messages đúng thứ tự', () => {
    const messages = buildMuscleMessages({
      muscle,
      message: 'Nên tập mấy set?',
      history: [
        { role: 'user', content: 'Chào' },
        { role: 'assistant', content: 'Chào bạn' },
        { role: 'system', content: 'bỏ qua' },
      ],
    });
    expect(messages[0].role).toBe('system');
    expect(messages[0].content).toContain('pectoralis major');
    expect(messages.slice(1)).toEqual([
      { role: 'user', content: 'Chào' },
      { role: 'assistant', content: 'Chào bạn' },
      { role: 'user', content: 'Nên tập mấy set?' },
    ]);
  });

  it('trả từng delta qua onDelta và câu đầy đủ', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        sseResponse([
          'data: {"model":"test-model","choices":[{"delta":{"content":"Tập "}}]}\n\n',
          'data: {"choices":[{"delta":{"content":"3 set"}}]}\n\n',
          'data: {"choices":[{"delta":{},"finish_reason":"stop"}],"usage":{"prompt_tokens":8,"completion_tokens":3}}\n\n',
          'data: [DONE]\n\n',
        ]),
      ),
    );

    const deltas = [];
    const result = await answerMuscleQuestionStream({
      muscle,
      message: 'Nên tập mấy set?',
      onDelta: (text) => deltas.push(text),
    });

    expect(deltas).toEqual(['Tập ', '3 set']);
    expect(result.answer).toBe('Tập 3 set');
    expect(result.model).toBe('test-model');
    expect(result.evidence.length).toBeGreaterThan(0);
    expect(result.usage).toEqual({ input: 8, output: 3, cost: 0 });
  });
});
