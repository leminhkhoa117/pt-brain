/**
 * Giáo trình học tập cho PT (PT Academy).
 *
 * - MODULES: 5 mảng kiến thức nền tảng của nghề PT.
 * - LESSONS: nội dung từng bài, biên soạn từ nguồn uy tín (mỗi bài >= 1 nguồn,
 *   liệt kê trong `sources` kèm giấy phép).
 * - File này giữ thuần dữ liệu/hàm thuần (không dependency ngoài) theo quy
 *   ước shared/ của repo; schema zod nằm ở server/src/validation/.
 * - Nội dung mang tính giáo dục, không thay thế đào tạo chứng chỉ hành nghề
 *   và không phải tư vấn y tế.
 */

import { MUSCLES } from '../muscles/index.js';
import { HEALTH_CONDITIONS } from '../health/conditions.js';

export const CURRICULUM_MODULES = [
  {
    key: 'anat',
    vi: 'Giải phẫu cơ xương khớp',
    en: 'Anatomy',
    blurb:
      'Thuật ngữ, cơ vân, xương, khớp và vận động học — nền tảng để đọc kỹ thuật, hiểu vì sao bài tập tác động lên cơ nào.',
  },
  {
    key: 'phys',
    vi: 'Sinh lý vận động & tập luyện',
    en: 'Exercise Physiology',
    blurb:
      'Cơ co như thế nào, hệ năng lượng, tim mạch và thích ứng khi tập — giải thích vì sao giáo án của bạn có tác dụng.',
  },
  {
    key: 'nutr',
    vi: 'Dinh dưỡng',
    en: 'Nutrition',
    blurb:
      'Năng lượng, macronutrient, nước, supplement và chiến lược giảm mỡ/tăng cơ dựa trên bằng chứng.',
  },
  {
    key: 'fit',
    vi: 'Yếu tố thể chất',
    en: 'Fitness Components',
    blurb:
      'Sức mạnh, sức bền, uốn dẻo, thăng bằng và cách đánh giá thể chất khách bằng test chuẩn.',
  },
  {
    key: 'rehab',
    vi: 'Phục hồi chức năng & an toàn',
    en: 'Rehab & Safety',
    blurb:
      'Lành thương, chấn thương thường gặp, khoa học về đau và ranh giới chuyển hướng khách sang chuyên gia y tế.',
  },
  {
    key: 'case',
    vi: 'Ứng dụng: cá nhân hoá ca cụ thể',
    en: 'Applied Case Studies',
    blurb:
      'Ghép toàn bộ kiến thức 5 module thành giáo án tập + kế hoạch ăn cho từng ca khách thật — từ buổi đầu tới re-test.',
  },
];

export const MODULE_KEYS = CURRICULUM_MODULES.map((m) => m.key);

/** Đường dẫn tĩnh của ảnh (client/public/curriculum/images/<file>). */
export function lessonImageUrl(file) {
  return `/curriculum/images/${file}`;
}

/**
 * Kiểm tra tham chiếu chéo không cần zod: slug duy nhất, ảnh trong section
 * đã khai báo, related trỏ tới cơ/bệnh nền có thật. Schema trường (độ dài,
 * min/max) do server/src/validation/curriculumLesson.js đảm nhiệm.
 */
export function validateLessonCrossRefs(lessons) {
  const seen = new Set();
  lessons.forEach((lesson) => {
    if (seen.has(lesson.slug)) {
      throw new Error(`Giáo trình có 2 bài trùng slug: ${lesson.slug}`);
    }
    seen.add(lesson.slug);

    const files = new Set((lesson.images || []).map((img) => img.file));
    (lesson.sections || []).forEach((section, index) => {
      if (section.image && !files.has(section.image)) {
        throw new Error(
          `${lesson.slug}: section ${index + 1} dùng ảnh "${section.image}" chưa khai báo trong images[]`,
        );
      }
    });

    (lesson.related?.muscles || []).forEach((slug) => {
      if (!MUSCLES[slug]) {
        throw new Error(`${lesson.slug}: related.muscles chứa cơ không tồn tại: ${slug}`);
      }
    });

    (lesson.related?.conditions || []).forEach((key) => {
      if (!HEALTH_CONDITIONS.some((c) => c.key === key)) {
        throw new Error(`${lesson.slug}: related.conditions chứa key không tồn tại: ${key}`);
      }
    });
  });
}

/** Metadata nhẹ của một bài, dùng cho cây giáo trình ở client. */
export function lessonMeta(lesson) {
  return {
    slug: lesson.slug,
    module: lesson.module,
    chapter: lesson.chapter,
    chapterTitle: lesson.chapterTitle,
    order: lesson.order,
    title: lesson.title,
    subtitle: lesson.subtitle,
    minutes: lesson.minutes,
    quizCount: lesson.quiz.length,
    termCount: lesson.terms.length,
  };
}

/** Chấm quiz bằng code: so trực tiếp với đáp án trong bài. */
export function gradeLessonQuiz(lesson, answers) {
  if (
    !Array.isArray(answers) ||
    answers.length !== lesson.quiz.length ||
    answers.some((a) => !Number.isInteger(a) || a < 0 || a > 3)
  ) {
    return null;
  }

  const results = lesson.quiz.map((question, index) => ({
    correct: answers[index] === question.answer,
    answer: question.answer,
    chosen: answers[index],
    explain: question.explain,
  }));
  const correctCount = results.filter((r) => r.correct).length;
  const total = results.length;
  const score = Math.round((correctCount / total) * 100);

  return { results, correctCount, total, score };
}

/** Cây giáo trình: module -> chương -> bài (metadata, không kèm body). */
export function buildCurriculumTree(lessons) {
  return CURRICULUM_MODULES.map((mod) => {
    const moduleLessons = lessons
      .filter((l) => l.module === mod.key)
      .sort((a, b) => a.chapter - b.chapter || a.order - b.order);

    const byChapter = new Map();
    moduleLessons.forEach((lesson) => {
      if (!byChapter.has(lesson.chapter)) {
        byChapter.set(lesson.chapter, {
          no: lesson.chapter,
          title: lesson.chapterTitle,
          lessons: [],
        });
      }
      byChapter.get(lesson.chapter).lessons.push(lessonMeta(lesson));
    });

    return {
      key: mod.key,
      vi: mod.vi,
      en: mod.en,
      blurb: mod.blurb,
      lessonCount: moduleLessons.length,
      minutesTotal: moduleLessons.reduce((sum, l) => sum + l.minutes, 0),
      chapters: [...byChapter.values()],
    };
  });
}
