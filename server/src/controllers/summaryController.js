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
import { getProgram } from '../services/training/programService.js';
import { applyPlanSchema } from '../validation/learning.js';
import { assertAiQuota, getAiUsage, recordAiCall } from '../services/ai/quota.js';
import { getUser } from '../services/authService.js';
import { Summary } from '../models/Summary.js';
import { createSummaryInputSchema, askSchema, summaryMetaSchema } from '../validation/summary.js';
import { summaryToMarkdown } from '../utils/markdown.js';
import { buildSummaryPdf } from '../services/pdf/summaryPdf.js';

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
  const summaries = await Summary.find({ userId: req.userId })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('paperId', 'title authors year journal doi evidenceLevel isOpenAccess')
    .lean();

  const q = String(req.query.q || '').trim().toLowerCase();
  const favoriteOnly = req.query.favorite === 'true';
  const tag = String(req.query.tag || '').trim();

  const filtered = summaries.filter((s) => {
    if (favoriteOnly && !s.isFavorite) return false;
    if (tag && !(s.tags || []).includes(tag)) return false;
    if (!q) return true;
    const haystack = [
      s.paperId?.title,
      s.paperId?.doi,
      s.content?.tldr,
      s.content?.metadata?.title,
      ...(s.tags || []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });

  res.json({
    data: {
      summaries: filtered.map((s) => ({
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
        total: summaries.length,
        favorites: summaries.filter((s) => s.isFavorite).length,
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
