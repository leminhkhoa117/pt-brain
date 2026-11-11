import { getUser } from '../services/authService.js';
import { answerMuscleQuestion } from '../services/ai/muscleCoach.js';
import { assertAiQuota, getAiUsage, recordAiCall } from '../services/ai/quota.js';
import { muscleChatSchema } from '../validation/muscle.js';
import { ApiError } from '../utils/ApiError.js';
import { MUSCLE_GROUPS, getMuscle } from '../../../shared/muscles/index.js';

export async function chat(req, res) {
  const data = muscleChatSchema.parse(req.body || {});
  const muscle = getMuscle(data.slug);
  if (!muscle) throw ApiError.badRequest('Không tìm thấy cơ đã chọn');

  await assertAiQuota(req.userId, 'muscle');

  const user = await getUser(req.userId);
  const group = MUSCLE_GROUPS[muscle.group];
  const result = await answerMuscleQuestion({
    muscle: {
      slug: data.slug,
      vi: muscle.vi,
      en: muscle.en,
      group: group?.vi || '',
      region: group?.vi || '',
    },
    message: data.message,
    history: data.history,
    profile: {
      goal: user.profile?.goal,
      experience: user.profile?.experience,
      sex: user.profile?.sex,
    },
  });

  await recordAiCall(req.userId, { kind: 'muscle', usage: result.usage });

  res.json({
    data: {
      ...result,
      quota: await getAiUsage(req.userId),
    },
  });
}
