import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import {
  authLimiter,
  forgotPasswordLimiter,
  loginLimiter,
} from '../middleware/rateLimit.js';
import { requireAuth } from '../middleware/auth.js';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '../validation/auth.js';
import * as auth from '../controllers/authController.js';

const router = Router();

// Response auth chứa thông tin tài khoản/cookie: không để proxy/browser cache.
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

router.get('/providers', auth.providers);
router.get('/google/start', authLimiter, auth.googleStart);
router.get('/google/callback', authLimiter, auth.googleCallback);

router.post('/register', authLimiter, validate(registerSchema), asyncHandler(auth.register));
router.post(
  '/login',
  authLimiter,
  loginLimiter,
  validate(loginSchema),
  asyncHandler(auth.login),
);
router.post('/refresh', authLimiter, asyncHandler(auth.refresh));
router.post('/logout', requireAuth, asyncHandler(auth.logout));

router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  validate(forgotPasswordSchema),
  asyncHandler(auth.forgotPassword),
);
router.post(
  '/reset-password',
  authLimiter,
  validate(resetPasswordSchema),
  asyncHandler(auth.resetPassword),
);

export default router;
