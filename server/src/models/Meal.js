import mongoose from 'mongoose';

const mealItemSchema = new mongoose.Schema(
  {
    name: String,
    portion: String,
    calories: Number,
    proteinG: Number,
    carbsG: Number,
    fatG: Number,
    confidence: String,
  },
  { _id: false },
);

const mealSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    dateKey: { type: String, required: true, index: true },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      default: 'lunch',
    },
    description: { type: String, default: '', maxlength: 1000 },
    notes: { type: String, default: '', maxlength: 2000 },
    image: { type: mongoose.Schema.Types.Mixed, default: null },
    analysis: {
      items: { type: [mealItemSchema], default: [] },
      totals: {
        calories: { type: Number, default: 0 },
        proteinG: { type: Number, default: 0 },
        carbsG: { type: Number, default: 0 },
        fatG: { type: Number, default: 0 },
      },
      confidence: { type: String, default: 'low' },
      assumptions: { type: [String], default: [] },
      caveats: { type: [String], default: [] },
      disclaimer: { type: String, default: '' },
    },
    model: { type: String, default: '' },
  },
  { timestamps: true },
);

mealSchema.index({ userId: 1, dateKey: -1 });

export const Meal = mongoose.model('Meal', mealSchema);
