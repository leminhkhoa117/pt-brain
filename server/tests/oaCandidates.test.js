import { describe, expect, it } from 'vitest';
import {
  candidatesFromOpenAlex,
  candidatesFromSemanticScholar,
  candidatesFromUnpaywall,
  dedupeCandidates,
  mergeOpenAlexAvailability,
} from '../src/services/research/oaCandidates.js';
import { extractCitationPdfUrl } from '../src/services/research/pdfFetch.js';

describe('candidatesFromOpenAlex', () => {
  it('ưu tiên PDF, sau đó landing page và loại trùng', () => {
    const candidates = candidatesFromOpenAlex({
      best_oa_location: {
        pdf_url: 'https://repo.example/best.pdf',
        landing_page_url: 'https://repo.example/best',
        source: { display_name: 'Repository' },
      },
      locations: [
        {
          pdf_url: 'https://repo.example/best.pdf',
          landing_page_url: 'https://repo.example/best',
          is_oa: true,
          source: { display_name: 'Repository' },
        },
        {
          pdf_url: 'https://publisher.example/paper.pdf',
          landing_page_url: 'https://publisher.example/paper',
          is_oa: true,
          source: { display_name: 'Publisher' },
        },
      ],
    });

    expect(candidates.map((c) => c.url)).toEqual([
      'https://repo.example/best.pdf',
      'https://publisher.example/paper.pdf',
      'https://repo.example/best',
      'https://publisher.example/paper',
    ]);
    expect(candidates[0].kind).toBe('pdf');
    expect(candidates[2].kind).toBe('landing');
  });

  it('bỏ URL không hợp lệ và giải mã &amp;', () => {
    const candidates = candidatesFromOpenAlex({
      best_oa_location: { pdf_url: 'https://repo.example/a.pdf?x=1&amp;y=2' },
      locations: [{ pdf_url: 'ftp://bad.example/a.pdf' }],
    });
    expect(candidates).toHaveLength(1);
    expect(candidates[0].url).toBe('https://repo.example/a.pdf?x=1&y=2');
  });
});

describe('candidatesFromUnpaywall', () => {
  it('lấy best + oa_locations', () => {
    const candidates = candidatesFromUnpaywall({
      best_oa_location: { url_for_pdf: 'https://a.example/x.pdf', url: 'https://a.example/x' },
      oa_locations: [
        { url_for_pdf: 'https://b.example/y.pdf', host_type: 'repository' },
        { url: 'https://b.example/y' },
      ],
    });
    expect(candidates.map((c) => c.kind)).toEqual(['pdf', 'landing', 'pdf', 'landing']);
    expect(candidates[2].source).toBe('repository');
  });
});

describe('candidatesFromSemanticScholar', () => {
  it('chỉ nhận openAccessPdf', () => {
    expect(candidatesFromSemanticScholar({ openAccessPdf: { url: 'https://s2.example/p.pdf' } })).toHaveLength(1);
    expect(candidatesFromSemanticScholar({})).toHaveLength(0);
  });
});

describe('dedupeCandidates', () => {
  it('giữ thứ tự và loại URL trùng', () => {
    const out = dedupeCandidates([
      { source: 'a', url: 'https://x.example/1.pdf', kind: 'pdf' },
      { source: 'b', url: 'https://x.example/1.pdf', kind: 'landing' },
      { source: 'c', url: 'https://x.example/2', kind: 'landing' },
    ]);
    expect(out).toHaveLength(2);
    expect(out[0].source).toBe('a');
  });
});

describe('mergeOpenAlexAvailability', () => {
  it('gộp OA, PMCID, retraction và venue metrics theo DOI', () => {
    const merged = mergeOpenAlexAvailability(
      [{ doi: '10.1/ABC', isOpenAccess: false, pmcid: '' }],
      [
        {
          doi: 'https://doi.org/10.1/abc',
          ids: { pmcid: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC123' },
          open_access: { is_oa: true, oa_status: 'green' },
          best_oa_location: { pdf_url: 'https://repo.example/a.pdf' },
          is_retracted: true,
          primary_location: { source: { h_index: 42 } },
        },
      ],
    );
    expect(merged[0]).toMatchObject({
      isOpenAccess: true,
      oaStatus: 'green',
      pdfUrl: 'https://repo.example/a.pdf',
      pmcid: 'PMC123',
      isRetracted: true,
      journalHIndex: 42,
    });
  });

  it('giữ nguyên item không tìm thấy DOI', () => {
    const item = { doi: '10.1/missing', isOpenAccess: false };
    expect(mergeOpenAlexAvailability([item], [])[0]).toBe(item);
  });
});

describe('extractCitationPdfUrl', () => {
  it('đọc meta citation_pdf_url với thứ tự attribute bất kỳ', () => {
    const html = '<meta content="/files/paper.pdf" name="citation_pdf_url">';
    expect(extractCitationPdfUrl(html, 'https://repo.example/article/1')).toBe(
      'https://repo.example/files/paper.pdf',
    );
  });

  it('fallback sang link rel=alternate type=application/pdf', () => {
    const html = '<link rel="alternate" type="application/pdf" href="https://repo.example/a.pdf">';
    expect(extractCitationPdfUrl(html, 'https://repo.example/x')).toBe(
      'https://repo.example/a.pdf',
    );
  });

  it('trả rỗng khi không có link', () => {
    expect(extractCitationPdfUrl('<html><body>no pdf</body></html>', 'https://x.example')).toBe('');
  });
});
