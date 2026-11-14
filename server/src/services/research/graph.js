import { env } from '../../config/env.js';
import { fetchJson } from '../../utils/http.js';
import { normalizeDoi } from '../../utils/doi.js';
import { mapOpenAlexWork } from './openalex.js';

const OPENALEX = 'https://api.openalex.org/works';
const SELECT =
  'id,doi,title,display_name,publication_year,type,cited_by_count,authorships,primary_location,open_access,best_oa_location,ids';

const shortId = (value) => String(value || '').split('/').pop();

function mailto() {
  return `mailto=${encodeURIComponent(env.CONTACT_EMAIL)}`;
}

async function resolveOpenAlexId(doiOrId) {
  const value = String(doiOrId || '').trim();
  if (/^W\d+$/i.test(value)) return value.toUpperCase();
  const doi = normalizeDoi(value);
  if (!doi) return '';
  const data = await fetchJson(
    `${OPENALEX}/doi:${doi}?select=id&${mailto()}`,
    { cacheTtlMs: 30 * 60 * 1000 },
  );
  return shortId(data?.id);
}

async function getWorksByIds(ids = [], limit = 20) {
  const clean = [...new Set(ids.map(shortId).filter((id) => /^W\d+$/i.test(id)))].slice(0, limit);
  if (!clean.length) return [];
  const out = [];
  for (let start = 0; start < clean.length; start += 50) {
    const chunk = clean.slice(start, start + 50);
    const data = await fetchJson(
      `${OPENALEX}?filter=openalex_id:${chunk.join('|')}&select=${SELECT}&per-page=${chunk.length}&${mailto()}`,
    );
    out.push(...(data?.results || []));
  }
  const byId = new Map(out.map((work) => [shortId(work.id), work]));
  return clean
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map(mapGraphWork);
}

export function mapGraphWork(work = {}) {
  const mapped = mapOpenAlexWork(work);
  return {
    title: mapped.title,
    authors: (mapped.authors || []).slice(0, 3),
    year: mapped.year,
    journal: mapped.journal,
    doi: mapped.doi,
    pmid: mapped.pmid,
    url: mapped.url || (mapped.doi ? `https://doi.org/${mapped.doi}` : ''),
    citationCount: mapped.citationCount,
    isOpenAccess: mapped.isOpenAccess,
    oaStatus: mapped.oaStatus,
    isRetracted: mapped.isRetracted,
    evidenceLevel: mapped.evidenceLevel,
  };
}

/**
 * Lấy một nhánh citation graph từ OpenAlex:
 * - references: các bài được bài này dẫn
 * - citations: các bài dẫn bài này
 * - related: bài liên quan do OpenAlex gợi ý
 */
export async function getGraph(doiOrId, kind = 'references', limit = 20) {
  const openalexId = await resolveOpenAlexId(doiOrId);
  if (!openalexId) {
    return { kind, doi: doiOrId, items: [], error: 'Không tìm thấy bài trên OpenAlex' };
  }

  if (kind === 'citations') {
    const data = await fetchJson(
      `${OPENALEX}?filter=cites:${openalexId}&select=${SELECT}&per-page=${Math.min(limit, 50)}&sort=cited_by_count:desc&${mailto()}`,
    );
    return { kind, doi: doiOrId, items: (data?.results || []).map(mapGraphWork) };
  }

  const field = kind === 'related' ? 'related_works' : 'referenced_works';
  const data = await fetchJson(`${OPENALEX}/${openalexId}?select=${field}&${mailto()}`);
  const ids = Array.isArray(data?.[field]) ? data[field] : [];
  return { kind, doi: doiOrId, items: await getWorksByIds(ids, limit) };
}
