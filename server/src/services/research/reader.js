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
  const normalized = {
    ...data,
    title: data.title?.trim() || 'Bài báo chưa có tiêu đề',
  };
  const query = { userId };
  if (normalized.doi) query.doi = normalized.doi.toLowerCase();
  else if (normalized.pmid) query.pmid = String(normalized.pmid);
  else if (normalized.pmcid) query.pmcid = String(normalized.pmcid);
  else query.title = normalized.title;

  let paper = await Paper.findOne(query);
  if (!paper) {
    paper = new Paper({ userId, source: normalized.source || 'manual' });
  }
  for (const field of PAPER_FIELDS) {
    const value = normalized[field];
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
 * Chạy AI trong nền để request không bị timeout với PDF dài.
 * Cập nhật progress/status vào Summary để client polling.
 */
async function runSummaryJob({ summaryId, paperId, userId, resolved }) {
  try {
    const { content, usage, model, promptVersion } = await summarizePaper({
      paper: resolved.paper,
      text: resolved.text,
      basedOn: resolved.basedOn,
      onProgress: (progress) => {
        Summary.updateOne({ _id: summaryId }, { $set: { progress } }).catch(() => {});
      },
    });

    // PDF thường có metadata rác; bổ sung các field còn thiếu từ nội dung AI trích
    if (content.metadata) {
      const update = {};
      if (!resolved.paper.title && content.metadata.title) update.title = content.metadata.title;
      if (!resolved.paper.journal && content.metadata.journal) update.journal = content.metadata.journal;
      if (!resolved.paper.year && content.metadata.year) update.year = content.metadata.year;
      if (!resolved.paper.doi && content.metadata.doi) update.doi = content.metadata.doi;
      if (Object.keys(update).length) {
        await Paper.findByIdAndUpdate(paperId, { $set: update }).catch(() => {});
      }
    }

    await Summary.updateOne(
      { _id: summaryId },
      {
        $set: {
          content,
          model,
          promptVersion,
          status: 'ready',
          progress: '',
          error: '',
        },
      },
    );
    await recordAiCall(userId, { kind: 'summarize', usage }).catch(() => {});
  } catch (error) {
    await Summary.updateOne(
      { _id: summaryId },
      {
        $set: {
          status: 'failed',
          progress: '',
          error: (error.message || 'Lỗi tóm tắt').slice(0, 500),
        },
      },
    ).catch(() => {});
  }
}

/**
 * Pipeline: lấy nguồn -> cache -> tạo Summary "processing" -> chạy AI nền.
 * Trả về ngay để client hiển thị tiến trình và polling.
 */
export async function createSummaryForUser(user, input, file) {
  const resolved = await resolveInput(input, file);
  const cacheKey = buildCacheKey(resolved);

  const existing = await Summary.findOne({ userId: user._id, cacheKey }).sort({
    createdAt: -1,
  });
  if (existing && (!existing.status || existing.status === 'ready')) {
    const paper = await Paper.findById(existing.paperId);
    return {
      summary: existing,
      paper,
      sourceText: existing.sourceText,
      cached: true,
      usage: null,
    };
  }
  if (existing?.status === 'processing') {
    const paper = await Paper.findById(existing.paperId);
    return {
      summary: existing,
      paper,
      sourceText: existing.sourceText,
      cached: false,
      processing: true,
    };
  }

  await assertAiQuota(user._id, 'summarize');

  const paper = await upsertPaper(user._id, resolved.paper);
  const sourceText = truncateText(resolved.text, 400000);

  const summary = await Summary.create({
    userId: user._id,
    paperId: paper._id,
    inputType: resolved.inputType,
    basedOn: resolved.basedOn,
    content: {
      metadata: {
        title: resolved.paper.title || '',
        authors: resolved.paper.authors || [],
        year: resolved.paper.year || 0,
        journal: resolved.paper.journal || '',
        doi: resolved.paper.doi || '',
      },
      tldr: 'Đang xử lý...',
      mainResults: [],
      confidence: { basedOn: resolved.basedOn, missingInfo: [] },
    },
    sourceText,
    sourceUrl: resolved.sourceUrl || '',
    sourceKind: resolved.sourceKind,
    pdfHash: resolved.pdfHash || '',
    cacheKey,
    status: 'processing',
    progress: 'Đang chuẩn bị tài liệu...',
  });

  // Không await: chạy nền, cập nhật status/progress để client polling
  runSummaryJob({
    summaryId: summary._id,
    paperId: paper._id,
    userId: user._id,
    resolved,
  });

  return { summary, paper, sourceText, cached: false, processing: true };
}

export async function getSummaryForUser(userId, id) {
  const summary = await Summary.findOne({ _id: id, userId });
  if (!summary) throw ApiError.notFound('Không tìm thấy bản tóm tắt');
  const paper = await Paper.findById(summary.paperId);
  return { summary, paper };
}

/** Chạy lại job tóm tắt từ nguồn đã lưu (dùng khi job lỗi hoặc server restart). */
export async function retrySummaryForUser(userId, id) {
  const summary = await Summary.findOne({ _id: id, userId });
  if (!summary) throw ApiError.notFound('Không tìm thấy bản tóm tắt');
  if (summary.status === 'processing') {
    throw ApiError.conflict('Bài đang được tóm tắt, vui lòng chờ thêm');
  }
  const paper = await Paper.findById(summary.paperId);
  if (!paper) throw ApiError.notFound('Không tìm thấy metadata bài báo');
  if (!summary.sourceText) {
    throw new ApiError(
      422,
      'NO_SOURCE_TEXT',
      'Bản ghi không còn nội dung nguồn để tóm tắt lại. Hãy tải lại PDF/link.',
    );
  }

  await assertAiQuota(userId, 'summarize');

  summary.status = 'processing';
  summary.progress = 'Đang chuẩn bị tài liệu...';
  summary.error = '';
  await summary.save();

  runSummaryJob({
    summaryId: summary._id,
    paperId: paper._id,
    userId,
    resolved: {
      paper,
      text: summary.sourceText,
      basedOn: summary.basedOn,
      sourceUrl: summary.sourceUrl,
    },
  });

  return summary;
}

/** Đánh dấu job kẹt sau khi server restart là failed để người dùng bấm thử lại. */
export async function markStaleSummariesFailed(maxAgeMinutes = 30) {
  const cutoff = new Date(Date.now() - maxAgeMinutes * 60 * 1000);
  const result = await Summary.updateMany(
    { status: 'processing', updatedAt: { $lt: cutoff } },
    {
      $set: {
        status: 'failed',
        progress: '',
        error:
          'Job tóm tắt bị gián đoạn (server khởi động lại hoặc quá thời gian). Bấm "Thử lại" để chạy lại.',
      },
    },
  );
  return result.modifiedCount;
}

export async function appendQa(userId, id, question, answer) {
  await Summary.updateOne(
    { _id: id, userId },
    { $push: { qa: { $each: [{ question, answer, createdAt: new Date() }], $slice: -20 } } },
  );
}

export async function clearQa(userId, id) {
  const result = await Summary.updateOne({ _id: id, userId }, { $set: { qa: [] } });
  if (!result.matchedCount) throw ApiError.notFound('Không tìm thấy bản tóm tắt');
}

export async function deleteSummaryForUser(userId, id) {
  const result = await Summary.findOneAndDelete({ _id: id, userId });
  if (!result) throw ApiError.notFound('Không tìm thấy bản tóm tắt');
}

export { parseIdentifier };
