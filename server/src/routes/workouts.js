import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { workoutCreateSchema, workoutUpdateSchema } from '../validation/training.js';
import * as workouts from '../controllers/workoutController.js';

const router = Router();
router.use(requireAuth);

router.get('/progression/:exercise', asyncHandler(workouts.progression));
router.get('/', asyncHandler(workouts.list));
router.post('/', validate(workoutCreateSchema), asyncHandler(workouts.create));
router.get('/:id', asyncHandler(workouts.getOne));
router.patch('/:id', validate(workoutUpdateSchema), asyncHandler(workouts.update));
router.delete('/:id', asyncHandler(workouts.remove));

export default router;
