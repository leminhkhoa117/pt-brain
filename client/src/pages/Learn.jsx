import { useSearchParams } from 'react-router-dom';
import { Segmented } from '../components/ui.jsx';
import GlossaryPage from './learn/GlossaryPage.jsx';
import FlashcardsPage from './learn/FlashcardsPage.jsx';
import NotesPage from './learn/NotesPage.jsx';
import QuizPage from './learn/QuizPage.jsx';
import CurriculumPage from './learn/CurriculumPage.jsx';
import LessonPage from './learn/LessonPage.jsx';

const TABS = [
  { value: 'curriculum', label: 'Giáo trình', icon: 'notebook' },
  { value: 'glossary', label: 'Từ điển' },
  { value: 'flashcards', label: 'Flashcard' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'notes', label: 'Sổ tay' },
];

export default function Learn() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('tab');
  const tab = ['glossary', 'flashcards', 'quiz', 'notes', 'curriculum'].includes(raw)
    ? raw
    : 'curriculum';
  const lessonSlug = params.get('lesson');

  const change = (value) => {
    const next = new URLSearchParams(params);
    if (value === 'curriculum') next.delete('tab');
    else next.set('tab', value);
    next.delete('lesson');
    setParams(next);
  };

  const openLesson = (slug) => {
    const next = new URLSearchParams(params);
    next.set('lesson', slug);
    if (tab !== 'curriculum') next.set('tab', 'curriculum');
    setParams(next);
    window.scrollTo({ top: 0 });
  };

  const closeLesson = () => {
    const next = new URLSearchParams(params);
    next.delete('lesson');
    setParams(next);
    window.scrollTo({ top: 0 });
  };

  // Đang mở một bài: ưu tiên render trang bài học, bỏ qua tab bên dưới.
  if (tab === 'curriculum' && lessonSlug) {
    return <LessonPage slug={lessonSlug} onBack={closeLesson} />;
  }

  return (
    <div>
      <div className="mb-4 overflow-x-auto">
        <Segmented options={TABS} value={tab} onChange={change} />
      </div>
      {tab === 'flashcards' ? (
        <FlashcardsPage />
      ) : tab === 'quiz' ? (
        <QuizPage />
      ) : tab === 'notes' ? (
        <NotesPage />
      ) : tab === 'glossary' ? (
        <GlossaryPage />
      ) : (
        <CurriculumPage onSelectLesson={openLesson} />
      )}
    </div>
  );
}
