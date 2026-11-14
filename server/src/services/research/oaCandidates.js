import { env } from '../../config/env.js';
import { fetchJson } from '../../utils/http.js';
import { normalizeDoi } from '../../utils/doi.js';
import { reconstructAbstract } from './openalex.js';

const OPENALEX = 'https://api.openalex.org/works';
const UNPAYWALL = 'https://api.unpaywall.org/v2';
const SEMANTIC_SCHOLAR = 'https://api.semanticscholar.org/graph/v1/paper';

function cleanUrl(value) {
  return String(value || '')
    .trim()
    .replace(/&amp;/g, '&');
}

function addCandidate(list, seen, url, source, kind) {
  const clean = cleanUrl(url);
  if (!clean || seen.has(clean)) return;
  if (!/^https?:\/\//i.test(clean)) return;
  seen.add(clean);
  list.push({ source: source || 'openalex', url: clean, kind });
}

/**
 * Mọi vị trí OpenAlex biết cho một bài: PDF trực tiếp trước, landing page sau.
 * Đây là điểm mạnh so với chỉ dùng `best_oa_location`.
 */
export function candidatesFromOpenAlex(work = {}) {
  const out = [];
  const seen = new Set();
  const best = work.best_oa_location || {};
  const locations = Array.isArray(work.locations) ? work.locations : [];

  addCandidate(out, seen, best.pdf_url, best.source?.display_name, 'pdf');
  for (const location of locations) {
    addCandidate(out, seen, location?.pdf_url, location?.source?.display_name, 'pdf');
  }
  addCandidate(out, seen, best.landing_page_url, best.source?.display_name, 'landing');
  for (const location of locations) {
    if (location?.is_oa) {
      addCandidate(out, seen, location?.landing_page_url, location?.source?.display_name, 'landing');
    }
  }
  return out;
}

/** Unpaywall trả cả best_oa_location và danh sách oa_locations. */
export function candidatesFromUnpaywall(data = {}) {
  const out = [];
  const seen = new Set();
  const best = data.best_oa_location || {};
  addCandidate(out, seen, best.url_for_pdf, best.host_type || best.version, 'pdf');
  addCandidate(out, seen, best.url, best.host_type || best.version, 'landing');
  for (const location of Array.isArray(data.oa_locations) ? data.oa_locations : []) {
    addCandidate(out, seen, location?.url_for_pdf, location?.host_type || location?.version, 'pdf');
    addCandidate(out, seen, location?.url, location?.host_type || location?.version, 'landing');
  }
  return out;
}

export function candidatesFromSemanticScholar(data = {}) {
  const out = [];
  const seen = new Set();
  addCandidate(out, seen, data?.openAccessPdf?.url, 'semantic_scholar', 'pdf');
  return out;
}

function openAlexPath(doiOrId) {
  const value = String(doiOrId || '').trim();
  if (/^W\d+$/i.test(value)) return value.toUpperCase();
  if (/^doi:/i.test(value)) return `doi:${normalizeDoi(value.slice(4))}`;
  const doi = normalizeDoi(value);
  return doi ? `doi:${doi}` : '';
}

export async function openAlexCandidates(doiOrId, { fetchJsonImpl = fetchJson } = {}) {
  const path = openAlexPath(doiOrId);
  if (!path) return [];
  try {
    const data = await fetchJsonImpl(
      `${OPENALEX}/${path}?select=locations,best_oa_location,primary_location&mailto=${encodeURIComponent(env.CONTACT_EMAIL)}`,
    );
    return candidatesFromOpenAlex(data);
  } catch {
    return [];
  }
}

export async function unpaywallCandidates(doi, { fetchJsonImpl = fetchJson } = {}) {
  const normalized = normalizeDoi(doi);
  if (!normalized) return [];
  try {
    const data = await fetchJsonImpl(
      `${UNPAYWALL}/${encodeURIComponent(normalized)}?email=${encodeURIComponent(env.CONTACT_EMAIL)}`,
    );
    return candidatesFromUnpaywall(data);
  } catch {
    return [];
  }
}

/** Semantic Scholar không cần key nhưng rate limit thấp; chỉ dùng như nguồn cuối. */
export async function semanticScholarCandidates(doi, { fetchJsonImpl = fetchJson } = {}) {
  const normalized = normalizeDoi(doi);
  if (!normalized) return [];
  try {
    const data = await fetchJsonImpl(
      `${SEMANTIC_SCHOLAR}/DOI:${encodeURIComponent(normalized)}?fields=openAccessPdf`,
      { timeout: 15000 },
    );
    return candidatesFromSemanticScholar(data);
  } catch {
    return [];
  }
}

export function dedupeCandidates(candidates = []) {
  const seen = new Set();
  const out = [];
  for (const candidate of candidates) {
    const url = cleanUrl(candidate?.url);
    if (!url || seen.has(url) || !/^https?:\/\//i.test(url)) continue;
    seen.add(url);
    out.push({
      source: candidate.source || 'source',
      url,
      kind: candidate.kind === 'landing' ? 'landing' : 'pdf',
    });
  }
  // PDF trực tiếp trước, landing page sau — giảm số lần tải HTML và thời gian.
  return out.sort((a, b) => Number(a.kind === 'landing') - Number(b.kind === 'landing'));
}

const shortId = (value) => String(value || '').split('/').pop();

/**
 * Gộp tình trạng open-access/full-text từ một batch OpenAlex vào kết quả search.
 * Hàm thuần để test; `enrichFullTextAvailability` chỉ lo phần gọi API.
 */
export function mergeOpenAlexAvailability(items = [], works = []) {
  const byDoi = new Map();
  for (const work of works) {
    const key = normalizeDoi(work?.doi || '').toLowerCase();
    if (key) byDoi.set(key, work);
  }

  return items.map((item) => {
    const key = normalizeDoi(item.doi || '').toLowerCase();
    const work = key ? byDoi.get(key) : null;
    if (!work) return item;

    const best = work.best_oa_location || {};
    const oa = work.open_access || {};
    const oaUrl = cleanUrl(oa.oa_url);
    const pdfUrl = item.pdfUrl || best.pdf_url || (/\.pdf(?:$|[?#])/i.test(oaUrl) ? oaUrl : '');
    const fullTextUrl =
      item.fullTextUrl || best.landing_page_url || (!pdfUrl && oaUrl ? oaUrl : '');

    return {
      ...item,
      title: item.title || work.title || work.display_name || '',
      year: item.year || work.publication_year || undefined,
      journal:
        item.journal || work.primary_location?.source?.display_name || '',
      abstract: item.abstract || reconstructAbstract(work.abstract_inverted_index),
      authors:
        item.authors?.length
          ? item.authors
          : (work.authorships || [])
              .map((authorship) => authorship.author?.display_name)
              .filter(Boolean)
              .slice(0, 30),
      volume: item.volume || work.biblio?.volume || '',
      issue: item.issue || work.biblio?.issue || '',
      pages: item.pages || work.biblio?.first_page || '',
      isOpenAccess: Boolean(item.isOpenAccess || oa.is_oa),
      oaStatus: item.oaStatus || oa.oa_status || '',
      pdfUrl,
      fullTextUrl,
      pmcid: item.pmcid || shortId(work.ids?.pmcid) || '',
      isRetracted: Boolean(item.isRetracted || work.is_retracted),
      journalHIndex: item.journalHIndex ?? work.primary_location?.source?.h_index,
      journalImpact2yr:
        item.journalImpact2yr ?? work.primary_location?.source?.summary_stats?.['2yr_mean_citedness'],
    };
  });
}

/**
 * Một call OpenAlex theo batch DOI (tối đa 50) để biết bài nào thật sự có
 * full text trước khi áp filter `fullTextOnly`. Lỗi mạng không làm hỏng search.
 */
export async function enrichFullTextAvailability(items = [], { fetchJsonImpl = fetchJson } = {}) {
  const dois = [
    ...new Set(items.map((item) => normalizeDoi(item.doi || '')).filter(Boolean)),
  ].slice(0, 50);
  if (!dois.length) return items;

  try {
    const data = await fetchJsonImpl(
      `${OPENALEX}?filter=doi:${dois.join('|')}&select=doi,ids,title,display_name,publication_year,authorships,abstract_inverted_index,biblio,open_access,best_oa_location,primary_location,is_retracted&per-page=${dois.length}&mailto=${encodeURIComponent(env.CONTACT_EMAIL)}`,
      { cacheTtlMs: 10 * 60 * 1000 },
    );
    return mergeOpenAlexAvailability(items, data?.results || []);
  } catch {
    return items;
  }
}
