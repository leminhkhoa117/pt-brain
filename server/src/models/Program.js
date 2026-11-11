import mongoose from 'mongoose';
import { CARDIO_KEYS } from '../../../shared/training/cardio.js';

const programExerciseSchema = new mongoose.Schema(
  {
    exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
    name: { type: String, required: true },
    muscleGroup: { type: String, required: true },
    sets: { type: Number, required: true, min: 1, max: 20 },
    repRange: {
      min: { type: Number, default: 8, min: 1, max: 100 },
      max: { type: Number, default: 12, min: 1, max: 100 },
    },
    targetRir: { type: Number, default: 2, min: 0, max: 5 },
    restSec: { type: Number, default: 120, min: 0, max: 900 },
  },
  { _id: false },
);

const programCardioSchema = new mongoose.Schema(
  {
    activity: { type: String, enum: CARDIO_KEYS, required: true },
    durationMin: { type: Number, required: true, min: 1, max: 600 },
    distanceKm: { type: Number, min: 0, max: 1000 },
    intensity: {
      type: String,
      enum: ['light', 'moderate', 'vigorous'],
      default: 'moderate',
    },
    notes: { type: String, default: '', maxlength: 500 },
  },
  { _id: false },
);

const programDaySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    exercises: { type: [programExerciseSchema], default: [] },
    // Cardio lên lịch cùng ngày, ví dụ Chủ nhật chạy bộ 30 phút.
    cardio: { type: [programCardioSchema], default: [] },
  },
  { _id: false },
);

const programSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    goal: { type: String, enum: ['cut', 'maintain', 'lean_bulk', 'bulk'], default: 'maintain' },
    daysPerWeek: { type: Number, min: 1, max: 7, default: 3 },
    split: { type: String, enum: ['full_body', 'upper_lower', 'ppl', 'custom'], default: 'full_body' },
    equipment: { type: [String], default: [] },
    days: { type: [programDaySchema], default: [] },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
    deloadEveryWeeks: { type: Number, min: 3, max: 12, default: 6 },
    notes: { type: String, default: '' },
  },
  { timestamps: true },
);

export const Program = mongoose.model('Program', programSchema);
