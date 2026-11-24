import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import { CurriculumProgress } from '../models/CurriculumProgress.js';
import {
  buildCurriculumTree,
  gradeLessonQuiz,
  lessonImageUrl,
} from '../../../shared/curriculum/index.js';
import { LESSONS } from '../../../shared/curriculum/lessons/index.js';
import {
  lessonAskSchema,
  progressUpdateSchema,
  lessonQuizAiSchema,
  quizSubmitSchema,
} from '../validation/curriculum.js';
import { generateQuiz } from '../services/ai/quizGenerator.js';
import {
  answerLessonQuestion,
  answerLessonQuestionStream,
} from '../services/ai/lessonCoach.js';
import { assertAiQuota, getAiUsage, recordAiCall } from '../services/ai/quota.js';
import { evidenceReferences } from '../research/evidenceBase.js';
import {
  markCompleted,
  recordQuizResult,
  recordView,
} from '../services/learning/recommendations.js';

const MODULE_ORDER = new Map(
  [...new Set(LESSONS.map((lesson) => lesson.module))].map((key, index) => [key, index]),
);

const lessonsInOrder = [...LESSONS].sort(
  (a, b) =>
    MODULE_ORDER.get(a.module) - MODULE_ORDER.get(b.module) ||
    a.chapter - b.chapter ||
    a.order - b.order,
);

function getLessonOr404(slug) {
  const lesson = LESSONS.find((item) => item.slug === slug);
  if (!lesson) {
    throw ApiError.notFound('Không tìm thấy bài học này trong giáo trình');
  }
  return lesson;
}

function lessonContent(lesson) {
  return {
    ...lesson,
    sections: lesson.sections.map((section) => ({
      ...section,
      imageUrl: section.image ? lessonImageUrl(section.image) : null,
    })),
    images: lesson.images.map((image) => ({ ...image, url: lessonImageUrl(image.file) })),
  };
}

async function loadProgressMap(userId) {
  const rows = await CurriculumProgress.find({ userId }).lean();
  return new Map(rows.map((row) => [row.lessonSlug, row]));
}

/** GET /api/curriculum — cây giáo trình + tiến độ của user. */
export async function tree(req, res) {
  const progressMap = await loadProgressMap(req.userId);

  const modules = buildCurriculumTree(lessonsInOrder).map((mod) => ({
    ...mod,
    chapters: mod.chapters.map((chapter) => ({
      ...chapter,
      lessons: chapter.lessons.map((meta) => {
        const progress = progressMap.get(meta.slug);
        return {
          ...meta,
          status: progress?.status || 'new',
          quizBest: progress?.quizBest || 0,
        };
      }),
    })),
    completed: mod.chapters.reduce(
      (sum, chapter) =>
        sum + chapter.lessons.filter((lesson) => progressMap.get(lesson.slug)?.status === 'completed').length,
      0,
    ),
  }));

  const completedCount = [...progressMap.values()].filter((row) => row.status === 'completed').length;

  // "Tiếp tục học": bài đang đọc gần nhất, nếu không có thì bài đầu tiên chưa xong.
  let continueLesson = null;
  const readingRows = [...progressMap.values()]
    .filter((row) => row.status === 'reading')
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  if (readingRows.length) {
    const lesson = LESSONS.find((item) => item.slug === readingRows[0].lessonSlug);
    if (lesson) continueLesson = lesson.slug;
  } else {
    const firstUnfinished = lessonsInOrder.find(
      (lesson) => progressMap.get(lesson.slug)?.status !== 'completed',
    );
    continueLesson = firstUnfinished?.slug || null;
  }

  const lastRow = [...progressMap.values()].sort(
    (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0),
  )[0];

  res.json({
    data: {
      modules,
      overall: {
        totalLessons: LESSONS.length,
        completed: completedCount,
        percent: Math.round((completedCount / LESSONS.length) * 100),
      },
      continueLesson,
      lastActivityAt: lastRow?.updatedAt || null,
      disclaimer:
        'Nội dung giáo dục cho huấn luyện viên, không thay thế đào tạo chứng chỉ hành nghề và không phải tư vấn y tế.',
    },
  });
}

/** GET /api/curriculum/lessons/:slug — nội dung đầy đủ một bài. */
export async function lesson(req, res) {
  const found = getLessonOr404(req.params.slug);
  const surface = typeof req.query?.surface === 'string' ? req.query.surface.slice(0, 60) : '';
  await recordView(req.userId, found.slug, { surface });
  const progress = await CurriculumProgress.findOne({
    userId: req.userId,
    lessonSlug: found.slug,
  }).lean();

  res.json({
    data: {
      lesson: lessonContent(found),
      evidence: evidenceReferences(found.related.evidence),
      progress: progress
        ? {
            status: progress.status,
            quizBest: progress.quizBest,
            quizAttempts: progress.quizAttempts,
            lastQuizScore: progress.lastQuizScore,
            mastery: progress.mastery || 0,
            lastViewedAt: progress.lastViewedAt,
            appliedActions: progress.appliedActions || [],
            completedAt: progress.completedAt,
          }
        : {
            status: 'new',
            quizBest: 0,
            quizAttempts: 0,
            lastQuizScore: 0,
            mastery: 0,
            lastViewedAt: null,
            appliedActions: [],
            completedAt: null,
          },
    },
  });
}

/** PUT /api/curriculum/progress/:slug — đánh dấu đang đọc / hoàn thành. */
export async function markProgress(req, res) {
  const found = getLessonOr404(req.params.slug);
  const { status } = progressUpdateSchema.parse(req.body || {});

  const doc = await CurriculumProgress.findOneAndUpdate(
    { userId: req.userId, lessonSlug: found.slug },
    {
      status,
      completedAt: status === 'completed' ? new Date() : null,
      $setOnInsert: { userId: req.userId, lessonSlug: found.slug },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  if (status === 'completed') await markCompleted(req.userId, found.slug);

  res.json({ data: { progress: doc } });
}

/** POST /api/curriculum/lessons/:slug/quiz — nộp bài, chấm bằng code. */
export async function submitQuiz(req, res) {
  const found = getLessonOr404(req.params.slug);
  const { answers } = quizSubmitSchema.parse(req.body || {});

  const graded = gradeLessonQuiz(found, answers);
  if (!graded) {
    throw ApiError.badRequest(
      `Bài này có ${found.quiz.length} câu; gửi đúng ${found.quiz.length} đáp án (0-3 mỗi câu).`,
    );
  }

  const doc = await CurriculumProgress.findOneAndUpdate(
    { userId: req.userId, lessonSlug: found.slug },
    {
      $inc: { quizAttempts: 1 },
      lastQuizScore: graded.score,
      $max: { quizBest: graded.score },
      $setOnInsert: { userId: req.userId, lessonSlug: found.slug, status: 'reading' },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  const mastery = await recordQuizResult(req.userId, found.slug, graded.score);

  res.json({
    data: {
      results: graded.results,
      score: graded.score,
      correctCount: graded.correctCount,
      total: graded.total,
      quizBest: doc.quizBest,
      quizAttempts: doc.quizAttempts,
      mastery: mastery ?? doc.mastery,
    },
  });
}

/** POST /api/curriculum/lessons/:slug/quiz-ai — AI tạo thêm câu hỏi từ nội dung bài. */
export async function quizAi(req, res) {
  const found = getLessonOr404(req.params.slug);
  const { count } = lessonQuizAiSchema.parse(req.body || {});

  await assertAiQuota(req.userId, 'quiz');

  const content = {
    tldr: found.subtitle,
    studyType: 'Giáo trình PT Brain',
    mainResults: found.sections.map((section) => `${section.heading}: ${section.body}`).join('\n'),
    authorsConclusion: found.objectives.join('; '),
    practicalTakeaways: found.applyBox,
    glossary: found.terms.map((term) => ({ term: term.en, definition: term.def })),
  };

  const result = await generateQuiz({ content, count, title: found.title });
  await recordAiCall(req.userId, { kind: 'quiz', usage: result.usage });

  res.json({
    data: {
      lessonSlug: found.slug,
      quiz: result.quiz,
      quota: await getAiUsage(req.userId),
    },
  });
}

function askContext(req) {
  const found = getLessonOr404(req.params.slug);
  const data = lessonAskSchema.parse(req.body || {});
  return { lesson: found, data };
}

/** POST /api/curriculum/lessons/:slug/ask — chat hỏi đáp theo bài (JSON). */
export async function ask(req, res) {
  const { lesson, data } = askContext(req);
  await assertAiQuota(req.userId, 'curriculum');

  const result = await answerLessonQuestion({
    lesson,
    message: data.message,
    history: data.history,
    evidenceIds: lesson.related.evidence,
  });

  await recordAiCall(req.userId, { kind: 'curriculum', usage: result.usage });

  res.json({
    data: {
      ...result,
      evidence: evidenceReferences(lesson.related.evidence),
      quota: await getAiUsage(req.userId),
    },
  });
}

/** POST /api/curriculum/lessons/:slug/ask/stream — bản SSE của ask. */
export async function askStream(req, res) {
  const { lesson, data } = askContext(req);
  await assertAiQuota(req.userId, 'curriculum');

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
    const result = await answerLessonQuestionStream({
      lesson,
      message: data.message,
      history: data.history,
      evidenceIds: lesson.related.evidence,
      onDelta: (text) => {
        answer += text;
        send('delta', { text });
      },
    });

    await recordAiCall(req.userId, { kind: 'curriculum', usage: result.usage });
    send('done', {
      answer: result.answer,
      model: result.model,
      usage: result.usage,
      evidence: evidenceReferences(lesson.related.evidence),
      quota: await getAiUsage(req.userId),
    });
  } catch (error) {
    logger.warn({ err: error, slug: lesson.slug }, 'Stream chat bài học thất bại');
    send('error', {
      message: error.message || 'Không trả lời được câu hỏi này. Vui lòng thử lại.',
      partial: answer,
    });
  } finally {
    if (!closed) res.end();
  }
}
