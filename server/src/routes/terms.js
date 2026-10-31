import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as terms from '../controllers/termController.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(terms.list));
router.post('/', asyncHandler(terms.create));
router.patch('/:id', asyncHandler(terms.update));
router.delete('/:id', asyncHandler(terms.remove));

export default router;
