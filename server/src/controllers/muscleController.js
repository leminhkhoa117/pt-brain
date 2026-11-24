import { getUser } from '../services/authService.js';
import {
  answerStructureQuestion,
  answerStructureQuestionStream,
} from '../services/ai/muscleCoach.js';
import { assertAiQuota, getAiUsage, recordAiCall } from '../services/ai/quota.js';
import { muscleChatSchema } from '../validation/muscle.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import { MUSCLE_GROUPS, getMuscle } from '../../../shared/muscles/index.js';
import {
  ANATOMY_FOR_MUSCLE,
  findAnatomyByName,
  getAnatomyStructure,
} from '../../../shared/anatomy/index.js';

function muscleStructure(muscle, slug) {
  const group = MUSCLE_GROUPS[muscle.group];
  return {
    kind: 'muscle',
    slug,
    vi: muscle.vi,
    en: muscle.en,
    group: muscle.group,
    groupVi: group?.vi || '',
    groupEn: group?.en || '',
    region: group?.vi || '',
    description: muscle.fn,
    functions: [muscle.fn, group?.description].filter(Boolean),
    exercises: muscle.exercises || [],
    note: muscle.note || '',
    relatedBones: ANATOMY_FOR_MUSCLE[slug] || [],
  };
}

function resolveStructure(data) {
  if (data.kind === 'muscle' || (!data.kind && data.slug)) {
    const muscle = getMuscle(data.slug);
    if (!muscle) throw ApiError.badRequest('Không tìm thấy cơ đã chọn');
    return muscleStructure(muscle, data.slug);
  }

  const anatomy = (data.id && getAnatomyStructure(data.id)) || (data.name && findAnatomyByName(data.name));
  if (!anatomy) throw ApiError.badRequest('Không tìm thấy cấu trúc giải phẫu đã chọn');
  // Server tự quyết định kind dựa trên dữ liệu đã resolve, không tin client.
  return {
    kind: anatomy.kind,
    id: anatomy.id,
    vi: anatomy.vi,
    en: anatomy.en,
    group: anatomy.group,
    groupVi: anatomy.groupVi,
    region: anatomy.region,
    type: anatomy.type,
    description: anatomy.description,
    functions: anatomy.functions,
    training: anatomy.training,
    clinical: anatomy.clinical,
    attachments: anatomy.attachments,
    source: anatomy.source,
  };
}

function profileOf(user) {
  const profile = user.profile || {};
  return {
    age: user.age(),
    sex: profile.sex,
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
    activityLevel: profile.activityLevel,
    goal: profile.goal,
    experience: profile.experience,
    healthConditions: profile.healthConditions || [],
    conditionNotes: profile.conditionNotes || '',
  };
}

async function structureContext(req) {
  const data = muscleChatSchema.parse(req.body || {});
  const structure = resolveStructure(data);
  const user = await getUser(req.userId);
  return { data, structure, profile: profileOf(user) };
}

export async function chat(req, res) {
  const context = await structureContext(req);
  await assertAiQuota(req.userId, 'muscle');

  const result = await answerStructureQuestion({
    structure: context.structure,
    message: context.data.message,
    history: context.data.history,
    profile: context.profile,
  });

  await recordAiCall(req.userId, { kind: 'muscle', usage: result.usage });

  res.json({
    data: {
      ...result,
      structure: context.structure,
      quota: await getAiUsage(req.userId),
    },
  });
}

/** SSE: trả lời từng đoạn, cùng cơ chế với chat của trang nghiên cứu. */
export async function chatStream(req, res) {
  const context = await structureContext(req);
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
    const result = await answerStructureQuestionStream({
      structure: context.structure,
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
      structure: context.structure,
      quota: await getAiUsage(req.userId),
    });
  } catch (error) {
    logger.warn(
      { err: error, kind: context.structure.kind, id: context.structure.id || context.structure.slug },
      'Stream chat giải phẫu thất bại',
    );
    send('error', {
      message: error.message || 'Không trả lời được câu hỏi này. Vui lòng thử lại.',
      partial: answer,
    });
  } finally {
    if (!closed) res.end();
  }
}
