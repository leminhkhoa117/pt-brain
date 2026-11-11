import mongoose from 'mongoose';
import { CARDIO_KEYS } from '../../../shared/training/cardio.js';

const setSchema = new mongoose.Schema(
  {
    exercise: { type: String, required: true },
    exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
    muscleGroup: { type: String, required: true },
    weightKg: { type: Number, required: true, min: 0, max: 1000 },
    reps: { type: Number, required: true, min: 0, max: 200 },
    rir: { type: Number, min: 0, max: 10 },
    rpe: { type: Number, min: 1, max: 10 },
    notes: { type: String, default: '' },
  },
  { _id: false },
);

const workoutSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true },
    dateKey: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    programId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
    dayName: { type: String, default: '' },
    kind: { type: String, enum: ['strength', 'cardio'], default: 'strength' },
    // Cardio/hoạt động ngoài phòng gym: chạy, bơi, đạp xe...
    activity: { type: String, enum: ['', ...CARDIO_KEYS], default: '' },
    distanceKm: { type: Number, min: 0, max: 1000 },
    intensity: {
      type: String,
      enum: ['light', 'moderate', 'vigorous'],
      default: 'moderate',
    },
    caloriesBurned: { type: Number, min: 0, max: 20000, default: 0 },
    caloriesSource: { type: String, enum: ['estimated', 'manual'], default: 'estimated' },
    sets: { type: [setSchema], default: [] },
    computed: {
      tonnage: { type: Number, default: 0 },
      setsByMuscle: { type: mongoose.Schema.Types.Mixed, default: {} },
      estimated1RMs: { type: mongoose.Schema.Types.Mixed, default: {} },
      calories: { type: Number, default: 0 },
      met: { type: Number, default: 0 },
      paceMinPerKm: { type: Number, default: 0 },
    },
    notes: { type: String, default: '' },
    durationMin: { type: Number, min: 0, max: 600 },
  },
  { timestamps: true },
);

workoutSessionSchema.index({ userId: 1, dateKey: -1 });

export const WorkoutSession = mongoose.model('WorkoutSession', workoutSessionSchema);
