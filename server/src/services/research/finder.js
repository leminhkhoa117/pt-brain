import { assertAiQuota, recordAiCall } from '../ai/quota.js';
import { translateQuestion } from '../ai/queryTranslator.js';
import { summarizeSearchResults, synthesizeAnswer } from '../ai/finderSummarizer.js';
import { searchPubMed } from './pubmed.js';
import { searchEuropePmc } from './europepmc.js';
import { searchOpenAlex } from './openalex.js';
import { dedupeResults, rankResults } from './ranker.js';
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
    tasks.push(searchPubMed(query, { retmax: 6, yearFrom, yearTo }));
    tasks.push(searchEuropePmc(query, { pageSize: 6, yearFrom, yearTo }));
    tasks.push(searchOpenAlex(query, { perPage: 6, yearFrom, yearTo }));
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

export async function findResearch(user, { question, queries: providedQueries, filters = {} }) {
  await assertAiQuota(user._id, 'search');

  let queries = (providedQueries || []).map((q) => q.trim()).filter(Boolean).slice(0, 4);
  let mesh = [];
  let usage = { input: 0, output: 0, cost: 0 };
  let model = '';

  if (!queries.length) {
    const translated = await translateQuestion(question);
    queries = translated.queries;
    mesh = translated.mesh;
    usage = addUsage(usage, translated.usage);
    model = translated.model;
  }

  const { results: rawResults, failures, calls } = await collectFromSources(queries, filters);
  const deduped = dedupeResults(rawResults);
  const ranked = rankResults(deduped, filters);
  const top = ranked.slice(0, 8);

  if (!top.length) {
    return {
      question,
      queries,
      mesh,
      filters,
      total: 0,
      scanned: rawResults.length,
      results: [],
      synthesis:
        'Không tìm thấy bài nào khớp bộ lọc hiện tại. Hãy thử bỏ lọc năm/open access hoặc đổi cách hỏi.',
      usage,
      model,
      sources: { calls, failures },
    };
  }

  const [summaries, synthesis] = await Promise.all([
    summarizeSearchResults(question, top),
    synthesizeAnswer(question, top),
  ]);

  usage = addUsage(usage, summaries.usage, synthesis.usage);
  model = model || synthesis.model;

  const results = top.map((item, index) => ({
    ...item,
    id: index + 1,
    viSummary: summaries.summaries[index] || '',
  }));

  await recordAiCall(user._id, { kind: 'search', usage });

  return {
    question,
    queries,
    mesh,
    filters,
    total: ranked.length,
    scanned: rawResults.length,
    results,
    synthesis: synthesis.answer,
    usage,
    model,
    sources: { calls, failures },
  };
}
