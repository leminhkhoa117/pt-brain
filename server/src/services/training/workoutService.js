import { WorkoutSession } from '../../models/WorkoutSession.js';
import { Program } from '../../models/Program.js';
import { ApiError } from '../../utils/ApiError.js';
import { parseDateKey } from '../../utils/date.js';
import {
  estimateOneRepMax,
  setsByMuscle,
  tonnage,
} from '../../../../shared/calculators/index.js';
import {
  buildProgressionSuggestion,
  deloadStatus,
} from '../../../../shared/training/planner.js';

/** Tính tonnage, set theo nhóm cơ và 1RM ước tính tốt nhất mỗi bài. */
export function computeSession(sets = []) {
  const estimated1RMs = {};
  for (const set of sets) {
    if (!set.exercise || !Number(set.weightKg) || !Number(set.reps)) continue;
    try {
      const estimate = estimateOneRepMax({
        weightKg: Number(set.weightKg),
        reps: Number(set.reps),
      });
      const current = estimated1RMs[set.exercise] || 0;
      estimated1RMs[set.exercise] = Math.max(current, estimate.average);
    } catch {
      // Bỏ qua set không hợp lệ
    }
  }
  return {
    tonnage: tonnage(sets),
    setsByMuscle: setsByMuscle(sets),
    estimated1RMs,
  };
}

export async function createWorkout(userId, data) {
  const date = parseDateKey(data.date);
  const computed = computeSession(data.sets);
  return WorkoutSession.create({
    userId,
    date,
    dateKey: data.date,
    programId: data.programId,
    dayName: data.dayName || '',
    sets: data.sets,
    notes: data.notes || '',
    durationMin: data.durationMin,
    computed,
  });
}

export async function listWorkouts(userId, { from, to, programId, limit = 50 } = {}) {
  const query = { userId };
  if (from || to) {
    query.dateKey = { ...(from ? { $gte: from } : {}), ...(to ? { $lte: to } : {}) };
  }
  if (programId) query.programId = programId;
  return WorkoutSession.find(query)
    .sort({ dateKey: -1 })
    .limit(Math.min(Number(limit) || 50, 200))
    .lean();
}

export async function getWorkout(userId, id) {
  const workout = await WorkoutSession.findOne({ _id: id, userId });
  if (!workout) throw ApiError.notFound('Không tìm thấy buổi tập');
  return workout;
}

export async function updateWorkout(userId, id, data) {
  const workout = await getWorkout(userId, id);
  if (data.sets) {
    workout.sets = data.sets;
    workout.computed = computeSession(data.sets);
  }
  if (data.notes !== undefined) workout.notes = data.notes;
  if (data.durationMin !== undefined) workout.durationMin = data.durationMin;
  if (data.dayName !== undefined) workout.dayName = data.dayName;
  await workout.save();
  return workout;
}

export async function deleteWorkout(userId, id) {
  const workout = await WorkoutSession.findOneAndDelete({ _id: id, userId });
  if (!workout) throw ApiError.notFound('Không tìm thấy buổi tập');
}

/** Tiến trình 1RM ước tính của một bài theo thời gian. */
export async function progressionForExercise(userId, exercise) {
  const sessions = await WorkoutSession.find({ userId, 'sets.exercise': exercise })
    .sort({ dateKey: 1 })
    .limit(200)
    .lean();

  return sessions
    .map((session) => {
      const sets = (session.sets || []).filter((s) => s.exercise === exercise);
      if (!sets.length) return null;
      let best = 0;
      let bestSet = null;
      for (const set of sets) {
        try {
          const est = estimateOneRepMax({
            weightKg: Number(set.weightKg),
            reps: Number(set.reps),
          }).average;
          if (est > best) {
            best = est;
            bestSet = set;
          }
        } catch {
          // ignore
        }
      }
      return {
        dateKey: session.dateKey,
        estimated1RM: Math.round(best * 10) / 10,
        bestWeightKg: bestSet?.weightKg ?? null,
        bestReps: bestSet?.reps ?? null,
        tonnage: session.computed?.tonnage || 0,
      };
    })
    .filter(Boolean);
}

/**
 * Gợi ý progressive overload + deload cho một ngày của giáo án,
 * dựa trên buổi tập gần nhất có bài đó.
 */
export async function suggestionsForProgramDay(userId, program, dayName) {
  const day = program.days.find((d) => d.name === dayName) || program.days[0];
  if (!day) throw ApiError.badRequest('Giáo án chưa có ngày tập nào');

  const names = (day.exercises || []).map((e) => e.name);
  const recent = await WorkoutSession.find({ userId, 'sets.exercise': { $in: names } })
    .sort({ dateKey: -1 })
    .limit(60)
    .lean();

  const firstSession = await WorkoutSession.findOne({ userId, programId: program._id })
    .sort({ dateKey: 1 })
    .lean();

  const suggestions = (day.exercises || []).map((exercise) => {
    const plain = exercise.toObject ? exercise.toObject() : exercise;
    const session = recent.find((s) => s.sets?.some((set) => set.exercise === plain.name));
    const lastSets = session
      ? session.sets.filter((set) => set.exercise === plain.name)
      : [];
    return {
      ...plain,
      lastDate: session?.dateKey || null,
      lastSets,
      suggestion: buildProgressionSuggestion({
        lastSets,
        repMin: plain.repRange?.min ?? 8,
        repMax: plain.repRange?.max ?? 12,
        targetRir: plain.targetRir ?? 2,
      }),
    };
  });

  return {
    dayName: day.name,
    suggestions,
    deload: deloadStatus({
      firstSessionDate: firstSession?.date,
      deloadEveryWeeks: program.deloadEveryWeeks,
    }),
  };
}

export async function getProgramOrThrow(userId, id) {
  const program = await Program.findOne({ _id: id, userId });
  if (!program) throw ApiError.notFound('Không tìm thấy giáo án');
  return program;
}
