import { Flashcard } from '../models/Flashcard.js';
import { Term } from '../models/Term.js';
import { reviewFlashcard } from '../../../shared/learning/sm2.js';
import {
  flashcardCreateSchema,
  flashcardUpdateSchema,
  reviewSchema,
} from '../validation/learning.js';
import { ApiError } from '../utils/ApiError.js';

export async function create(req, res) {
  const data = flashcardCreateSchema.parse(req.body);
  let { front, back } = data;
  let termId;

  if (data.termId) {
    const term = await Term.findOne({ _id: data.termId, userId: req.userId });
    if (!term) throw ApiError.notFound('Không tìm thấy thuật ngữ');
    termId = term._id;
    front = term.en;
    back = `${term.vi}${term.explanation ? ` — ${term.explanation}` : ''}`;
  }

  const card = await Flashcard.create({
    userId: req.userId,
    termId,
    front,
    back,
    sourcePaperId: data.sourcePaperId,
    dueDate: new Date(),
  });
  res.status(201).json({ data: { card } });
}

export async function list(req, res) {
  const query = { userId: req.userId };
  if (req.query.due === 'true') query.dueDate = { $lte: new Date() };
  const [cards, total, due] = await Promise.all([
    Flashcard.find(query).sort({ dueDate: 1 }).limit(100).lean(),
    Flashcard.countDocuments({ userId: req.userId }),
    Flashcard.countDocuments({ userId: req.userId, dueDate: { $lte: new Date() } }),
  ]);
  res.json({ data: { cards, stats: { total, due } } });
}

export async function update(req, res) {
  const data = flashcardUpdateSchema.parse(req.body);
  const card = await Flashcard.findOne({ _id: req.params.id, userId: req.userId });
  if (!card) throw ApiError.notFound('Không tìm thấy flashcard');
  Object.assign(card, data);
  await card.save();
  res.json({ data: { card } });
}

export async function remove(req, res) {
  const card = await Flashcard.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!card) throw ApiError.notFound('Không tìm thấy flashcard');
  res.json({ data: { ok: true } });
}

export async function review(req, res) {
  const { quality } = reviewSchema.parse(req.body);
  const card = await Flashcard.findOne({ _id: req.params.id, userId: req.userId });
  if (!card) throw ApiError.notFound('Không tìm thấy flashcard');

  const next = reviewFlashcard(card, quality);
  card.ease = next.ease;
  card.intervalDays = next.intervalDays;
  card.reps = next.reps;
  card.lapses = next.lapses;
  card.dueDate = next.dueDate;
  await card.save();

  res.json({
    data: {
      card,
      review: next,
      stats: {
        total: await Flashcard.countDocuments({ userId: req.userId }),
        due: await Flashcard.countDocuments({
          userId: req.userId,
          dueDate: { $lte: new Date() },
        }),
      },
    },
  });
}
