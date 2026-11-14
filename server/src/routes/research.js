import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimit.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as research from '../controllers/researchController.js';

const router = Router();
router.use(requireAuth);

router.post('/search', aiLimiter, asyncHandler(research.search));
router.get('/graph', asyncHandler(research.graph));

export default router;
