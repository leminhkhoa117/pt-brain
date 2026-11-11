import {
  appendQa,
  clearQa,
  createSummaryForUser,
  deleteSummaryForUser,
  getSummaryForUser,
  retrySummaryForUser,
} from '../services/research/reader.js';
import { proposePlanChanges } from '../services/ai/planAdvisor.js';
import { askAboutPaper } from '../services/ai/paperSummarizer.js';
import { translateSource } from '../services/ai/translator.js';
import { getProgram } from '../services/training/programService.js';
import { applyPlanSchema } from '../validation/learning.js';
import { assertAiQuota, getAiUsage, recordAiCall } from '../services/ai/quota.js';
import { getUser } from '../services/authService.js';
import { Summary } from '../models/Summary.js';
import { Paper } from '../models/Paper.js';
import { escapeRegex } from '../utils/regex.js';
import { createSummaryInputSchema, askSchema, summaryMetaSchema } from '../validation/summary.js';
import { summaryToMarkdown } from '../utils/markdown.js';
import { buildSummaryPdf } from '../services/pdf/summaryPdf.js';
import { sendPdfFile } from '../services/research/pdf.js';
import { ApiError } from '../utils/ApiError.js';

export async function create(req, res) {
  const user = await getUser(req.userId);
  const input = req.file
    ? {
        title:
          typeof req.body?.title === 'string' ? req.body.title.trim().slice(0, 300) : undefined,
      }
    : createSummaryInputSchema.parse(req.body);

  const result = await createSummaryForUser(user, input, req.file);
  res.status(result.cached ? 200 : 202).json({
    data: {
      summary: result.summary,
      paper: result.paper,
      sourceText: result.sourceText,
      cached: result.cached,
      processing: Boolean(result.processing),
      usage: result.usage,
    },
  });
}

export async function list(req, res) {
  const params = req.validatedQuery || req.query || {};
  const q = String(params.q || '').trim();
  const favoriteOnly = params.favorite === 'true';
  const tag = String(params.tag || '').trim();
  const limit = Math.min(Math.max(Number(params.limit) || 100, 1), 100);
  const offset = Math.max(Number(params.offset) || 0, 0);

  const query = { userId: req.userId };
  if (favoriteOnly) query.isFavorite = true;
  if (tag) query.tags = tag;

  if (q) {
    const safe = escapeRegex(q);
    const matchingPapers = await Paper.find({
      userId: req.userId,
      $or: [
        { title: { $regex: safe, $options: 'i' } },
        { doi: { $regex: safe, $options: 'i' } },
      ],
    })
      .select('_id')
      .limit(200)
      .lean();

    const alternatives = [
      { tags: { $regex: safe, $options: 'i' } },
      { 'content.tldr': { $regex: safe, $options: 'i' } },
      { 'content.metadata.title': { $regex: safe, $options: 'i' } },
    ];
    if (matchingPapers.length) {
      alternatives.unshift({ paperId: { $in: matchingPapers.map((paper) => paper._id) } });
    }
    query.$or = alternatives;
  }

  const [summaries, total, favorites, filteredTotal] = await Promise.all([
    Summary.find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate('paperId', 'title authors year journal doi evidenceLevel isOpenAccess')
      .lean(),
    Summary.countDocuments({ userId: req.userId }),
    Summary.countDocuments({ userId: req.userId, isFavorite: true }),
    Summary.countDocuments(query),
  ]);

  res.json({
    data: {
      summaries: summaries.map((s) => ({
        id: s._id,
        paper: s.paperId,
        basedOn: s.basedOn,
        inputType: s.inputType,
        tldr: s.content?.tldr || '',
        tags: s.tags || [],
        isFavorite: Boolean(s.isFavorite),
        status: s.status || 'ready',
        progress: s.progress || '',
        createdAt: s.createdAt,
      })),
      stats: {
        total,
        favorites,
        filtered: filteredTotal,
      },
      page: {
        limit,
        offset,
        hasMore: offset + summaries.length < filteredTotal,
      },
      usage: await getAiUsage(req.userId),
    },
  });
}

export async function updateMeta(req, res) {
  const data = summaryMetaSchema.parse(req.body);
  const summary = await Summary.findOne({ _id: req.params.id, userId: req.userId });
  if (!summary) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy bản tóm tắt' } });
  }
  if (data.tags !== undefined) summary.tags = data.tags;
  if (data.isFavorite !== undefined) summary.isFavorite = data.isFavorite;
  await summary.save();
  return res.json({ data: { summary } });
}

export async function getOne(req, res) {
  const { summary, paper } = await getSummaryForUser(req.userId, req.params.id);
  res.json({
    data: { summary, paper, sourceText: summary.sourceText, usage: await getAiUsage(req.userId) },
  });
}

export async function remove(req, res) {
  await deleteSummaryForUser(req.userId, req.params.id);
  res.json({ data: { ok: true } });
}

export async function retry(req, res) {
  const summary = await retrySummaryForUser(req.userId, req.params.id);
  res.status(202).json({ data: { summary } });
}

export async function ask(req, res) {
  const { question } = askSchema.parse(req.body);
  const { summary } = await getSummaryForUser(req.userId, req.params.id);
  if (summary.status && summary.status !== 'ready') {
    return res.status(409).json({
      error: {
        code: 'SUMMARY_NOT_READY',
        message:
          summary.status === 'processing'
            ? 'Bài đang được tóm tắt, vui lòng chờ thêm.'
            : `Bản tóm tắt lỗi: ${summary.error || 'không rõ nguyên nhân'}`,
      },
    });
  }
  await assertAiQuota(req.userId, 'ask');

  const result = await askAboutPaper({
    content: summary.content,
    sourceText: summary.sourceText,
    question,
    history: summary.qa || [],
  });

  await appendQa(req.userId, summary._id, question, result.answer);
  await recordAiCall(req.userId, { kind: 'ask', usage: result.usage });

  res.json({
    data: {
      answer: result.answer,
      usage: result.usage,
      quota: await getAiUsage(req.userId),
    },
  });
}

export async function clearChat(req, res) {
  await clearQa(req.userId, req.params.id);
  res.json({ data: { ok: true } });
}

/** Dịch toàn văn/abstract sang tiếng Việt; lưu lại để lần sau không gọi AI nữa. */
export async function translate(req, res) {
  const { summary, paper } = await getSummaryForUser(req.userId, req.params.id);
  if (summary.status && summary.status !== 'ready') {
    return res.status(409).json({
      error: {
        code: 'SUMMARY_NOT_READY',
        message: 'Bài chưa tóm tắt xong, chưa thể dịch.',
      },
    });
  }
  if (summary.translation?.text && req.query.force !== '1') {
    return res.json({ data: { translation: summary.translation, cached: true } });
  }
  if (!summary.sourceText || summary.sourceText.length < 80) {
    throw new ApiError(422, 'EMPTY_SOURCE', 'Bài này không có đủ nội dung để dịch.');
  }

  await assertAiQuota(req.userId, 'translate');
  const result = await translateSource({
    text: summary.sourceText,
    title: paper?.title || summary.content?.metadata?.title || '',
  });
  const translation = {
    text: result.text,
    model: result.model,
    chars: result.chars,
    truncated: result.truncated,
    createdAt: new Date(),
  };
  await Summary.updateOne(
    { _id: summary._id, userId: req.userId },
    { $set: { translation } },
  );
  await recordAiCall(req.userId, { kind: 'translate', usage: result.usage });

  res.json({
    data: {
      translation,
      cached: false,
      quota: await getAiUsage(req.userId),
    },
  });
}

/** Phục vụ PDF gốc của bài do người dùng tải lên, để mở đúng trang hình/bảng. */
export async function sourcePdf(req, res) {
  const { summary } = await getSummaryForUser(req.userId, req.params.id);
  if (summary.sourceKind !== 'user_pdf' || !summary.pdfHash) {
    throw new ApiError(
      404,
      'PDF_NOT_AVAILABLE',
      'Bài này không có PDF gốc được lưu. Hãy mở link bài báo để xem hình.',
    );
  }
  await sendPdfFile(req, res, summary.pdfHash);
}

export async function exportMarkdown(req, res) {
  const { summary, paper } = await getSummaryForUser(req.userId, req.params.id);
  const markdown = summaryToMarkdown(summary, paper);
  const slug = (paper?.title || 'tom-tat')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .toLowerCase();
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="pt-brain-${slug || 'summary'}.md"`);
  res.send(markdown);
}

/** Tải bản dịch tiếng Việt của bài (chỉ phần đã dịch). */
export async function exportTranslation(req, res) {
  const { summary, paper } = await getSummaryForUser(req.userId, req.params.id);
  const text = summary.translation?.text;
  if (!text) {
    throw new ApiError(404, 'TRANSLATION_NOT_FOUND', 'Bài này chưa có bản dịch tiếng Việt.');
  }

  const title = summary.content?.metadata?.title || paper?.title || 'Bản dịch bài nghiên cứu';
  const header = [
    title,
    'Bản dịch tiếng Việt — dịch tự động từ bài gốc',
    summary.translation.truncated
      ? 'Lưu ý: chỉ dịch phần đầu của bài (giới hạn 40.000 ký tự); phần còn lại xem bản gốc.'
      : '',
    '',
  ]
    .filter(Boolean)
    .join('\n');

  const slug = (paper?.title || title || 'ban-dich')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .toLowerCase();

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="pt-brain-${slug || 'ban-dich'}-vi.txt"`,
  );
  res.send(`${header}\n${text}\n`);
}

/** Xuất PDF có font tiếng Việt. */
export async function exportPdf(req, res) {
  const { summary, paper } = await getSummaryForUser(req.userId, req.params.id);
  const pdf = await buildSummaryPdf(summary, paper);
  const slug = (paper?.title || 'tom-tat')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .toLowerCase();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="pt-brain-${slug || 'summary'}.pdf"`);
  res.send(pdf);
}

/** AI đề xuất chỉnh giáo án từ bài nghiên cứu; người dùng duyệt trước khi áp dụng. */export async function applyToPlan(req, res) {
  const { programId } = applyPlanSchema.parse(req.body);
  const { summary } = await getSummaryForUser(req.userId, req.params.id);
  if (summary.status && summary.status !== 'ready') {
    return res.status(409).json({
      error: {
        code: 'SUMMARY_NOT_READY',
        message: 'Bài chưa tóm tắt xong, không thể áp dụng vào giáo án.',
      },
    });
  }
  const program = await getProgram(req.userId, programId);

  await assertAiQuota(req.userId, 'apply');
  const proposal = await proposePlanChanges({ content: summary.content, program });
  await recordAiCall(req.userId, { kind: 'apply', usage: proposal.usage });

  res.json({
    data: {
      proposal: {
        rationale: proposal.rationale,
        noChangeReason: proposal.noChangeReason,
        changes: proposal.changes,
        skipped: proposal.skipped,
      },
      program: {
        _id: program._id,
        name: program.name,
        days: program.days,
      },
      quota: await getAiUsage(req.userId),
    },
  });
}
