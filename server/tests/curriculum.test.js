import { describe, expect, it } from 'vitest';

/**
 * Unit test nội dung giáo trình: schema, cây module và chấm quiz.
 * Không cần MongoDB — API integration nằm ở curriculumApi.test.js.
 */

const { LESSONS } = await import('../../shared/curriculum/lessons/index.js');
const {
  buildCurriculumTree,
  gradeLessonQuiz,
  lessonImageUrl,
  validateLessonCrossRefs,
} = await import('../../shared/curriculum/index.js');
const { lessonSchema, validateCurriculumLessons } = await import(
  '../src/validation/curriculumLesson.js'
);

describe('Nội dung giáo trình — schema & chéo dữ liệu', () => {
  it('toàn bộ bài pass schema zod + tham chiếu chéo (validate chạy khi routes nạp)', () => {
    expect(() => validateCurriculumLessons(LESSONS)).not.toThrow();
    expect(LESSONS.length).toBeGreaterThanOrEqual(14);
    LESSONS.forEach((lesson) => {
      expect(lesson.slug).toMatch(/^[a-z]+-\d+-\d+$/);
      expect(lesson.quiz.length).toBeGreaterThanOrEqual(4);
      expect(lesson.sources.length).toBeGreaterThanOrEqual(1);
      expect(lesson.sections.length).toBeGreaterThanOrEqual(2);
      expect(lesson.terms.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('schema bắt lỗi biên soạn: bài thiếu quiz/sources ném lỗi rõ', () => {
    const bad = { ...LESSONS[0] };
    delete bad.quiz;
    expect(() => lessonSchema.parse(bad)).toThrow();

    const noSources = { ...LESSONS[0], sources: [] };
    expect(() => lessonSchema.parse(noSources)).toThrow();
  });

  it('tham chiếu chéo bắt slug trùng, cơ/bệnh nền không tồn tại', () => {
    expect(() => validateLessonCrossRefs([LESSONS[0], LESSONS[0]])).toThrow(/trùng slug/);

    const badMuscle = structuredClone(LESSONS[0]);
    badMuscle.related.muscles = ['khong-ton-tai'];
    expect(() => validateLessonCrossRefs([badMuscle])).toThrow(/không tồn tại: khong-ton-tai/);

    const badCondition = structuredClone(LESSONS[0]);
    badCondition.related.conditions = ['khong-ton-tai'];
    expect(() => validateLessonCrossRefs([badCondition])).toThrow(/không tồn tại: khong-ton-tai/);
  });

  it('ảnh trong section đã khai báo trong images', () => {
    const badImage = structuredClone(LESSONS[0]);
    badImage.sections[0].image = 'chua-khai-bao.png';
    if (badImage.sections[0].image) {
      expect(() => validateLessonCrossRefs([badImage])).toThrow(/chưa khai báo/);
    }
  });

  it('cây giáo trình có đủ 6 module đúng thứ tự và tổng thời gian dương', () => {
    const tree = buildCurriculumTree(LESSONS);
    expect(tree.map((m) => m.key)).toEqual(['anat', 'phys', 'nutr', 'fit', 'rehab', 'case']);
    tree.forEach((mod) => {
      expect(mod.lessonCount).toBe(LESSONS.filter((l) => l.module === mod.key).length);
      expect(mod.minutesTotal).toBeGreaterThan(0);
      mod.chapters.forEach((chapter) => {
        expect(chapter.lessons.length).toBeGreaterThan(0);
        chapter.lessons.forEach((lesson) => expect(lesson.slug).toMatch(/^[a-z]+-\d+-\d+$/));
      });
    });
  });

  it('mỗi module đều có ít nhất 1 bài', () => {
    ['anat', 'phys', 'nutr', 'fit', 'rehab', 'case'].forEach((key) => {
      expect(LESSONS.some((lesson) => lesson.module === key)).toBe(true);
    });
  });

  it('lessonImageUrl trỏ đúng thư mục tĩnh', () => {
    expect(lessonImageUrl('anat-1-1-planes.png')).toBe('/curriculum/images/anat-1-1-planes.png');
  });
});

describe('gradeLessonQuiz — chấm bằng code', () => {
  it('đúng hết → 100 điểm, sai hết → 0, có giải thích', () => {
    const lesson = LESSONS[0];

    const allRight = gradeLessonQuiz(lesson, lesson.quiz.map((q) => q.answer));
    expect(allRight.score).toBe(100);
    expect(allRight.correctCount).toBe(allRight.total);

    const allWrong = gradeLessonQuiz(lesson, lesson.quiz.map((q) => (q.answer + 1) % 4));
    expect(allWrong.score).toBe(0);
    expect(allWrong.results[0].correct).toBe(false);
    expect(allWrong.results[0].explain.length).toBeGreaterThan(0);
  });

  it('số đáp án không khớp hoặc giá trị sai → null', () => {
    const lesson = LESSONS[0];

    expect(gradeLessonQuiz(lesson, [0, 1])).toBeNull();
    expect(gradeLessonQuiz(lesson, lesson.quiz.map(() => 9))).toBeNull();
    expect(gradeLessonQuiz(lesson, lesson.quiz.map(() => '1'))).toBeNull();
    expect(gradeLessonQuiz(lesson, lesson.quiz.map(() => 1.5))).toBeNull();
  });

  it('điểm là số nguyên làm tròn theo phần trăm', () => {
    const lesson = LESSONS[0];
    const answers = lesson.quiz.map((q, index) =>
      index === 0 ? (q.answer + 1) % 4 : q.answer,
    );
    const graded = gradeLessonQuiz(lesson, answers);
    const expected = Math.round(((lesson.quiz.length - 1) / lesson.quiz.length) * 100);
    expect(graded.score).toBe(expected);
    expect(Number.isInteger(graded.score)).toBe(true);
  });
});
