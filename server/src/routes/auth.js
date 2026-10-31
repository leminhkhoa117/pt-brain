import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { requireAuth } from '../middleware/auth.js';
import { loginSchema, registerSchema } from '../validation/auth.js';
import * as auth from '../controllers/authController.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), asyncHandler(auth.register));
router.post('/login', authLimiter, validate(loginSchema), asyncHandler(auth.login));
router.post('/refresh', authLimiter, asyncHandler(auth.refresh));
router.post('/logout', requireAuth, asyncHandler(auth.logout));

export default router;
