import { describe, expect, it } from 'vitest';
import { postWithRetry } from '../src/services/ai/client.js';
import { ApiError } from '../src/utils/ApiError.js';

const baseBody = { model: 'test-model', messages: [], max_tokens: 1500 };

describe('postWithRetry', () => {
  it('retry một lần với budget lớn hơn khi AI rỗng vì finish_reason=length', async () => {
    const calls = [];
    const fakePost = async (body) => {
      calls.push(body);
      if (calls.length === 1) {
        throw new ApiError(502, 'AI_EMPTY', 'AI trả về nội dung rỗng', {
          finishReason: 'length',
        });
      }
      return { text: '{"ok":true}', finishReason: 'stop', usage: {} };
    };

    const result = await postWithRetry(baseBody, 'test-session', 1000, fakePost);
    expect(result.text).toBe('{"ok":true}');
    expect(calls).toHaveLength(2);
    expect(calls[0].max_tokens).toBe(1500);
    expect(calls[1].max_tokens).toBe(9000);
  });

  it('không retry với lỗi khác', async () => {
    let calls = 0;
    const fakePost = async () => {
      calls += 1;
      throw new ApiError(502, 'AI_ERROR', 'upstream lỗi');
    };

    await expect(postWithRetry(baseBody, 'test-session', 1000, fakePost)).rejects.toThrow(
      'upstream lỗi',
    );
    expect(calls).toBe(1);
  });

  it('không retry khi lần đầu thành công', async () => {
    let calls = 0;
    const fakePost = async () => {
      calls += 1;
      return { text: 'ok', finishReason: 'stop', usage: {} };
    };

    const result = await postWithRetry(baseBody, 'test-session', 1000, fakePost);
    expect(result.text).toBe('ok');
    expect(calls).toBe(1);
  });
});
