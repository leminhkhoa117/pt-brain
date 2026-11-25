import { describe, it, expect } from 'vitest';
import { normalizeDoi } from '../src/utils/doi.js';
import { parseIdentifier } from '../src/services/research/metadata.js';
import { isPreprintHost } from '../src/utils/curlFetch.js';

describe('normalizeDoi — version preprint', () => {
  it('bỏ hậu tố v1/v2 của bioRxiv và medRxiv', () => {
    expect(normalizeDoi('10.64898/2026.10.24.761369v1')).toBe(
      '10.64898/2026.10.24.761369',
    );
    expect(normalizeDoi('10.1101/2020.01.01.2001v3')).toBe(
      '10.1101/2020.01.01.2001',
    );
  });

  it('không đụng DOI thường kết thúc bằng v1', () => {
    expect(normalizeDoi('10.1000/examplev1')).toBe('10.1000/examplev1');
  });
});

describe('parseIdentifier — link bioRxiv/medRxiv', () => {
  it('bỏ version khỏi DOI khi dán link biorxiv', () => {
    expect(
      parseIdentifier(
        'https://www.biorxiv.org/content/10.64898/2026.10.24.761369v1',
      ),
    ).toEqual({ type: 'doi', value: '10.64898/2026.10.24.761369' });
  });

  it('bỏ version khỏi DOI khi dán link medrxiv', () => {
    expect(
      parseIdentifier('https://www.medrxiv.org/content/10.1101/2020.01.01.2001v2'),
    ).toEqual({ type: 'doi', value: '10.1101/2020.01.01.2001' });
  });

  it('giữ nguyên DOI/PMID/PMCID thường', () => {
    expect(parseIdentifier('10.1519/JSC.0b013e3181e3482f')).toEqual({
      type: 'doi',
      value: '10.1519/JSC.0b013e3181e3482f',
    });
    expect(parseIdentifier('PMC1234567')).toEqual({
      type: 'pmcid',
      value: 'PMC1234567',
    });
  });
});

describe('isPreprintHost', () => {
  it('nhận đúng host biorxiv/medrxiv', () => {
    expect(isPreprintHost('https://www.biorxiv.org/content/x.pdf')).toBe(true);
    expect(isPreprintHost('https://medrxiv.org/content/x.pdf')).toBe(true);
    expect(isPreprintHost('https://pubmed.ncbi.nlm.nih.gov/123')).toBe(false);
  });
});
