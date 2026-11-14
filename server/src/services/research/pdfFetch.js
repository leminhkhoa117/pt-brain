import { fetchBuffer } from '../../utils/http.js';
import { parsePdfBuffer } from './pdf.js';

const MAX_PDF_BYTES = 25 * 1024 * 1024;
const MAX_HTML_BYTES = 4 * 1024 * 1024;
const MIN_TEXT_CHARS = 800;

// Header giống trình duyệt chỉ dùng cho bước tải PDF/landing page. Các API JSON
// vẫn dùng User-Agent "polite" của PT Brain.
const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
};

const META_TAG_RE = /<meta\b[^>]*>/gi;
const META_NAME_RE = /name=["'](?:citation_pdf_url)["']/i;
const META_CONTENT_RE = /content=["']([^"']+)["']/i;
const LINK_PDF_RE = /<link\b[^>]*type=["']application\/pdf["'][^>]*>/i;
const LINK_HREF_RE = /href=["']([^"']+)["']/i;

function absoluteUrl(value, baseUrl) {
  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return '';
  }
}

/**
 * Lấy link PDF từ landing page theo chuẩn Highwire `citation_pdf_url`
 * (Google Scholar/publisher/repository đều dùng), fallback sang
 * `<link rel="alternate" type="application/pdf">`.
 */
export function extractCitationPdfUrl(html = '', baseUrl = '') {
  const value = String(html || '');
  for (const tag of value.match(META_TAG_RE) || []) {
    if (!META_NAME_RE.test(tag)) continue;
    const content = tag.match(META_CONTENT_RE)?.[1];
    if (content) return absoluteUrl(content, baseUrl);
  }
  const linkTag = value.match(LINK_PDF_RE)?.[0];
  if (linkTag) {
    const href = linkTag.match(LINK_HREF_RE)?.[1];
    if (href) return absoluteUrl(href, baseUrl);
  }
  return '';
}

function looksLikeHtml(buffer, contentType = '') {
  if (/html/i.test(contentType)) return true;
  const head = buffer.subarray(0, 512).toString('utf8').trim().toLowerCase();
  return head.startsWith('<!doctype html') || head.startsWith('<html') || head.includes('<head');
}

async function downloadPdf(url, { maxBytes = MAX_PDF_BYTES } = {}) {
  let response = await fetchBuffer(url, {
    maxBytes,
    accept: 'application/pdf,text/html;q=0.9,*/*;q=0.8',
    headers: BROWSER_HEADERS,
  });

  // Một số host trả HTML (trang trung gian/challenge) thay vì PDF; thử lấy
  // citation_pdf_url đúng một lần rồi tải lại.
  if (looksLikeHtml(response.buffer, response.contentType)) {
    const recovered = extractCitationPdfUrl(
      response.buffer.toString('utf8'),
      response.finalUrl || url,
    );
    if (!recovered || recovered === url) {
      throw new Error('nhận HTML thay vì PDF và không tìm thấy citation_pdf_url');
    }
    response = await fetchBuffer(recovered, {
      maxBytes,
      accept: 'application/pdf',
      headers: BROWSER_HEADERS,
    });
  }

  return response;
}

/**
 * Thử lần lượt mọi candidate (PDF trực tiếp + landing page) cho tới khi đọc được
 * text. Trả về `attempts` để minh bạch nguồn nào đã thử và vì sao thất bại.
 */
export async function fetchFirstReadablePdf(
  candidates = [],
  { maxBytes = MAX_PDF_BYTES, minChars = MIN_TEXT_CHARS } = {},
) {
  const attempts = [];

  for (const candidate of candidates) {
    const url = String(candidate?.url || '').trim();
    if (!url) continue;
    const source = candidate.source || 'source';
    const baseAttempt = { source, url, kind: candidate.kind || 'pdf' };
    let pdfUrl = url;

    try {
      if (candidate.kind === 'landing') {
        const page = await fetchBuffer(url, {
          maxBytes: MAX_HTML_BYTES,
          accept: 'text/html,application/xhtml+xml,*/*;q=0.8',
          headers: BROWSER_HEADERS,
        });
        pdfUrl = extractCitationPdfUrl(page.buffer.toString('utf8'), page.finalUrl || url);
        if (!pdfUrl) {
          attempts.push({ ...baseAttempt, result: 'landing page không có citation_pdf_url' });
          continue;
        }
      }

      const response = await downloadPdf(pdfUrl, { maxBytes });
      const parsed = await parsePdfBuffer(response.buffer);
      if (!parsed.text || parsed.text.length < minChars) {
        attempts.push({ ...baseAttempt, result: 'PDF không có đủ text (có thể bản scan)' });
        continue;
      }

      return {
        ok: true,
        text: parsed.text,
        pages: parsed.pages || 0,
        source,
        url: response.finalUrl || pdfUrl,
        attempts: [...attempts, { ...baseAttempt, result: 'ok' }],
      };
    } catch (error) {
      attempts.push({
        ...baseAttempt,
        result: String(error?.message || error).slice(0, 180),
      });
    }
  }

  return { ok: false, attempts };
}
