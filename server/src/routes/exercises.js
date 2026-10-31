import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as exercises from '../controllers/exerciseController.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(exercises.list));

export default router;
