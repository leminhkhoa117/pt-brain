/**
 * SM-2 đơn giản cho flashcard.
 * quality: 0-5 (0-2 = quên, 3 = khó, 4 = tốt, 5 = dễ)
 * Trả về các field mới để lưu vào Flashcard.
 */
export function reviewFlashcard(card, quality, now = new Date()) {
  const q = Math.max(0, Math.min(5, Math.round(Number(quality))));
  let ease = Number(card.ease) || 2.5;
  let intervalDays = Number(card.intervalDays) || 0;
  let reps = Number(card.reps) || 0;
  let lapses = Number(card.lapses) || 0;

  ease = Math.max(1.3, Math.min(3.0, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))));

  if (q < 3) {
    reps = 0;
    intervalDays = 1;
    lapses += 1;
  } else {
    reps += 1;
    if (reps === 1) intervalDays = 1;
    else if (reps === 2) intervalDays = 6;
    else intervalDays = Math.max(1, Math.round(intervalDays * ease));
  }

  intervalDays = Math.min(365, intervalDays);
  const dueDate = new Date(new Date(now).getTime() + intervalDays * 86400000);

  return {
    ease: Math.round(ease * 100) / 100,
    intervalDays,
    reps,
    lapses,
    dueDate,
    lastQuality: q,
  };
}

export const QUALITY_LABELS = [
  { value: 0, label: 'Quên hoàn toàn', tone: 'danger' },
  { value: 2, label: 'Khó nhớ', tone: 'warning' },
  { value: 3, label: 'Tạm được', tone: 'info' },
  { value: 4, label: 'Tốt', tone: 'success' },
  { value: 5, label: 'Rất dễ', tone: 'success' },
];
