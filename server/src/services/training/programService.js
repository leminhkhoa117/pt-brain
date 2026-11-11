import { Program } from '../../models/Program.js';
import { ApiError } from '../../utils/ApiError.js';
import { MUSCLE_VOLUME_TARGET } from '../../../../shared/config/nutrition.js';
import { volumeStatus } from '../../../../shared/calculators/index.js';
import { suggestSplit, SPLIT_LABELS, volumeFromDays } from '../../../../shared/training/planner.js';
import { listExercises } from './exerciseService.js';
import {
  healthConditionLabel,
  isExerciseAvoided,
} from '../../../../shared/health/conditions.js';

const TEMPLATES = {
  full_body: [
    {
      label: 'Full body A',
      slots: [
        { muscle: 'quads', category: 'compound' },
        { muscle: 'chest', category: 'compound' },
        { muscle: 'back', category: 'compound' },
        { muscle: 'hamstrings', category: 'compound' },
        { muscle: 'shoulders', category: 'isolation' },
        { muscle: 'core' },
      ],
    },
    {
      label: 'Full body B',
      slots: [
        { muscle: 'hamstrings', category: 'compound' },
        { muscle: 'shoulders', category: 'compound' },
        { muscle: 'back', category: 'compound' },
        { muscle: 'quads', category: 'compound' },
        { muscle: 'chest', category: 'isolation' },
        { muscle: 'core' },
      ],
    },
    {
      label: 'Full body C',
      slots: [
        { muscle: 'glutes', category: 'compound' },
        { muscle: 'chest', category: 'compound' },
        { muscle: 'back', category: 'compound' },
        { muscle: 'quads', category: 'compound' },
        { muscle: 'triceps', category: 'isolation' },
        { muscle: 'biceps', category: 'isolation' },
      ],
    },
  ],
  upper_lower: [
    {
      label: 'Upper A',
      slots: [
        { muscle: 'chest', category: 'compound' },
        { muscle: 'back', category: 'compound' },
        { muscle: 'shoulders', category: 'compound' },
        { muscle: 'back' },
        { muscle: 'shoulders', category: 'isolation' },
        { muscle: 'triceps', category: 'isolation' },
        { muscle: 'biceps', category: 'isolation' },
      ],
    },
    {
      label: 'Lower A',
      slots: [
        { muscle: 'quads', category: 'compound' },
        { muscle: 'hamstrings', category: 'compound' },
        { muscle: 'glutes', category: 'compound' },
        { muscle: 'quads', category: 'isolation' },
        { muscle: 'calves', category: 'isolation' },
        { muscle: 'core' },
      ],
    },
    {
      label: 'Upper B',
      slots: [
        { muscle: 'chest', category: 'compound' },
        { muscle: 'back', category: 'compound' },
        { muscle: 'shoulders', category: 'compound' },
        { muscle: 'chest', category: 'isolation' },
        { muscle: 'back', category: 'isolation' },
        { muscle: 'triceps', category: 'isolation' },
        { muscle: 'biceps', category: 'isolation' },
      ],
    },
    {
      label: 'Lower B',
      slots: [
        { muscle: 'hamstrings', category: 'compound' },
        { muscle: 'quads', category: 'compound' },
        { muscle: 'glutes', category: 'compound' },
        { muscle: 'hamstrings', category: 'isolation' },
        { muscle: 'calves', category: 'isolation' },
        { muscle: 'core' },
      ],
    },
  ],
  ppl: [
    {
      label: 'Push A',
      slots: [
        { muscle: 'chest', category: 'compound' },
        { muscle: 'shoulders', category: 'compound' },
        { muscle: 'chest', category: 'compound' },
        { muscle: 'shoulders', category: 'isolation' },
        { muscle: 'triceps', category: 'isolation' },
        { muscle: 'triceps', category: 'isolation' },
      ],
    },
    {
      label: 'Pull A',
      slots: [
        { muscle: 'back', category: 'compound' },
        { muscle: 'back', category: 'compound' },
        { muscle: 'back' },
        { muscle: 'biceps', category: 'isolation' },
        { muscle: 'biceps', category: 'isolation' },
        { muscle: 'core' },
      ],
    },
    {
      label: 'Legs A',
      slots: [
        { muscle: 'quads', category: 'compound' },
        { muscle: 'hamstrings', category: 'compound' },
        { muscle: 'glutes', category: 'compound' },
        { muscle: 'quads', category: 'isolation' },
        { muscle: 'calves', category: 'isolation' },
        { muscle: 'core' },
      ],
    },
    {
      label: 'Push B',
      slots: [
        { muscle: 'shoulders', category: 'compound' },
        { muscle: 'chest', category: 'compound' },
        { muscle: 'chest', category: 'isolation' },
        { muscle: 'shoulders', category: 'isolation' },
        { muscle: 'triceps', category: 'isolation' },
        { muscle: 'triceps', category: 'isolation' },
      ],
    },
    {
      label: 'Pull B',
      slots: [
        { muscle: 'back', category: 'compound' },
        { muscle: 'back', category: 'compound' },
        { muscle: 'back', category: 'isolation' },
        { muscle: 'biceps', category: 'isolation' },
        { muscle: 'biceps', category: 'isolation' },
        { muscle: 'core' },
      ],
    },
    {
      label: 'Legs B',
      slots: [
        { muscle: 'hamstrings', category: 'compound' },
        { muscle: 'quads', category: 'compound' },
        { muscle: 'glutes', category: 'compound' },
        { muscle: 'hamstrings', category: 'isolation' },
        { muscle: 'calves', category: 'isolation' },
        { muscle: 'core' },
      ],
    },
  ],
};

function pickExercise(pool, slot, used, allowedEquipment) {
  const base = pool.filter((e) => e.primaryMuscles.includes(slot.muscle));
  if (!base.length) return null;

  const byCategory = slot.category
    ? base.filter((e) => e.category === slot.category)
    : base;
  const candidates = byCategory.length ? byCategory : base;

  // Nếu người dùng đã chọn dụng cụ, tuyệt đối không fallback sang dụng cụ khác:
  // thà bỏ trống slot còn hơn gợi ý bài họ không thể tập.
  const withEquipment = allowedEquipment.size
    ? candidates.filter((e) => e.equipment.some((eq) => allowedEquipment.has(eq)))
    : candidates;
  if (allowedEquipment.size && !withEquipment.length) return null;

  const finalPool = withEquipment.filter((e) => !used.has(e.slug));
  if (!finalPool.length) return null;

  finalPool.sort((a, b) => Number(b.isCompound) - Number(a.isCompound));
  return finalPool[0];
}

function prescription(exercise, goal, experience) {
  const compound = Boolean(exercise.isCompound);
  let sets = compound ? (experience === 'beginner' ? 3 : 4) : 3;
  if (experience === 'advanced' && compound) sets = 4;

  const repRange = compound
    ? goal === 'cut'
      ? { min: 8, max: 12 }
      : { min: 6, max: 10 }
    : goal === 'cut'
      ? { min: 12, max: 15 }
      : { min: 10, max: 15 };

  return {
    exerciseId: exercise._id,
    name: exercise.nameVi,
    muscleGroup: exercise.primaryMuscles[0],
    sets,
    repRange,
    targetRir: experience === 'beginner' ? 3 : 2,
    restSec: compound ? 120 : 90,
  };
}

/** Tạo giáo án gợi ý bằng quy tắc trong code (không dùng AI). */
export async function suggestProgram({
  goal = 'maintain',
  experience = 'intermediate',
  daysPerWeek = 3,
  equipment = [],
  sessionMinutes = 60,
  healthConditions = [],
}) {
  const days = Number(daysPerWeek) || 3;
  const split = suggestSplit(days);
  const all = await listExercises();
  const pool = healthConditions?.length
    ? all.filter((exercise) => !isExerciseAvoided(exercise.nameEn, exercise.nameVi, healthConditions))
    : all;
  if (!pool.length) throw new ApiError(500, 'NO_EXERCISES', 'Thư viện bài tập chưa được seed');

  const allowedEquipment = new Set(
    (equipment || []).length ? [...equipment, 'bodyweight'] : [],
  );
  const maxExercises = sessionMinutes <= 45 ? 4 : sessionMinutes <= 60 ? 5 : 6;
  const used = new Set();
  const templates = TEMPLATES[split];
  const programDays = [];
  let missingSlots = 0;

  for (let index = 0; index < days; index += 1) {
    const template = templates[index % templates.length];
    const slots = template.slots.slice(0, maxExercises);
    const exercises = [];
    for (const slot of slots) {
      const exercise = pickExercise(pool, slot, used, allowedEquipment);
      if (!exercise) {
        missingSlots += 1;
        continue;
      }
      used.add(exercise.slug);
      exercises.push(prescription(exercise, goal, experience));
    }
    programDays.push({
      name: index < templates.length ? template.label : `${template.label} ${index + 1}`,
      exercises,
    });
  }

  return {
    split,
    splitLabel: SPLIT_LABELS[split],
    daysPerWeek: days,
    days: programDays,
    equipment,
    missingSlots,
    notes: `Gợi ý theo quy tắc: ${days} buổi/tuần, ${SPLIT_LABELS[split]}, tối đa ${maxExercises} bài/buổi. Mục tiêu volume 10-20 set/nhóm cơ/tuần.${
      healthConditions?.length
        ? ` Đã loại bài không phù hợp với: ${healthConditions.map(healthConditionLabel).join(', ')}.`
        : ''
    }${
      missingSlots
        ? ` Có ${missingSlots} slot bị bỏ trống vì không có bài phù hợp dụng cụ đã chọn; hãy thêm dụng cụ hoặc dùng "Tự tạo giáo án".`
        : ''
    }`,
  };
}

export function computeVolume(program) {
  const volume = volumeFromDays(program.days || []);
  return {
    volume,
    status: volumeStatus(volume, MUSCLE_VOLUME_TARGET),
    target: MUSCLE_VOLUME_TARGET,
    totalSets: Object.values(volume).reduce((a, b) => a + b, 0),
  };
}

const APPLY_LIMITS = {
  sets: { min: 1, max: 20 },
  targetRir: { min: 0, max: 5 },
  repMin: { min: 1, max: 30 },
  repMax: { min: 1, max: 30 },
};

/** Áp các thay đổi đã duyệt vào days; trả về danh sách đã áp và bị bỏ qua. */
export function applyChangesToDays(days, changes) {
  const applied = [];
  const skipped = [];
  for (const change of changes) {
    const day = days.find((d) => d.name === change.dayName);
    const exercise = day?.exercises?.find((e) => e.name === change.exerciseName);
    if (!day || !exercise) {
      skipped.push({ ...change, reason: 'Không tìm thấy ngày/bài' });
      continue;
    }
    const limits = APPLY_LIMITS[change.field];
    if (!limits || !Number.isFinite(change.after) || change.after < limits.min || change.after > limits.max) {
      skipped.push({ ...change, reason: 'Giá trị ngoài giới hạn' });
      continue;
    }

    const before =
      change.field === 'repMin'
        ? exercise.repRange?.min
        : change.field === 'repMax'
          ? exercise.repRange?.max
          : exercise[change.field];
    const after = Math.round(change.after);
    const nextMin = change.field === 'repMin' ? after : exercise.repRange?.min;
    const nextMax = change.field === 'repMax' ? after : exercise.repRange?.max;
    if (nextMin > nextMax) {
      skipped.push({ ...change, reason: 'repMin > repMax' });
      continue;
    }

    if (change.field === 'repMin') exercise.repRange.min = after;
    else if (change.field === 'repMax') exercise.repRange.max = after;
    else exercise[change.field] = after;

    applied.push({
      dayName: day.name,
      exerciseName: exercise.name,
      field: change.field,
      before,
      after,
    });
  }
  return { applied, skipped };
}

export async function createProgram(userId, data) {
  return Program.create({ ...data, userId });
}

export async function listPrograms(userId) {
  return Program.find({ userId }).sort({ status: 1, createdAt: -1 }).lean();
}

export async function getProgram(userId, id) {
  const program = await Program.findOne({ _id: id, userId });
  if (!program) throw ApiError.notFound('Không tìm thấy giáo án');
  return program;
}

export async function updateProgram(userId, id, data) {
  const program = await getProgram(userId, id);
  Object.assign(program, data);
  await program.save();
  return program;
}

export async function deleteProgram(userId, id) {
  const program = await Program.findOneAndDelete({ _id: id, userId });
  if (!program) throw ApiError.notFound('Không tìm thấy giáo án');
}
