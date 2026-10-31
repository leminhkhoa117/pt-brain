import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as notes from '../controllers/noteController.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(notes.list));
router.post('/', asyncHandler(notes.create));
router.patch('/:id', asyncHandler(notes.update));
router.delete('/:id', asyncHandler(notes.remove));

export default router;
