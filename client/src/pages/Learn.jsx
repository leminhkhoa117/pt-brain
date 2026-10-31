import { useSearchParams } from 'react-router-dom';
import { Segmented } from '../components/ui.jsx';
import GlossaryPage from './learn/GlossaryPage.jsx';
import FlashcardsPage from './learn/FlashcardsPage.jsx';
import NotesPage from './learn/NotesPage.jsx';
import QuizPage from './learn/QuizPage.jsx';

const TABS = [
  { value: 'glossary', label: 'Từ điển' },
  { value: 'flashcards', label: 'Flashcard' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'notes', label: 'Sổ tay' },
];

export default function Learn() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('tab');
  const tab = ['flashcards', 'quiz', 'notes'].includes(raw) ? raw : 'glossary';

  const change = (value) => {
    const next = new URLSearchParams(params);
    if (value === 'glossary') next.delete('tab');
    else next.set('tab', value);
    setParams(next);
  };

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
      ) : (
        <GlossaryPage />
      )}
    </div>
  );
}
