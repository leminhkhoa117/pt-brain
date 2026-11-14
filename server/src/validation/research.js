import { z } from 'zod';

export const researchSearchSchema = z
  .object({
    question: z.string().trim().min(5, 'Câu hỏi quá ngắn').max(1000, 'Câu hỏi quá dài'),
    queries: z.array(z.string().trim().min(3).max(220)).max(4).optional(),
    filters: z
      .object({
        yearFrom: z.coerce.number().int().min(1900).max(2100).optional(),
        yearTo: z.coerce.number().int().min(1900).max(2100).optional(),
        openAccessOnly: z.boolean().optional(),
        fullTextOnly: z.boolean().optional(),
        maxLevel: z.coerce.number().int().min(1).max(5).optional(),
      })
      .strict()
      .optional(),
  })
  .strict()
  .refine(
    (data) =>
      !data.filters?.yearFrom ||
      !data.filters?.yearTo ||
      data.filters.yearFrom <= data.filters.yearTo,
    { message: 'Năm bắt đầu phải nhỏ hơn hoặc bằng năm kết thúc' },
  );

export const paperCreateSchema = z
  .object({
    title: z.string().trim().min(3).max(500),
    authors: z.array(z.string().trim().max(200)).max(50).optional().default([]),
    year: z.coerce.number().int().min(1800).max(2200).optional(),
    journal: z.string().trim().max(300).optional().default(''),
    doi: z.string().trim().max(300).optional().default(''),
    pmid: z.string().trim().max(50).optional().default(''),
    pmcid: z.string().trim().max(50).optional().default(''),
    url: z.string().trim().max(1000).optional().default(''),
    abstract: z.string().trim().max(50000).optional().default(''),
    publicationTypes: z.array(z.string().trim().max(120)).max(30).optional().default([]),
    evidenceLevel: z.coerce.number().int().min(1).max(5).optional().default(5),
    citationCount: z.coerce.number().int().min(0).optional().default(0),
    isOpenAccess: z.boolean().optional().default(false),
    source: z
      .enum(['pubmed', 'europepmc', 'openalex', 'manual'])
      .optional()
      .default('manual'),
  })
  .strict();

export const researchGraphSchema = z
  .object({
    doi: z.string().trim().min(3).max(300),
    kind: z.enum(['references', 'citations', 'related']).default('references'),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  })
  .strict();
