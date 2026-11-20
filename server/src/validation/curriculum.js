import { z } from 'zod';

export const progressUpdateSchema = z
  .object({
    status: z.enum(['reading', 'completed']),
  })
  .strict();

const answerSchema = z.coerce.number().int().min(0).max(3);

export const quizSubmitSchema = z
  .object({
    answers: z.array(answerSchema).min(1).max(8),
  })
  .strict();

const chatHistoryItem = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1).max(4000),
});

export const lessonAskSchema = z
  .object({
    message: z.string().trim().min(1).max(2000),
    history: z.array(chatHistoryItem).max(8).default([]),
  })
  .strict();

export const lessonQuizAiSchema = z
  .object({
    count: z.coerce.number().int().min(3).max(8).default(5),
  })
  .strict();
