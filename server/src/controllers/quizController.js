import { generateQuiz } from '../services/ai/quizGenerator.js';
import { getSummaryForUser } from '../services/research/reader.js';
import { assertAiQuota, getAiUsage, recordAiCall } from '../services/ai/quota.js';
import { quizRequestSchema } from '../validation/quiz.js';

export async function create(req, res) {
  const { summaryId, count } = quizRequestSchema.parse(req.body);
  const { summary } = await getSummaryForUser(req.userId, summaryId);

  if (summary.status && summary.status !== 'ready') {
    return res.status(409).json({
      error: {
        code: 'SUMMARY_NOT_READY',
        message: 'Bài chưa tóm tắt xong, chưa thể tạo quiz.',
      },
    });
  }

  await assertAiQuota(req.userId, 'quiz');

  const result = await generateQuiz({
    content: summary.content || {},
    count,
    title: summary.content?.metadata?.title || '',
  });

  await recordAiCall(req.userId, { kind: 'quiz', usage: result.usage });

  return res.json({
    data: {
      summaryId,
      paperTitle: summary.content?.metadata?.title || '',
      quiz: result.quiz,
      quota: await getAiUsage(req.userId),
    },
  });
}
