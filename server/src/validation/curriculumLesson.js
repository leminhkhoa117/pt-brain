import { z } from 'zod';
import { MODULE_KEYS, validateLessonCrossRefs } from '../../../shared/curriculum/index.js';
import { validateLearningMetadata } from '../../../shared/learning/contexts.js';

/**
 * Schema nội dung một bài giáo trình (nằm ở server vì shared/ giữ thuần dữ
 * liệu, không dependency ngoài). Validate toàn bộ ngay khi routes nạp để
 * bắt lỗi biên soạn sớm nhất.
 */

const sourceSchema = z.object({
  label: z.string().trim().min(1).max(200),
  url: z.string().trim().url().max(500),
  license: z.string().trim().max(120).default('cite-only'),
});

const imageSchema = z.object({
  file: z.string().trim().regex(/^[\w-]+\.(png|jpg|jpeg|svg|webp)$/i),
  caption: z.string().trim().max(400).default(''),
  source: z.string().trim().max(200).default(''),
  sourceUrl: z.string().trim().url().max(500),
  license: z.string().trim().max(120).default('Public domain'),
});

export const lessonSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z]+-\d+-\d+$/, 'slug theo dạng module-chương-bài, ví dụ anat-2-3'),
  module: z.enum(MODULE_KEYS),
  chapter: z.number().int().min(1).max(20),
  chapterTitle: z.string().trim().min(1).max(160),
  order: z.number().min(0).max(99),
  title: z.string().trim().min(1).max(200),
  subtitle: z.string().trim().min(1).max(300),
  minutes: z.number().int().min(2).max(45),
  objectives: z.array(z.string().trim().min(4).max(300)).min(3).max(6),
  sections: z
    .array(
      z.object({
        heading: z.string().trim().min(1).max(160),
        body: z.string().trim().min(40),
        image: z.string().trim().regex(/^[\w-]+\.(png|jpg|jpeg|svg|webp)$/i).optional(),
      }),
    )
    .min(2)
    .max(8),
  applyBox: z.string().trim().min(40).max(3000),
  safetyBox: z.string().trim().min(20).max(3000).optional(),
  terms: z
    .array(
      z.object({
        en: z.string().trim().min(1).max(120),
        vi: z.string().trim().min(1).max(160),
        def: z.string().trim().min(5).max(600),
      }),
    )
    .min(3)
    .max(12),
  images: z.array(imageSchema).max(8).default([]),
  quiz: z
    .array(
      z.object({
        q: z.string().trim().min(8).max(500),
        choices: z.array(z.string().trim().min(1).max(300)).length(4),
        answer: z.number().int().min(0).max(3),
        explain: z.string().trim().min(10).max(800),
      }),
    )
    .min(4)
    .max(8),
  related: z
    .object({
      muscles: z.array(z.string().trim().max(80)).max(12).default([]),
      exercises: z.array(z.string().trim().max(80)).max(12).default([]),
      calculators: z.array(z.string().trim().max(40)).max(6).default([]),
      conditions: z.array(z.string().trim().max(40)).max(6).default([]),
      evidence: z.array(z.string().trim().max(10)).max(10).default([]),
    })
    .prefault({}),
  sources: z.array(sourceSchema).min(1).max(8),
});

/** Validate toàn bộ giáo trình: schema + tham chiếu chéo. Ném lỗi sớm. */
export function validateCurriculumLessons(lessons) {
  lessons.forEach((lesson) => lessonSchema.parse(lesson));
  validateLessonCrossRefs(lessons);
  validateLearningMetadata(lessons);
  return lessons;
}
