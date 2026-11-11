import { describe, it, expect } from 'vitest';
import { selectRelevantContext } from '../src/services/ai/retrieval.js';

describe('selectRelevantContext', () => {
  it('trả nguyên văn khi bài ngắn', () => {
    const text = 'Một bài ngắn về hypertrophy.';
    expect(selectRelevantContext(text, 'hypertrophy là gì?')).toBe(text);
  });

  it('giữ phần đầu và các mục Results/Discussion khi bài dài', () => {
    const chunks = Array.from(
      { length: 40 },
      (_, i) =>
        `${i === 1 ? 'Results' : i === 20 ? 'Discussion' : 'Section'} đoạn ${i}: ` +
        'nội dung nghiên cứu '.repeat(120),
    );
    const text = chunks.join('\n\n');
    const context = selectRelevantContext(text, 'kết quả chính là gì?', { maxChars: 20000 });
    expect(context.length).toBeLessThan(text.length);
    expect(context).toContain('Section đoạn 0');
    expect(context).toContain('Results');
    expect(context).toContain('Discussion');
    expect(context).toContain('[Đoạn');
  });

  it('ưu tiên đoạn chứa từ khóa và số liệu trong câu hỏi', () => {
    const chunks = Array.from(
      { length: 40 },
      (_, i) =>
        `Section ${i}: ` +
        'nội dung nền '.repeat(500) +
        (i === 30 ? ' creatine monohydrate p = 0.003 ' : ''),
    );
    const text = chunks.join('\n\n');
    const context = selectRelevantContext(
      text,
      'creatine monohydrate p = 0.003 có hiệu quả không?',
      { maxChars: 20000 },
    );
    expect(context).toContain('creatine monohydrate');
    expect(context).toContain('p = 0.003');
  });

  it('giới hạn độ dài tương đối', () => {
    const text = 'Luận điểm khoa học. '.repeat(10000);
    const context = selectRelevantContext(text, 'câu hỏi', { maxChars: 10000 });
    expect(context.length).toBeGreaterThan(5000);
    expect(context.length).toBeLessThan(16000);
  });

  it('trả rỗng với input rỗng', () => {
    expect(selectRelevantContext('', 'x')).toBe('');
  });
});
