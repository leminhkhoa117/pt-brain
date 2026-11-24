import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate, validateQuery } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  applyActionSchema,
  dismissSchema,
  recommendationsQuerySchema,
  trackEventSchema,
} from '../validation/learningHub.js';
import * as learning from '../controllers/learningController.js';

const router = Router();
router.use(requireAuth);

router.get(
  '/recommendations',
  validateQuery(recommendationsQuerySchema),
  asyncHandler(learning.recommendations),
);
router.get('/next', asyncHandler(learning.next));
router.get('/summary', asyncHandler(learning.summary));
router.post(
  '/lessons/:slug/apply',
  validate(applyActionSchema),
  asyncHandler(learning.apply),
);
router.post('/dismiss', validate(dismissSchema), asyncHandler(learning.dismiss));
router.post('/track', validate(trackEventSchema), asyncHandler(learning.track));

export default router;
