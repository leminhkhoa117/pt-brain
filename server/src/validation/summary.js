import { z } from 'zod';

const stringArray = (splitPattern) =>
  z.preprocess((value) => {
    if (typeof value === 'string') {
      return value
        .split(splitPattern)
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return value;
  }, z.array(z.string()).default([]));

const resultItemBase = z.object({
  finding: z.string().min(1),
  numbers: z.string().default('Không nêu trong bài'),
  plainMeaning: z.string().default('Không nêu trong bài'),
});

// AI đôi khi trả mỗi kết quả dưới dạng một câu string -> chuẩn hóa thay vì retry tốn tiền
const resultItemSchema = z.preprocess((value) => {
  if (typeof value === 'string') {
    return {
      finding: value,
      numbers: 'Không nêu trong bài',
      plainMeaning: 'Không nêu trong bài',
    };
  }
  if (value && typeof value === 'object') {
    return {
      finding: value.finding || value.result || value.statement || 'Không nêu trong bài',
      numbers: value.numbers || value.statistics || 'Không nêu trong bài',
      plainMeaning: value.plainMeaning || value.meaning || 'Không nêu trong bài',
    };
  }
  return value;
}, resultItemBase);

const glossaryItemSchema = z.object({
  en: z.string().min(1),
  vi: z.string().min(1),
  explanation: z.string().min(1),
});

const glossarySchema = z.preprocess((value) => {
  if (!Array.isArray(value)) return value;
  return value
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      en: item.en || item.term || '',
      vi: item.vi || item.termVi || '',
      explanation: item.explanation || item.meaning || '',
    }))
    .filter((item) => item.en && item.vi && item.explanation);
}, z.array(glossaryItemSchema).default([]));

/**
 * Schema bản tóm tắt theo mục 6.4 của plan.
 * Có preprocess để chịu được các biến thể JSON nhỏ từ model (string thay vì object...).
 */
export const summaryContentSchema = z.object({
  metadata: z.preprocess(
    (value) => (value && typeof value === 'object' ? value : {}),
    z.object({
      title: z.string().default(''),
      authors: stringArray(/\s*[;,]\s*/),
      year: z.coerce.number().int().min(0).max(2200).catch(0).default(0),
      journal: z.string().default(''),
      doi: z.string().default(''),
    }),
  ),
  tldr: z.string().min(1),
  researchQuestion: z.string().default('Không nêu trong bài'),
  studyType: z.string().min(1),
  evidenceLevel: z.preprocess(
    (value) =>
      typeof value === 'number'
        ? { level: value, explanation: '' }
        : value && typeof value === 'object'
          ? value
          : { level: 5, explanation: '' },
    z.object({
      level: z.coerce.number().int().min(1).max(5).catch(5),
      explanation: z.string().default(''),
    }),
  ),
  participants: z.preprocess(
    (value) =>
      typeof value === 'number'
        ? { n: value, description: '' }
        : value && typeof value === 'object'
          ? value
          : {},
    z.object({
      n: z.coerce.number().int().min(0).catch(0).default(0),
      description: z.string().default('Không nêu trong bài'),
    }),
  ),
  design: z.string().default('Không nêu trong bài'),
  intervention: z.string().default('Không nêu trong bài'),
  outcomes: z.string().default('Không nêu trong bài'),
  mainResults: z.array(resultItemSchema).min(1),
  secondaryResults: z.array(resultItemSchema).default([]),
  authorsConclusion: z.string().default('Không nêu trong bài'),
  limitations: stringArray(/\n+/),
  conflictOfInterest: z.string().default('Không nêu trong bài'),
  practicalTakeaways: stringArray(/\n+/),
  whoItDoesNotApplyTo: z.string().default('Không nêu trong bài'),
  glossary: glossarySchema,
  confidence: z.preprocess(
    (value) => {
      if (value && typeof value === 'object') {
        const basedOn = String(value.basedOn || '').toLowerCase();
        return {
          ...value,
          basedOn: basedOn.includes('abstract')
            ? 'abstract_only'
            : basedOn.includes('full')
              ? 'fulltext'
              : 'abstract_only',
        };
      }
      return { basedOn: 'abstract_only', missingInfo: [] };
    },
    z.object({
      basedOn: z.enum(['fulltext', 'abstract_only']),
      missingInfo: stringArray(/\n+/),
    }),
  ),
});

export const partialExtractionSchema = z.object({
  facts: z.preprocess(
    (value) => (Array.isArray(value) ? value : []),
    z
      .array(
        z.preprocess(
          (item) =>
            typeof item === 'string'
              ? { statement: item, numbers: '' }
              : item && typeof item === 'object'
                ? item
                : { statement: '' },
          z.object({
            statement: z.string().default(''),
            numbers: z.string().default(''),
          }),
        ),
      )
      .default([]),
  ),
  methods: z.string().default(''),
  limitations: stringArray(/\n+/),
  terms: glossarySchema,
});

export const createSummaryInputSchema = z
  .object({
    url: z.string().trim().url('URL không hợp lệ').optional(),
    doi: z.string().trim().min(4).max(300).optional(),
    text: z
      .string()
      .trim()
      .min(80, 'Văn bản tối thiểu 80 ký tự')
      .max(400000, 'Văn bản quá dài')
      .optional(),
    title: z.string().trim().max(300).optional(),
  })
  .strict()
  .refine((data) => data.url || data.doi || data.text, {
    message: 'Cần nhập link, DOI hoặc văn bản bài báo',
  });

export const askSchema = z.object({
  question: z.string().trim().min(3, 'Câu hỏi quá ngắn').max(2000, 'Câu hỏi quá dài'),
});

export const termSchema = z.object({
  en: z.string().trim().min(1).max(200),
  vi: z.string().trim().min(1).max(200),
  explanation: z.string().trim().max(2000).optional().default(''),
  example: z.string().trim().max(2000).optional().default(''),
  sourcePaperId: z.string().regex(/^[a-f0-9]{24}$/i).optional(),
});

export const noteSchema = z.object({
  text: z.string().trim().min(1).max(10000),
  summaryId: z.string().regex(/^[a-f0-9]{24}$/i).optional(),
  paperId: z.string().regex(/^[a-f0-9]{24}$/i).optional(),
  tags: z.array(z.string().trim().max(50)).max(20).optional().default([]),
});
