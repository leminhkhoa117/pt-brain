import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { requireAuth } from '../middleware/auth.js';
import { changePasswordSchema, deleteAccountSchema, updateMeSchema } from '../validation/auth.js';
import * as me from '../controllers/meController.js';

const router = Router();

router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
router.use(requireAuth);
router.get('/me', asyncHandler(me.getMe));
router.get('/me/ai-usage', asyncHandler(me.getMyAiUsage));
router.post('/me/welcome-seen', asyncHandler(me.markIntroSeen));
router.patch('/me', validate(updateMeSchema), asyncHandler(me.updateMe));
router.post(
  '/me/password',
  authLimiter,
  validate(changePasswordSchema),
  asyncHandler(me.changePassword),
);
router.get('/me/sessions', asyncHandler(me.listSessions));
router.delete('/me/sessions', asyncHandler(me.revokeOtherSessions));
router.delete('/me/sessions/:id', asyncHandler(me.revokeSession));
router.delete('/me', validate(deleteAccountSchema), asyncHandler(me.deleteMe));

export default router;
