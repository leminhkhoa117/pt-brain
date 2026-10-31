import { useSearchParams } from 'react-router-dom';
import { Segmented } from '../components/ui.jsx';
import GlossaryPage from './learn/GlossaryPage.jsx';
import FlashcardsPage from './learn/FlashcardsPage.jsx';
import NotesPage from './learn/NotesPage.jsx';

export default function Learn() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('tab');
  const tab = ['flashcards', 'notes'].includes(raw) ? raw : 'glossary';

  const change = (value) => {
    const next = new URLSearchParams(params);
    if (value === 'glossary') next.delete('tab');
    else next.set('tab', value);
    setParams(next);
  };

  return (
    <div>
      <div className="mb-4 overflow-x-auto">
        <Segmented
          options={[
            { value: 'glossary', label: 'Từ điển' },
            { value: 'flashcards', label: 'Flashcard' },
            { value: 'notes', label: 'Sổ tay' },
          ]}
          value={tab}
          onChange={change}
        />
      </div>
      {tab === 'flashcards' ? (
        <FlashcardsPage />
      ) : tab === 'notes' ? (
        <NotesPage />
      ) : (
        <GlossaryPage />
      )}
    </div>
  );
}
