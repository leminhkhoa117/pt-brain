import { env } from '../../config/env.js';
import { fetchJson } from '../../utils/http.js';
import { normalizeText } from '../../utils/text.js';
import { evidenceLevelFromPublicationTypes } from './evidence.js';

const OPENALEX = 'https://api.openalex.org/works';

/** Dựng lại abstract từ inverted index của OpenAlex. */
export function reconstructAbstract(index) {
  if (!index || typeof index !== 'object') return '';
  const words = [];
  for (const [word, positions] of Object.entries(index)) {
    for (const position of positions || []) words[position] = word;
  }
  return normalizeText(words.filter(Boolean).join(' '));
}

function normalizeDoi(value = '') {
  return String(value).replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').toLowerCase();
}

export async function searchOpenAlex(query, { perPage = 8, yearFrom, yearTo } = {}) {
  const filters = [];
  if (yearFrom) filters.push(`from_publication_date:${yearFrom}-01-01`);
  if (yearTo) filters.push(`to_publication_date:${yearTo}-12-31`);
  const params = new URLSearchParams({
    search: query,
    'per-page': String(perPage),
    sort: 'relevance_score:desc',
    mailto: env.CONTACT_EMAIL,
  });
  if (filters.length) params.set('filter', filters.join(','));

  const data = await fetchJson(`${OPENALEX}?${params.toString()}`);
  return (data?.results || []).map(mapOpenAlexWork);
}

/** Map một `work` OpenAlex sang shape kết quả dùng chung trong Finder/Reader. */
export function mapOpenAlexWork(work = {}) {
  const types = [work.type].filter(Boolean);
  return {
    title: normalizeText(work.title || work.display_name || ''),
    authors: (work.authorships || [])
      .map((a) => a.author?.display_name)
      .filter(Boolean)
      .slice(0, 30),
    year: work.publication_year || undefined,
    journal: normalizeText(work.primary_location?.source?.display_name || ''),
    journalHIndex: work.primary_location?.source?.h_index ?? undefined,
    journalImpact2yr: work.primary_location?.source?.summary_stats?.['2yr_mean_citedness'] ?? undefined,
    doi: normalizeDoi(work.doi || ''),
    pmid: String(work.ids?.pmid || '')
      .replace(/^https?:\/\/pubmed\.ncbi\.nlm\.nih\.gov\//, '')
      .replace(/\/$/, ''),
    pmcid: String(work.ids?.pmcid || '')
      .replace(/^https?:\/\/www\.ncbi\.nlm\.nih\.gov\/pmc\/articles\//, '')
      .replace(/\/$/, ''),
    url: work.doi || work.id || '',
    abstract: reconstructAbstract(work.abstract_inverted_index),
    publicationTypes: types,
    evidenceLevel: evidenceLevelFromPublicationTypes(types).level,
    citationCount: work.cited_by_count || 0,
    isOpenAccess: Boolean(work.open_access?.is_oa),
    oaStatus: work.open_access?.oa_status || '',
    isRetracted: Boolean(work.is_retracted),
    fullTextUrl: work.open_access?.oa_url || '',
    pdfUrl: work.best_oa_location?.pdf_url || '',
    source: 'openalex',
  };
}
