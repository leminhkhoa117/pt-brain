import { WorkoutSession } from '../../models/WorkoutSession.js';
import { Program } from '../../models/Program.js';
import { Exercise } from '../../models/Exercise.js';
import { BodyLog } from '../../models/BodyLog.js';
import { User } from '../../models/User.js';
import { ApiError } from '../../utils/ApiError.js';
import { parseDateKey } from '../../utils/date.js';
import { estimateCardioCalories } from '../../../../shared/training/cardio.js';
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

async function cardioWeightForUser(userId) {
  const [user, latestLog] = await Promise.all([
    User.findById(userId).select('profile.weightKg').lean(),
    BodyLog.findOne({ userId }).sort({ dateKey: -1 }).select('weightKg').lean(),
  ]);
  return Number(latestLog?.weightKg || user?.profile?.weightKg) || null;
}

export async function createWorkout(userId, data) {
  const date = parseDateKey(data.date);

  if (data.kind === 'cardio') {
    const manual = data.caloriesBurned !== undefined;
    let calories = Number(data.caloriesBurned) || 0;
    let met = 0;
    let paceMinPerKm = 0;

    if (!manual) {
      const weightKg = await cardioWeightForUser(userId);
      if (!weightKg) {
        throw new ApiError(
          422,
          'CARDIO_WEIGHT_REQUIRED',
          'Cần cân nặng trong hồ sơ hoặc BodyLog để ước tính calo. Bạn có thể nhập calo thủ công.',
        );
      }
      try {
        const estimate = estimateCardioCalories({
          activity: data.activity,
          durationMin: data.durationMin,
          distanceKm: data.distanceKm,
          weightKg,
          intensity: data.intensity,
        });
        calories = estimate.calories;
        met = estimate.met;
        paceMinPerKm = estimate.paceMinPerKm || 0;
      } catch (error) {
        throw ApiError.badRequest(error.message);
      }
    }

    return WorkoutSession.create({
      userId,
      date,
      dateKey: data.date,
      programId: data.programId,
      dayName: data.dayName || '',
      kind: 'cardio',
      activity: data.activity,
      distanceKm: data.distanceKm,
      intensity: data.intensity || 'moderate',
      caloriesBurned: Math.round(calories),
      caloriesSource: manual ? 'manual' : 'estimated',
      sets: [],
      notes: data.notes || '',
      durationMin: data.durationMin,
      computed: {
        tonnage: 0,
        setsByMuscle: {},
        estimated1RMs: {},
        calories: Math.round(calories),
        met,
        paceMinPerKm,
      },
    });
  }

  const computed = computeSession(data.sets);
  return WorkoutSession.create({
    userId,
    date,
    dateKey: data.date,
    programId: data.programId,
    dayName: data.dayName || '',
    kind: 'strength',
    sets: data.sets,
    notes: data.notes || '',
    durationMin: data.durationMin,
    computed: { ...computed, calories: 0 },
  });
}

export async function listWorkouts(userId, { from, to, programId, kind, limit = 50 } = {}) {
  const query = { userId };
  if (from || to) {
    query.dateKey = { ...(from ? { $gte: from } : {}), ...(to ? { $lte: to } : {}) };
  }
  if (programId) query.programId = programId;
  if (kind) query.kind = kind;
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
  // Lấy 200 buổi MỚI NHẤT rồi đảo lại để biểu đồ vẫn tăng dần theo thời gian.
  // Sort tăng dần + limit sẽ lấy nhầm 200 buổi cũ nhất khi lịch sử dài.
  const sessions = await WorkoutSession.find({ userId, 'sets.exercise': exercise })
    .sort({ dateKey: -1, createdAt: -1 })
    .limit(200)
    .lean();

  return sessions
    .reverse()
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

  // Gắn equipment để client biết bài bodyweight được phép log tạ = 0.
  const exerciseIds = (day.exercises || [])
    .map((exercise) => exercise.exerciseId)
    .filter(Boolean);
  const exerciseDocs = exerciseIds.length
    ? await Exercise.find({ _id: { $in: exerciseIds } }).select('_id equipment').lean()
    : [];
  const equipmentById = new Map(
    exerciseDocs.map((exercise) => [String(exercise._id), exercise.equipment || []]),
  );

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
      equipment: equipmentById.get(String(plain.exerciseId)) || [],
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
    cardio: day.cardio || [],
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
