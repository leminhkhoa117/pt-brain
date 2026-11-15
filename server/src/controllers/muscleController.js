import { getUser } from '../services/authService.js';
import { answerMuscleQuestion, answerMuscleQuestionStream } from '../services/ai/muscleCoach.js';
import { assertAiQuota, getAiUsage, recordAiCall } from '../services/ai/quota.js';
import { muscleChatSchema } from '../validation/muscle.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import { MUSCLE_GROUPS, getMuscle } from '../../../shared/muscles/index.js';

async function muscleContext(req) {
  const data = muscleChatSchema.parse(req.body || {});
  const muscle = getMuscle(data.slug);
  if (!muscle) throw ApiError.badRequest('Không tìm thấy cơ đã chọn');

  const user = await getUser(req.userId);
  const group = MUSCLE_GROUPS[muscle.group];
  return {
    data,
    muscle: {
      slug: data.slug,
      vi: muscle.vi,
      en: muscle.en,
      group: group?.vi || '',
      region: group?.vi || '',
    },
    profile: {
      goal: user.profile?.goal,
      experience: user.profile?.experience,
      sex: user.profile?.sex,
    },
  };
}

export async function chat(req, res) {
  const context = await muscleContext(req);
  await assertAiQuota(req.userId, 'muscle');

  const result = await answerMuscleQuestion({
    muscle: context.muscle,
    message: context.data.message,
    history: context.data.history,
    profile: context.profile,
  });

  await recordAiCall(req.userId, { kind: 'muscle', usage: result.usage });

  res.json({
    data: {
      ...result,
      quota: await getAiUsage(req.userId),
    },
  });
}

/** SSE: trả lời từng đoạn, cùng cơ chế với chat của trang nghiên cứu. */
export async function chatStream(req, res) {
  const context = await muscleContext(req);
  await assertAiQuota(req.userId, 'muscle');

  res.status(200);
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  let closed = false;
  res.on('close', () => {
    closed = true;
  });
  const send = (event, payload) => {
    if (closed) return;
    try {
      res.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
    } catch {
      closed = true;
    }
  };

  let answer = '';
  try {
    const result = await answerMuscleQuestionStream({
      muscle: context.muscle,
      message: context.data.message,
      history: context.data.history,
      profile: context.profile,
      onDelta: (text) => {
        answer += text;
        send('delta', { text });
      },
    });

    await recordAiCall(req.userId, { kind: 'muscle', usage: result.usage });
    send('done', {
      answer: result.answer,
      model: result.model,
      usage: result.usage,
      evidence: result.evidence,
      quota: await getAiUsage(req.userId),
    });
  } catch (error) {
    logger.warn({ err: error, slug: context.data.slug }, 'Stream chat cơ bắp thất bại');
    send('error', {
      message: error.message || 'Không trả lời được câu hỏi này. Vui lòng thử lại.',
      partial: answer,
    });
  } finally {
    if (!closed) res.end();
  }
}
