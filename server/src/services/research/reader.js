import crypto from 'node:crypto';
import { Summary } from '../../models/Summary.js';
import { Paper } from '../../models/Paper.js';
import { summarizePaper, PROMPT_VERSION } from '../ai/paperSummarizer.js';
import { assertAiQuota, recordAiCall } from '../ai/quota.js';
import {
  enrichPaperMetadata,
  parseIdentifier,
  resolveWorkByDoi,
  resolveWorkByUrl,
} from './metadata.js';
import { parsePdfBuffer, savePdfBuffer, removePdfFile } from './pdf.js';
import { extractFigureHints } from './figures.js';
import { ApiError } from '../../utils/ApiError.js';
import { normalizeText, truncateText } from '../../utils/text.js';
import {
  acquireSummaryLock,
  releaseSummaryLock,
  releaseSummaryLocks,
} from './summaryLock.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
    const paper = await enrichPaperMetadata(
      {
        title: input.title || parsed.title,
        authors: [],
        url: '',
        publicationTypes: [],
        evidenceLevel: 5,
        source: 'manual',
        doi: parsed.doiFromFilename || '',
      },
      { text: parsed.text, filename: file.originalname, keepTitle: Boolean(input.title) },
    );
    return {
      paper,
      text: parsed.text,
      basedOn: 'fulltext',
      sourceKind: 'user_pdf',
      sourceUrl: paper.url || '',
      pdfHash: parsed.hash,
      pdfPages: parsed.pages || 0,
      figureHints: parsed.figureHints || [],
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
  const paper = await enrichPaperMetadata(
    {
      title: input.title || inferTitleFromText(text),
      authors: [],
      url: '',
      publicationTypes: [],
      evidenceLevel: 5,
      source: 'manual',
    },
    { text, keepTitle: Boolean(input.title) },
  );
  return {
    paper,
    text,
    basedOn: text.length >= 5000 ? 'fulltext' : 'abstract_only',
    sourceKind: 'user_text',
    sourceUrl: '',
    inputType: text.length >= 5000 ? 'text' : 'abstract',
  };
}

export function buildCacheKey(resolved, version = PROMPT_VERSION) {
  const suffix = `:${version}`;
  if (resolved.paper?.doi) return `doi:${resolved.paper.doi.toLowerCase()}${suffix}`;
  if (resolved.pdfHash) return `pdf:${resolved.pdfHash}${suffix}`;
  if (resolved.sourceUrl) {
    return `url:${crypto.createHash('sha256').update(resolved.sourceUrl).digest('hex').slice(0, 40)}${suffix}`;
  }
  return `text:${crypto.createHash('sha256').update(resolved.text).digest('hex').slice(0, 40)}${suffix}`;
}

// Job tóm tắt chạy trong RAM. Nếu server restart hoặc AI treo, document có thể
// kẹt ở "processing" mãi. Sau 6 phút không cập nhật thì coi là job chết.
const STALE_PROCESSING_MS = 6 * 60 * 1000;
const STALE_PROCESSING_ERROR =
  'Job tóm tắt bị gián đoạn (server khởi động lại hoặc quá thời gian). Bấm "Thử lại" để chạy lại.';

async function failIfStale(summary) {
  if (!summary || summary.status !== 'processing') return false;
  const updatedAt = summary.updatedAt ? new Date(summary.updatedAt).getTime() : 0;
  if (updatedAt && Date.now() - updatedAt < STALE_PROCESSING_MS) return false;
  summary.status = 'failed';
  summary.progress = '';
  summary.error = STALE_PROCESSING_ERROR;
  await summary.save();
  await releaseSummaryLock(summary.userId, summary.cacheKey);
  return true;
}

const PAPER_FIELDS = [
  'title',
  'authors',
  'year',
  'journal',
  'volume',
  'issue',
  'pages',
  'doi',
  'pmid',
  'pmcid',
  'url',
  'abstract',
  'publicationTypes',
  'evidenceLevel',
  'citationCount',
  'isOpenAccess',
  'oaStatus',
  'isRetracted',
  'journalHIndex',
  'journalImpact2yr',
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

async function responseForSummary(summary, { cached, processing }) {
  const paper = await Paper.findById(summary.paperId);
  return {
    summary,
    paper,
    sourceText: summary.sourceText,
    cached,
    processing,
    usage: null,
  };
}

/**
 * Chạy AI trong nền để request không bị timeout với PDF dài.
 * Cập nhật progress/status vào Summary để client polling.
 */
async function runSummaryJob({ summaryId, paperId, userId, resolved, cacheKey }) {
  try {
    const { content, facts, usage, model, promptVersion } = await summarizePaper({
      paper: resolved.paper,
      text: resolved.text,
      basedOn: resolved.basedOn,
      figureHints: resolved.figureHints || [],
      facts: resolved.facts || null,
      onProgress: (progress) => {
        Summary.updateOne({ _id: summaryId }, { $set: { progress } }).catch(() => {});
      },
    });

    // PDF thường có metadata rác; bổ sung các field còn thiếu từ nội dung AI trích
    if (content.metadata) {
      const update = {};
      const currentTitle = String(resolved.paper.title || '').trim();
      const aiTitle = String(content.metadata.title || '').trim();
      const titleMissing = !currentTitle || /chưa có tiêu đề|^không rõ$/i.test(currentTitle);
      if (titleMissing && aiTitle && !/^không rõ$|^unknown$/i.test(aiTitle)) {
        update.title = aiTitle;
      }
      if (!resolved.paper.journal && content.metadata.journal) update.journal = content.metadata.journal;
      if (!resolved.paper.year && content.metadata.year) update.year = content.metadata.year;
      if (!resolved.paper.volume && content.metadata.volume) update.volume = content.metadata.volume;
      if (!resolved.paper.issue && content.metadata.issue) update.issue = content.metadata.issue;
      if (!resolved.paper.pages && content.metadata.pages) update.pages = content.metadata.pages;
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
          facts,
          model,
          promptVersion,
          needsReview: content.verification?.passed === false,
          reviewedAt: null,
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
  } finally {
    await releaseSummaryLock(userId, cacheKey);
  }
}

/**
 * Pipeline: lấy nguồn -> cache -> tạo Summary "processing" -> chạy AI nền.
 * Trả về ngay để client hiển thị tiến trình và polling.
 */
export async function createSummaryForUser(user, input, file) {
  const resolved = await resolveInput(input, file);
  resolved.figureHints =
    resolved.figureHints?.length ? resolved.figureHints : extractFigureHints(resolved.text);
  const cacheKey = buildCacheKey(resolved);
  const findExisting = () =>
    Summary.findOne({ userId: user._id, cacheKey }).sort({ createdAt: -1 });

  let existing = await findExisting();
  if (existing) await failIfStale(existing);
  if (existing && (!existing.status || existing.status === 'ready')) {
    return responseForSummary(existing, { cached: true, processing: false });
  }
  if (existing?.status === 'processing') {
    return responseForSummary(existing, { cached: false, processing: true });
  }

  const locked = await acquireSummaryLock(user._id, cacheKey);
  if (!locked) {
    // Request khác đang tạo Summary. Chờ ngắn để trả đúng bản đang xử lý
    // thay vì tạo thêm job thứ hai.
    for (let attempt = 0; attempt < 10; attempt += 1) {
      await sleep(200);
      existing = await findExisting();
      if (!existing) continue;
      if (existing.status === 'processing') {
        return responseForSummary(existing, { cached: false, processing: true });
      }
      if (!existing.status || existing.status === 'ready') {
        return responseForSummary(existing, { cached: true, processing: false });
      }
    }
    throw ApiError.conflict('Bài này đang được xử lý, vui lòng thử lại sau vài giây');
  }

  let jobStarted = false;
  try {
    // Double-check sau khi có khóa: request trước có thể vừa tạo xong.
    existing = await findExisting();
    if (existing && (!existing.status || existing.status === 'ready')) {
      await releaseSummaryLock(user._id, cacheKey);
      return responseForSummary(existing, { cached: true, processing: false });
    }
    if (existing?.status === 'processing') {
      await releaseSummaryLock(user._id, cacheKey);
      return responseForSummary(existing, { cached: false, processing: true });
    }

    await assertAiQuota(user._id, 'summarize');

    // Nếu lần trước fail nhưng còn nguồn, chạy lại trên cùng document để
    // không để lại bản ghi lỗi trùng trong thư viện.
    if (existing?.status === 'failed' && existing.sourceText) {
      const paper = await Paper.findById(existing.paperId);
      if (paper) {
        existing.status = 'processing';
        existing.progress = 'Đang chuẩn bị tài liệu...';
        existing.error = '';
        existing.needsReview = false;
        existing.reviewedAt = null;
        await existing.save();
        jobStarted = true;
        runSummaryJob({
          summaryId: existing._id,
          paperId: paper._id,
          userId: user._id,
          resolved: {
            paper,
            text: existing.sourceText,
            basedOn: existing.basedOn,
            sourceUrl: existing.sourceUrl,
            figureHints: existing.figureHints?.length
              ? existing.figureHints
              : extractFigureHints(existing.sourceText),
            facts:
              existing.facts && existing.promptVersion === PROMPT_VERSION
                ? existing.facts
                : null,
          },
          cacheKey,
        });
        return responseForSummary(existing, { cached: false, processing: true });
      }
    }

    if (existing?.status === 'failed') {
      await Summary.deleteOne({ _id: existing._id, userId: user._id }).catch(() => {});
    }

    const paper = await upsertPaper(user._id, resolved.paper);
    const sourceText = truncateText(resolved.text, 400000);

    // Lưu PDF gốc để mở đúng trang hình/bảng. Nếu lưu lỗi, bản tóm tắt vẫn chạy.
    if (file && resolved.pdfHash) {
      await savePdfBuffer(file.buffer, resolved.pdfHash).catch(() => {});
    }

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
          volume: resolved.paper.volume || '',
          issue: resolved.paper.issue || '',
          pages: resolved.paper.pages || '',
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
      pdfPages: resolved.pdfPages || 0,
      figureHints: resolved.figureHints || [],
      cacheKey,
      promptVersion: PROMPT_VERSION,
      status: 'processing',
      progress: 'Đang chuẩn bị tài liệu...',
    });

    // Không await: chạy nền, cập nhật status/progress để client polling
    jobStarted = true;
    runSummaryJob({
      summaryId: summary._id,
      paperId: paper._id,
      userId: user._id,
      resolved,
      cacheKey,
    });

    return { summary, paper, sourceText, cached: false, processing: true };
  } catch (error) {
    if (!jobStarted) await releaseSummaryLock(user._id, cacheKey);
    throw error;
  }
}

export async function getSummaryForUser(userId, id) {
  const summary = await Summary.findOne({ _id: id, userId });
  if (!summary) throw ApiError.notFound('Không tìm thấy bản tóm tắt');
  await failIfStale(summary);
  const paper = await Paper.findById(summary.paperId);
  return { summary, paper };
}

/** Chạy lại job tóm tắt từ nguồn đã lưu (dùng khi job lỗi hoặc server restart). */
export async function retrySummaryForUser(userId, id) {
  let summary = await Summary.findOne({ _id: id, userId });
  if (!summary) throw ApiError.notFound('Không tìm thấy bản tóm tắt');
  await failIfStale(summary);
  if (summary.status === 'processing') {
    throw ApiError.conflict('Bài đang được tóm tắt, vui lòng chờ thêm');
  }

  const lockKey = summary.cacheKey;
  const locked = lockKey ? await acquireSummaryLock(userId, lockKey) : true;
  if (!locked) {
    throw ApiError.conflict('Bài này đang được xử lý, vui lòng chờ thêm');
  }

  let jobStarted = false;
  try {
    // Re-check sau khi có khóa: một request khác có thể vừa thắng race.
    summary = await Summary.findOne({ _id: id, userId });
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
    summary.needsReview = false;
    summary.reviewedAt = null;
    await summary.save();

    jobStarted = true;
    runSummaryJob({
      summaryId: summary._id,
      paperId: paper._id,
      userId,
      resolved: {
        paper,
        text: summary.sourceText,
        basedOn: summary.basedOn,
        sourceUrl: summary.sourceUrl,
        figureHints: summary.figureHints?.length
          ? summary.figureHints
          : extractFigureHints(summary.sourceText),
        facts:
          summary.facts && summary.promptVersion === PROMPT_VERSION ? summary.facts : null,
      },
      cacheKey: summary.cacheKey,
    });

    return summary;
  } catch (error) {
    if (!jobStarted && lockKey) await releaseSummaryLock(userId, lockKey);
    throw error;
  }
}

/**
 * Khôi phục job đang processing sau khi server restart. Vì job chạy trong RAM,
 * không có tiến trình nào đang giữ các document này sau restart; ta chạy lại
 * từ sourceText đã lưu. Giới hạn số job resume cùng lúc để không bùng AI call.
 */
export async function resumeInterruptedSummaries({ limit = 5 } = {}) {
  const processing = await Summary.find({ status: 'processing' }).sort({ updatedAt: 1 }).lean();
  const selected = processing.slice(0, limit);
  const overflow = processing.slice(limit);

  if (overflow.length) {
    await Summary.updateMany(
      { _id: { $in: overflow.map((item) => item._id) } },
      {
        $set: {
          status: 'failed',
          progress: '',
          error:
            'Có quá nhiều job bị gián đoạn khi khởi động lại. Bấm "Thử lại" cho các job cần thiết.',
        },
      },
    );
    await releaseSummaryLocks(overflow);
  }

  let resumed = 0;
  let failed = overflow.length;

  for (const summary of selected) {
    const paper = await Paper.findById(summary.paperId);
    if (!paper || !summary.sourceText) {
      await Summary.updateOne(
        { _id: summary._id },
        {
          $set: {
            status: 'failed',
            progress: '',
            error:
              'Không thể khôi phục job sau khởi động lại vì thiếu nội dung nguồn. Hãy tải lại PDF/link.',
          },
        },
      ).catch(() => {});
      failed += 1;
      continue;
    }

    const locked = summary.cacheKey
      ? await acquireSummaryLock(summary.userId, summary.cacheKey)
      : true;
    if (!locked) continue;

    await Summary.updateOne(
      { _id: summary._id, status: 'processing' },
      { $set: { progress: 'Đang khôi phục sau khởi động lại...', needsReview: false, reviewedAt: null } },
    );
    runSummaryJob({
      summaryId: summary._id,
      paperId: paper._id,
      userId: summary.userId,
      resolved: {
        paper,
        text: summary.sourceText,
        basedOn: summary.basedOn,
        sourceUrl: summary.sourceUrl,
        figureHints: summary.figureHints?.length
          ? summary.figureHints
          : extractFigureHints(summary.sourceText),
        facts:
          summary.facts && summary.promptVersion === PROMPT_VERSION ? summary.facts : null,
      },
      cacheKey: summary.cacheKey,
    });
    resumed += 1;
  }

  return { resumed, failed };
}

/** Đánh dấu job kẹt sau khi server restart là failed để người dùng bấm thử lại. */
export async function markStaleSummariesFailed(maxAgeMinutes = 0) {
  const cutoff = new Date(Date.now() - maxAgeMinutes * 60 * 1000);
  const stale = await Summary.find({
    status: 'processing',
    updatedAt: { $lt: cutoff },
  })
    .select('userId cacheKey')
    .lean();
  const result = await Summary.updateMany(
    { status: 'processing', updatedAt: { $lt: cutoff } },
    {
      $set: {
        status: 'failed',
        progress: '',
        error: STALE_PROCESSING_ERROR,
      },
    },
  );
  await releaseSummaryLocks(stale);
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
  if (result.pdfHash) {
    const remaining = await Summary.countDocuments({ pdfHash: result.pdfHash });
    if (!remaining) await removePdfFile(result.pdfHash);
  }
}

export { parseIdentifier };
