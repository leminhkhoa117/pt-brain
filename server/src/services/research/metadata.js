import { ApiError } from '../../utils/ApiError.js';
import { fetchBuffer, fetchJson } from '../../utils/http.js';
import { decodeEntities, extractHtmlTitle, htmlToText, normalizeText, xmlToText } from '../../utils/text.js';
import { extractDoi, normalizeDoi, doiFromFilename } from '../../utils/doi.js';
import { env } from '../../config/env.js';
import { evidenceLevelFromPublicationTypes } from './evidence.js';
import { parsePdfBuffer } from './pdf.js';
import { mapOpenAlexWork } from './openalex.js';
import {
  candidatesFromOpenAlex,
  candidatesFromUnpaywall,
  dedupeCandidates,
  semanticScholarCandidates,
} from './oaCandidates.js';
import { fetchFirstReadablePdf } from './pdfFetch.js';

const EUROPEPMC = 'https://www.ebi.ac.uk/europepmc/webservices/rest';
const CROSSREF = 'https://api.crossref.org/works';
const UNPAYWALL = 'https://api.unpaywall.org/v2';
const OPENALEX_WORKS = 'https://api.openalex.org/works';

export { normalizeDoi };

const asArray = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

export function parseIdentifier(raw) {
  const value = String(raw || '').trim();
  const doi = value.match(/\b(10\.\d{4,9}\/[-._;()/:A-Z0-9]+)\b/i);
  if (doi) return { type: 'doi', value: normalizeDoi(doi[1]) };

  if (/^PMC\d+$/i.test(value)) return { type: 'pmcid', value: value.toUpperCase() };
  const pmcInUrl = value.match(/\/(PMC\d+)(?:[/?#]|$)/i);
  if (pmcInUrl) return { type: 'pmcid', value: pmcInUrl[1].toUpperCase() };

  const pmidUrl = value.match(/pubmed(?:\.ncbi\.nlm\.nih\.gov)?\/(\d{4,9})/i);
  const pmidQuery = value.match(/[?&](?:term|id)=(\d{4,9})\b/);
  if (pmidUrl) return { type: 'pmid', value: pmidUrl[1] };
  if (pmidQuery) return { type: 'pmid', value: pmidQuery[1] };

  if (/^\d{4,9}$/.test(value)) return { type: 'pmid', value };
  if (/^https?:\/\//i.test(value)) return { type: 'url', value };
  return { type: 'unknown', value };
}

async function europePmcSearch(query) {
  const url = `${EUROPEPMC}/search?query=${encodeURIComponent(query)}&format=json&resultType=core&pageSize=1`;
  const data = await fetchJson(url);
  return data?.resultList?.result?.[0] || null;
}

async function crossrefByDoi(doi) {
  const data = await fetchJson(`${CROSSREF}/${encodeURIComponent(doi)}`);
  return data?.message || null;
}

async function unpaywallByDoi(doi) {
  return fetchJson(`${UNPAYWALL}/${encodeURIComponent(doi)}?email=${encodeURIComponent(env.CONTACT_EMAIL)}`);
}

async function openalexByDoi(doi) {
  const normalized = normalizeDoi(doi);
  if (!normalized) return null;
  return fetchJson(
    `${OPENALEX_WORKS}/doi:${normalized}?select=id,doi,title,display_name,publication_year,type,cited_by_count,authorships,abstract_inverted_index,ids,is_retracted,open_access,primary_location,best_oa_location,locations&mailto=${encodeURIComponent(env.CONTACT_EMAIL)}`,
  );
}

async function fetchPmcFullText(pmcid) {
  const { buffer } = await fetchBuffer(`${EUROPEPMC}/${pmcid}/fullTextXML`, {
    maxBytes: 8 * 1024 * 1024,
    accept: 'application/xml,text/xml',
  });
  const text = xmlToText(buffer.toString('utf8'));
  return text.length > 500 ? text : null;
}

function authorsFromEuropePmc(authorString) {
  if (!authorString) return [];
  return normalizeText(authorString)
    .replace(/\.$/, '')
    .split(/\s*,\s*/)
    .filter(Boolean)
    .slice(0, 30);
}

function authorsFromCrossref(authors = []) {
  return authors
    .map((a) => normalizeText(`${a.given || ''} ${a.family || a.name || ''}`))
    .filter(Boolean)
    .slice(0, 30);
}

function yearFromCrossref(message) {
  const print = message?.['published-print']?.['date-parts']?.[0]?.[0];
  const issued = message?.issued?.['date-parts']?.[0]?.[0];
  const online = message?.['published-online']?.['date-parts']?.[0]?.[0];
  return print || issued || online || undefined;
}

function pickOpenAccessUrl(pmc, oa) {
  const urls = asArray(pmc?.fullTextUrlList?.fullTextUrl);
  const open = urls.find(
    (u) => /open access/i.test(u.availability || '') && !/pdf/i.test(u.documentStyle || ''),
  );
  const pdf = urls.find((u) => /open access/i.test(u.availability || '') && /pdf/i.test(u.documentStyle || ''));
  return {
    fullTextUrl: open?.url || oa?.best_oa_location?.url || '',
    pdfUrl: pdf?.url || oa?.best_oa_location?.url_for_pdf || '',
  };
}

export function mapEuropePmcResult(result) {
  const types = asArray(result?.pubTypeList?.pubType);
  const evidence = evidenceLevelFromPublicationTypes(types);
  const fullTextUrls = asArray(result?.fullTextUrlList?.fullTextUrl);
  const openHtml = fullTextUrls.find(
    (item) => /open access/i.test(item?.availability || '') && !/pdf/i.test(item?.documentStyle || ''),
  );
  const openPdf = fullTextUrls.find(
    (item) => /open access/i.test(item?.availability || '') && /pdf/i.test(item?.documentStyle || ''),
  );
  return {
    title: normalizeText(result?.title || ''),
    authors: authorsFromEuropePmc(result?.authorString),
    year: Number(result?.pubYear || result?.journalInfo?.yearOfPublication) || undefined,
    journal: normalizeText(result?.journalInfo?.journal?.title || result?.journalTitle || ''),
    volume: String(result?.journalInfo?.volume || ''),
    issue: String(result?.journalInfo?.issue || ''),
    pages: normalizeText(result?.pageInfo || ''),
    doi: normalizeDoi(result?.doi || ''),
    pmid: result?.pmid || '',
    pmcid: result?.pmcid || '',
    url: result?.doi ? `https://doi.org/${normalizeDoi(result.doi)}` : '',
    abstract: normalizeText(decodeEntities(result?.abstractText || '')),
    publicationTypes: types,
    evidenceLevel: evidence.level,
    citationCount: Number(result?.citedByCount) || 0,
    isOpenAccess: result?.isOpenAccess === 'Y',
    fullTextUrl: openHtml?.url || '',
    pdfUrl: openPdf?.url || '',
  };
}

function basePaperFromCrossref(message) {
  const types = asArray(message?.type);
  return {
    title: normalizeText(decodeEntities(message?.title?.[0] || '')),
    authors: authorsFromCrossref(message?.author),
    year: yearFromCrossref(message),
    journal: normalizeText(decodeEntities(message?.['container-title']?.[0] || '')),
    volume: String(message?.volume || ''),
    issue: String(message?.issue || ''),
    pages: String(message?.page || ''),
    doi: normalizeDoi(message?.DOI || ''),
    url: message?.DOI ? `https://doi.org/${normalizeDoi(message.DOI)}` : '',
    abstract: normalizeText(decodeEntities(String(message?.abstract || '').replace(/<[^>]+>/g, ' '))),
    publicationTypes: types,
    evidenceLevel: evidenceLevelFromPublicationTypes(types).level,
    citationCount: Number(message?.['is-referenced-by-count']) || 0,
    isOpenAccess: false,
  };
}

function normalizeForMatch(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const TITLE_STOPWORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'from',
  'into',
  'during',
  'after',
  'before',
  'between',
  'among',
  'using',
  'effect',
  'effects',
  'influence',
  'study',
  'trial',
]);

function titleTokens(value = '') {
  return normalizeForMatch(value)
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !TITLE_STOPWORDS.has(token));
}

function titleSimilarity(a = '', b = '') {
  const left = new Set(titleTokens(a));
  const right = new Set(titleTokens(b));
  if (!left.size || !right.size) return 0;
  let overlap = 0;
  for (const token of left) if (right.has(token)) overlap += 1;
  return (2 * overlap) / (left.size + right.size);
}

function cleanTitleForQuery(value = '') {
  return String(value)
    .replace(/[’‘“”]/g, ' ')
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 220);
}

/** Các manh mối thư mục có trong trang đầu PDF (kể cả khi bài không in DOI). */
export function extractBibliographicHints(text = '') {
  const value = String(text).slice(0, 40000);
  const hints = {};

  const footer = value.match(
    /VOLUME\s+(\d+)\s*\|\s*NUMBER\s+(\d+)\s*\|\s*[A-Z]+\s+(\d{4})\s*\|\s*(\d{3,5})/i,
  );
  if (footer) {
    hints.volume = footer[1];
    hints.issue = footer[2];
    hints.year = Number(footer[3]);
    hints.pageStart = footer[4];
  }

  const citation = value.match(
    /([A-Z][A-Za-z&.\s]{2,60}?)\s*(\d+)\((\d+)\)\s*[:\s]\s*(\d{3,5})\s*[–-]\s*(\d{3,5}),?\s*(\d{4})/,
  );
  if (citation) {
    hints.journal = normalizeText(citation[1]).replace(/\s+$/, '');
    hints.volume = hints.volume || citation[2];
    hints.issue = hints.issue || citation[3];
    hints.pageStart = hints.pageStart || citation[4];
    hints.pageEnd = citation[5];
    hints.year = hints.year || Number(citation[6]);
  }

  const range = value.match(/\b(\d{3,5})\s*[–-]\s*(\d{3,5})\b/);
  if (range) {
    hints.pageStart = hints.pageStart || range[1];
    hints.pageEnd = hints.pageEnd || range[2];
  }

  const fullJournal = value.match(/\b(Journal of [A-Z][A-Za-z&.\s]{4,90}?(?:Research|Medicine|Science|Sciences|Review|Reviews|Nutrition|Physiology))\b/);
  if (fullJournal) hints.journalFull = normalizeText(fullJournal[1]);

  return hints;
}

export async function crossrefSearch(query, rows = 5) {
  if (!query || query.length < 8) return [];
  const url = `${CROSSREF}?query.bibliographic=${encodeURIComponent(query)}&rows=${rows}&select=DOI,title,author,container-title,issued,volume,issue,page,type`;
  const data = await fetchJson(url);
  return Array.isArray(data?.message?.items) ? data.message.items : [];
}

export function crossrefQueryCandidates(paper = {}, hints = {}) {
  const title = cleanTitleForQuery(paper.title);
  const authors = (paper.authors || []).slice(0, 2).join(' ');
  const journal = normalizeText(hints.journalFull || hints.journal || paper.journal || '');
  const year = hints.year || paper.year || '';
  const pages = [hints.pageStart || '', hints.pageEnd || ''].filter(Boolean).join(' ');
  const parts = (items) => items.filter(Boolean).join(' ');
  const titleLooksLikeCode =
    !title ||
    /^[A-Z0-9 ._-]{3,40}$/.test(title) ||
    title.split(' ').filter((word) => /[a-z]{3}/i.test(word)).length < 4;

  const queries = [
    parts([journal, year, pages]),
    parts([journal, year, pages, title.split(' ').slice(0, 10).join(' ')]),
    parts([title, journal, year]),
    parts([title.split(' ').slice(0, 14).join(' '), authors, year]),
    parts([journal, year, pages, authors]),
  ];
  if (titleLooksLikeCode) {
    // Với PDF chỉ có mã bài, ưu tiên thư mục + trang trước.
    queries.sort((a, b) => Number(!a.includes(journal)) - Number(!b.includes(journal)));
  }

  return queries
    .map((query) => query.trim())
    .filter((query, index, list) => query.length >= 8 && list.indexOf(query) === index);
}

export function pickCrossrefMatch(items = [], paper = {}, hints = {}) {
  let best = null;
  for (const item of items) {
    const candidate = basePaperFromCrossref(item);
    if (!candidate.title || candidate.title.length < 8) continue;
    const similarity = titleSimilarity(paper.title, candidate.title);
    const journalMatch =
      (hints.journal || hints.journalFull) &&
      candidate.journal &&
      [hints.journal, hints.journalFull]
        .filter(Boolean)
        .some(
          (journal) =>
            normalizeForMatch(candidate.journal).includes(normalizeForMatch(journal)) ||
            normalizeForMatch(journal).includes(normalizeForMatch(candidate.journal)),
        );
    const yearMatch = hints.year && candidate.year === hints.year;
    const pageMatch =
      hints.pageStart &&
      candidate.pages &&
      candidate.pages.includes(hints.pageStart) &&
      (!hints.pageEnd || candidate.pages.includes(hints.pageEnd));
    const score =
      similarity * 4 + (journalMatch ? 2 : 0) + (yearMatch ? 1.5 : 0) + (pageMatch ? 2 : 0) +
      Math.min(0.5, candidate.title.length / 200);
    if (score < 3.2) continue;
    if (similarity < 0.3 && !(journalMatch && yearMatch && pageMatch)) continue;
    if (!best || score > best.score) best = { score, item };
  }
  return best?.item || null;
}

function shouldReplaceTitle(current = '') {
  const value = normalizeText(String(current));
  if (!value) return true;
  if (value === value.toUpperCase() && value.length > 16) return true;
  if (/^[A-Z0-9 ._-]{3,30}$/.test(value)) return true;
  if (value.split(/\s+/).length < 4 && value.length < 48) return true;
  return false;
}

/**
 * Làm giàu metadata từ Crossref bằng DOI (từ metadata, text hoặc tên file),
 * nếu không có DOI thì tìm bằng thư mục (title + journal + year + pages).
 */
export async function enrichPaperMetadata(
  paper = {},
  { text = '', filename = '', keepTitle = false } = {},
) {
  const headText = String(text).slice(0, 8000);
  const doi =
    normalizeDoi(paper.doi) ||
    doiFromFilename(filename) ||
    extractDoi(headText);
  const hints = extractBibliographicHints(text);
  let cross = doi ? await crossrefByDoi(doi).catch(() => null) : null;

  if (!cross) {
    for (const query of crossrefQueryCandidates(paper, hints)) {
      const items = await crossrefSearch(query).catch(() => []);
      cross = pickCrossrefMatch(items, paper, hints);
      if (cross) break;
    }
  }
  if (!cross) {
    return { ...paper, doi: doi || paper.doi || '', biblioHints: hints };
  }

  const meta = basePaperFromCrossref(cross);
  const useCrossrefTitle = !keepTitle && Boolean(meta.title);
  return {
    ...paper,
    title: useCrossrefTitle
      ? meta.title
      : shouldReplaceTitle(paper.title) && meta.title
        ? meta.title
        : paper.title,
    authors: meta.authors?.length ? meta.authors : paper.authors || [],
    year: meta.year || paper.year,
    journal: meta.journal || paper.journal || '',
    volume: meta.volume || paper.volume || '',
    issue: meta.issue || paper.issue || '',
    pages: meta.pages || paper.pages || '',
    doi: meta.doi || doi || paper.doi || '',
    url: paper.url || meta.url || '',
    publicationTypes: paper.publicationTypes?.length ? paper.publicationTypes : meta.publicationTypes,
    evidenceLevel: paper.evidenceLevel || meta.evidenceLevel,
    biblioHints: hints,
    metadataSource: 'crossref',
  };
}

/**
 * Lấy metadata + nội dung theo DOI/PMID/PMCID.
 * Ưu tiên toàn văn open access (Europe PMC XML -> PDF), nếu không có thì dùng abstract.
 */export async function resolveWorkByDoi(doiInput) {
  const doi = normalizeDoi(doiInput);
  if (!doi) throw ApiError.badRequest('DOI không hợp lệ');

  const [em, openalex] = await Promise.all([
    europePmcSearch(`DOI:"${doi}"`).catch(() => null),
    openalexByDoi(doi).catch(() => null),
  ]);
  const cross = em ? null : await crossrefByDoi(doi).catch(() => null);
  if (!em && !cross && !openalex) {
    throw new ApiError(404, 'PAPER_NOT_FOUND', 'Không tìm thấy bài báo với DOI này');
  }

  const oa = await unpaywallByDoi(doi).catch(() => null);
  const paper = em
    ? mapEuropePmcResult(em)
    : cross
      ? basePaperFromCrossref(cross)
      : { ...mapOpenAlexWork(openalex), url: `https://doi.org/${doi}` };
  paper.doi = doi;
  paper.title = paper.title || normalizeText(cross?.title?.[0] || openalex?.title || '') || doi;
  paper.url = paper.url || `https://doi.org/${doi}`;
  paper.isOpenAccess = paper.isOpenAccess || Boolean(oa?.is_oa || openalex?.open_access?.is_oa);
  paper.oaStatus = paper.oaStatus || openalex?.open_access?.oa_status || '';
  paper.isRetracted = Boolean(paper.isRetracted || openalex?.is_retracted);
  paper.source = em ? 'europepmc' : 'openalex';

  const journalSource = openalex?.primary_location?.source;
  if (journalSource?.h_index != null) paper.journalHIndex = journalSource.h_index;
  const impact = journalSource?.summary_stats?.['2yr_mean_citedness'];
  if (impact != null) paper.journalImpact2yr = Number(impact);

  const oaUrls = pickOpenAccessUrl(em, oa);
  paper.fullTextUrl =
    oaUrls.fullTextUrl || paper.fullTextUrl || openalex?.best_oa_location?.landing_page_url || '';
  paper.pdfUrl = oaUrls.pdfUrl || paper.pdfUrl || openalex?.best_oa_location?.pdf_url || '';

  let text = '';
  let sourceKind = 'abstract';

  if (paper.pmcid && paper.isOpenAccess) {
    const full = await fetchPmcFullText(paper.pmcid).catch(() => null);
    if (full) {
      text = full;
      sourceKind = 'open_access_fulltext';
    }
  }
  if (!text && paper.fullTextUrl) {
    const page = await fetchBuffer(paper.fullTextUrl, {
      maxBytes: 6 * 1024 * 1024,
      accept: 'text/html,application/xhtml+xml',
    }).catch(() => null);
    if (page) {
      const extracted = htmlToText(page.buffer.toString('utf8'));
      if (extracted.length > 800) {
        text = extracted;
        sourceKind = 'open_access_fulltext';
      }
    }
  }
  if (!text && paper.pdfUrl) {
    const pdf = await fetchBuffer(paper.pdfUrl, {
      maxBytes: Math.min(env.PDF_MAX_MB, 30) * 1024 * 1024,
      accept: 'application/pdf',
    }).catch(() => null);
    if (pdf) {
      const parsed = await parsePdfBuffer(pdf.buffer).catch(() => null);
      if (parsed?.text && parsed.text.length > 800) {
        text = parsed.text;
        sourceKind = 'open_access_fulltext';
      }
    }
  }

  // Athenaeum-style fallback: thử mọi vị trí OA (OpenAlex locations, Unpaywall,
  // Semantic Scholar) thay vì chỉ best_oa_location. Giữ PMC XML ở ưu tiên đầu.
  if (!text) {
    const candidates = dedupeCandidates([
      ...candidatesFromOpenAlex(openalex || {}),
      ...candidatesFromUnpaywall(oa || {}),
      ...(await semanticScholarCandidates(doi)),
    ]);
    if (candidates.length) {
      const pdf = await fetchFirstReadablePdf(candidates, {
        maxBytes: Math.min(env.PDF_MAX_MB, 30) * 1024 * 1024,
      });
      if (pdf.ok) {
        text = pdf.text;
        sourceKind = 'open_access_fulltext';
        paper.pdfUrl = paper.pdfUrl || pdf.url;
      }
    }
  }

  if (!text) text = paper.abstract;
  if (!text || text.length < 80) {
    throw new ApiError(
      422,
      'NO_CONTENT',
      'Không lấy được abstract hoặc toàn văn của bài này. Hãy thử tải PDF hoặc dán nội dung.',
    );
  }

  return {
    paper,
    text,
    basedOn: sourceKind === 'abstract' ? 'abstract_only' : 'fulltext',
    sourceKind,
    sourceUrl: paper.url || paper.fullTextUrl || paper.pdfUrl,
  };
}

export async function resolveWorkByPmid(pmid) {
  const em = await europePmcSearch(`EXT_ID:${pmid} AND SRC:MED`);
  if (!em) throw new ApiError(404, 'PAPER_NOT_FOUND', 'Không tìm thấy bài báo với PMID này');
  if (em.doi) return resolveWorkByDoi(em.doi);

  const paper = mapEuropePmcResult(em);
  paper.source = 'pubmed';
  paper.url = `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;
  let text = paper.abstract;
  let sourceKind = 'abstract';
  if (paper.pmcid && paper.isOpenAccess) {
    const full = await fetchPmcFullText(paper.pmcid).catch(() => null);
    if (full) {
      text = full;
      sourceKind = 'open_access_fulltext';
    }
  }
  if (!text) throw new ApiError(422, 'NO_CONTENT', 'Bài này không có abstract/full text truy cập được');
  return {
    paper,
    text,
    basedOn: sourceKind === 'abstract' ? 'abstract_only' : 'fulltext',
    sourceKind,
    sourceUrl: paper.url,
  };
}

export async function resolveWorkByPmcid(pmcid) {
  const em = await europePmcSearch(`PMCID:${pmcid}`);
  if (!em) throw new ApiError(404, 'PAPER_NOT_FOUND', 'Không tìm thấy bài báo với PMCID này');
  if (em.doi) return resolveWorkByDoi(em.doi);

  const paper = mapEuropePmcResult(em);
  paper.source = 'europepmc';
  paper.url = `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcid}/`;
  const full = await fetchPmcFullText(pmcid).catch(() => null);
  if (!full) throw new ApiError(422, 'NO_CONTENT', 'Bài này chưa có toàn văn open access');
  return {
    paper,
    text: full,
    basedOn: 'fulltext',
    sourceKind: 'open_access_fulltext',
    sourceUrl: paper.url,
  };
}

/** Link thường: tải trang và trích nội dung chính (có kiểm tra SSRF + giới hạn dung lượng). */
export async function resolveWorkByUrl(url) {
  const parsed = parseIdentifier(url);
  if (parsed.type === 'doi') return resolveWorkByDoi(parsed.value);
  if (parsed.type === 'pmid') return resolveWorkByPmid(parsed.value);
  if (parsed.type === 'pmcid') return resolveWorkByPmcid(parsed.value);

  const page = await fetchBuffer(url, {
    maxBytes: 6 * 1024 * 1024,
    accept: 'text/html,application/xhtml+xml,application/pdf;q=0.9',
  });

  if (/application\/pdf/i.test(page.contentType)) {
    const parsedPdf = await parsePdfBuffer(page.buffer);
    return {
      paper: {
        title: parsedPdf.title || 'Bài báo từ PDF',
        authors: [],
        url: page.finalUrl,
        publicationTypes: [],
        evidenceLevel: 5,
        source: 'manual',
      },
      text: parsedPdf.text,
      basedOn: 'fulltext',
      sourceKind: 'user_pdf',
      sourceUrl: page.finalUrl,
    };
  }

  const html = page.buffer.toString('utf8');
  const text = htmlToText(html);
  if (text.length < 300) {
    throw new ApiError(
      422,
      'NO_CONTENT',
      'Không trích được nội dung chính từ link này. Thử tải PDF hoặc dán văn bản.',
    );
  }
  return {
    paper: {
      title: extractHtmlTitle(html) || page.finalUrl,
      authors: [],
      url: page.finalUrl,
      publicationTypes: [],
      evidenceLevel: 5,
      source: 'manual',
    },
    text,
    basedOn: 'fulltext',
    sourceKind: 'web_fulltext',
    sourceUrl: page.finalUrl,
  };
}

