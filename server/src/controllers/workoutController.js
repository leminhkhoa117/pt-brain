import * as workoutService from '../services/training/workoutService.js';
import { workoutCreateSchema, workoutUpdateSchema } from '../validation/training.js';

export async function create(req, res) {
  const data = workoutCreateSchema.parse(req.body);
  const workout = await workoutService.createWorkout(req.userId, data);
  res.status(201).json({ data: { workout } });
}

export async function list(req, res) {
  const workouts = await workoutService.listWorkouts(req.userId, {
    from: req.query.from,
    to: req.query.to,
    programId: req.query.programId,
    kind: req.query.kind,
    limit: req.query.limit,
  });
  res.json({ data: { workouts } });
}

export async function getOne(req, res) {
  const workout = await workoutService.getWorkout(req.userId, req.params.id);
  res.json({ data: { workout } });
}

export async function update(req, res) {
  const data = workoutUpdateSchema.parse(req.body);
  const workout = await workoutService.updateWorkout(req.userId, req.params.id, data);
  res.json({ data: { workout } });
}

export async function remove(req, res) {
  await workoutService.deleteWorkout(req.userId, req.params.id);
  res.json({ data: { ok: true } });
}

export async function progression(req, res) {
  const exercise = decodeURIComponent(req.params.exercise || '').slice(0, 200);
  const points = await workoutService.progressionForExercise(req.userId, exercise);
  res.json({ data: { exercise, points } });
}
