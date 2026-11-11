import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimit.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as mealPlans from '../controllers/mealPlanController.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(mealPlans.list));
router.post('/suggest-ai', aiLimiter, asyncHandler(mealPlans.aiSuggest));
router.post('/', asyncHandler(mealPlans.create));
router.get('/:id/adherence', asyncHandler(mealPlans.adherence));
router.get('/:id/reviews', asyncHandler(mealPlans.reviews));
router.post('/:id/reviews', aiLimiter, asyncHandler(mealPlans.evaluateWeek));
router.post('/:id/activate', asyncHandler(mealPlans.activate));
router.put('/:id', asyncHandler(mealPlans.update));
router.delete('/:id', asyncHandler(mealPlans.remove));

export default router;
