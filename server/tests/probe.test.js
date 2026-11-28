import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applyProbeResult,
  clearProbeCache,
  probeTopCandidates,
} from '../src/services/research/probe.js';

describe('applyProbeResult', () => {
  it('PDF probe ok -> giữ bài và đánh dấu full text', () => {
    const item = applyProbeResult(
      { title: 'PDF', hasFullText: false },
      { status: 'ok', kind: 'pdf', url: 'https://repo.example/a.pdf' },
    );
    expect(item).toMatchObject({
      hasFullText: true,
      fullTextSource: 'pdf',
      fullTextLabel: 'Có PDF',
      keep: true,
    });
  });

  it('HTML OA probe ok -> nhận là toàn văn HTML', () => {
    const item = applyProbeResult(
      { title: 'HTML', hasFullText: false, fullTextUrl: 'https://publisher.example/a' },
      { status: 'ok', kind: 'oa_html', url: 'https://publisher.example/a' },
    );
    expect(item).toMatchObject({
      hasFullText: true,
      fullTextSource: 'oa_html',
      keep: true,
    });
  });

  it('probe unknown giữ bài nếu metadata đã có PMC/PDF, loại landing-only', () => {
    expect(
      applyProbeResult({ hasFullText: true }, { status: 'unknown', reason: 'timeout' }).keep,
    ).toBe(true);
    expect(
      applyProbeResult({ hasFullText: false }, { status: 'unknown', reason: 'timeout' }).keep,
    ).toBe(false);
  });

  it('probe fail loại bài', () => {
    expect(
      applyProbeResult({ hasFullText: true }, { status: 'fail', reason: 'http_404' }).keep,
    ).toBe(false);
  });
});

describe('probeTopCandidates', () => {
  beforeEach(() => {
    clearProbeCache();
    vi.clearAllMocks();
  });

  it('probe song song, giữ bài đọc được và loại bài hỏng', async () => {
    const items = [
      { title: 'PDF', hasFullText: true, pdfUrl: 'https://repo.example/a.pdf' },
      { title: 'HTML', hasFullText: false, fullTextUrl: 'https://publisher.example/a' },
      { title: 'Broken', hasFullText: true, pdfUrl: 'https://repo.example/broken.pdf' },
    ];
    const probeImpl = vi.fn(async (item) => {
      if (item.title === 'HTML') return { status: 'ok', kind: 'oa_html', url: item.fullTextUrl };
      if (item.title === 'Broken') return { status: 'fail', kind: 'pdf', reason: 'http_404' };
      return { status: 'ok', kind: 'pdf', url: item.pdfUrl };
    });

    const probed = await probeTopCandidates(items, { probeImpl, concurrency: 2 });
    expect(probed.map((item) => item.keep)).toEqual([true, true, false]);
    expect(probed[1].fullTextSource).toBe('oa_html');
  });

  it('hết ngân sách thì giữ bài metadata có PMC/PDF, bỏ landing-only', async () => {
    const items = [
      { title: 'PDF', hasFullText: true, pdfUrl: 'https://repo.example/a.pdf' },
      { title: 'HTML', hasFullText: false, fullTextUrl: 'https://publisher.example/a' },
    ];
    const probed = await probeTopCandidates(items, {
      totalBudgetMs: -1,
      probeImpl: vi.fn(async () => ({ status: 'ok', kind: 'pdf' })),
    });
    expect(probed.map((item) => item.keep)).toEqual([true, false]);
  });
});
