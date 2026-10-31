import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimit.js';
import { uploadPdf } from '../middleware/upload.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as summaries from '../controllers/summaryController.js';

const router = Router();
router.use(requireAuth);

router.post('/', aiLimiter, uploadPdf.single('file'), asyncHandler(summaries.create));
router.get('/', asyncHandler(summaries.list));
router.get('/:id/export.md', asyncHandler(summaries.exportMarkdown));
router.post('/:id/apply-to-plan', aiLimiter, asyncHandler(summaries.applyToPlan));
router.get('/:id', asyncHandler(summaries.getOne));
router.delete('/:id', asyncHandler(summaries.remove));
router.post('/:id/ask', aiLimiter, asyncHandler(summaries.ask));

export default router;
