import mongoose from 'mongoose';

const nutritionTotalsSchema = new mongoose.Schema(
  {
    calories: { type: Number, default: 0, min: 0 },
    proteinG: { type: Number, default: 0, min: 0 },
    carbsG: { type: Number, default: 0, min: 0 },
    fatG: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    portion: { type: String, default: '', trim: true, maxlength: 120 },
    calories: { type: Number, default: 0, min: 0 },
    proteinG: { type: Number, default: 0, min: 0 },
    carbsG: { type: Number, default: 0, min: 0 },
    fatG: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

const mealSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      default: 'lunch',
    },
    name: { type: String, default: '', trim: true, maxlength: 160 },
    foods: { type: [foodSchema], default: [] },
    totals: { type: nutritionTotalsSchema, default: () => ({}) },
  },
  { _id: false },
);

const daySchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 40 },
    meals: { type: [mealSchema], default: [] },
    totals: { type: nutritionTotalsSchema, default: () => ({}) },
  },
  { _id: false },
);

const preferencesSchema = new mongoose.Schema(
  {
    mealsPerDay: { type: Number, min: 3, max: 5, default: 3 },
    dietStyle: {
      type: String,
      enum: ['omnivore', 'high_protein', 'vegetarian', 'vegan', 'pescatarian'],
      default: 'omnivore',
    },
    allergies: { type: [String], default: [] },
    dislikes: { type: String, default: '', maxlength: 1000 },
    budget: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    cookingMinutes: { type: Number, min: 10, max: 180, default: 30 },
    notes: { type: String, default: '', maxlength: 2000 },
  },
  { _id: false },
);

const mealPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    goal: {
      type: String,
      enum: ['cut', 'maintain', 'lean_bulk', 'bulk'],
      default: 'maintain',
    },
    startDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    endDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    durationDays: { type: Number, required: true, min: 7, max: 90 },
    status: { type: String, enum: ['active', 'archived'], default: 'active', index: true },
    dailyTargets: { type: nutritionTotalsSchema, default: () => ({}) },
    cycleDays: {
      type: [daySchema],
      validate: {
        validator: (days) => Array.isArray(days) && days.length === 7,
        message: 'Chu kỳ thực đơn phải có đúng 7 ngày',
      },
      default: [],
    },
    preferences: { type: preferencesSchema, default: () => ({}) },
    rationale: { type: String, default: '', maxlength: 8000 },
    cautions: { type: [String], default: [] },
    evidenceIds: { type: [String], default: [] },
    source: {
      type: String,
      enum: ['ai', 'fallback', 'manual'],
      default: 'ai',
    },
    model: { type: String, default: '' },
  },
  { timestamps: true },
);

mealPlanSchema.index({ userId: 1, status: 1, createdAt: -1 });
mealPlanSchema.index({ userId: 1, startDate: -1, endDate: -1 });

export const MealPlan = mongoose.model('MealPlan', mealPlanSchema);
