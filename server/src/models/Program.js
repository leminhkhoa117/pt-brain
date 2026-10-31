import mongoose from 'mongoose';

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

const programDaySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    exercises: { type: [programExerciseSchema], default: [] },
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
