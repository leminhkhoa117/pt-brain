import { describe, expect, it } from 'vitest';
import {
  apaAuthor,
  apaAuthors,
  formatCitation,
  splitAuthorName,
  toApa,
  toBibtex,
  toRis,
} from '../src/services/citations/index.js';

const paper = {
  title: 'Resistance Training Volume Enhances Muscle Hypertrophy but Not Strength in Trained Men',
  authors: ['Brad J Schoenfeld', 'Bret Contreras', 'James Krieger'],
  year: 2019,
  journal: 'Medicine & Science in Sports & Exercise',
  volume: '51',
  issue: '1',
  pages: '94-103',
  doi: '10.1249/MSS.0000000000001764',
  url: 'https://doi.org/10.1249/MSS.0000000000001764',
  publicationTypes: ['Journal Article'],
};

describe('toBibtex', () => {
  it('sinh entry đủ trường và escape ký tự đặc biệt', () => {
    const bib = toBibtex(paper);
    expect(bib).toContain('@article{');
    expect(bib).toContain('Schoenfeld, Brad J and Contreras, Bret');
    expect(bib).toContain('Medicine \\& Science in Sports \\& Exercise');
    expect(bib).toContain('pages = {94--103}');
    expect(bib).toContain('doi = {10.1249/mss.0000000000001764}');
  });
});

describe('APA', () => {
  it('đổi tên tác giả sang Family, Initials', () => {
    expect(apaAuthor('Brad J Schoenfeld')).toBe('Schoenfeld, B. J.');
    expect(apaAuthors(['Brad J Schoenfeld', 'Bret Contreras'])).toBe(
      'Schoenfeld, B. J., & Contreras, B.',
    );
  });

  it('nhận cả dạng family + initials của Europe PMC', () => {
    expect(splitAuthorName('Carvalho L')).toEqual({ family: 'Carvalho', given: 'L' });
    expect(apaAuthor('Carvalho L')).toBe('Carvalho, L.');
    const bib = toBibtex({ ...paper, authors: ['Carvalho L', 'Schoenfeld BJ'] });
    expect(bib).toContain('Carvalho, L and Schoenfeld, B J');
  });

  it('sinh câu trích dẫn có năm, journal, volume, issue, pages, DOI', () => {
    const apa = toApa(paper);
    expect(apa).toContain('Schoenfeld, B. J., Contreras, B., & Krieger, J. (2019).');
    expect(apa).toContain('Medicine & Science in Sports & Exercise, 51(1), 94–103.');
    expect(apa).toContain('https://doi.org/10.1249/mss.0000000000001764');
  });
});

describe('toRis', () => {
  it('sinh RIS có đủ tag và kết thúc ER', () => {
    const ris = toRis(paper);
    expect(ris).toContain('TY  - JOUR');
    expect(ris).toContain('AU  - Schoenfeld, Brad J');
    expect(ris).toContain('SP  - 94');
    expect(ris).toContain('EP  - 103');
    expect(ris.trim().endsWith('ER  -')).toBe(true);
  });
});

describe('formatCitation', () => {
  it('chọn đúng style và báo lỗi style lạ', () => {
    expect(formatCitation(paper, 'bib')).toContain('@article');
    expect(formatCitation(paper, 'ris')).toContain('TY  - JOUR');
    expect(formatCitation(paper, 'apa')).toContain('(2019).');
    expect(() => formatCitation(paper, 'mla')).toThrow();
  });
});
