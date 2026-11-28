import { describe, expect, it } from 'vitest';
import { buildFullTextSynthesisPayload } from '../src/services/research/synthesize.js';

describe('buildFullTextSynthesisPayload', () => {
  it('gộp metadata paper + nội dung Summary fulltext, giới hạn 8 bài', () => {
    const summaries = Array.from({ length: 10 }, (_, index) => ({
      _id: `s${index}`,
      paperId: `p${index}`,
      content: {
        tldr: `Tóm tắt ${index}`,
        studyType: 'RCT',
        mainResults: [{ finding: 'Tăng hypertrophy', numbers: 'p = 0.01' }],
        practicalTakeaways: ['Tăng volume từ từ'],
        conclusion: { summary: 'Volume cao hơn có lợi.' },
      },
    }));
    const papers = summaries.map((summary, index) => ({
      _id: summary.paperId,
      title: `Paper ${index}`,
      authors: ['Author'],
      year: 2024,
    }));

    const payload = buildFullTextSynthesisPayload(summaries, papers);
    expect(payload).toHaveLength(8);
    expect(payload[0]).toMatchObject({
      id: 1,
      summaryId: 's0',
      title: 'Paper 0',
      tldr: 'Tóm tắt 0',
      studyType: 'RCT',
    });
    expect(payload[0].mainResults[0]).toMatchObject({
      finding: 'Tăng hypertrophy',
      numbers: 'p = 0.01',
    });
  });

  it('không lỗi khi thiếu paper hoặc content', () => {
    const payload = buildFullTextSynthesisPayload(
      [{ _id: 's1', paperId: 'missing', content: null }],
      [],
    );
    expect(payload[0]).toMatchObject({
      title: 'Không rõ tiêu đề',
      tldr: '',
      mainResults: [],
    });
  });
});
