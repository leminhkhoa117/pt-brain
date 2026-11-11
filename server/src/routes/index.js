import { Router } from 'express';
import mongoose from 'mongoose';
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
import quizRoutes from './quizzes.js';
import bodyAssessmentRoutes from './bodyAssessments.js';
import mealRoutes from './meals.js';
import mealPlanRoutes from './mealPlans.js';
import muscleRoutes from './muscles.js';

const router = Router();

router.get('/health', async (req, res) => {
  let db = 'down';
  try {
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      db = 'up';
    }
  } catch {
    // Mongo chưa kết nối hoặc ping lỗi -> health check trả 503 để orchestrator biết.
  }

  const ok = db === 'up';
  res.status(ok ? 200 : 503).json({
    data: {
      ok,
      service: 'pt-brain-api',
      db,
      uptimeSec: Math.round(process.uptime()),
      time: new Date().toISOString(),
    },
  });
});

// Liveness không phụ thuộc Mongo, dùng khi cần phân biệt process chết và DB chết.
router.get('/health/live', (req, res) => {
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
router.use('/quizzes', quizRoutes);
router.use('/body-assessments', bodyAssessmentRoutes);
router.use('/meals', mealRoutes);
router.use('/meal-plans', mealPlanRoutes);
router.use('/muscles', muscleRoutes);

export default router;
