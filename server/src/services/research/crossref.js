import { env } from '../../config/env.js';
import { fetchJson } from '../../utils/http.js';
import { decodeEntities, normalizeText } from '../../utils/text.js';
import { normalizeDoi } from '../../utils/doi.js';
import { evidenceLevelFromPublicationTypes } from './evidence.js';

const CROSSREF = 'https://api.crossref.org/works';
const SELECT =
  'DOI,title,author,container-title,issued,published-print,published-online,volume,issue,page,type,abstract,is-referenced-by-count,URL';

function yearFromItem(item = {}) {
  const print = item['published-print']?.['date-parts']?.[0]?.[0];
  const issued = item.issued?.['date-parts']?.[0]?.[0];
  const online = item['published-online']?.['date-parts']?.[0]?.[0];
  return print || issued || online || undefined;
}

function cleanTitle(value = '') {
  return normalizeText(decodeEntities(String(value || '').replace(/<[^>]+>/g, ' ')));
}

export function mapCrossrefItem(item = {}) {
  const title = cleanTitle(item.title?.[0] || '');
  const doi = normalizeDoi(item.DOI || '');
  const type = String(item.type || '').toLowerCase();
  const evidence = evidenceLevelFromPublicationTypes([type, title]);
  return {
    title,
    authors: (Array.isArray(item.author) ? item.author : [])
      .map((author) => normalizeText(`${author.given || ''} ${author.family || author.name || ''}`))
      .filter(Boolean)
      .slice(0, 30),
    year: yearFromItem(item),
    journal: normalizeText(decodeEntities(item['container-title']?.[0] || '')),
    volume: String(item.volume || ''),
    issue: String(item.issue || ''),
    pages: normalizeText(item.page || ''),
    doi,
    pmid: '',
    pmcid: '',
    url: item.URL || (doi ? `https://doi.org/${doi}` : ''),
    abstract: normalizeText(decodeEntities(String(item.abstract || '').replace(/<[^>]+>/g, ' '))),
    publicationTypes: type ? [type] : [],
    evidenceLevel: evidence.level,
    citationCount: Number(item['is-referenced-by-count']) || 0,
    isOpenAccess: false,
    oaStatus: '',
    isRetracted: false,
    source: 'crossref',
  };
}

/** Tìm trên Crossref — nguồn bổ sung cho PubMed/Europe PMC/OpenAlex. */
export async function searchCrossref(query, { rows = 6, yearFrom, yearTo } = {}) {
  if (!query || query.length < 8) return [];
  const params = new URLSearchParams({
    'query.bibliographic': query,
    rows: String(rows),
    select: SELECT,
    mailto: env.CONTACT_EMAIL,
  });
  const filters = [];
  if (yearFrom) filters.push(`from-pub-date:${yearFrom}-01-01`);
  if (yearTo) filters.push(`until-pub-date:${yearTo}-12-31`);
  if (filters.length) params.set('filter', filters.join(','));

  const data = await fetchJson(`${CROSSREF}?${params.toString()}`);
  return (Array.isArray(data?.message?.items) ? data.message.items : [])
    .map(mapCrossrefItem)
    .filter((item) => item.title);
}
