import { calculatorTab } from '@shared/learning/contexts.js';

/**
 * Chuyển action học tập thành URL nội bộ. Mọi nhánh đều là route đã tồn tại;
 * không nhận URL từ server để tránh open redirect.
 */
export function actionPath(action, lessonSlug) {
  switch (action?.type) {
    case 'open_calculator':
      return `/calculators?tab=${calculatorTab(action.key)}`;
    case 'open_atlas':
      return action.muscle ? `/muscles?muscle=${encodeURIComponent(action.muscle)}` : '/muscles';
    case 'open_training':
      return `/training?tab=${action.tab === 'workout' ? 'workout' : 'planner'}`;
    case 'open_workout':
      return '/training?tab=workout';
    case 'open_nutrition':
      return '/nutrition';
    case 'open_body_log':
      return '/body-log';
    case 'open_body_assessment':
      return '/body-assessment';
    case 'open_research':
      return '/research';
    case 'create_flashcards':
      return `/learn?tab=flashcards${lessonSlug ? `&lesson=${lessonSlug}` : ''}`;
    case 'open_lesson':
    default:
      return lessonSlug ? `/learn?lesson=${lessonSlug}` : '/learn';
  }
}

export function lessonPath(slug, surface) {
  if (!slug) return '/learn';
  const params = new URLSearchParams({ lesson: slug });
  if (surface) params.set('surface', surface);
  return `/learn?${params.toString()}`;
}
