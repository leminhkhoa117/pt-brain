import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  flashcardCreateSchema,
  flashcardUpdateSchema,
  reviewSchema,
} from '../validation/learning.js';
import * as flashcards from '../controllers/flashcardController.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(flashcards.list));
router.post('/', validate(flashcardCreateSchema), asyncHandler(flashcards.create));
router.patch('/:id', validate(flashcardUpdateSchema), asyncHandler(flashcards.update));
router.delete('/:id', asyncHandler(flashcards.remove));
router.post('/:id/review', validate(reviewSchema), asyncHandler(flashcards.review));

export default router;
