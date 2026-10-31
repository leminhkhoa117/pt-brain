import { listExercises } from '../services/training/exerciseService.js';

export async function list(req, res) {
  const exercises = await listExercises({
    q: req.query.q,
    muscle: req.query.muscle,
    equipment: req.query.equipment,
  });
  res.json({ data: { exercises } });
}
