import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimit.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as quizzes from '../controllers/quizController.js';

const router = Router();
router.use(requireAuth);

router.post('/', aiLimiter, asyncHandler(quizzes.create));

export default router;
