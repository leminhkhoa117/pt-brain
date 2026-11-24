import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { Icon, Spinner } from '../components/ui.jsx';
import { useApplyLearningAction } from './useLearning.js';
import { actionPath } from './learningLinks.js';

const ACTION_ICON = {
  open_calculator: 'calculator',
  open_atlas: 'body',
  open_training: 'dumbbell',
  open_workout: 'clipboard',
  open_nutrition: 'utensils',
  open_body_log: 'scale',
  open_body_assessment: 'camera',
  open_research: 'book',
  create_flashcards: 'cards',
  open_lesson: 'arrowRight',
};

export default function ApplyActionButton({
  action,
  lessonSlug,
  surface,
  className,
  variant = 'primary',
  onApplied,
}) {
  const navigate = useNavigate();
  const mutation = useApplyLearningAction();
  const [done, setDone] = useState(false);

  if (!action?.type) return null;

  const handleClick = async () => {
    const path = actionPath(action, lessonSlug);
    // "Mở bài" chỉ là điều hướng, không tính là đã áp dụng vào công việc thật.
    if (action.type !== 'open_lesson') {
      try {
        await mutation.mutateAsync({
          slug: lessonSlug,
          action: {
            actionType: action.type,
            label: action.label || '',
            surface,
            payload: {
              key: action.key,
              muscle: action.muscle,
              tab: action.tab,
            },
          },
        });
        setDone(true);
        onApplied?.(action);
      } catch {
        // Vẫn cho người dùng mở công cụ kể cả khi ghi nhận lỗi mạng.
      }
    }
    navigate(path);
  };

  const base =
    variant === 'ghost'
      ? 'btn-ghost !px-2.5 !py-1 text-[11px]'
      : variant === 'secondary'
        ? 'btn-secondary !px-3 !py-1.5 text-xs'
        : 'btn-primary !px-3 !py-1.5 text-xs';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={mutation.isPending}
      className={clsx('inline-flex items-center gap-1.5', base, className)}
    >
      {mutation.isPending ? (
        <Spinner className="h-3.5 w-3.5" />
      ) : (
        <Icon name={done ? 'check' : ACTION_ICON[action.type] || 'arrowRight'} className="h-3.5 w-3.5" />
      )}
      {action.label || (done ? 'Đã áp dụng' : 'Áp dụng')}
    </button>
  );
}
