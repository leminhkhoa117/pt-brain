import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { updateMeSchema } from '../validation/auth.js';
import * as me from '../controllers/meController.js';

const router = Router();

router.use(requireAuth);
router.get('/me', asyncHandler(me.getMe));
router.get('/me/ai-usage', asyncHandler(me.getMyAiUsage));
router.patch('/me', validate(updateMeSchema), asyncHandler(me.updateMe));
router.delete('/me', asyncHandler(me.deleteMe));

export default router;
