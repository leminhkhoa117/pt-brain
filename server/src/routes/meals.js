import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateQuery } from '../middleware/validate.js';
import { aiLimiter } from '../middleware/rateLimit.js';
import { uploadImage } from '../middleware/upload.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { mealListQuerySchema, mealSummaryQuerySchema } from '../validation/vision.js';
import * as meals from '../controllers/mealController.js';

const router = Router();
router.use(requireAuth);

router.get('/', validateQuery(mealListQuerySchema), asyncHandler(meals.list));
router.get('/summary', validateQuery(mealSummaryQuerySchema), asyncHandler(meals.summary));
router.post('/manual', asyncHandler(meals.createManual));
router.post('/estimate', aiLimiter, asyncHandler(meals.estimate));
router.post('/', aiLimiter, uploadImage.single('photo'), asyncHandler(meals.create));
router.get('/:id/photo', asyncHandler(meals.servePhoto));
router.patch('/:id', asyncHandler(meals.update));
router.delete('/:id', asyncHandler(meals.remove));

export default router;
