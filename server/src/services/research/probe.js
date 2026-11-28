import { ApiError } from '../../utils/ApiError.js';
import { fetchBuffer, probeUrl } from '../../utils/http.js';
import { htmlToText } from '../../utils/text.js';
import { extractCitationPdfUrl } from './pdfFetch.js';

const EUROPEPMC = 'https://www.ebi.ac.uk/europepmc/webservices/rest';
const PROBE_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const HTML_MAX_BYTES = 1.5 * 1024 * 1024;
const HTML_MIN_CHARS = 5000;

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
};

const FULLTEXT_MARKERS = [
  /\bmethods?\b/i,
  /\bmaterials and methods\b/i,
  /\bresults?\b/i,
  /\bdiscussion\b/i,
  /\bconclusions?\b/i,
  /\bparticipants?\b|\bsubjects?\b/i,
  /\bstatistical analysis\b/i,
];

const PAYWALL_MARKERS = [
  /access this article/i,
  /purchase (this )?article/i,
  /sign in to (read|access)/i,
  /subscribe to (read|access)/i,
  /rent this article/i,
  /buy (this )?article/i,
];

const probeCache = new Map();

/** Xoá cache probe trong test hoặc khi cần kiểm tra lại toàn bộ. */
export function clearProbeCache() {
  probeCache.clear();
}

function cacheKeyFor(item = {}) {
  if (item.doi) return `doi:${String(item.doi).toLowerCase()}`;
  if (item.pmcid) return `pmc:${String(item.pmcid).toUpperCase()}`;
  if (item.pdfUrl) return `url:${item.pdfUrl}`;
  if (item.fullTextUrl) return `url:${item.fullTextUrl}`;
  return '';
}

function readCache(key) {
  if (!key) return null;
  const entry = probeCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    probeCache.delete(key);
    return null;
  }
  return entry.result;
}

function writeCache(key, result) {
  if (!key || !result || result.status === 'skipped') return;
  probeCache.set(key, { result, expiresAt: Date.now() + PROBE_CACHE_TTL_MS });
}

function httpStatus(error) {
  const fromDetails = Number(error?.details?.status || 0);
  if (fromDetails) return fromDetails;
  return Number(String(error?.message || '').match(/HTTP (\d{3})/)?.[1] || 0);
}

/** Lỗi 404/410 là fail; timeout/403/429/5xx là unknown (không kết luận bài không đọc được). */
function classifyProbeError(error) {
  const status = httpStatus(error);
  if ([404, 410].includes(status)) {
    return { status: 'fail', reason: `http_${status}` };
  }
  if ([401, 403, 429, 500, 502, 503, 504].includes(status)) {
    return { status: 'unknown', reason: `http_${status}` };
  }
  if (/timeout|aborted|fetch failed|econn|enotfound|socket/i.test(error?.message || '')) {
    return { status: 'unknown', reason: 'network' };
  }
  return { status: 'unknown', reason: String(error?.message || error).slice(0, 160) };
}

async function probePmc(pmcid, { timeoutMs }) {
  const url = `${EUROPEPMC}/${pmcid}/fullTextXML`;
  try {
    const response = await probeUrl(url, {
      timeout: timeoutMs,
      accept: 'application/xml,text/xml',
      maxBytes: 128 * 1024,
    });
    const body = response.buffer.toString('utf8');
    if (/<article|<fullTextArticle|<body/i.test(body)) {
      return { status: 'ok', kind: 'pmc_xml', url: response.finalUrl };
    }
    return { status: 'fail', kind: 'pmc_xml', reason: 'not_pmc_xml', url: response.finalUrl };
  } catch (error) {
    return { ...classifyProbeError(error), kind: 'pmc_xml', url };
  }
}

async function probePdf(url, { timeoutMs }) {
  try {
    const response = await probeUrl(url, {
      timeout: timeoutMs,
      accept: 'application/pdf,text/html;q=0.9,*/*;q=0.8',
      headers: { Range: 'bytes=0-65535', ...BROWSER_HEADERS },
      maxBytes: 64 * 1024,
    });
    const magic = response.buffer.subarray(0, 5).toString('latin1');
    if (magic.startsWith('%PDF') || /application\/pdf/i.test(response.contentType)) {
      return { status: 'ok', kind: 'pdf', url: response.finalUrl };
    }

    if (/html/i.test(response.contentType)) {
      const recovered = extractCitationPdfUrl(
        response.buffer.toString('utf8'),
        response.finalUrl || url,
      );
      if (recovered && recovered !== url) {
        const second = await probeUrl(recovered, {
          timeout: timeoutMs,
          accept: 'application/pdf',
          headers: { Range: 'bytes=0-65535', ...BROWSER_HEADERS },
          maxBytes: 64 * 1024,
        });
        if (
          second.buffer.subarray(0, 5).toString('latin1').startsWith('%PDF') ||
          /application\/pdf/i.test(second.contentType)
        ) {
          return { status: 'ok', kind: 'pdf', url: second.finalUrl };
        }
      }
      // Có thể là Cloudflare/challenge hoặc landing; không kết luận PDF hỏng.
      return { status: 'unknown', kind: 'pdf', reason: 'html_instead_of_pdf', url: response.finalUrl };
    }

    return { status: 'fail', kind: 'pdf', reason: 'not_pdf', url: response.finalUrl };
  } catch (error) {
    return { ...classifyProbeError(error), kind: 'pdf', url };
  }
}

async function probeHtml(url, { timeoutMs }) {
  try {
    const response = await fetchBuffer(url, {
      maxBytes: HTML_MAX_BYTES,
      accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
      headers: BROWSER_HEADERS,
      timeout: timeoutMs,
      retries: 0,
    });

    if (/application\/pdf/i.test(response.contentType)) {
      return probePdf(response.finalUrl || url, { timeoutMs });
    }
    const head = response.buffer.subarray(0, 512).toString('utf8').trim().toLowerCase();
    const looksHtml =
      /html|xml/i.test(response.contentType) ||
      head.startsWith('<!doctype') ||
      head.startsWith('<html') ||
      head.includes('<head');
    if (!looksHtml) {
      return { status: 'fail', kind: 'oa_html', reason: 'not_html', url: response.finalUrl };
    }

    const text = htmlToText(response.buffer.toString('utf8'));
    if (text.length < HTML_MIN_CHARS) {
      return { status: 'fail', kind: 'oa_html', reason: 'too_short', url: response.finalUrl };
    }
    if (PAYWALL_MARKERS.some((pattern) => pattern.test(text))) {
      return { status: 'fail', kind: 'oa_html', reason: 'paywall_marker', url: response.finalUrl };
    }
    const markers = FULLTEXT_MARKERS.filter((pattern) => pattern.test(text)).length;
    const hasDiscussion = /\bdiscussion\b/i.test(text);
    // Structured abstract cũng có Methods/Results/Conclusions; cần thêm Discussion
    // hoặc bài đủ dài với cấu trúc rõ ràng để tránh nhận abstract làm toàn văn.
    if (markers < 2 || (!hasDiscussion && !(text.length > 8000 && markers >= 3))) {
      return {
        status: 'fail',
        kind: 'oa_html',
        reason: 'no_fulltext_structure',
        url: response.finalUrl,
      };
    }
    return { status: 'ok', kind: 'oa_html', url: response.finalUrl, textLength: text.length };
  } catch (error) {
    return { ...classifyProbeError(error), kind: 'oa_html', url };
  }
}

/**
 * Kiểm tra một kết quả có thật sự mở được toàn văn:
 * PMC XML -> PDF trực tiếp -> HTML OA. Không tải toàn bộ PDF.
 */
export async function probeFullText(item = {}, { timeoutMs = 2500 } = {}) {
  const cacheKey = cacheKeyFor(item);
  const cached = readCache(cacheKey);
  if (cached) return cached;

  const attempts = [];
  let unknown = null;

  if (item.pmcid && item.isOpenAccess) {
    const result = await probePmc(item.pmcid, { timeoutMs });
    if (result.status === 'ok') {
      writeCache(cacheKey, result);
      return result;
    }
    attempts.push(result);
    if (result.status === 'unknown') unknown = result;
  }

  if (item.pdfUrl) {
    const result = await probePdf(item.pdfUrl, { timeoutMs });
    if (result.status === 'ok') {
      writeCache(cacheKey, result);
      return result;
    }
    attempts.push(result);
    if (result.status === 'unknown') unknown = result;
  }

  if (item.fullTextUrl) {
    const result = await probeHtml(item.fullTextUrl, { timeoutMs });
    if (result.status === 'ok') {
      writeCache(cacheKey, result);
      return result;
    }
    attempts.push(result);
    if (result.status === 'unknown') unknown = result;
  }

  if (unknown) {
    const result = { ...unknown, attempts };
    writeCache(cacheKey, result);
    return result;
  }
  const result = {
    status: 'fail',
    kind: 'none',
    reason: attempts[0]?.reason || 'no_url',
    attempts,
  };
  writeCache(cacheKey, result);
  return result;
}

const LABELS = {
  pmc_xml: 'Toàn văn PMC',
  pdf: 'Có PDF',
  oa_html: 'Toàn văn HTML OA',
};

/** Gộp kết quả probe vào item; `keep=false` nghĩa là loại khỏi kết quả trả về. */
export function applyProbeResult(item = {}, result = {}) {
  const probe = {
    status: result.status,
    kind: result.kind || '',
    url: result.url || '',
    reason: result.reason || '',
  };

  if (result.status === 'ok') {
    if (result.kind === 'pdf') {
      return {
        ...item,
        pdfUrl: item.pdfUrl || result.url || '',
        hasFullText: true,
        hasFullTextLink: false,
        fullTextSource: 'pdf',
        fullTextLabel: LABELS.pdf,
        probe,
        keep: true,
      };
    }
    if (result.kind === 'pmc_xml') {
      return {
        ...item,
        hasFullText: true,
        hasFullTextLink: false,
        fullTextSource: 'pmc_xml',
        fullTextLabel: LABELS.pmc_xml,
        probe,
        keep: true,
      };
    }
    if (result.kind === 'oa_html') {
      return {
        ...item,
        fullTextUrl: item.fullTextUrl || result.url || '',
        hasFullText: true,
        hasFullTextLink: false,
        fullTextSource: 'oa_html',
        fullTextLabel: LABELS.oa_html,
        probe,
        keep: true,
      };
    }
  }

  // Timeout/403/429/5xx: giữ bài nếu metadata đã có PMC/PDF; landing-only thì loại.
  // Fail (404/410, sai content-type) thì loại kể cả metadata báo có PDF.
  const keep =
    (result.status === 'unknown' || result.status === 'skipped') && item.hasFullText === true;
  return { ...item, probe, keep };
}

async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    for (;;) {
      const index = cursor;
      cursor += 1;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
}

/**
 * Probe top N sau khi xếp hạng. Có ngân sách tổng để search không bị treo
 * nếu nhiều host chậm.
 */
export async function probeTopCandidates(
  items = [],
  {
    limit = 20,
    concurrency = 8,
    timeoutMs = 2500,
    totalBudgetMs = 8000,
    probeImpl = probeFullText,
  } = {},
) {
  const selected = items.slice(0, limit);
  if (!selected.length) return [];
  const deadline = Date.now() + totalBudgetMs;

  const results = await mapWithConcurrency(selected, concurrency, async (item) => {
    if (Date.now() > deadline) return { status: 'skipped', reason: 'budget' };
    try {
      return await probeImpl(item, { timeoutMs });
    } catch (error) {
      if (error instanceof ApiError) {
        return { ...classifyProbeError(error), kind: 'none' };
      }
      return { status: 'unknown', kind: 'none', reason: String(error?.message || error) };
    }
  });

  return selected.map((item, index) => applyProbeResult(item, results[index]));
}
