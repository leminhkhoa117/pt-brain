import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimit.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as curriculum from '../controllers/curriculumController.js';
import { LESSONS } from '../../../shared/curriculum/lessons/index.js';
import { validateCurriculumLessons } from '../validation/curriculumLesson.js';

// Fail fast: mọi bài phải pass schema + tham chiếu chéo ngay khi nạp routes.
validateCurriculumLessons(LESSONS);

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(curriculum.tree));
router.get('/lessons/:slug', asyncHandler(curriculum.lesson));
router.put('/progress/:slug', asyncHandler(curriculum.markProgress));
router.post('/lessons/:slug/quiz', asyncHandler(curriculum.submitQuiz));

// Tốn quota AI: quiz sinh thêm + chat hỏi đáp theo bài.
router.post('/lessons/:slug/quiz-ai', aiLimiter, asyncHandler(curriculum.quizAi));
router.post('/lessons/:slug/ask', aiLimiter, asyncHandler(curriculum.ask));
router.post('/lessons/:slug/ask/stream', aiLimiter, asyncHandler(curriculum.askStream));

export default router;
