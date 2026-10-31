import crypto from 'node:crypto';
import { Summary } from '../../models/Summary.js';
import { Paper } from '../../models/Paper.js';
import { summarizePaper } from '../ai/paperSummarizer.js';
import { assertAiQuota, recordAiCall } from '../ai/quota.js';
import {
  parseIdentifier,
  resolveWorkByDoi,
  resolveWorkByUrl,
} from './metadata.js';
import { parsePdfBuffer } from './pdf.js';
import { ApiError } from '../../utils/ApiError.js';
import { normalizeText, truncateText } from '../../utils/text.js';

function inferTitleFromText(text) {
  const first = normalizeText(text)
    .split('\n')
    .map((line) => line.replace(/^#+\s*/, '').trim())
    .find((line) => line.length > 10);
  return (first || 'Văn bản nghiên cứu').slice(0, 240);
}

async function resolveInput(input, file) {
  if (file) {
    const parsed = await parsePdfBuffer(file.buffer, { filename: file.originalname });
    return {
      paper: {
        title: input.title || parsed.title,
        authors: [],
        url: '',
        publicationTypes: [],
        evidenceLevel: 5,
        source: 'manual',
      },
      text: parsed.text,
      basedOn: 'fulltext',
      sourceKind: 'user_pdf',
      sourceUrl: '',
      pdfHash: parsed.hash,
      inputType: 'pdf',
    };
  }

  if (input.doi) {
    const resolved = await resolveWorkByDoi(input.doi);
    if (input.title) resolved.paper.title = input.title;
    return { ...resolved, inputType: 'doi' };
  }

  if (input.url) {
    const resolved = await resolveWorkByUrl(input.url);
    if (input.title) resolved.paper.title = input.title;
    return { ...resolved, inputType: 'url' };
  }

  const text = normalizeText(input.text);
  return {
    paper: {
      title: input.title || inferTitleFromText(text),
      authors: [],
      url: '',
      publicationTypes: [],
      evidenceLevel: 5,
      source: 'manual',
    },
    text,
    basedOn: text.length >= 5000 ? 'fulltext' : 'abstract_only',
    sourceKind: 'user_text',
    sourceUrl: '',
    inputType: text.length >= 5000 ? 'text' : 'abstract',
  };
}

export function buildCacheKey(resolved) {
  if (resolved.paper?.doi) return `doi:${resolved.paper.doi.toLowerCase()}`;
  if (resolved.pdfHash) return `pdf:${resolved.pdfHash}`;
  if (resolved.sourceUrl) {
    return `url:${crypto.createHash('sha256').update(resolved.sourceUrl).digest('hex').slice(0, 40)}`;
  }
  return `text:${crypto.createHash('sha256').update(resolved.text).digest('hex').slice(0, 40)}`;
}

const PAPER_FIELDS = [
  'title',
  'authors',
  'year',
  'journal',
  'doi',
  'pmid',
  'pmcid',
  'url',
  'abstract',
  'publicationTypes',
  'evidenceLevel',
  'citationCount',
  'isOpenAccess',
  'fullTextUrl',
  'pdfUrl',
  'source',
];

async function upsertPaper(userId, data) {
  const query = { userId };
  if (data.doi) query.doi = data.doi.toLowerCase();
  else if (data.pmid) query.pmid = String(data.pmid);
  else if (data.pmcid) query.pmcid = String(data.pmcid);
  else query.title = data.title;

  let paper = await Paper.findOne(query);
  if (!paper) {
    paper = new Paper({ userId, source: data.source || 'manual' });
  }
  for (const field of PAPER_FIELDS) {
    const value = data[field];
    if (value === undefined || value === null) continue;
    if (Array.isArray(value) && value.length === 0 && paper[field]?.length) continue;
    if (field === 'doi') {
      paper.doi = value.toLowerCase();
    } else {
      paper[field] = value;
    }
  }
  await paper.save();
  return paper;
}

/**
 * Pipeline hoàn chỉnh: lấy nguồn -> cache -> gọi AI -> lưu Paper + Summary.
 * Trả về sourceText để client hiển thị đối chiếu (không phải lúc nào cũng lưu toàn văn).
 */
export async function createSummaryForUser(user, input, file) {
  const resolved = await resolveInput(input, file);
  const cacheKey = buildCacheKey(resolved);

  const cached = await Summary.findOne({ userId: user._id, cacheKey });
  if (cached) {
    const paper = await Paper.findById(cached.paperId);
    return {
      summary: cached,
      paper,
      sourceText: cached.sourceText,
      cached: true,
      usage: null,
    };
  }

  await assertAiQuota(user._id, 'summarize');

  const { content, usage, model, promptVersion } = await summarizePaper({
    paper: resolved.paper,
    text: resolved.text,
    basedOn: resolved.basedOn,
  });

  const paper = await upsertPaper(user._id, resolved.paper);
  const sourceText = truncateText(resolved.text, 400000);

  const summary = await Summary.create({
    userId: user._id,
    paperId: paper._id,
    inputType: resolved.inputType,
    basedOn: resolved.basedOn,
    content,
    sourceText,
    sourceUrl: resolved.sourceUrl || '',
    sourceKind: resolved.sourceKind,
    pdfHash: resolved.pdfHash || '',
    model,
    promptVersion,
    cacheKey,
  });

  await recordAiCall(user._id, { kind: 'summarize', usage });

  return { summary, paper, sourceText, cached: false, usage };
}

export async function getSummaryForUser(userId, id) {
  const summary = await Summary.findOne({ _id: id, userId });
  if (!summary) throw ApiError.notFound('Không tìm thấy bản tóm tắt');
  const paper = await Paper.findById(summary.paperId);
  return { summary, paper };
}

export async function appendQa(userId, id, question, answer) {
  await Summary.updateOne(
    { _id: id, userId },
    { $push: { qa: { $each: [{ question, answer, createdAt: new Date() }], $slice: -20 } } },
  );
}

export async function deleteSummaryForUser(userId, id) {
  const result = await Summary.findOneAndDelete({ _id: id, userId });
  if (!result) throw ApiError.notFound('Không tìm thấy bản tóm tắt');
}

export { parseIdentifier };
