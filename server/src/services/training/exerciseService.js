import { Exercise } from '../../models/Exercise.js';
import { EXERCISES } from '../../seed/exercises.js';
import { escapeRegex } from '../../utils/regex.js';

let seedChecked = false;

/** Seed thư viện bài tập (idempotent theo slug). */
export async function ensureExercisesSeeded() {
  if (seedChecked) return;
  const count = await Exercise.estimatedDocumentCount();
  if (count >= EXERCISES.length) {
    seedChecked = true;
    return;
  }
  await Exercise.bulkWrite(
    EXERCISES.map((item) => ({
      updateOne: {
        filter: { slug: item.slug },
        update: { $set: item },
        upsert: true,
      },
    })),
  );
  seedChecked = true;
}

export async function listExercises({ q, muscle, equipment } = {}) {
  await ensureExercisesSeeded();
  const query = {};
  if (muscle) query.primaryMuscles = muscle;
  if (equipment) query.equipment = equipment;
  if (q) {
    const safe = escapeRegex(String(q).slice(0, 80));
    query.$or = [
      { nameVi: { $regex: safe, $options: 'i' } },
      { nameEn: { $regex: safe, $options: 'i' } },
    ];
  }
  return Exercise.find(query).sort({ isCompound: -1, nameVi: 1 }).lean();
}
