import { describe, expect, it } from 'vitest';
import { mapCrossrefItem } from '../src/services/research/crossref.js';

describe('mapCrossrefItem', () => {
  it('map metadata Crossref sang shape Finder', () => {
    const item = mapCrossrefItem({
      DOI: '10.1249/MSS.0000000000001764',
      title: ['Resistance Training Volume Enhances Muscle Hypertrophy'],
      author: [
        { given: 'Brad J', family: 'Schoenfeld' },
        { given: 'Bret', family: 'Contreras' },
      ],
      'container-title': ['Medicine & Science in Sports & Exercise'],
      'published-print': { 'date-parts': [[2019, 1, 1]] },
      issued: { 'date-parts': [[2018, 1, 1]] },
      volume: '51',
      issue: '1',
      page: '94-103',
      type: 'journal-article',
      abstract: '<jats:p>Background: resistance training.</jats:p>',
      'is-referenced-by-count': 380,
      URL: 'https://doi.org/10.1249/MSS.0000000000001764',
    });

    expect(item).toMatchObject({
      title: 'Resistance Training Volume Enhances Muscle Hypertrophy',
      year: 2019,
      journal: 'Medicine & Science in Sports & Exercise',
      doi: '10.1249/MSS.0000000000001764',
      citationCount: 380,
      source: 'crossref',
      isOpenAccess: false,
    });
    expect(item.authors).toEqual(['Brad J Schoenfeld', 'Bret Contreras']);
    expect(item.abstract).toBe('Background: resistance training.');
  });

  it('nhận diện meta-analysis từ tiêu đề dù Crossref type là journal-article', () => {
    const item = mapCrossrefItem({
      DOI: '10.1/x',
      title: ['A systematic review and meta-analysis of resistance training'],
      type: 'journal-article',
    });
    expect(item.evidenceLevel).toBe(1);
  });

  it('trả year undefined khi không có date-parts', () => {
    const item = mapCrossrefItem({ DOI: '10.1/y', title: ['A paper'] });
    expect(item.year).toBeUndefined();
  });
});
