import { fetchJson } from '../../utils/http.js';
import { mapEuropePmcResult } from './metadata.js';

const EUROPEPMC = 'https://www.ebi.ac.uk/europepmc/webservices/rest/search';

export async function searchEuropePmc(
  query,
  { pageSize = 8, yearFrom, yearTo, openAccessOnly = true } = {},
) {
  const yearFilter =
    yearFrom || yearTo
      ? ` AND PUB_YEAR:[${yearFrom || 1900} TO ${yearTo || new Date().getFullYear()}]`
      : '';
  const oaFilter = openAccessOnly ? ' AND OPEN_ACCESS:Y' : '';
  const fullQuery = `(${query})${oaFilter}${yearFilter}`;
  const url = `${EUROPEPMC}?query=${encodeURIComponent(fullQuery)}&format=json&resultType=core&pageSize=${pageSize}`;
  const data = await fetchJson(url);
  return (data?.resultList?.result || []).map((result) => ({
    ...mapEuropePmcResult(result),
    source: 'europepmc',
  }));
}
