import { useSearchParams } from 'react-router-dom';
import { Segmented } from '../components/ui.jsx';
import PlannerPage from './training/PlannerPage.jsx';
import WorkoutPage from './training/WorkoutPage.jsx';
import WorkoutHistoryPage from './training/WorkoutHistoryPage.jsx';
import ExerciseLibraryPage from './training/ExerciseLibraryPage.jsx';

const TABS = [
  { value: 'planner', label: 'Giáo án' },
  { value: 'workout', label: 'Log buổi tập' },
  { value: 'history', label: 'Buổi tập' },
  { value: 'exercises', label: 'Bài tập' },
];

export default function Training() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('tab');
  const tab = ['workout', 'history', 'exercises'].includes(raw) ? raw : 'planner';

  const change = (value) => {
    const next = new URLSearchParams(params);
    if (value === 'planner') next.delete('tab');
    else next.set('tab', value);
    setParams(next);
  };

  return (
    <div>
      <div className="mb-4 overflow-x-auto">
        <Segmented options={TABS} value={tab} onChange={change} />
      </div>
      {tab === 'workout' ? (
        <WorkoutPage />
      ) : tab === 'history' ? (
        <WorkoutHistoryPage />
      ) : tab === 'exercises' ? (
        <ExerciseLibraryPage />
      ) : (
        <PlannerPage />
      )}
    </div>
  );
}
