import { Router } from 'express';
import authRoutes from './auth.js';
import meRoutes from './me.js';
import metricsRoutes from './metrics.js';
import calcRoutes from './calc.js';
import summaryRoutes from './summaries.js';
import paperRoutes from './papers.js';
import termRoutes from './terms.js';
import noteRoutes from './notes.js';
import researchRoutes from './research.js';
import exerciseRoutes from './exercises.js';
import programRoutes from './programs.js';
import workoutRoutes from './workouts.js';
import flashcardRoutes from './flashcards.js';
import clientRoutes from './clients.js';
import quizRoutes from './quizzes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ data: { ok: true, service: 'pt-brain-api', time: new Date().toISOString() } });
});

router.use('/auth', authRoutes);
router.use('/', meRoutes);
router.use('/metrics', metricsRoutes);
router.use('/calc', calcRoutes);
router.use('/summaries', summaryRoutes);
router.use('/papers', paperRoutes);
router.use('/terms', termRoutes);
router.use('/notes', noteRoutes);
router.use('/research', researchRoutes);
router.use('/exercises', exerciseRoutes);
router.use('/programs', programRoutes);
router.use('/workouts', workoutRoutes);
router.use('/flashcards', flashcardRoutes);
router.use('/clients', clientRoutes);
router.use('/quizzes', quizRoutes);

export default router;
