import { describe, it, expect } from 'vitest';
import {
  RESEARCH_TOPICS,
  getResearchTopic,
} from '../../shared/research/topics.js';
import { researchSearchSchema } from '../src/validation/research.js';
import { toPlainQuery } from '../src/services/research/querySyntax.js';

describe('RESEARCH_TOPICS', () => {
  it('có id duy nhất và đủ trường bắt buộc', () => {
    const ids = new Set();
    for (const topic of RESEARCH_TOPICS) {
      expect(topic.id).toMatch(/^[a-z0-9-]+$/);
      expect(ids.has(topic.id)).toBe(false);
      ids.add(topic.id);
      expect(topic.label.length).toBeGreaterThan(2);
      expect(topic.description.length).toBeGreaterThan(10);
      expect(topic.exampleQuestion.length).toBeGreaterThanOrEqual(5);
      expect(topic.tags.length).toBeGreaterThan(0);
    }
  });

  it('mỗi chủ đề có 4 truy vấn hợp lệ và chuyển được sang keyword', () => {
    for (const topic of RESEARCH_TOPICS) {
      expect(topic.queries).toHaveLength(4);
      for (const query of topic.queries) {
        expect(query.length).toBeGreaterThan(8);
        expect(query.length).toBeLessThanOrEqual(220);
        expect(toPlainQuery(query).length).toBeGreaterThan(5);
      }
    }
  });

  it('concepts khớp schema API và không rỗng', () => {
    for (const topic of RESEARCH_TOPICS) {
      expect(topic.concepts.length).toBeGreaterThanOrEqual(2);
      expect(topic.concepts.length).toBeLessThanOrEqual(6);
      for (const concept of topic.concepts) {
        expect(concept.label.length).toBeGreaterThanOrEqual(2);
        expect(concept.terms.length).toBeGreaterThanOrEqual(1);
        expect(concept.terms.length).toBeLessThanOrEqual(10);
      }

      const parsed = researchSearchSchema.parse({
        question: topic.exampleQuestion,
        queries: topic.queries,
        concepts: topic.concepts,
      });
      expect(parsed.queries).toHaveLength(4);
      expect(parsed.concepts).toHaveLength(topic.concepts.length);
    }
  });

  it('tìm chủ đề theo id', () => {
    expect(getResearchTopic('breathing-training')?.label).toContain('Hít thở');
    expect(getResearchTopic('khong-ton-tai')).toBeNull();
  });
});
