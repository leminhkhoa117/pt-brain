import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/services/ai/quota.js', () => ({
  assertAiQuota: vi.fn(async () => ({ used: 0, limit: 30 })),
  recordAiCall: vi.fn(async () => {}),
}));

vi.mock('../src/services/ai/queryTranslator.js', () => ({
  translateQuestion: vi.fn(async () => ({
    queries: ['resistance training volume'],
    concepts: [],
    mesh: [],
    usage: { input: 1, output: 1, cost: 0 },
    model: 'test',
  })),
}));

vi.mock('../src/services/research/pubmed.js', () => ({
  searchPubMed: vi.fn(async () => []),
}));
vi.mock('../src/services/research/europepmc.js', () => ({
  searchEuropePmc: vi.fn(async () => []),
}));
vi.mock('../src/services/research/openalex.js', () => ({
  searchOpenAlex: vi.fn(async () => []),
}));
vi.mock('../src/services/research/crossref.js', () => ({
  searchCrossref: vi.fn(async () => []),
}));
vi.mock('../src/services/research/oaCandidates.js', () => ({
  enrichFullTextAvailability: vi.fn(async (items) => items),
}));
vi.mock('../src/services/research/probe.js', () => ({
  probeTopCandidates: vi.fn(async (items) =>
    items.map((item) => ({ ...item, keep: item.hasFullText === true })),
  ),
}));

import { searchPubMed } from '../src/services/research/pubmed.js';
import { findResearch } from '../src/services/research/finder.js';

const user = { _id: 'user-1' };

describe('findResearch access policy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('chỉ trả bài OA có toàn văn, bỏ bài non-OA/landing và không tạo summary AI', async () => {
    searchPubMed.mockResolvedValue([
      {
        title: 'Resistance training volume increases hypertrophy',
        doi: '10.1/oa',
        year: 2024,
        isOpenAccess: true,
        pdfUrl: 'https://repo.example/oa.pdf',
        abstract: 'Resistance training volume and hypertrophy',
        evidenceLevel: 1,
      },
      {
        title: 'Resistance training volume closed paper',
        doi: '10.1/closed',
        year: 2024,
        isOpenAccess: false,
        abstract: 'Resistance training volume and hypertrophy',
        evidenceLevel: 1,
      },
      {
        title: 'Resistance training volume landing only',
        doi: '10.1/landing',
        year: 2024,
        isOpenAccess: true,
        fullTextUrl: 'https://publisher.example/article',
        abstract: 'Resistance training volume and hypertrophy',
        evidenceLevel: 2,
      },
    ]);

    const data = await findResearch(user, {
      question: 'volume tập cho hypertrophy',
      queries: ['resistance training volume'],
      filters: { yearFrom: 2020 },
    });

    expect(data.policy).toBe('oa_fulltext');
    expect(data.filters.openAccessOnly).toBe(true);
    expect(data.filters.fullTextOnly).toBe(true);
    expect(data.results).toHaveLength(1);
    expect(data.results[0].title).toBe('Resistance training volume increases hypertrophy');
    expect(data.results[0].viSummary).toBeUndefined();
    expect(data.results[0].access).toMatchObject({
      isOa: true,
      fullTextSource: 'pdf',
      pdfUrl: 'https://repo.example/oa.pdf',
    });
    expect(data.synthesis).toBe('');
    expect(data.dropped).toEqual({ notOa: 1, noFullText: 1 });
  });

  it('ép chính sách dù client gửi cờ tắt', async () => {
    searchPubMed.mockResolvedValue([
      {
        title: 'Resistance training volume closed paper',
        doi: '10.1/closed',
        year: 2024,
        isOpenAccess: false,
        abstract: 'Resistance training volume and hypertrophy',
        evidenceLevel: 1,
      },
    ]);

    const data = await findResearch(user, {
      question: 'volume tập cho hypertrophy',
      queries: ['resistance training volume'],
      filters: { openAccessOnly: false, fullTextOnly: false },
    });

    expect(data.results).toHaveLength(0);
    expect(data.filters.openAccessOnly).toBe(true);
    expect(data.filters.fullTextOnly).toBe(true);
    expect(data.dropped.notOa).toBe(1);
  });
});
