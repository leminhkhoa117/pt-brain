import { Router } from 'express';
import authRoutes from './auth.js';
import meRoutes from './me.js';
import metricsRoutes from './metrics.js';
import calcRoutes from './calc.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ data: { ok: true, service: 'pt-brain-api', time: new Date().toISOString() } });
});

router.use('/auth', authRoutes);
router.use('/', meRoutes);
router.use('/metrics', metricsRoutes);
router.use('/calc', calcRoutes);

export default router;
