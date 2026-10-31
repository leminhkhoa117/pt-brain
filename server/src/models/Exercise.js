import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    nameVi: { type: String, required: true },
    nameEn: { type: String, required: true },
    primaryMuscles: { type: [String], default: [] },
    secondaryMuscles: { type: [String], default: [] },
    equipment: { type: [String], default: [] },
    category: { type: String, enum: ['compound', 'isolation', 'cardio', 'mobility'], default: 'compound' },
    isCompound: { type: Boolean, default: true },
    instructions: { type: String, default: '' },
  },
  { timestamps: true },
);

exerciseSchema.index({ nameVi: 'text', nameEn: 'text' });

export const Exercise = mongoose.model('Exercise', exerciseSchema);
