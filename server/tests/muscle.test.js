import { describe, it, expect } from 'vitest';
import { muscleChatSchema } from '../src/validation/muscle.js';

const valid = {
  slug: 'pectoralis-major',
  message: 'Nên tập bao nhiêu set mỗi tuần?',
  history: [
    { role: 'user', content: 'Chào' },
    { role: 'assistant', content: 'Chào bạn' },
  ],
};

describe('muscle chat validation', () => {
  it('nhận câu hỏi hợp lệ', () => {
    expect(muscleChatSchema.parse(valid).slug).toBe('pectoralis-major');
    expect(muscleChatSchema.parse(valid).history).toHaveLength(2);
  });

  it('mặc định history rỗng', () => {
    const parsed = muscleChatSchema.parse({
      slug: 'deltoid',
      message: 'Cơ này tập thế nào?',
    });
    expect(parsed.history).toEqual([]);
  });

  it('chặn mã cơ, câu hỏi và role không hợp lệ', () => {
    expect(() => muscleChatSchema.parse({ ...valid, slug: 'Cơ ngực!' })).toThrow();
    expect(() => muscleChatSchema.parse({ ...valid, message: 'x' })).toThrow();
    expect(() =>
      muscleChatSchema.parse({ ...valid, history: [{ role: 'system', content: 'x' }] }),
    ).toThrow();
  });

  it('giới hạn tối đa 10 lượt hội thoại', () => {
    const history = Array.from({ length: 11 }, () => ({ role: 'user', content: 'x' }));
    expect(() => muscleChatSchema.parse({ ...valid, history })).toThrow();
  });
});
