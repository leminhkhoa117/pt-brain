import mongoose from 'mongoose';

const measurementsSchema = new mongoose.Schema(
  {
    waistCm: { type: Number, min: 20, max: 250 },
    neckCm: { type: Number, min: 15, max: 100 },
    hipCm: { type: Number, min: 30, max: 250 },
    chestCm: { type: Number, min: 30, max: 250 },
    armCm: { type: Number, min: 10, max: 100 },
    thighCm: { type: Number, min: 20, max: 150 },
  },
  { _id: false },
);

const computedSchema = new mongoose.Schema(
  {
    bmi: Number,
    bodyFatNavy: Number,
    leanMassKg: Number,
    ffmi: Number,
    ffmiNormalized: Number,
    bmr: Number,
    tdee: Number,
  },
  { _id: false },
);

const postureItemSchema = new mongoose.Schema(
  {
    key: { type: String, required: true }, // ví dụ: 'squat_depth'
    label: String,
    ok: Boolean,
    note: String,
  },
  { _id: false },
);

const bodyLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // date = Date UTC 00:00; dateKey = 'YYYY-MM-DD' dùng để unique + query nhanh
    date: { type: Date, required: true },
    dateKey: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    weightKg: { type: Number, required: true, min: 20, max: 400 },
    measurements: { type: measurementsSchema, default: () => ({}) },
    bodyFatPct: { type: Number, min: 1, max: 70 },
    restingHr: { type: Number, min: 25, max: 150 },
    sleepHours: { type: Number, min: 0, max: 24 },
    steps: { type: Number, min: 0, max: 200000 },
    calories: { type: Number, min: 0, max: 15000 },
    proteinG: { type: Number, min: 0, max: 1000 },
    notes: { type: String, maxlength: 2000 },
    posture: [postureItemSchema],
    computed: { type: computedSchema, default: () => ({}) },
  },
  { timestamps: true },
);

// Một document / ngày / người dùng
bodyLogSchema.index({ userId: 1, dateKey: 1 }, { unique: true });

export const BodyLog = mongoose.model('BodyLog', bodyLogSchema);
