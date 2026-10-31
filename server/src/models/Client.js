import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, trim: true, lowercase: true, default: '' },
    phone: { type: String, trim: true, maxlength: 30, default: '' },
    sex: { type: String, enum: ['male', 'female'], required: false },
    birthDate: Date,
    heightCm: { type: Number, min: 100, max: 250 },
    goal: { type: String, enum: ['cut', 'maintain', 'lean_bulk', 'bulk'], default: 'maintain' },
    experience: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    status: { type: String, enum: ['active', 'paused', 'ended'], default: 'active' },
    startDate: { type: Date, default: Date.now },
    programId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
    notes: { type: String, default: '', maxlength: 4000 },
    tags: { type: [String], default: [] },
    lastCheckIn: Date,
  },
  { timestamps: true },
);

clientSchema.index({ ownerId: 1, status: 1, name: 1 });
clientSchema.index({ ownerId: 1, email: 1 });

export const Client = mongoose.model('Client', clientSchema);
