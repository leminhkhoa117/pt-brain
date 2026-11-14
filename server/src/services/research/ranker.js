import { evidenceLevelFromPublicationTypes } from './evidence.js';
import { assessFullText } from './fullText.js';

const EVIDENCE_WEIGHT = { 1: 100, 2: 80, 3: 50, 4: 20, 5: 0 };

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
  'study',
  'trial',
  'review',
]);

const normalizeTitleKey = (title = '') =>
  String(title || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .slice(0, 200);

const titleTokens = (title = '') =>
  normalizeTitleKey(title)
    .split(' ')
    .filter((token) => token.length >= 3 && !TITLE_STOPWORDS.has(token));

function titleSimilarity(a = '', b = '') {
  const left = new Set(titleTokens(a));
  const right = new Set(titleTokens(b));
  if (!left.size || !right.size) return 0;
  let overlap = 0;
  for (const token of left) if (right.has(token)) overlap += 1;
  return (2 * overlap) / (left.size + right.size);
}

const yearsCompatible = (a, b) => !a || !b || Math.abs(Number(a) - Number(b)) <= 1;

function mergeResults(a, b) {
  const types = Array.from(new Set([...(a.publicationTypes || []), ...(b.publicationTypes || [])]));
  const providers = Array.from(
    new Set([...(a.providers || []), ...(b.providers || []), a.source, b.source].filter(Boolean)),
  );
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
    journalHIndex: Math.max(a.journalHIndex || 0, b.journalHIndex || 0) || undefined,
    journalImpact2yr:
      Math.max(a.journalImpact2yr || 0, b.journalImpact2yr || 0) || undefined,
    oaStatus: a.oaStatus || b.oaStatus || '',
    isRetracted: Boolean(a.isRetracted || b.isRetracted),
    providers,
    source: a.source || b.source,
  };
}

function findFuzzyCluster(item, clusters) {
  let best = null;
  let bestScore = 0;
  for (const cluster of clusters) {
    // Hai DOI khác nhau là hai bài khác nhau, dù tiêu đề giống.
    if (item.doi && cluster.doi && item.doi !== cluster.doi) continue;
    if (!yearsCompatible(item.year, cluster.item.year)) continue;
    const score = titleSimilarity(item.title, cluster.item.title);
    if (score > bestScore) {
      bestScore = score;
      best = cluster;
    }
  }
  return bestScore >= 0.9 ? best : null;
}

/** Gộp kết quả từ nhiều nguồn: DOI -> PMID -> fuzzy title + năm. */
export function dedupeResults(results = []) {
  const clusters = [];
  const doiIndex = new Map();
  const pmidIndex = new Map();

  for (const raw of results) {
    if (!raw?.title) continue;
    const item = {
      ...raw,
      evidenceLevel:
        raw.evidenceLevel || evidenceLevelFromPublicationTypes(raw.publicationTypes).level,
      citationCount: raw.citationCount || 0,
      providers:
        Array.isArray(raw.providers) && raw.providers.length
          ? raw.providers
          : [raw.source].filter(Boolean),
    };
    const doi = item.doi ? String(item.doi).toLowerCase() : '';
    const pmid = item.pmid ? String(item.pmid) : '';

    let cluster = doi ? doiIndex.get(doi) : pmid ? pmidIndex.get(pmid) : null;
    if (!cluster) cluster = findFuzzyCluster(item, clusters);

    if (!cluster) {
      cluster = { item, doi, pmid };
      clusters.push(cluster);
    } else {
      cluster.item = mergeResults(cluster.item, item);
      cluster.doi = cluster.doi || doi;
      cluster.pmid = cluster.pmid || pmid;
    }

    if (cluster.doi) doiIndex.set(cluster.doi, cluster);
    if (doi) doiIndex.set(doi, cluster);
    if (cluster.pmid) pmidIndex.set(cluster.pmid, cluster);
    if (pmid) pmidIndex.set(pmid, cluster);
  }

  return clusters.map((cluster) => cluster.item);
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
export function rankResults(results = [], { maxLevel, openAccessOnly, fullTextOnly } = {}) {
  return results
    .filter((item) => (maxLevel ? (item.evidenceLevel || 5) <= maxLevel : true))
    .filter((item) => (openAccessOnly ? item.isOpenAccess : true))
    .map((item) => ({ ...item, ...assessFullText(item), score: scoreResult(item) }))
    .filter((item) => (fullTextOnly ? item.hasFullText : true))
    .sort((a, b) => b.score - a.score);
}
