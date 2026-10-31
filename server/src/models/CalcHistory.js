import mongoose from 'mongoose';

const calcHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    inputs: { type: mongoose.Schema.Types.Mixed, default: {} },
    outputs: { type: mongoose.Schema.Types.Mixed, default: {} },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

calcHistorySchema.index({ userId: 1, date: -1 });

export const CalcHistory = mongoose.model('CalcHistory', calcHistorySchema);
