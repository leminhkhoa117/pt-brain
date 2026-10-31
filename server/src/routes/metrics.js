import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate, validateQuery } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { bodyLogSchema, metricsRangeSchema } from '../validation/metrics.js';
import * as metrics from '../controllers/metricsController.js';

const router = Router();
router.use(requireAuth);

router.get('/', validateQuery(metricsRangeSchema), asyncHandler(metrics.listMetrics));
router.get('/summary', validateQuery(metricsRangeSchema), asyncHandler(metrics.summary));
router.get('/export.csv', asyncHandler(metrics.downloadCsv));
router.get('/:date', asyncHandler(metrics.getMetric));
router.put('/:date', validate(bodyLogSchema), asyncHandler(metrics.putMetric));

export default router;
