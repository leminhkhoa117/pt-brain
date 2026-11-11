import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { calcLimiter } from '../middleware/rateLimit.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as calc from '../controllers/calcController.js';

const router = Router();
router.use(requireAuth, calcLimiter);

router.get('/history', asyncHandler(calc.listHistory));
router.delete('/history', asyncHandler(calc.clearHistory));
router.delete('/history/:id', asyncHandler(calc.deleteHistoryItem));
router.post('/:type', asyncHandler(calc.calculate));

export default router;
