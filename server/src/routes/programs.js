import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { programCreateSchema, programUpdateSchema, suggestProgramSchema } from '../validation/training.js';
import { applyChangesSchema } from '../validation/learning.js';
import * as programs from '../controllers/programController.js';

const router = Router();
router.use(requireAuth);

router.post('/suggest', validate(suggestProgramSchema), asyncHandler(programs.suggest));
router.get('/', asyncHandler(programs.list));
router.post('/', validate(programCreateSchema), asyncHandler(programs.create));
router.get('/:id/volume', asyncHandler(programs.volume));
router.get('/:id/suggestions', asyncHandler(programs.suggestions));
router.post('/:id/apply-changes', validate(applyChangesSchema), asyncHandler(programs.applyChanges));
router.get('/:id', asyncHandler(programs.getOne));
router.patch('/:id', validate(programUpdateSchema), asyncHandler(programs.update));
router.delete('/:id', asyncHandler(programs.remove));

export default router;
