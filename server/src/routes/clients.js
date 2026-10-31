import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { clientCreateSchema, clientUpdateSchema } from '../validation/client.js';
import * as clients from '../controllers/clientController.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(clients.list));
router.post('/', validate(clientCreateSchema), asyncHandler(clients.create));
router.get('/:id', asyncHandler(clients.getOne));
router.patch('/:id', validate(clientUpdateSchema), asyncHandler(clients.update));
router.delete('/:id', asyncHandler(clients.remove));

export default router;
