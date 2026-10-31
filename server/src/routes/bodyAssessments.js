import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimit.js';
import { uploadImages } from '../middleware/upload.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as bodyAssessment from '../controllers/bodyAssessmentController.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(bodyAssessment.list));
router.post(
  '/',
  aiLimiter,
  uploadImages.array('photos', 4),
  asyncHandler(bodyAssessment.create),
);
router.get('/evidence', asyncHandler(bodyAssessment.listEvidence));
router.get('/:id/photos/:filename', asyncHandler(bodyAssessment.servePhoto));
router.get('/:id', asyncHandler(bodyAssessment.getOne));
router.delete('/:id', asyncHandler(bodyAssessment.remove));

export default router;
