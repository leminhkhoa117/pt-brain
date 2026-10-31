import { describe, it, expect } from 'vitest';
import {
  extractHtmlTitle,
  htmlToText,
  normalizeText,
  splitIntoChunks,
  xmlToText,
} from '../src/utils/text.js';

describe('htmlToText', () => {
  it('bỏ script/nav/footer và giữ nội dung chính', () => {
    const html = `
      <html><head><title>T</title><style>.x{}</style></head>
      <body>
        <nav>Menu</nav>
        <article>
          <h1>Tiêu đề bài</h1>
          <p>Đoạn một có số liệu 12.5 kg.</p>
          <script>alert(1)</script>
          <p>Đoạn hai.</p>
        </article>
        <footer>Footer</footer>
      </body></html>`;
    const text = htmlToText(html);
    expect(text).toContain('Đoạn một có số liệu 12.5 kg.');
    expect(text).toContain('Đoạn hai.');
    expect(text).not.toContain('Menu');
    expect(text).not.toContain('alert');
    expect(text).not.toContain('Footer');
  });

  it('trả về chuỗi rỗng với input rỗng', () => {
    expect(htmlToText('')).toBe('');
  });
});

describe('extractHtmlTitle', () => {
  it('ưu tiên og:title', () => {
    const html = '<meta property="og:title" content="OG Title"><title>HTML Title</title>';
    expect(extractHtmlTitle(html)).toBe('OG Title');
  });

  it('fallback về title rồi h1', () => {
    expect(extractHtmlTitle('<title>  A  B </title>')).toBe('A B');
    expect(extractHtmlTitle('<h1>Heading</h1>')).toBe('Heading');
  });
});

describe('xmlToText (JATS)', () => {
  it('giữ nội dung Results và bảng, bỏ references', () => {
    const xml = `<article><body>
      <sec><title>Results</title><p>Khối nạc tăng 1.2 kg (p = 0.02).</p>
      <table-wrap><table><tr><td>Nhóm A</td><td>10</td></tr></table></table-wrap></sec>
      <sec><title>Discussion</title><p>Kết quả phù hợp với giả thuyết.</p></sec>
      </body><back><ref-list><ref>Smith 2020</ref></ref-list></back></article>`;
    const text = xmlToText(xml);
    expect(text).toContain('Results');
    expect(text).toContain('1.2 kg');
    expect(text).toContain('Nhóm A');
    expect(text).toContain('Discussion');
    expect(text).not.toContain('Smith 2020');
  });
});

describe('splitIntoChunks', () => {
  it('giữ nguyên nội dung khi nối các chunk', () => {
    const paragraph = 'Câu này có số liệu 1.5 kg. '.repeat(20);
    const text = Array.from({ length: 10 }, () => paragraph).join('\n\n');
    const chunks = splitIntoChunks(text, 500);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((c) => c.length <= 500)).toBe(true);
    expect(chunks.join(' ')).toContain('1.5 kg');
  });

  it('trả về mảng rỗng với input rỗng', () => {
    expect(splitIntoChunks('')).toEqual([]);
  });

  it('không cắt mất đoạn văn ngắn', () => {
    expect(splitIntoChunks('Một đoạn ngắn.', 500)).toEqual(['Một đoạn ngắn.']);
  });
});

describe('normalizeText', () => {
  it('gộp khoảng trắng và xuống dòng thừa', () => {
    expect(normalizeText('  A   B \r\n\n\n\n C  ')).toBe('A B\n\nC');
  });
});
