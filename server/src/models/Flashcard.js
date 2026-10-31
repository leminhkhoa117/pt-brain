import mongoose from 'mongoose';

// Flashcard theo thuật toán SM-2 đơn giản
const flashcardSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    termId: { type: mongoose.Schema.Types.ObjectId, ref: 'Term' },
    front: { type: String, required: true },
    back: { type: String, required: true },
    sourcePaperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Paper' },
    ease: { type: Number, default: 2.5, min: 1.3, max: 3.0 },
    intervalDays: { type: Number, default: 0, min: 0 },
    dueDate: { type: Date, default: Date.now, index: true },
    reps: { type: Number, default: 0, min: 0 },
    lapses: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

flashcardSchema.index({ userId: 1, dueDate: 1 });

export const Flashcard = mongoose.model('Flashcard', flashcardSchema);
