import mongoose from 'mongoose';
import { env } from '../../config/env.js';
import { fetchJson } from '../../utils/http.js';
import { normalizeDoi } from '../../utils/doi.js';
import { OaVerification } from '../../models/OaVerification.js';
import { assessFullText } from './fullText.js';
import { isVerifiedOpenAccess } from './accessPolicy.js';
import { reconstructAbstract } from './openalex.js';

const OPENALEX = 'https://api.openalex.org/works';
const UNPAYWALL = 'https://api.unpaywall.org/v2';
const SEMANTIC_SCHOLAR = 'https://api.semanticscholar.org/graph/v1/paper';

const OPENALEX_BATCH_SIZE = 50;
const UNPAYWALL_FALLBACK_LIMIT = 30;
const UNPAYWALL_CONCURRENCY = 5;
const POSITIVE_CACHE_MS = 7 * 24 * 60 * 60 * 1000;
const NEGATIVE_CACHE_MS = 24 * 60 * 60 * 1000;

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
      kind: ['landing', 'pmc', 'pmc_xml'].includes(candidate.kind) ? candidate.kind : 'pdf',
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
    const oaLocations = (Array.isArray(work.locations) ? work.locations : []).filter(
      (location) => location?.is_oa,
    );
    const locationPdf = oaLocations.find((location) => location?.pdf_url)?.pdf_url || '';
    const locationLanding =
      oaLocations.find((location) => location?.landing_page_url)?.landing_page_url || '';
    const locationLicense =
      [best.license, ...oaLocations.map((location) => location?.license)].find(Boolean) || '';
    const oaUrl = cleanUrl(oa.oa_url);
    const pdfUrl =
      item.pdfUrl ||
      best.pdf_url ||
      locationPdf ||
      (/\.pdf(?:$|[?#])/i.test(oaUrl) ? oaUrl : '');
    const fullTextUrl =
      item.fullTextUrl ||
      best.landing_page_url ||
      locationLanding ||
      (!pdfUrl && oaUrl ? oaUrl : '');

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
      isOpenAccess: Boolean(item.isOpenAccess || oa.is_oa || oaLocations.length),
      oaStatus: item.oaStatus || oa.oa_status || '',
      license: item.license || locationLicense,
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
 * Gộp metadata OA từ Unpaywall. Chỉ nhận khi `is_oa === true`; không biến
 * một landing page paywall thành nguồn toàn văn.
 */
export function mergeUnpaywallAvailability(item = {}, data = {}) {
  if (!data || data.is_oa !== true) return item;
  const best = data.best_oa_location || {};
  const locations = Array.isArray(data.oa_locations) ? data.oa_locations : [];
  const pdfUrl =
    best.url_for_pdf || locations.find((location) => location?.url_for_pdf)?.url_for_pdf || '';
  const landingUrl =
    best.url || locations.find((location) => location?.url)?.url || '';
  const license =
    best.license || locations.find((location) => location?.license)?.license || '';

  return {
    ...item,
    isOpenAccess: true,
    oaStatus: item.oaStatus || data.oa_status || '',
    license: item.license || license,
    pdfUrl: item.pdfUrl || pdfUrl,
    fullTextUrl: item.fullTextUrl || landingUrl,
  };
}

function cacheKeyFor(item = {}) {
  return normalizeDoi(item.doi || '').toLowerCase();
}

function applyCachedAvailability(item, row) {
  if (!row) return item;
  return {
    ...item,
    isOpenAccess: Boolean(item.isOpenAccess || row.isOpenAccess),
    oaStatus: item.oaStatus || row.oaStatus || '',
    license: item.license || row.license || '',
    pdfUrl: item.pdfUrl || row.pdfUrl || '',
    fullTextUrl: item.fullTextUrl || row.fullTextUrl || '',
    pmcid: item.pmcid || row.pmcid || '',
  };
}

async function readOaCache(dois = []) {
  if (mongoose.connection.readyState !== 1 || !dois.length) return new Map();
  try {
    const rows = await OaVerification.find({
      doi: { $in: dois },
      expiresAt: { $gt: new Date() },
    }).lean();
    return new Map(rows.map((row) => [String(row.doi).toLowerCase(), row]));
  } catch {
    return new Map();
  }
}

async function writeOaCache(items = [], confirmedDois = new Set()) {
  if (mongoose.connection.readyState !== 1 || !items.length) return;
  const now = Date.now();
  const operations = [];
  for (const item of items) {
    const doi = cacheKeyFor(item);
    if (!doi) continue;
    const verified = isVerifiedOpenAccess(item);
    const hasFullText = assessFullText(item).hasFullText;
    // Chỉ cache kết quả dương hoặc kết quả âm đã được Unpaywall xác nhận.
    // Lỗi mạng/rate-limit không được biến bài OA thành "closed" trong 24 giờ.
    if (!verified && !confirmedDois.has(doi)) continue;
    operations.push({
      updateOne: {
        filter: { doi },
        update: {
          $set: {
            doi,
            isOpenAccess: verified,
            oaStatus: item.oaStatus || '',
            license: item.license || '',
            pdfUrl: item.pdfUrl || '',
            fullTextUrl: item.fullTextUrl || '',
            pmcid: item.pmcid || '',
            verifiedAt: new Date(now),
            expiresAt: new Date(
              now + (verified && hasFullText ? POSITIVE_CACHE_MS : NEGATIVE_CACHE_MS),
            ),
          },
        },
        upsert: true,
      },
    });
  }
  if (!operations.length) return;
  await OaVerification.bulkWrite(operations, { ordered: false }).catch(() => {});
}

async function fetchUnpaywall(doi, fetchJsonImpl) {
  try {
    return await fetchJsonImpl(
      `${UNPAYWALL}/${encodeURIComponent(doi)}?email=${encodeURIComponent(env.CONTACT_EMAIL)}`,
      { timeout: 12000 },
    );
  } catch {
    return null;
  }
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
 * Một call OpenAlex theo batch DOI (tối đa 50) để biết bài nào thật sự có
 * full text trước khi áp filter `fullTextOnly`. Lỗi mạng không làm hỏng search.
 */
export async function enrichFullTextAvailability(items = [], { fetchJsonImpl = fetchJson } = {}) {
  const dois = [
    ...new Set(
      items
        .map((item) => normalizeDoi(item.doi || '').toLowerCase())
        .filter(Boolean),
    ),
  ].slice(0, 100);
  if (!dois.length) return items;

  let merged = items;

  // 1. Batch OpenAlex: metadata + OA + toàn bộ locations. Chia lô 50 DOI
  // để không bỏ sót bài khi một truy vấn trả về nhiều kết quả.
  for (let index = 0; index < dois.length; index += OPENALEX_BATCH_SIZE) {
    const chunk = dois.slice(index, index + OPENALEX_BATCH_SIZE);
    try {
      const data = await fetchJsonImpl(
        `${OPENALEX}?filter=doi:${chunk.join('|')}&select=doi,ids,title,display_name,publication_year,authorships,abstract_inverted_index,biblio,open_access,best_oa_location,primary_location,locations,is_retracted&per-page=${chunk.length}&mailto=${encodeURIComponent(env.CONTACT_EMAIL)}`,
        { cacheTtlMs: 10 * 60 * 1000 },
      );
      merged = mergeOpenAlexAvailability(merged, data?.results || []);
    } catch {
      // Lỗi OpenAlex không được làm hỏng search; Unpaywall vẫn có thể cứu.
    }
  }

  // 2. Cache xác minh gần nhất (tránh gọi lại Unpaywall mỗi lần tìm).
  const cached = await readOaCache(dois);
  if (cached.size) {
    merged = merged.map((item) =>
      applyCachedAvailability(item, cached.get(cacheKeyFor(item))),
    );
  }

  // 3. Unpaywall cho bài chưa xác minh OA hoặc chưa có đường đọc toàn văn.
  const pending = merged
    .filter((item) => {
      const doi = cacheKeyFor(item);
      if (!doi) return false;
      return !isVerifiedOpenAccess(item) || !assessFullText(item).hasFullText;
    })
    .slice(0, UNPAYWALL_FALLBACK_LIMIT);

  const confirmedDois = new Set();
  if (pending.length) {
    const resolved = await mapWithConcurrency(
      pending,
      UNPAYWALL_CONCURRENCY,
      async (item) => {
        const doi = cacheKeyFor(item);
        const data = await fetchUnpaywall(doi, fetchJsonImpl);
        return { doi, data };
      },
    );
    const byDoi = new Map(
      resolved
        .filter((entry) => entry.data)
        .map((entry) => {
          confirmedDois.add(entry.doi);
          return [entry.doi, entry.data];
        }),
    );
    merged = merged.map((item) => {
      const data = byDoi.get(cacheKeyFor(item));
      return data ? mergeUnpaywallAvailability(item, data) : item;
    });
  }

  await writeOaCache(merged, confirmedDois);
  return merged;
}
