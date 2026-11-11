import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateQuery } from '../middleware/validate.js';
import { aiLimiter } from '../middleware/rateLimit.js';
import { uploadPdf } from '../middleware/upload.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { summaryListQuerySchema } from '../validation/summary.js';
import * as summaries from '../controllers/summaryController.js';

const router = Router();
router.use(requireAuth);

router.post('/', aiLimiter, uploadPdf.single('file'), asyncHandler(summaries.create));
router.get('/', validateQuery(summaryListQuerySchema), asyncHandler(summaries.list));
router.get('/:id/export.md', asyncHandler(summaries.exportMarkdown));
router.get('/:id/export.pdf', asyncHandler(summaries.exportPdf));
router.get('/:id/export-translation.txt', asyncHandler(summaries.exportTranslation));
router.get('/:id/source.pdf', asyncHandler(summaries.sourcePdf));
router.post('/:id/apply-to-plan', aiLimiter, asyncHandler(summaries.applyToPlan));
router.post('/:id/retry', aiLimiter, asyncHandler(summaries.retry));
router.post('/:id/translate', aiLimiter, asyncHandler(summaries.translate));
router.delete('/:id/chat', asyncHandler(summaries.clearChat));
router.patch('/:id', asyncHandler(summaries.updateMeta));
router.get('/:id', asyncHandler(summaries.getOne));
router.delete('/:id', asyncHandler(summaries.remove));
router.post('/:id/ask', aiLimiter, asyncHandler(summaries.ask));

export default router;
