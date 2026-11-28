import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../src/utils/ApiError.js';

vi.mock('../src/utils/http.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    probeUrl: vi.fn(),
    fetchBuffer: vi.fn(),
  };
});

import { fetchBuffer, probeUrl } from '../src/utils/http.js';
import { clearProbeCache, probeFullText } from '../src/services/research/probe.js';

const fullTextHtml = Buffer.from(
  `<html><body><article>
    <h1>Study</h1>
    <h2>Methods</h2><p>${'Participants performed resistance training. '.repeat(120)}</p>
    <h2>Results</h2><p>${'Hypertrophy increased significantly. '.repeat(120)}</p>
    <h2>Discussion</h2><p>${'These findings agree with prior work. '.repeat(120)}</p>
    <h2>Conclusion</h2><p>Volume matters.</p>
  </article></body></html>`,
);

describe('probeFullText', () => {
  beforeEach(() => {
    clearProbeCache();
    vi.clearAllMocks();
  });

  it('nhận PDF qua magic bytes', async () => {
    probeUrl.mockResolvedValue({
      buffer: Buffer.from('%PDF-1.7\n...'),
      contentType: 'application/pdf',
      finalUrl: 'https://repo.example/a.pdf',
    });
    const result = await probeFullText({
      doi: '10.1/pdf',
      isOpenAccess: true,
      pdfUrl: 'https://repo.example/a.pdf',
    });
    expect(result).toMatchObject({ status: 'ok', kind: 'pdf' });
  });

  it('fallback HTML khi PDF lỗi 404 và HTML có đủ mục toàn văn', async () => {
    probeUrl.mockRejectedValue(
      new ApiError(502, 'PROBE_HTTP', 'Nguồn trả lời HTTP 404', { status: 404 }),
    );
    fetchBuffer.mockResolvedValue({
      buffer: fullTextHtml,
      contentType: 'text/html; charset=utf-8',
      finalUrl: 'https://publisher.example/article',
    });

    const result = await probeFullText({
      doi: '10.1/html',
      isOpenAccess: true,
      pdfUrl: 'https://repo.example/missing.pdf',
      fullTextUrl: 'https://publisher.example/article',
    });
    expect(result).toMatchObject({ status: 'ok', kind: 'oa_html' });
  });

  it('trang chỉ abstract ngắn bị loại', async () => {
    fetchBuffer.mockResolvedValue({
      buffer: Buffer.from('<html><body><article><h1>Abstract</h1><p>Short abstract.</p></article></body></html>'),
      contentType: 'text/html',
      finalUrl: 'https://publisher.example/abstract',
    });

    const result = await probeFullText({
      doi: '10.1/abstract',
      isOpenAccess: true,
      fullTextUrl: 'https://publisher.example/abstract',
    });
    expect(result.status).toBe('fail');
  });

  it('403/429 là unknown, không kết luận bài hỏng', async () => {
    probeUrl.mockRejectedValue(
      new ApiError(502, 'PROBE_HTTP', 'Nguồn trả lời HTTP 429', { status: 429 }),
    );
    const result = await probeFullText({
      doi: '10.1/blocked',
      isOpenAccess: true,
      pdfUrl: 'https://repo.example/blocked.pdf',
    });
    expect(result.status).toBe('unknown');
  });
});
