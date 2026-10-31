import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as papers from '../controllers/paperController.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(papers.list));
router.post('/', asyncHandler(papers.create));
router.get('/:id', asyncHandler(papers.getOne));
router.delete('/:id', asyncHandler(papers.remove));

export default router;
