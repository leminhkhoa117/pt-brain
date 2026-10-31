import { evidenceLevelFromPublicationTypes } from './evidence.js';

const EVIDENCE_WEIGHT = { 1: 100, 2: 80, 3: 50, 4: 20, 5: 0 };

const normalizeTitleKey = (title = '') =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9à-ỹ]+/gi, ' ')
    .trim()
    .slice(0, 120);

function mergeResults(a, b) {
  const types = Array.from(new Set([...(a.publicationTypes || []), ...(b.publicationTypes || [])]));
  return {
    ...a,
    title: (b.title || '').length > (a.title || '').length ? b.title : a.title,
    abstract: (b.abstract || '').length > (a.abstract || '').length ? b.abstract : a.abstract,
    authors: (b.authors || []).length > (a.authors || []).length ? b.authors : a.authors,
    citationCount: Math.max(a.citationCount || 0, b.citationCount || 0),
    isOpenAccess: Boolean(a.isOpenAccess || b.isOpenAccess),
    publicationTypes: types,
    evidenceLevel: Math.min(
      a.evidenceLevel || 5,
      b.evidenceLevel || 5,
      evidenceLevelFromPublicationTypes(types).level,
    ),
    pmid: a.pmid || b.pmid || '',
    pmcid: a.pmcid || b.pmcid || '',
    doi: a.doi || b.doi || '',
    url: a.url || b.url || '',
    pdfUrl: a.pdfUrl || b.pdfUrl || '',
    fullTextUrl: a.fullTextUrl || b.fullTextUrl || '',
    journal: a.journal || b.journal || '',
    year: a.year || b.year || undefined,
    source: a.source || b.source,
  };
}

/** Gộp kết quả từ nhiều nguồn, loại trùng theo DOI -> PMID -> tiêu đề. */
export function dedupeResults(results = []) {
  const map = new Map();
  for (const raw of results) {
    if (!raw?.title) continue;
    const item = {
      ...raw,
      evidenceLevel:
        raw.evidenceLevel || evidenceLevelFromPublicationTypes(raw.publicationTypes).level,
      citationCount: raw.citationCount || 0,
    };
    const key = item.doi
      ? `doi:${String(item.doi).toLowerCase()}`
      : item.pmid
        ? `pmid:${item.pmid}`
        : `title:${normalizeTitleKey(item.title)}`;
    const existing = map.get(key);
    map.set(key, existing ? mergeResults(existing, item) : item);
  }
  return [...map.values()];
}

export function scoreResult(item, currentYear = new Date().getFullYear()) {
  const level = item.evidenceLevel || 5;
  const age = Math.max(0, currentYear - (item.year || currentYear));
  const recency = Math.max(0, 18 - age * 2);
  const citations = Math.min(18, Math.log10((item.citationCount || 0) + 1) * 7);
  const openAccess = item.isOpenAccess ? 4 : 0;
  const hasAbstract = item.abstract && item.abstract.length > 200 ? 2 : 0;
  return Math.round((EVIDENCE_WEIGHT[level] ?? 0) + recency + citations + openAccess + hasAbstract);
}

/** Lọc và xếp hạng hoàn toàn bằng code, không để AI quyết định thứ tự. */
export function rankResults(results = [], { maxLevel, openAccessOnly } = {}) {
  return results
    .filter((item) => (maxLevel ? (item.evidenceLevel || 5) <= maxLevel : true))
    .filter((item) => (openAccessOnly ? item.isOpenAccess : true))
    .map((item) => ({ ...item, score: scoreResult(item) }))
    .sort((a, b) => b.score - a.score);
}
