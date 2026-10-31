import { fetchJson } from '../../utils/http.js';
import { normalizeText } from '../../utils/text.js';
import { mapEuropePmcResult } from './metadata.js';

const ESEARCH = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
const EUROPEPMC = 'https://www.ebi.ac.uk/europepmc/webservices/rest/search';

/**
 * Tìm trên PubMed để lấy PMID, sau đó lấy metadata + abstract đầy đủ từ Europe PMC
 * (esummary của PubMed không trả abstract).
 */
export async function searchPubMed(query, { retmax = 8, yearFrom, yearTo } = {}) {
  const params = new URLSearchParams({
    db: 'pubmed',
    term: query,
    retmode: 'json',
    retmax: String(retmax),
    sort: 'relevance',
  });
  if (yearFrom) params.set('mindate', `${yearFrom}/01/01`);
  if (yearTo) params.set('maxdate', `${yearTo}/12/31`);
  if (yearFrom || yearTo) params.set('datetype', 'pdat');

  const search = await fetchJson(`${ESEARCH}?${params.toString()}`);
  const ids = search?.esearchresult?.idlist || [];
  if (!ids.length) return [];

  const emQuery = `(${ids.map((id) => `EXT_ID:${id}`).join(' OR ')}) AND SRC:MED`;
  const url = `${EUROPEPMC}?query=${encodeURIComponent(emQuery)}&format=json&resultType=core&pageSize=${ids.length}`;
  const data = await fetchJson(url);
  return (data?.resultList?.result || []).map((result) => ({
    ...mapEuropePmcResult(result),
    source: 'pubmed',
    abstract: normalizeText(result.abstractText || ''),
  }));
}
