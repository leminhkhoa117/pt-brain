import * as programService from '../services/training/programService.js';
import { suggestionsForProgramDay } from '../services/training/workoutService.js';
import { generatePlanProposal, evaluateProgram } from '../services/ai/planCoach.js';
import { assertAiQuota, getAiUsage, recordAiCall } from '../services/ai/quota.js';
import { getUser } from '../services/authService.js';
import { PlanEvaluation } from '../models/PlanEvaluation.js';
import { programCreateSchema, programUpdateSchema, suggestProgramSchema } from '../validation/training.js';
import { applyChangesSchema } from '../validation/learning.js';

export async function aiSuggest(req, res) {
  const params = suggestProgramSchema.parse(req.body);
  const user = await getUser(req.userId);
  await assertAiQuota(req.userId, 'apply');

  const healthConditions = params.healthConditions?.length
    ? params.healthConditions
    : user.profile?.healthConditions || [];
  const conditionNotes = params.conditionNotes ?? user.profile?.conditionNotes ?? '';

  const result = await generatePlanProposal({
    profile: {
      sex: user.profile?.sex,
      age: user.age(),
      heightCm: user.profile?.heightCm,
      goal: params.goal,
      experience: params.experience,
      healthConditions,
      conditionNotes,
    },
    params: { ...params, healthConditions, conditionNotes },
  });

  if (result.usage) {
    await recordAiCall(req.userId, { kind: 'apply', usage: result.usage });
  }

  res.json({
    data: {
      ...result,
      name: params.name || result.name,
      goal: params.goal,
      experience: params.experience,
      equipment: params.equipment,
      healthConditions,
      conditionNotes,
      notes: result.rationale,
      quota: await getAiUsage(req.userId),
    },
  });
}

export async function evaluate(req, res) {
  const program = await programService.getProgram(req.userId, req.params.id);
  const user = await getUser(req.userId);
  await assertAiQuota(req.userId, 'apply');

  const result = await evaluateProgram({
    program,
    profile: {
      sex: user.profile?.sex,
      age: user.age(),
      heightCm: user.profile?.heightCm,
      goal: program.goal,
      experience: user.profile?.experience,
      healthConditions: user.profile?.healthConditions || [],
      conditionNotes: user.profile?.conditionNotes || '',
    },
  });

  await recordAiCall(req.userId, { kind: 'apply', usage: result.usage });
  const saved = await PlanEvaluation.create({
    userId: req.userId,
    programId: program._id,
    score: result.score,
    grade: result.grade,
    content: result,
    model: result.model,
  });

  res.status(201).json({ data: { evaluation: result, id: saved._id } });
}

export async function evaluations(req, res) {
  const items = await PlanEvaluation.find({
    userId: req.userId,
    programId: req.params.id,
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();
  res.json({ data: { evaluations: items } });
}

export async function suggest(req, res) {
  const input = suggestProgramSchema.parse(req.body);
  const result = await programService.suggestProgram(input);
  res.json({
    data: {
      ...result,
      name: input.name || `Giáo án ${result.daysPerWeek} buổi/tuần · ${result.splitLabel}`,
      goal: input.goal,
      experience: input.experience,
    },
  });
}

export async function create(req, res) {
  const data = programCreateSchema.parse(req.body);
  const program = await programService.createProgram(req.userId, data);
  res.status(201).json({ data: { program } });
}

export async function list(req, res) {
  const programs = await programService.listPrograms(req.userId);
  res.json({ data: { programs } });
}

export async function getOne(req, res) {
  const program = await programService.getProgram(req.userId, req.params.id);
  res.json({ data: { program, volume: programService.computeVolume(program) } });
}

export async function update(req, res) {
  const data = programUpdateSchema.parse(req.body);
  const program = await programService.updateProgram(req.userId, req.params.id, data);
  res.json({ data: { program, volume: programService.computeVolume(program) } });
}

export async function remove(req, res) {
  await programService.deleteProgram(req.userId, req.params.id);
  res.json({ data: { ok: true } });
}

export async function volume(req, res) {
  const program = await programService.getProgram(req.userId, req.params.id);
  res.json({ data: programService.computeVolume(program) });
}

export async function suggestions(req, res) {
  const program = await programService.getProgram(req.userId, req.params.id);
  const dayName = typeof req.query.dayName === 'string' ? req.query.dayName.slice(0, 80) : '';
  const result = await suggestionsForProgramDay(req.userId, program, dayName);
  res.json({ data: result });
}

export async function applyChanges(req, res) {
  const { changes } = applyChangesSchema.parse(req.body);
  const program = await programService.getProgram(req.userId, req.params.id);
  const result = programService.applyChangesToDays(program.days, changes);
  if (!result.applied.length) {
    return res.status(400).json({
      error: {
        code: 'NO_CHANGES_APPLIED',
        message: 'Không có thay đổi nào hợp lệ để áp dụng',
        details: result.skipped,
      },
    });
  }
  await program.save();
  return res.json({
    data: {
      program,
      volume: programService.computeVolume(program),
      applied: result.applied,
      skipped: result.skipped,
    },
  });
}
