import { ApiError } from '../../utils/ApiError.js';
import { fetchBuffer, fetchJson } from '../../utils/http.js';
import { decodeEntities, extractHtmlTitle, htmlToText, normalizeText, xmlToText } from '../../utils/text.js';
import { env } from '../../config/env.js';
import { evidenceLevelFromPublicationTypes } from './evidence.js';
import { parsePdfBuffer } from './pdf.js';

const EUROPEPMC = 'https://www.ebi.ac.uk/europepmc/webservices/rest';
const CROSSREF = 'https://api.crossref.org/works';
const UNPAYWALL = 'https://api.unpaywall.org/v2';

const asArray = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

export function normalizeDoi(value = '') {
  return String(value)
    .trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
    .replace(/^doi:\s*/i, '')
    .replace(/[.,;)\]]+$/, '');
}

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
  const parts = message?.issued?.['date-parts']?.[0];
  return parts?.[0] || undefined;
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
  return {
    title: normalizeText(result?.title || ''),
    authors: authorsFromEuropePmc(result?.authorString),
    year: Number(result?.pubYear || result?.journalInfo?.yearOfPublication) || undefined,
    journal: normalizeText(result?.journalInfo?.journal?.title || result?.journalTitle || ''),
    doi: normalizeDoi(result?.doi || ''),
    pmid: result?.pmid || '',
    pmcid: result?.pmcid || '',
    url: result?.doi ? `https://doi.org/${normalizeDoi(result.doi)}` : '',
    abstract: normalizeText(decodeEntities(result?.abstractText || '')),
    publicationTypes: types,
    evidenceLevel: evidence.level,
    citationCount: Number(result?.citedByCount) || 0,
    isOpenAccess: result?.isOpenAccess === 'Y',
  };
}

function basePaperFromCrossref(message) {
  const types = asArray(message?.type);
  return {
    title: normalizeText(message?.title?.[0] || ''),
    authors: authorsFromCrossref(message?.author),
    year: yearFromCrossref(message),
    journal: normalizeText(message?.['container-title']?.[0] || ''),
    doi: normalizeDoi(message?.DOI || ''),
    url: message?.DOI ? `https://doi.org/${normalizeDoi(message.DOI)}` : '',
    abstract: normalizeText(decodeEntities(String(message?.abstract || '').replace(/<[^>]+>/g, ' '))),
    publicationTypes: types,
    evidenceLevel: evidenceLevelFromPublicationTypes(types).level,
    citationCount: Number(message?.['is-referenced-by-count']) || 0,
    isOpenAccess: false,
  };
}

/**
 * Lấy metadata + nội dung theo DOI/PMID/PMCID.
 * Ưu tiên toàn văn open access (Europe PMC XML -> PDF), nếu không có thì dùng abstract.
 */
export async function resolveWorkByDoi(doiInput) {
  const doi = normalizeDoi(doiInput);
  if (!doi) throw ApiError.badRequest('DOI không hợp lệ');

  const em = await europePmcSearch(`DOI:"${doi}"`).catch(() => null);
  const cross = em ? null : await crossrefByDoi(doi).catch(() => null);
  if (!em && !cross) {
    throw new ApiError(404, 'PAPER_NOT_FOUND', 'Không tìm thấy bài báo với DOI này');
  }

  const oa = await unpaywallByDoi(doi).catch(() => null);
  const paper = em ? mapEuropePmcResult(em) : basePaperFromCrossref(cross);
  paper.doi = doi;
  paper.title = paper.title || normalizeText(cross?.title?.[0] || '') || doi;
  paper.isOpenAccess = paper.isOpenAccess || Boolean(oa?.is_oa);
  paper.source = 'europepmc';
  const oaUrls = pickOpenAccessUrl(em, oa);
  paper.fullTextUrl = oaUrls.fullTextUrl;
  paper.pdfUrl = oaUrls.pdfUrl;

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

