import { useSearchParams } from 'react-router-dom';
import { Segmented } from '../components/ui.jsx';
import KeepAliveTabs from '../components/KeepAliveTabs.jsx';
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
    next.delete('focus');
    setParams(next);
  };

  const openLesson = (slug, { focus = '' } = {}) => {
    const next = new URLSearchParams(params);
    next.set('lesson', slug);
    if (focus) next.set('focus', focus);
    else next.delete('focus');
    if (tab !== 'curriculum') next.set('tab', 'curriculum');
    setParams(next);
    window.scrollTo({ top: 0 });
  };

  const closeLesson = () => {
    const next = new URLSearchParams(params);
    next.delete('lesson');
    next.delete('focus');
    setParams(next);
    window.scrollTo({ top: 0 });
  };

  // Đang mở một bài: ưu tiên render trang bài học, bỏ qua tab bên dưới.
  const lessonOpen = tab === 'curriculum' && Boolean(lessonSlug);

  const panes = [
    { value: 'curriculum', children: <CurriculumPage onSelectLesson={openLesson} /> },
    { value: 'glossary', children: <GlossaryPage /> },
    { value: 'flashcards', children: <FlashcardsPage /> },
    { value: 'quiz', children: <QuizPage /> },
    { value: 'notes', children: <NotesPage /> },
  ];

  return (
    <div>
      {/* Ẩn nhưng vẫn mounted: đóng bài học quay lại đúng state tab cũ. */}
      <div className={lessonOpen ? 'hidden' : undefined}>
        <div className="mb-4 overflow-x-auto">
          <Segmented options={TABS} value={tab} onChange={change} />
        </div>
        <KeepAliveTabs active={tab} items={panes} />
      </div>
      {lessonOpen && <LessonPage slug={lessonSlug} onBack={closeLesson} />}
    </div>
  );
}
