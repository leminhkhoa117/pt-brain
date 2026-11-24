/**
 * Audit nội dung giáo trình + learning metadata.
 * Chạy: npm --prefix server run audit:curriculum
 */
import { LESSONS } from '../../shared/curriculum/lessons/index.js';
import {
  lessonLearningMeta,
  validateLearningMetadata,
} from '../../shared/learning/contexts.js';
import { EXERCISES } from '../src/seed/exercises.js';

const exerciseSlugs = new Set(EXERCISES.map((exercise) => exercise.slug));
const problems = [];
const surfaceCounts = {};
const actionCounts = {};

for (const lesson of LESSONS) {
  const meta = lessonLearningMeta(lesson);
  if (!meta.keyTakeaways?.length) problems.push(`${lesson.slug}: thiếu keyTakeaways`);
  if (!meta.microQuiz?.length) problems.push(`${lesson.slug}: thiếu microQuiz`);
  for (const action of meta.actions) {
    actionCounts[action.type] = (actionCounts[action.type] || 0) + 1;
  }
  for (const context of meta.contexts) {
    surfaceCounts[context.surface] = (surfaceCounts[context.surface] || 0) + 1;
  }
  for (const slug of lesson.related?.exercises || []) {
    if (!exerciseSlugs.has(slug)) problems.push(`${lesson.slug}: exercise không tồn tại: ${slug}`);
  }
}

try {
  validateLearningMetadata(LESSONS);
} catch (error) {
  problems.push(error.message);
}

console.log(`Lessons: ${LESSONS.length}`);
console.log('Contexts:', surfaceCounts);
console.log('Actions:', actionCounts);
console.log(`Problems: ${problems.length}`);
for (const problem of problems) console.error(`- ${problem}`);

if (problems.length) process.exitCode = 1;
