import mongoose from 'mongoose';

const paperSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    authors: { type: [String], default: [] },
    year: { type: Number, min: 1800, max: 2200 },
    journal: { type: String, default: '' },
    doi: { type: String, trim: true, lowercase: true, default: '' },
    pmid: { type: String, default: '' },
    pmcid: { type: String, default: '' },
    url: { type: String, default: '' },
    fullTextUrl: { type: String, default: '' },
    pdfUrl: { type: String, default: '' },
    abstract: { type: String, default: '' },
    publicationTypes: { type: [String], default: [] },
    // Mức bằng chứng 1 (cao nhất) -> 5 (thấp nhất), xếp hạng bằng code
    evidenceLevel: { type: Number, min: 1, max: 5, default: 5 },
    sampleSize: Number,
    citationCount: { type: Number, default: 0 },
    isOpenAccess: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    source: {
      type: String,
      enum: ['pubmed', 'europepmc', 'openalex', 'manual'],
      default: 'manual',
    },
  },
  { timestamps: true },
);

paperSchema.index({ userId: 1, doi: 1 }, { sparse: true });
paperSchema.index({ userId: 1, pmid: 1 }, { sparse: true });
paperSchema.index({ userId: 1, tags: 1 });

export const Paper = mongoose.model('Paper', paperSchema);
