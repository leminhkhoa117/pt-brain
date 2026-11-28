import { describe, expect, it } from 'vitest';
import {
  countDroppedResearch,
  isEligibleResearchItem,
  isVerifiedOpenAccess,
  researchDropReason,
} from '../src/services/research/accessPolicy.js';
import { assertFullTextReady } from '../src/services/research/reader.js';
import { mergeUnpaywallAvailability } from '../src/services/research/oaCandidates.js';

describe('research access policy', () => {
  it('chỉ coi là OA khi metadata được xác minh', () => {
    expect(isVerifiedOpenAccess({ isOpenAccess: true })).toBe(true);
    expect(isVerifiedOpenAccess({ isOpenAccess: false, oaStatus: 'gold' })).toBe(true);
    expect(isVerifiedOpenAccess({ isOpenAccess: false, pdfUrl: 'https://x/y.pdf' })).toBe(false);
    expect(isVerifiedOpenAccess({ isOpenAccess: false, oaStatus: 'closed' })).toBe(false);
  });

  it('bài đủ điều kiện phải OA và có toàn văn trực tiếp', () => {
    expect(
      isEligibleResearchItem({
        isOpenAccess: true,
        pdfUrl: 'https://repo.example/paper.pdf',
      }),
    ).toBe(true);
    expect(
      isEligibleResearchItem({
        isOpenAccess: true,
        pmcid: 'PMC123',
        oaStatus: 'green',
      }),
    ).toBe(true);
    expect(
      isEligibleResearchItem({
        isOpenAccess: false,
        pdfUrl: 'https://repo.example/paper.pdf',
      }),
    ).toBe(false);
    expect(
      isEligibleResearchItem({
        isOpenAccess: true,
        fullTextUrl: 'https://publisher.example/article',
      }),
    ).toBe(false);
  });

  it('báo lý do loại và đếm đúng', () => {
    const items = [
      { isOpenAccess: false },
      { isOpenAccess: true, fullTextUrl: 'https://publisher.example/article' },
      { isOpenAccess: true, pdfUrl: 'https://repo.example/paper.pdf' },
    ];
    expect(items.map(researchDropReason)).toEqual(['notOa', 'noFullText', '']);
    expect(countDroppedResearch(items)).toEqual({ notOa: 1, noFullText: 1 });
  });
});

describe('assertFullTextReady', () => {
  it('chấp nhận fulltext đủ dài', () => {
    expect(() =>
      assertFullTextReady({ basedOn: 'fulltext', text: 'x'.repeat(600) }),
    ).not.toThrow();
  });

  it('từ chối abstract-only và fulltext quá ngắn', () => {
    expect(() =>
      assertFullTextReady({ basedOn: 'abstract_only', text: 'x'.repeat(2000) }),
    ).toThrow(/không có toàn văn/i);
    expect(() => assertFullTextReady({ basedOn: 'fulltext', text: 'x'.repeat(100) })).toThrow(
      /không có toàn văn/i,
    );
  });
});

describe('mergeUnpaywallAvailability', () => {
  it('chỉ nhận khi Unpaywall báo is_oa=true và giữ license/PDF', () => {
    const merged = mergeUnpaywallAvailability(
      { doi: '10.1/a', isOpenAccess: false, title: 'Paper' },
      {
        is_oa: true,
        oa_status: 'green',
        best_oa_location: {
          url_for_pdf: 'https://repo.example/a.pdf',
          url: 'https://repo.example/a',
          license: 'cc-by',
        },
      },
    );
    expect(merged).toMatchObject({
      isOpenAccess: true,
      oaStatus: 'green',
      license: 'cc-by',
      pdfUrl: 'https://repo.example/a.pdf',
      fullTextUrl: 'https://repo.example/a',
    });
  });

  it('không biến bài closed thành OA', () => {
    const item = { doi: '10.1/a', isOpenAccess: false };
    expect(mergeUnpaywallAvailability(item, { is_oa: false })).toBe(item);
  });
});
