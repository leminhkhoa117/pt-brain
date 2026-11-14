import { describe, expect, it } from 'vitest';
import { mapGraphWork } from '../src/services/research/graph.js';
import { researchGraphSchema } from '../src/validation/research.js';

describe('mapGraphWork', () => {
  it('trả về trường gọn cho panel citation graph', () => {
    const mapped = mapGraphWork({
      id: 'https://openalex.org/W123',
      doi: 'https://doi.org/10.1249/MSS.0000000000001764',
      title: 'Resistance Training Volume',
      publication_year: 2019,
      type: 'article',
      cited_by_count: 380,
      authorships: [{ author: { display_name: 'Brad J Schoenfeld' } }],
      primary_location: { source: { display_name: 'Medicine & Science in Sports & Exercise' } },
      open_access: { is_oa: true, oa_status: 'green' },
      is_retracted: false,
    });
    expect(mapped).toMatchObject({
      title: 'Resistance Training Volume',
      year: 2019,
      doi: '10.1249/mss.0000000000001764',
      citationCount: 380,
      isOpenAccess: true,
      oaStatus: 'green',
      evidenceLevel: 5,
    });
    expect(mapped.authors).toEqual(['Brad J Schoenfeld']);
  });
});

describe('researchGraphSchema', () => {
  it('mặc định references + limit 20', () => {
    const parsed = researchGraphSchema.parse({ doi: '10.1249/mss.0000000000001764' });
    expect(parsed.kind).toBe('references');
    expect(parsed.limit).toBe(20);
  });

  it('từ chối kind lạ và limit quá lớn', () => {
    expect(() => researchGraphSchema.parse({ doi: '10.1/x', kind: 'all' })).toThrow();
    expect(() => researchGraphSchema.parse({ doi: '10.1/x', limit: 999 })).toThrow();
  });
});
