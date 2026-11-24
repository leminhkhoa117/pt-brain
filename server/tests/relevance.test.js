import { describe, it, expect } from 'vitest';
import {
  buildRelevanceContext,
  scoreRelevance,
} from '../src/services/research/relevance.js';
import { rankResults } from '../src/services/research/ranker.js';

const paper = (overrides = {}) => ({
  title: '',
  abstract: '',
  authors: [],
  publicationTypes: [],
  year: 2024,
  evidenceLevel: 5,
  citationCount: 0,
  isOpenAccess: false,
  ...overrides,
});

const breathingConcepts = [
  {
    label: 'Hít thở khi tập',
    terms: [
      'breathing during exercise',
      'breathing technique',
      'breathing pattern',
      'ventilatory response to exercise',
      'respiratory muscle training',
      'Valsalva maneuver',
      'intra-abdominal pressure',
      'bracing',
    ],
  },
  {
    label: 'Tập luyện',
    terms: ['resistance training', 'strength training', 'squat', 'deadlift', 'exercise'],
  },
  {
    label: 'Hiệu suất',
    terms: ['exercise performance', 'strength output', 'performance'],
  },
];

const relevant = [
  paper({
    title:
      'Rethinking the Valsalva Maneuver During Resistance Exercise: Why Transmural Pressure Matters',
    abstract:
      'Breathing strategies and intra-abdominal pressure during strength training affect performance.',
    evidenceLevel: 5,
    year: 2020,
  }),
  paper({
    title:
      'Breathing technique-dependent acute cardiopulmonary responses during squats in healthy females',
    abstract:
      'We examined breathing patterns during resistance training and exercise performance.',
    evidenceLevel: 5,
    year: 2024,
  }),
  paper({
    title: 'Respiratory Muscle Training Combinations in Amateur Runners: A Randomized Trial',
    abstract:
      'Respiratory muscle training improved exercise performance and ventilatory efficiency.',
    evidenceLevel: 2,
    year: 2025,
  }),
];

const irrelevant = [
  paper({
    title: 'Breathing exercises for chronic obstructive pulmonary disease',
    abstract: 'Pulmonary rehabilitation improves dyspnea in patients with COPD.',
    evidenceLevel: 1,
    year: 2026,
    citationCount: 500,
  }),
  paper({
    title: 'Effects of yoga-based and conventional physiotherapy programs on respiratory outcomes',
    abstract: 'Patients with asthma performed breathing exercises.',
    evidenceLevel: 1,
    year: 2026,
    citationCount: 500,
  }),
  paper({
    title:
      'Exercise as Mitochondrial Medicine: How Does the Exercise Prescription Affect Mitochondrial Adaptations',
    abstract: 'Aerobic exercise training alters mitochondrial biogenesis.',
    evidenceLevel: 1,
    year: 2026,
    citationCount: 500,
  }),
];

describe('scoreRelevance', () => {
  const context = buildRelevanceContext({ concepts: breathingConcepts });

  it('khớp concept chính ở title và tính điểm cao', () => {
    const result = scoreRelevance(relevant[0], context);
    expect(result.primaryMatch).toBe(true);
    expect(result.score).toBeGreaterThan(0.7);
    expect(result.matchedConcepts).toContain('Hít thở khi tập');
  });

  it('loại bài không khớp chủ đề chính', () => {
    const result = scoreRelevance(irrelevant[2], context);
    expect(result.primaryMatch).toBe(false);
    expect(result.score).toBe(0);
  });
});

describe('rankResults với relevance', () => {
  it('bài đúng chủ đề xếp trên bài evidence mạnh nhưng lạc đề', () => {
    const ranked = rankResults(
      [...irrelevant, ...relevant],
      {},
      { concepts: breathingConcepts, queries: [] },
    );

    const titles = ranked.map((item) => item.title);
    // Bài đúng chủ đề chiếm top 3; bài lạc đề bị loại hẳn dù evidence 1.
    expect(titles.slice(0, 3).sort()).toEqual(relevant.map((item) => item.title).sort());
    expect(titles).not.toContain(irrelevant[0].title);
    expect(titles).not.toContain(irrelevant[1].title);
    expect(titles.every((title) => !title.includes('Mitochondrial'))).toBe(true);
  });

  it('vẫn lọc theo maxLevel và open access', () => {
    const contextInput = { concepts: breathingConcepts, queries: [] };
    const items = relevant.map((item, index) => ({
      ...item,
      isOpenAccess: index === 0,
    }));
    expect(rankResults(items, { maxLevel: 2 }, contextInput)).toHaveLength(1);
    expect(rankResults(items, { openAccessOnly: true }, contextInput)).toHaveLength(1);
  });

  it('dùng truy vấn làm ngữ cảnh khi không có concepts', () => {
    const context = buildRelevanceContext({
      concepts: [],
      queries: ['Valsalva maneuver resistance training'],
    });
    const result = scoreRelevance(relevant[0], context);
    expect(result.primaryMatch).toBe(true);
    expect(result.score).toBeGreaterThan(0);
  });

  it('truy vấn tự nhập: khớp bất kỳ truy vấn nào, không bắt buộc truy vấn đầu', () => {
    const context = buildRelevanceContext({
      concepts: [],
      queries: [
        'unrelated mitochondrial adaptation aerobic exercise',
        'Valsalva maneuver resistance training',
      ],
    });
    const result = scoreRelevance(relevant[0], context);
    expect(result.primaryMatch).toBe(true);
    expect(result.matchedConcepts).toContain('Valsalva maneuver resistance training');
  });

  it('câu hỏi hô hấp rộng: bổ sung thuật ngữ để bài RMT khớp primary', () => {
    const context = buildRelevanceContext({
      concepts: [
        { label: 'Hô hấp', terms: ['breathing technique'] },
        { label: 'Tập luyện', terms: ['exercise'] },
      ],
      question: 'hít thở trong tập luyện',
    });
    const result = scoreRelevance(relevant[2], context);
    expect(result.primaryMatch).toBe(true);
    expect(result.score).toBeGreaterThan(0);
  });

  it('bài chỉ khớp chủ đề chính ở abstract bị hạ điểm', () => {
    const context = buildRelevanceContext({
      concepts: [
        { label: 'Hô hấp', terms: ['breathing technique'] },
        { label: 'Tập luyện', terms: ['exercise'] },
      ],
      question: 'hít thở trong tập luyện',
    });
    const abstractOnly = paper({
      title: 'Effects of a music-accompanied multimodal exercise program on trunk endurance',
      abstract: 'The program included breathing exercises and exercise training.',
    });
    const titleMatch = paper({
      title: 'Breathing technique effects on exercise performance',
      abstract: 'Breathing technique improved exercise performance.',
    });
    expect(scoreRelevance(abstractOnly, context).score).toBeLessThan(
      scoreRelevance(titleMatch, context).score,
    );
  });

  it('hạ điểm bài bệnh lý khi câu hỏi không nhắc bệnh lý', () => {
    const asthma = paper({
      title: 'Effect of respiratory muscle training in asthma: A systematic review and meta-analysis',
      abstract: 'Respiratory muscle training improved exercise capacity in patients with asthma.',
      evidenceLevel: 1,
      year: 2023,
    });
    const trainingContext = buildRelevanceContext({
      concepts: breathingConcepts,
      question: 'hít thở trong tập luyện',
    });
    const clinicalContext = buildRelevanceContext({
      concepts: breathingConcepts,
      question: 'bài tập thở cho bệnh nhân hen',
    });

    expect(clinicalContext.questionClinical).toBe(true);
    expect(scoreRelevance(asthma, trainingContext).score).toBeLessThan(
      scoreRelevance(asthma, clinicalContext).score,
    );
    expect(scoreRelevance(asthma, trainingContext).score).toBeLessThan(
      scoreRelevance(relevant[2], trainingContext).score,
    );
  });
});
