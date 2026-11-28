import { assertAiQuota, recordAiCall } from '../ai/quota.js';
import { translateQuestion } from '../ai/queryTranslator.js';
import { searchPubMed } from './pubmed.js';
import { searchEuropePmc } from './europepmc.js';
import { searchOpenAlex } from './openalex.js';
import { searchCrossref } from './crossref.js';
import { dedupeResults, rankResults } from './ranker.js';
import { enrichFullTextAvailability } from './oaCandidates.js';
import { buildLandscape } from './landscape.js';
import {
  RESEARCH_ACCESS_POLICY,
  isVerifiedOpenAccess,
} from './accessPolicy.js';
import { probeTopCandidates } from './probe.js';
import { toPlainQuery } from './querySyntax.js';
import { buildExpandedQueries } from './queryExpand.js';
import { ApiError } from '../../utils/ApiError.js';

const addUsage = (...items) =>
  items.reduce(
    (total, usage) => ({
      input: total.input + (usage?.input || 0),
      output: total.output + (usage?.output || 0),
      cost: total.cost + (usage?.cost || 0),
    }),
    { input: 0, output: 0, cost: 0 },
  );

async function collectFromSources(queries, { yearFrom, yearTo }) {
  const tasks = [];
  for (const query of queries) {
    // PubMed/Europe PMC hiểu Boolean + MeSH; OpenAlex/Crossref chỉ nhận keyword.
    const plainQuery = toPlainQuery(query) || query;
    tasks.push(searchPubMed(query, { retmax: 6, yearFrom, yearTo }));
    tasks.push(searchEuropePmc(query, { pageSize: 6, yearFrom, yearTo }));
    tasks.push(searchOpenAlex(plainQuery, { perPage: 6, yearFrom, yearTo }));
    tasks.push(searchCrossref(plainQuery, { rows: 6, yearFrom, yearTo }));
  }
  const settled = await Promise.allSettled(tasks);
  const results = [];
  let failures = 0;
  for (const item of settled) {
    if (item.status === 'fulfilled') results.push(...item.value);
    else failures += 1;
  }
  if (!results.length) {
    throw new ApiError(
      502,
      'SEARCH_SOURCES_FAILED',
      'Không truy vấn được nguồn nghiên cứu nào. Thử lại sau hoặc đổi câu hỏi.',
      { failedCalls: failures },
    );
  }
  return { results, failures, calls: settled.length };
}

export async function findResearch(
  user,
  { question, queries: providedQueries, concepts: providedConcepts, filters = {} },
) {
  await assertAiQuota(user._id, 'search');

  let queries = (providedQueries || []).map((q) => q.trim()).filter(Boolean).slice(0, 4);
  let concepts = Array.isArray(providedConcepts) ? providedConcepts : [];
  let mesh = [];
  let usage = { input: 0, output: 0, cost: 0 };
  let model = '';

  if (!queries.length) {
    const translated = await translateQuestion(question);
    queries = translated.queries;
    concepts = translated.concepts || [];
    mesh = translated.mesh;
    usage = addUsage(usage, translated.usage);
    model = translated.model;
  }

  const { results: rawResults, failures, calls } = await collectFromSources(queries, filters);
  const deduped = dedupeResults(rawResults);
  const enriched = await enrichFullTextAvailability(deduped);
  const relevanceInput = { question, queries, concepts };
  // Chính sách được ép ở server, không phụ thuộc checkbox của client.
  const accessFilters = {
    ...filters,
    openAccessOnly: true,
    fullTextOnly: true,
  };
  // Trước khi probe, cho phép ứng viên OA có landing page vào pool để kiểm tra
  // xem landing đó có thật sự là toàn văn HTML hay không.
  const rankingFilters = {
    ...filters,
    openAccessOnly: true,
    fullTextOnly: false,
  };
  let ranked = rankResults(enriched, rankingFilters, relevanceInput);
  // Concept AI có thể quá hẹp; nếu lọc sạch kết quả thì thử lại bằng chính queries.
  if (!ranked.length && concepts.length && queries.length) {
    ranked = rankResults(enriched, rankingFilters, { question, queries, concepts: [] });
  }
  let scanned = rawResults.length;
  let sourceCalls = calls;
  let sourceFailures = failures;
  let expanded = false;
  let expandedQueries = [];

  // Nếu bộ lọc liên quan làm mất quá nhiều bài, thử mở rộng bằng chính concept.
  // Chỉ tự mở rộng khi truy vấn do AI tạo; truy vấn người dùng tự nhập được tôn trọng.
  if (ranked.length < 5 && !providedQueries?.length && concepts.length) {
    const fallbackQueries = buildExpandedQueries(concepts);
    if (fallbackQueries.length) {
      try {
        const extra = await collectFromSources(fallbackQueries, filters);
        const merged = dedupeResults([...deduped, ...extra.results]);
        const reEnriched = await enrichFullTextAvailability(merged);
        const reRanked = rankResults(reEnriched, rankingFilters, relevanceInput);
        if (reRanked.length > ranked.length) {
          ranked = reRanked;
          expanded = true;
          expandedQueries = fallbackQueries;
          scanned += extra.results.length;
          sourceCalls += extra.calls;
          sourceFailures += extra.failures;
        }
      } catch {
        // Nguồn mở rộng lỗi không được làm hỏng kết quả ban đầu.
      }
    }
  }

  const candidatePool = ranked
    .filter((item) => item.hasFullText === true || Boolean(item.fullTextUrl))
    .slice(0, 20);

  let probed;
  try {
    probed = await probeTopCandidates(candidatePool, { limit: 20 });
  } catch {
    // Probe lỗi không được làm hỏng search; chỉ giữ bài metadata đã có PMC/PDF.
    probed = candidatePool.map((item) => ({ ...item, keep: item.hasFullText === true }));
  }

  const eligible = probed.filter((item) => item.keep);
  const top = eligible.slice(0, 8);
  const landscape = buildLandscape(eligible);
  const notOa = enriched.filter((item) => !isVerifiedOpenAccess(item)).length;
  const noFullText = enriched.filter(
    (item) =>
      isVerifiedOpenAccess(item) &&
      !item.hasFullText &&
      !item.fullTextUrl &&
      !item.pdfUrl &&
      !item.pmcid,
  ).length;
  const probeDropped = probed.filter((item) => !item.keep).length;
  const dropped = { notOa, noFullText: noFullText + probeDropped };
  const probeStats = { checked: probed.length, kept: eligible.length };

  if (!top.length) {
    return {
      question,
      queries,
      concepts,
      mesh,
      filters: accessFilters,
      policy: RESEARCH_ACCESS_POLICY,
      dropped,
      probe: probeStats,
      total: 0,
      scanned,
      results: [],
      landscape,
      synthesis: '',
      usage,
      model,
      expanded,
      expandedQueries,
      sources: { calls: sourceCalls, failures: sourceFailures },
    };
  }

  // Không tóm tắt/tổng hợp từ abstract. Tóm tắt chi tiết chỉ chạy trong Reader
  // khi đã có toàn văn hoặc PDF người dùng tải lên.
  const results = top.map((item, index) => ({
    ...item,
    id: index + 1,
    access: {
      isOa: Boolean(item.isOpenAccess),
      oaStatus: item.oaStatus || '',
      license: item.license || '',
      fullTextSource: item.fullTextSource || '',
      pdfUrl: item.pdfUrl || '',
      landingUrl: item.fullTextUrl || '',
    },
  }));

  await recordAiCall(user._id, { kind: 'search', usage });

  return {
    question,
    queries,
    concepts,
    mesh,
    filters: accessFilters,
    policy: RESEARCH_ACCESS_POLICY,
    dropped,
    probe: probeStats,
    total: eligible.length,
    scanned,
    results,
    landscape,
    synthesis: '',
    usage,
    model,
    expanded,
    expandedQueries,
    sources: { calls: sourceCalls, failures: sourceFailures },
  };
}
