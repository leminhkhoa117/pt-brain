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

const flexibleStringArray = z.preprocess((value) => {
  if (typeof value === 'string') return value.split(/\n+/).map((item) => item.trim()).filter(Boolean);
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === 'string') return item.trim();
      if (item && typeof item === 'object') {
        return String(item.text || item.claim || item.value || item.description || '').trim();
      }
      return '';
    })
    .filter(Boolean);
}, z.array(z.string()).default([]));

const ratingSchema = z.preprocess((value) => {
  const text = String(value?.rating || value || '').toLowerCase();
  if (/cao|high|mạnh|strong/.test(text)) return 'cao';
  if (/thấp|low|yếu|weak/.test(text)) return 'thấp';
  return 'vừa';
}, z.enum(['cao', 'vừa', 'thấp']).default('vừa'));

const certaintySchema = z.preprocess(
  (value) => {
    if (typeof value === 'string') {
      return { rating: value, reason: value };
    }
    if (value && typeof value === 'object') {
      return { rating: value.rating || value.level, reason: value.reason || value.explanation || '' };
    }
    return { rating: 'vừa', reason: '' };
  },
  z.object({
    rating: ratingSchema,
    reason: z.string().default(''),
  }),
);

const claimTypeSchema = z.preprocess((value) => {
  const text = String(value || '').toLowerCase();
  if (/dữ kiện|data|fact|measured|kết quả đo/.test(text)) return 'data';
  if (/tác giả|author|interpret|diễn giải/.test(text)) return 'author';
  if (/ai|nhận xét|suy luận/.test(text)) return 'ai';
  return 'data';
}, z.enum(['data', 'author', 'ai']).default('data'));

const resultItemBase = z.object({
  finding: z.string().min(1),
  numbers: z.string().default('Không nêu trong bài'),
  plainMeaning: z.string().default('Không nêu trong bài'),
  certainty: certaintySchema,
  claimType: claimTypeSchema,
  page: z.coerce.number().int().min(0).catch(0).default(0),
  quote: z.string().default(''),
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
      ...value,
      finding: value.finding || value.result || value.statement || 'Không nêu trong bài',
      numbers: value.numbers || value.statistics || 'Không nêu trong bài',
      plainMeaning: value.plainMeaning || value.meaning || 'Không nêu trong bài',
    };
  }
  return value;
}, resultItemBase);

const glossaryItemSchema = z.preprocess(
  (value) =>
    value && typeof value === 'object'
      ? {
          en: value.en || value.term || '',
          vi: value.vi || value.termVi || '',
          explanation: value.explanation || value.meaning || '',
          example: value.example || value.gymExample || '',
        }
      : value,
  z.object({
    en: z.string().min(1),
    vi: z.string().min(1),
    explanation: z.string().min(1),
    example: z.string().default(''),
  }),
);

const glossarySchema = z.preprocess((value) => {
  if (!Array.isArray(value)) return value;
  return value
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      en: item.en || item.term || '',
      vi: item.vi || item.termVi || '',
      explanation: item.explanation || item.meaning || '',
      example: item.example || item.gymExample || '',
    }))
    .filter((item) => item.en && item.vi && item.explanation);
}, z.array(glossaryItemSchema).default([]));

const figureItemSchema = z.preprocess(
  (value) => {
    if (typeof value === 'string') {
      return {
        label: value,
        kind: /bảng|table/i.test(value) ? 'table' : 'figure',
        title: '',
        caption: '',
        explanation: value,
        whatToLookFor: '',
        page: 0,
      };
    }
    if (!value || typeof value !== 'object') return value;
    const label = value.label || value.name || value.figure || value.table || '';
    const kindText = `${value.kind || value.type || ''} ${label}`.toLowerCase();
    return {
      label: String(label || ''),
      kind: /table|bảng/.test(kindText) ? 'table' : 'figure',
      title: value.title || value.name || '',
      caption: value.caption || value.captionOriginal || value.originalCaption || '',
      explanation: value.explanation || value.meaning || value.description || '',
      whatToLookFor: value.whatToLookFor || value.lookFor || value.note || '',
      page: value.page || value.pageNumber || 0,
    };
  },
  z.object({
    label: z.string().min(1),
    kind: z.enum(['figure', 'table']).default('figure'),
    title: z.string().default(''),
    caption: z.string().default(''),
    explanation: z.string().default(''),
    whatToLookFor: z.string().default(''),
    page: z.coerce.number().int().min(0).catch(0).default(0),
  }),
);

const figuresSchema = z.preprocess(
  (value) => (Array.isArray(value) ? value : []),
  z.array(figureItemSchema).max(12).default([]),
);

const axisSchema = z.preprocess(
  (value) => {
    if (typeof value === 'string') return { rating: value, reason: value };
    if (value && typeof value === 'object') {
      return { rating: value.rating || value.level, reason: value.reason || value.explanation || '' };
    }
    return { rating: 'vừa', reason: '' };
  },
  z.object({
    rating: ratingSchema,
    reason: z.string().default(''),
  }),
);

const evidenceAxesSchema = z.preprocess(
  (value) => (value && typeof value === 'object' ? value : {}),
  z.object({
    design: axisSchema,
    certainty: axisSchema,
    relevance: axisSchema,
  }),
);

const quickReadSchema = z.preprocess(
  (value) => (value && typeof value === 'object' ? value : {}),
  z.object({
    lines: flexibleStringArray,
    readyForPt: z.string().default(''),
  }),
);

const mechanismSchema = z.preprocess(
  (value) => (value && typeof value === 'object' ? value : {}),
  z.object({
    summary: z.string().default(''),
    steps: flexibleStringArray,
    whyWeightStaysStill: z.string().default(''),
    analogy: z.string().default(''),
  }),
);

const authorsViewSchema = z.preprocess(
  (value) => (value && typeof value === 'object' ? value : {}),
  z.object({
    conclusion: z.string().default(''),
    interpretations: flexibleStringArray,
    applications: flexibleStringArray,
  }),
);

const limitationsStructuredSchema = z.preprocess(
  (value) => (value && typeof value === 'object' ? value : {}),
  z.object({
    authors: flexibleStringArray,
    ai: flexibleStringArray,
  }),
);

const applicationSchema = z.preprocess(
  (value) => (value && typeof value === 'object' ? value : {}),
  z.object({
    supported: flexibleStringArray,
    hypothesis: flexibleStringArray,
    notYet: flexibleStringArray,
    unanswered: flexibleStringArray,
    notApplicableTo: z.string().default(''),
  }),
);

const benefitSignalsSchema = z.preprocess(
  (value) => (value && typeof value === 'object' ? value : {}),
  z.object({
    statement: z.string().default('Không nêu trong bài'),
    flags: z.preprocess((flags) => {
      if (!Array.isArray(flags)) return [];
      return flags.map((flag) =>
        typeof flag === 'string'
          ? { text: flag, source: '', page: 0 }
          : {
              text: flag?.text || flag?.signal || '',
              source: flag?.source || flag?.section || '',
              page: Number(flag?.page) || 0,
            },
      );
    }, z.array(z.object({ text: z.string(), source: z.string().default(''), page: z.coerce.number().default(0) })).default([])),
  }),
);

const selfCheckSchema = z.preprocess(
  (value) => (Array.isArray(value) ? value : []),
  z
    .array(
      z.preprocess(
        (item) =>
          typeof item === 'string'
            ? { question: item, answer: '' }
            : item && typeof item === 'object'
              ? item
              : { question: '', answer: '' },
        z.object({
          question: z.string().default(''),
          answer: z.string().default(''),
        }),
      ),
    )
    .default([]),
);

const sourceRefSchema = z.preprocess(
  (value) => {
    if (typeof value === 'string') return { value, page: 0, quote: '' };
    if (value && typeof value === 'object') {
      return {
        value: String(value.value || value.text || value.description || value.n || ''),
        page: Number(value.page ?? value.pageNumber ?? 0) || 0,
        quote: String(value.quote || value.evidence || value.verbatim || ''),
      };
    }
    return { value: '', page: 0, quote: '' };
  },
  z.object({
    value: z.string().default(''),
    page: z.coerce.number().int().min(0).catch(0).default(0),
    quote: z.string().default(''),
  }),
);

const claimRefSchema = z.preprocess(
  (value) => {
    if (typeof value === 'string') return { value, page: 0, quote: '' };
    if (value && typeof value === 'object') {
      return {
        value: String(value.value || value.text || value.claim || value.description || ''),
        page: Number(value.page ?? value.pageNumber ?? 0) || 0,
        quote: String(value.quote || value.evidence || value.verbatim || ''),
        measured: value.measured,
        source: value.source || value.section || '',
      };
    }
    return { value: '', page: 0, quote: '' };
  },
  z.object({
    value: z.string().default(''),
    page: z.coerce.number().int().min(0).catch(0).default(0),
    quote: z.string().default(''),
    measured: z.boolean().optional(),
    source: z.string().optional().default(''),
  }),
);

const armSchema = z.preprocess(
  (value) =>
    typeof value === 'string'
      ? { name: value }
      : value && typeof value === 'object'
        ? value
        : {},
  z.object({
    name: z.string().default(''),
    value: z.string().default(''),
    sd: z.string().default(''),
    n: z.coerce.number().int().min(0).catch(0).default(0),
  }),
);

/** Bước 1: dữ kiện thuần, mỗi trường có trang + trích nguyên văn. */
export const paperFactsSchema = z.object({
  metadata: z
    .preprocess(
      (value) => (value && typeof value === 'object' ? value : {}),
      z.object({
        title: sourceRefSchema,
        authors: z.array(sourceRefSchema).default([]),
        year: sourceRefSchema,
        journal: sourceRefSchema,
        volume: sourceRefSchema,
        issue: sourceRefSchema,
        pages: sourceRefSchema,
        doi: sourceRefSchema,
      }),
    )
    .default({}),
  study: z
    .preprocess(
      (value) => (value && typeof value === 'object' ? value : {}),
      z.object({
        design: sourceRefSchema,
        participants: z
          .preprocess(
            (value) => (value && typeof value === 'object' ? value : {}),
            z.object({
              n: z.coerce.number().int().min(0).catch(0).default(0),
              description: sourceRefSchema,
            }),
          )
          .default({}),
        intervention: sourceRefSchema,
        device: sourceRefSchema,
        comparator: sourceRefSchema,
        outcomes: z.array(sourceRefSchema).default([]),
        measurement: sourceRefSchema,
        setting: sourceRefSchema,
        duration: sourceRefSchema,
        failureCriteria: sourceRefSchema,
      }),
    )
    .default({}),
  results: z
    .array(
      z.preprocess(
        (value) => (value && typeof value === 'object' ? value : {}),
        z.object({
          id: z.string().default(''),
          outcome: z.string().default(''),
          arms: z.array(armSchema).default([]),
          p: z.string().default(''),
          d: z.string().default(''),
          ci: z.string().default(''),
          note: z.string().default(''),
          page: z.coerce.number().int().min(0).catch(0).default(0),
          quote: z.string().default(''),
        }),
      ),
    )
    .default([]),
  authors: z
    .preprocess(
      (value) => (value && typeof value === 'object' ? value : {}),
      z.object({
        conclusion: claimRefSchema,
        interpretations: z.array(claimRefSchema).default([]),
        applications: z.array(claimRefSchema).default([]),
        limitations: z.array(claimRefSchema).default([]),
        benefitSignals: z.array(claimRefSchema).default([]),
      }),
    )
    .default({}),
  sections: z.record(z.boolean()).default({}),
  glossaryCandidates: z.array(claimRefSchema).default([]),
});

/**
 * Schema bản tóm tắt theo cấu trúc trang mới cho người học PT.
 * Giữ các field cũ (tldr, researchQuestion, mainResults...) để tương thích
 * với bản tóm tắt đã lưu; thêm field mới với default an toàn.
 */
export const summaryContentSchema = z.object({
  metadata: z.preprocess(
    (value) => (value && typeof value === 'object' ? value : {}),
    z.object({
      title: z.string().default(''),
      authors: stringArray(/\s*[;,]\s*/),
      year: z.coerce.number().int().min(0).max(2200).catch(0).default(0),
      journal: z.string().default(''),
      volume: z.string().default(''),
      issue: z.string().default(''),
      pages: z.string().default(''),
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
  evidenceAxes: evidenceAxesSchema,
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
  measurementNote: z.string().default(''),
  resultsOverview: z.string().default(''),
  mainResults: z.array(resultItemSchema).min(1),
  secondaryResults: z.array(resultItemSchema).default([]),
  figures: figuresSchema,
  quickRead: quickReadSchema,
  whyStudy: z.string().default(''),
  mechanism: mechanismSchema,
  authorsConclusion: z.string().default('Không nêu trong bài'),
  authorsView: authorsViewSchema,
  limitations: stringArray(/\n+/),
  limitationsStructured: limitationsStructuredSchema,
  conflictOfInterest: z.string().default('Không nêu trong bài'),
  benefitSignals: benefitSignalsSchema,
  practicalTakeaways: stringArray(/\n+/),
  application: applicationSchema,
  whoItDoesNotApplyTo: z.string().default('Không nêu trong bài'),
  selfCheck: selfCheckSchema,
  glossary: glossarySchema,
  verification: z
    .preprocess(
      (value) => (value && typeof value === 'object' ? value : {}),
      z.object({
        passed: z.boolean().default(true),
        issues: flexibleStringArray,
        factsWarnings: flexibleStringArray,
        rounds: z.coerce.number().int().min(0).catch(0).default(0),
      }),
    )
    .default({}),
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

export const summaryMetaSchema = z
  .object({
    tags: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
    isFavorite: z.boolean().optional(),
  })
  .strict();

export const summaryListQuerySchema = z
  .object({
    q: z.string().trim().max(100).optional(),
    favorite: z.enum(['true', 'false']).optional(),
    tag: z.string().trim().max(50).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    offset: z.coerce.number().int().min(0).max(100000).optional(),
  })
  .strict();

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
