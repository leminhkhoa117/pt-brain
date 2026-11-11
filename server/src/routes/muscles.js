import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimit.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as muscles from '../controllers/muscleController.js';

const router = Router();
router.use(requireAuth);

router.post('/chat', aiLimiter, asyncHandler(muscles.chat));

export default router;
