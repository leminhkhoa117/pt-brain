import {
  appendQa,
  createSummaryForUser,
  deleteSummaryForUser,
  getSummaryForUser,
} from '../services/research/reader.js';
import { proposePlanChanges } from '../services/ai/planAdvisor.js';
import { askAboutPaper } from '../services/ai/paperSummarizer.js';
import { getProgram } from '../services/training/programService.js';
import { applyPlanSchema } from '../validation/learning.js';
import { assertAiQuota, getAiUsage, recordAiCall } from '../services/ai/quota.js';
import { getUser } from '../services/authService.js';
import { Summary } from '../models/Summary.js';
import { createSummaryInputSchema, askSchema } from '../validation/summary.js';
import { summaryToMarkdown } from '../utils/markdown.js';

export async function create(req, res) {
  const user = await getUser(req.userId);
  const input = req.file
    ? {
        title:
          typeof req.body?.title === 'string' ? req.body.title.trim().slice(0, 300) : undefined,
      }
    : createSummaryInputSchema.parse(req.body);

  const result = await createSummaryForUser(user, input, req.file);
  res.status(result.cached ? 200 : 201).json({
    data: {
      summary: result.summary,
      paper: result.paper,
      sourceText: result.sourceText,
      cached: result.cached,
      usage: result.usage,
    },
  });
}

export async function list(req, res) {
  const summaries = await Summary.find({ userId: req.userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('paperId', 'title authors year journal doi evidenceLevel isOpenAccess')
    .lean();

  res.json({
    data: {
      summaries: summaries.map((s) => ({
        id: s._id,
        paper: s.paperId,
        basedOn: s.basedOn,
        inputType: s.inputType,
        tldr: s.content?.tldr || '',
        createdAt: s.createdAt,
      })),
      usage: await getAiUsage(req.userId),
    },
  });
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

export async function ask(req, res) {
  const { question } = askSchema.parse(req.body);
  const { summary } = await getSummaryForUser(req.userId, req.params.id);
  await assertAiQuota(req.userId, 'ask');

  const result = await askAboutPaper({
    content: summary.content,
    sourceText: summary.sourceText,
    question,
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

/** AI đề xuất chỉnh giáo án từ bài nghiên cứu; người dùng duyệt trước khi áp dụng. */
export async function applyToPlan(req, res) {
  const { programId } = applyPlanSchema.parse(req.body);
  const { summary } = await getSummaryForUser(req.userId, req.params.id);
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
